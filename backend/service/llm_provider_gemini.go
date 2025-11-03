package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/lhnx/config"
	"google.golang.org/genai"
)

const defaultGeminiTemperature float32 = 0.2

type geminiProvider struct {
	client *genai.Client
	model  string
}

func newGeminiProvider(ctx context.Context, cfg *config.Config) (LLMProvider, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  cfg.LLMProvider.Gemini.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("skin service: init gemini client: %w", err)
	}

	return &geminiProvider{
		client: client,
		model:  cfg.LLMProvider.Gemini.Model,
	}, nil
}

func (p *geminiProvider) Name() string {
	return "gemini"
}

func (p *geminiProvider) Chat(ctx context.Context, messages []map[string]any) (string, error) {
	return "", nil
}

func (p *geminiProvider) ChatStream(ctx context.Context, messages []map[string]any) (<-chan string, <-chan error) {
	contentChan := make(chan string)
	errorChan := make(chan error, 1)

	go func() {
		defer close(contentChan)
		defer close(errorChan)

		if p == nil || p.client == nil {
			errorChan <- errors.New("chat service: gemini client not initialized")
			return
		}

		// 转换消息格式
		var contents []*genai.Content
		for _, msg := range messages {
			role, _ := msg["role"].(string)
			content, _ := msg["content"].(string)

			var geminiRole genai.Role
			switch role {
			case "user":
				geminiRole = genai.RoleUser
			case "assistant":
				geminiRole = genai.RoleModel
			default:
				continue
			}

			contents = append(contents, genai.NewContentFromParts(
				[]*genai.Part{genai.NewPartFromText(content)},
				geminiRole,
			))
		}

		// 创建流式响应
		iter := p.client.Models.GenerateContentStream(ctx, p.model, contents, &genai.GenerateContentConfig{
			Temperature: genai.Ptr(defaultGeminiTemperature),
		})

		// 迭代处理流式响应
		for resp, err := range iter {
			if err != nil {
				errorChan <- fmt.Errorf("chat service: gemini stream error: %w", err)
				return
			}

			text := resp.Text()
			if text != "" {
				select {
				case contentChan <- text:
				case <-ctx.Done():
					return
				}
			}
		}
	}()

	return contentChan, errorChan
}

func (p *geminiProvider) SkinAnalyze(ctx context.Context, image []byte, mimeType string, prompt string) (string, error) {
	if p == nil || p.client == nil {
		return "", errors.New("skin service: gemini client not initialized")
	}

	parts := []*genai.Part{
		genai.NewPartFromText(prompt),
		genai.NewPartFromBytes(image, mimeType),
	}

	resp, err := p.client.Models.GenerateContent(ctx, p.model, []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}, &genai.GenerateContentConfig{
		Temperature: genai.Ptr[float32](defaultGeminiTemperature),
	})
	if err != nil {
		return "", fmt.Errorf("skin service: generate content: %w", err)
	}

	return strings.TrimSpace(resp.Text()), nil
}
