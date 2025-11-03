package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/lhnx/config"
	"github.com/lhnx/pkg/logger"
)

const (
	defaultQwenTemperature = 0.2
)

type qwenProvider struct {
	model      string
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

func newQwenProvider(_ context.Context, cfg *config.Config) (LLMProvider, error) {
	apiKey := cfg.LLMProvider.Qwen.APIKey
	model := cfg.LLMProvider.Qwen.Model
	baseURL := cfg.LLMProvider.Qwen.Endpoint

	return &qwenProvider{
		model:   model,
		apiKey:  apiKey,
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: defaultRequestTimeout,
			Transport: &http.Transport{
				MaxIdleConns:          200,
				MaxIdleConnsPerHost:   200,
				IdleConnTimeout:       90 * time.Second,
				TLSHandshakeTimeout:   5 * time.Second,
				ExpectContinueTimeout: 1 * time.Second,
			},
		},
	}, nil
}

func (p *qwenProvider) Name() string {
	return "qwen"
}

func (p *qwenProvider) Chat(ctx context.Context, messages []map[string]any) (string, error) {
	return "-- chat --", nil
}

func (p *qwenProvider) ChatStream(ctx context.Context, messages []map[string]any) (<-chan string, <-chan error) {
	contentChan := make(chan string)
	errorChan := make(chan error, 1)

	go func() {
		defer close(contentChan)
		defer close(errorChan)

		logger := logger.FromContext(ctx)

		// 构建请求体
		requestBody := map[string]any{
			"model":       p.model,
			"temperature": defaultQwenTemperature,
			"messages":    messages,
			"stream":      true,
		}

		payloadBytes, err := json.Marshal(requestBody)
		if err != nil {
			errorChan <- fmt.Errorf("chat service: encode qwen request: %w", err)
			return
		}

		logger.WithField("model", p.model).Debug("sending stream request to qwen")

		url := fmt.Sprintf("%s/chat/completions", p.baseURL)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payloadBytes))
		if err != nil {
			errorChan <- fmt.Errorf("chat service: create qwen request: %w", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", p.apiKey))
		req.Header.Set("Accept", "text/event-stream")

		resp, err := p.httpClient.Do(req)
		if err != nil {
			errorChan <- fmt.Errorf("chat service: qwen request failed: %w", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			body, _ := io.ReadAll(resp.Body)
			logger.WithField("status", resp.StatusCode).
				WithField("response", string(body)).
				Error("qwen API error response")
			errorChan <- fmt.Errorf("chat service: qwen response status %d: %s", resp.StatusCode, string(body))
			return
		}

		// 读取流式响应
		reader := io.Reader(resp.Body)
		buffer := make([]byte, 8192)

		for {
			select {
			case <-ctx.Done():
				errorChan <- ctx.Err()
				return
			default:
			}

			n, err := reader.Read(buffer)
			if n > 0 {
				data := string(buffer[:n])

				for line := range strings.SplitSeq(data, "\n") {
					line = strings.TrimSpace(line)
					if !strings.HasPrefix(line, "data:") {
						continue
					}

					jsonData := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
					if jsonData == "" || jsonData == "[DONE]" {
						continue
					}

					var streamResp struct {
						Choices []struct {
							Delta struct {
								Content string `json:"content"`
							} `json:"delta"`
						} `json:"choices"`
					}

					if err := json.Unmarshal([]byte(jsonData), &streamResp); err != nil {
						logger.WithField("error", err).
							WithField("data", jsonData).
							Warn("failed to parse stream response")
						continue
					}

					if len(streamResp.Choices) > 0 {
						content := streamResp.Choices[0].Delta.Content
						if content != "" {
							select {
							case contentChan <- content:
							case <-ctx.Done():
								return
							}
						}
					}
				}
			}

			if err != nil {
				if err != io.EOF {
					logger.WithField("error", err).Error("error reading stream")
					errorChan <- fmt.Errorf("chat service: read stream: %w", err)
				}
				return
			}
		}
	}()

	return contentChan, errorChan
}

func (p *qwenProvider) SkinAnalyze(ctx context.Context, image []byte, mimeType string, prompt string) (string, error) {
	logger := logger.FromContext(ctx)

	encoded := base64.StdEncoding.EncodeToString(image)
	imageURL := fmt.Sprintf("data:%s;base64,%s", mimeType, encoded)

	// 使用 OpenAI 兼容的格式（Qwen 官方支持）
	requestBody := map[string]any{
		"model":       p.model,
		"temperature": defaultQwenTemperature,
		"messages": []map[string]any{
			{
				"role":    "system",
				"content": prompt,
			},
			{
				"role": "user",
				"content": []map[string]any{
					{
						"type": "text",
						"text": "请仔细分析这张面部照片的面部皮肤状况，完成上述 JSON 输出。",
					},
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": imageURL,
						},
					},
				},
			},
		},
		"response_format": map[string]string{
			"type": "json_object",
		},
	}

	payloadBytes, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("skin service: encode qwen request: %w", err)
	}

	// 记录请求体用于调试（不包含完整的 base64 图片）
	logger.WithField("model", p.model).
		WithField("url", fmt.Sprintf("%s/chat/completions", p.baseURL)).
		Debug("sending request to qwen")

	url := fmt.Sprintf("%s/chat/completions", p.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payloadBytes))
	if err != nil {
		return "", fmt.Errorf("skin service: create qwen request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", p.apiKey))

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("skin service: qwen request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("skin service: read qwen response: %w", err)
	}

	logger.WithField("response_body", string(body)).Debug("received qwen response")

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		logger.WithField("status", resp.StatusCode).
			WithField("response", string(body)).
			Error("qwen API error response")
		return "", fmt.Errorf("skin service: qwen response status %d: %s", resp.StatusCode, string(body))
	}

	logger.WithField("status", resp.StatusCode).Debug("received qwen response")

	var completion qwenChatResponse
	if err := json.Unmarshal(body, &completion); err != nil {
		logger.WithField("error", err).
			WithField("response_body", string(body)).
			Error("failed to decode qwen response")
		return "", fmt.Errorf("skin service: decode qwen response: %w", err)
	}

	return extractQwenText(completion)
}

func extractQwenText(resp qwenChatResponse) (string, error) {
	if len(resp.Choices) == 0 {
		return "", errors.New("skin service: empty response from provider")
	}

	// Qwen 返回的 content 是简单的字符串，不是数组
	var content string
	if err := json.Unmarshal(resp.Choices[0].Message.Content, &content); err != nil {
		return "", fmt.Errorf("skin service: decode content: %w", err)
	}

	result := strings.TrimSpace(content)
	if result == "" {
		return "", errors.New("skin service: empty response from provider")
	}

	return result, nil
}

// qwenChatResponse Qwen Chat Completions API 响应结构
type qwenChatResponse struct {
	Choices []struct {
		Message struct {
			Role    string          `json:"role"`
			Content json.RawMessage `json:"content"` // 字符串类型，需要 Unmarshal
		} `json:"message"`
	} `json:"choices"`
}
