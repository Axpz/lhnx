package rabbitmq

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Client 封装 RabbitMQ 的连接和通道
type Client struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	url     string
}

// Handler 定义消息处理函数
// 返回 nil 表示处理成功(ACK)，返回 error 表示失败(NACK/Requeue)
type Handler func(ctx context.Context, body []byte) error

// New 创建一个新的 RabbitMQ 客户端
func New(url string) (*Client, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to rabbitmq: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}

	return &Client{
		conn:    conn,
		channel: ch,
		url:     url,
	}, nil
}

// Close 优雅关闭连接和通道
func (c *Client) Close() error {
	if c.channel != nil {
		if err := c.channel.Close(); err != nil {
			return fmt.Errorf("failed to close channel: %w", err)
		}
	}
	if c.conn != nil {
		if err := c.conn.Close(); err != nil {
			return fmt.Errorf("failed to close connection: %w", err)
		}
	}
	return nil
}

// Publish 发送消息
// exchange: 交换机名称 (传 "" 使用默认交换机)
// routingKey: 路由键 (通常是队列名)
// body: 消息内容
func (c *Client) Publish(ctx context.Context, exchange, routingKey string, body []byte) error {
	return c.channel.PublishWithContext(ctx,
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        body,
		},
	)
}

// Consume 开始消费指定队列
// queue: 队列名称
// handler: 业务处理回调
// 这个方法会阻塞，直到连接关闭或上下文取消
func (c *Client) Consume(ctx context.Context, queue string, handler Handler) error {
	// 1. 确保队列存在 (可选，但在最小化设计中通常加上以防报错)
	_, err := c.channel.QueueDeclare(
		queue, // name
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// 2. 获取消费通道
	msgs, err := c.channel.Consume(
		queue, // queue
		"",    // consumer
		false, // auto-ack (手动ACK更安全)
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	// 3. 处理消息
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-msgs:
			if !ok {
				return fmt.Errorf("channel closed")
			}

			// 执行业务逻辑
			err := handler(ctx, d.Body)
			if err != nil {
				// 处理失败，NACK (requeue=true 这里可以根据需求调整，简化版默认重试)
				// 生产环境通常需要更复杂的重试策略，比如死信队列
				_ = d.Nack(false, true)
			} else {
				// 处理成功，ACK
				_ = d.Ack(false)
			}
		}
	}
}
