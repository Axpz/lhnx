package app

import (
	"context"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/lhnx/config"
	"github.com/lhnx/handler"
	"github.com/lhnx/pkg/auth"
	"github.com/lhnx/pkg/database"
	"github.com/lhnx/pkg/logger"
	"github.com/lhnx/pkg/middleware"
	"github.com/lhnx/pkg/rabbitmq"
	"github.com/lhnx/repository"
	"github.com/lhnx/service"
	"github.com/olivere/elastic/v7"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// App represents the application
type App struct {
	config *config.Config
	router *gin.Engine
	logger *logrus.Logger
}

// New creates a new application instance
func NewApp(cfg *config.Config) *App {
	return &App{
		config: cfg,
		logger: logger.InitLogger(),
	}
}

// NewRootCommand 返回根命令
func NewAppCommand(cfg *config.Config) *cobra.Command {
	app := NewApp(cfg)

	rootCmd := &cobra.Command{
		Use:   "app",
		Short: "Application",
		RunE: func(cmd *cobra.Command, args []string) error {
			return app.Run()
		},
	}

	rootCmd.AddCommand(NewEsSyncCommand(cfg))

	return rootCmd
}

// Run starts the application
func (a *App) Run() error {
	a.logger.Info("Initializing application...")

	// Initialize database
	db, err := database.New(database.Config{
		DSN: a.config.Database.DSN,
	})
	if err != nil {
		a.logger.Error(fmt.Sprintf("Failed to connect to database: %v", err))
		return err
	}
	a.logger.Info("Database connection established")

	esClient, err := elastic.NewClient(
		elastic.SetURL(a.config.Es.URL),
		elastic.SetSniff(false),
	)
	if err != nil {
		a.logger.Error(fmt.Sprintf("Failed to create Elasticsearch client: %v", err))
		return err
	}
	a.logger.Info("Elasticsearch client created")

	// Initialize OAuth providers
	auth.InitOAuth(
		a.config.OAuth.WechatKey,
		a.config.OAuth.WechatSecret,
		a.config.OAuth.WechatCallback,
	)
	a.logger.Info("OAuth providers initialized")

	// Initialize RabbitMQ
	var mqClient *rabbitmq.Client
	if a.config.RabbitMQ.URL != "" {
		var err error
		mqClient, err = rabbitmq.New(a.config.RabbitMQ.URL)
		if err != nil {
			a.logger.Errorf("Failed to connect to RabbitMQ: %v", err)
			return err
		}

		a.logger.Info("RabbitMQ client initialized")
		defer mqClient.Close()
	}

	// Initialize JWT manager
	jwtManager := auth.NewJWTManager(
		a.config.Auth.JWTSecret,
		a.config.Auth.JWTExpirationHours,
		a.config.Auth.RefreshTokenDays,
	)

	// Initialize password manager
	passwordManager := auth.NewPasswordManager()

	a.config.JwtManager = jwtManager
	a.config.PwdManager = passwordManager

	clientSet := config.ClientSet{
		Db: db,
		Es: esClient,
		Q:  mqClient,
	}

	// Initialize repositories
	repos := repository.New(clientSet)

	// Initialize LLM provider
	llmProviderSet, err := service.NewLLMProviderSet(context.Background(), a.config)
	if err != nil {
		a.logger.Error(fmt.Sprintf("Failed to initialize LLM provider: %v", err))
		return err
	}

	// Initialize services
	services := service.New(repos, a.config, llmProviderSet, clientSet)

	// Initialize handlers
	handlers := handler.New(services, jwtManager, a.config)

	// Setup router
	a.setupRouter(handlers)

	a.logger.Info(fmt.Sprintf("Starting server on port %s", a.config.Server.Port))
	return a.router.Run(":" + a.config.Server.Port)
}

// setupRouter configures the HTTP router
func (a *App) setupRouter(handlers *handler.Handlers) {
	// 根据日志级别设置 Gin 模式
	// loggerCfg := config.GetLoggerConfig()
	// logger.SetGinMode(loggerCfg.Level)

	// 禁用 Gin 默认日志（使用我们自己的日志系统）
	// logger.DisableGinDefaultLogger()

	// Create router without default middleware
	a.router = gin.New()

	// Add custom middleware (顺序很重要！)
	a.router.Use(middleware.LoggerInjection(a.logger)) // 注入 logger 到 gin.Context

	// CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{a.config.Server.FrontendURL}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	a.router.Use(cors.New(corsConfig))

	// Static file serving for uploads
	a.router.Static(a.config.Upload.URLPrefix, a.config.Upload.UploadDir)

	// API routes
	v1 := a.router.Group("/api/v1")

	// 使用统一的路由注册方法
	handler.RegisterAllRoutes(v1, handlers)
}
