package service

import (
	"time"

	"github.com/lhnx/config"
	"github.com/lhnx/repository"
)

const defaultRequestTimeout = 30 * time.Second

// Service holds all services
type Service struct {
	Auth AuthService
	Chat ChatService
}

// New creates a new service instance
func New(repos *repository.Repository, cfg *config.Config, llmProviderSet *LLMProviderSet, clientSet config.ClientSet) *Service {
	return &Service{
		Auth: NewAuthService(repos.User, cfg),
		Chat: NewChatService(llmProviderSet.Qwen),
	}
}
