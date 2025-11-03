package handler

import (
	"github.com/lhnx/config"
	"github.com/lhnx/pkg/auth"
	"github.com/lhnx/service"
)

// Handler holds all handlers
type Handlers struct {
	AuthSupabase *AuthSupabaseHandler
	Upload       *UploadHandler
	Chat         *ChatHandler
}

// New creates a new handler instance
func New(services *service.Service, jwtManager *auth.JWTManager, cfg *config.Config) *Handlers {
	return &Handlers{
		AuthSupabase: NewAuthSupabaseHandler(cfg, jwtManager, services.Auth),
		Upload:       NewUploadHandler(cfg),
		Chat:         NewChatHandler(services.Chat, cfg),
	}
}
