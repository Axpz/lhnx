package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lhnx/config"
	"github.com/lhnx/pkg/logger"
	"github.com/lhnx/service"
)

type ChatHandler struct {
	cfg     *config.Config
	service service.ChatService
}

func NewChatHandler(service service.ChatService, cfg *config.Config) *ChatHandler {
	return &ChatHandler{
		cfg:     cfg,
		service: service,
	}
}

// RegisterRoutes registers chat-related routes
func (h *ChatHandler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.POST("/chat/stream", h.Chat)
}

// Chat handles chat stream
func (h *ChatHandler) Chat(c *gin.Context) {
	ctx := c.Request.Context()
	logger := logger.FromContext(ctx)
	logger.Info("chat streaming starting ...")

	var request struct {
		Message string           `json:"message"`
		History []map[string]any `json:"history"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 构建完整的消息列表
	messages := append(request.History,
		map[string]any{
			"role":    "system",
			"content": "你是一个专业企业咨询助手，回答问题时保持专业简洁明了。",
		},
		map[string]any{
			"role":    "user",
			"content": request.Message,
		},
	)

	// 设置 SSE 响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	// 获取流式响应
	contentChan, errorChan := h.service.ChatStream(ctx, messages)

	// 使用 flusher 确保数据实时发送
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		logger.Error("streaming not supported")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "streaming not supported"})
		return
	}

	// 发送流式数据
	for {
		select {
		case content, ok := <-contentChan:
			if !ok {
				// channel 已关闭，发送结束标记
				c.Writer.WriteString("data: [DONE]\n\n")
				flusher.Flush()
				return
			}

			// 发送数据块
			data := map[string]string{"content": content}
			jsonData, err := json.Marshal(data)
			if err != nil {
				logger.WithField("error", err).Error("failed to marshal response")
				continue
			}

			c.Writer.WriteString(fmt.Sprintf("data: %s\n\n", string(jsonData)))
			flusher.Flush()

		case err := <-errorChan:
			if err != nil {
				logger.WithField("error", err).Error("stream error")
				errorData := map[string]string{"error": err.Error()}
				jsonData, _ := json.Marshal(errorData)
				c.Writer.WriteString(fmt.Sprintf("data: %s\n\n", string(jsonData)))
				flusher.Flush()
			}
			return

		case <-ctx.Done():
			logger.Info("client disconnected")
			return
		}
	}
}
