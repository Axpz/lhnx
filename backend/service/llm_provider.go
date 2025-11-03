package service

import (
	"context"

	"github.com/lhnx/config"
)

type LLMProviderSet struct {
	Qwen   LLMProvider
	Gemini LLMProvider
	OpenAI LLMProvider
}

func NewLLMProviderSet(ctx context.Context, cfg *config.Config) (*LLMProviderSet, error) {
	qwenProvider, err := newQwenProvider(ctx, cfg)
	if err != nil {
		return nil, err
	}

	geminiProvider, err := newGeminiProvider(ctx, cfg)
	if err != nil {
		return nil, err
	}

	return &LLMProviderSet{
		Qwen:   qwenProvider,
		Gemini: geminiProvider,
	}, nil
}

// SkinAnalysisProvider 定义皮肤分析模型提供方接口
type LLMProvider interface {
	Chat(ctx context.Context, messages []map[string]any) (string, error)
	ChatStream(ctx context.Context, messages []map[string]any) (<-chan string, <-chan error)
	SkinAnalyze(ctx context.Context, image []byte, mimeType string, prompt string) (string, error)
	Name() string
}
