package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/lhnx/pkg/auth"
	"github.com/lhnx/pkg/rabbitmq"
	"github.com/olivere/elastic/v7"
	"github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

// Config holds all configuration for the application
type Config struct {
	Database    DatabaseConfig
	Es          EsConfig
	Server      ServerConfig
	Auth        AuthConfig
	OAuth       OAuthConfig
	Supabase    SupabaseConfig
	Upload      UploadConfig
	LLMProvider LLMProvider
	RabbitMQ    RabbitMQConfig

	// this is not right, but easy for all
	JwtManager *auth.JWTManager
	PwdManager *auth.PasswordManager
}

type ClientSet struct {
	Db       *gorm.DB
	Es       *elastic.Client
	Supabase *supabase.Client
	Q        *rabbitmq.Client
}

// LLMConfig holds LLM configuration
type LLMConfig struct {
	Model    string
	APIKey   string
	Endpoint string
}

type LLMProvider struct {
	Provider string
	Gemini   LLMConfig
	Qwen     LLMConfig
	OpenAI   LLMConfig
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	DSN string
}

// ElasticsearchConfig holds Elasticsearch configuration
type EsConfig struct {
	URL string
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port        string
	FrontendURL string
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	JWTSecret          string
	JWTExpirationHours int
	RefreshTokenDays   int
	PasswordMinLength  int
	EnableRegistration bool
}

// OAuthConfig holds OAuth configuration
type OAuthConfig struct {
	WechatKey         string
	WechatSecret      string
	WechatCallback    string
	WechatRedirectURL string
}

// SupabaseConfig
type SupabaseConfig struct {
	SupabaseUrl       string
	SupabaseKey       string
	SupabaseJWTSecret string // JWT Secret for local token verification
}

// UploadConfig holds file upload configuration
type UploadConfig struct {
	MaxFileSize int64  // Maximum file size in bytes
	UploadDir   string // Directory to store uploaded files
	URLPrefix   string // URL prefix for accessing uploaded files
}

// RabbitMQConfig holds RabbitMQ configuration
type RabbitMQConfig struct {
	URL string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	cfg := &Config{
		Database: DatabaseConfig{
			DSN: getEnv("PG_DSN", ""),
		},
		Es: EsConfig{
			URL: getEnv("ES_URL", "http://localhost:9200"),
		},
		Server: ServerConfig{
			Port:        getEnv("PORT", "8080"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		Auth: AuthConfig{
			JWTSecret:          getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			JWTExpirationHours: getEnvAsInt("JWT_EXPIRATION_HOURS", 24),
			RefreshTokenDays:   getEnvAsInt("REFRESH_TOKEN_DAYS", 30),
			PasswordMinLength:  getEnvAsInt("PASSWORD_MIN_LENGTH", 8),
			EnableRegistration: getEnvAsBool("ENABLE_REGISTRATION", true),
		},
		OAuth: OAuthConfig{
			WechatKey:         getEnv("WECHAT_KEY", ""),
			WechatSecret:      getEnv("WECHAT_SECRET", ""),
			WechatCallback:    getEnv("WECHAT_CALLBACK", "http://localhost:8080/api/v1/auth/wechat/callback"),
			WechatRedirectURL: getEnv("WECHAT_REDIRECT_URL", "http://localhost:3000/auth/callback?success=true"),
		},
		Supabase: SupabaseConfig{
			SupabaseUrl:       getEnv("SUPABASE_URL", ""),
			SupabaseKey:       getEnv("SUPABASE_KEY", ""),
			SupabaseJWTSecret: getEnv("SUPABASE_JWT_SECRET", ""),
		},
		Upload: UploadConfig{
			MaxFileSize: getEnvAsInt64("UPLOAD_MAX_SIZE", 10*1024*1024), // 10MB default
			UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
			URLPrefix:   getEnv("UPLOAD_URL_PREFIX", "/uploads"),
		},
		LLMProvider: LLMProvider{
			Provider: getEnv("LLM_PROVIDER", "gemini"),
			Gemini: LLMConfig{
				Model:  getEnv("GEMINI_MODEL", "gemini-1.5-flash"),
				APIKey: getEnv("GEMINI_API_KEY", ""),
			},
			Qwen: LLMConfig{
				Model:    getEnv("QWEN_MODEL", "qwen-vl-plus"),
				APIKey:   getEnv("QWEN_API_KEY", ""),
				Endpoint: getEnv("QWEN_ENDPOINT", ""),
			},
		},
		RabbitMQ: RabbitMQConfig{
			URL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		},
	}

	return cfg, nil
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return fallback
}

// getEnvAsInt gets an environment variable as int with a fallback value
func getEnvAsInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

// getEnvAsBool gets an environment variable as bool with a fallback value
func getEnvAsBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

// getEnvAsInt64 gets an environment variable as int64 with a fallback value
func getEnvAsInt64(key string, fallback int64) int64 {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	}
	return fallback
}
