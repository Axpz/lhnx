package service

import (
	"context"
)

type chatService struct {
	llm LLMProvider
}

// ChatService 聊天服务接口
type ChatService interface {
	Chat(ctx context.Context, messages []map[string]any) (string, error)
	ChatStream(ctx context.Context, messages []map[string]any) (<-chan string, <-chan error)
}

// NewChatService 创建聊天服务
func NewChatService(llmProvider LLMProvider) ChatService {
	return &chatService{llm: llmProvider}
}

// Chat 聊天
func (s *chatService) Chat(ctx context.Context, messages []map[string]any) (string, error) {
	return s.llm.Chat(ctx, messages)
}

// ChatStream 流式聊天
func (s *chatService) ChatStream(ctx context.Context, messages []map[string]any) (<-chan string, <-chan error) {
	return s.llm.ChatStream(ctx, messages)
}
