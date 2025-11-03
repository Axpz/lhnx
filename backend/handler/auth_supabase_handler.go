package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lhnx/config"
	"github.com/lhnx/model"
	"github.com/lhnx/pkg/auth"
	"github.com/lhnx/pkg/logger"
	"github.com/lhnx/pkg/middleware"
	"github.com/lhnx/service"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
)

// AuthSupabaseHandler 认证处理器
type AuthSupabaseHandler struct {
	client      *supabase.Client
	jwtManager  *auth.JWTManager
	authService service.AuthService
}

// SignUpRequest 注册请求
type SignUpRequest struct {
	Email    string         `json:"email" binding:"required,email"`
	Password string         `json:"password" binding:"required,min=8"`
	Data     map[string]any `json:"data,omitempty"` // 用户元数据
}

// TokenRequest 令牌请求
type TokenRequest struct {
	GrantType    string `json:"grant_type" binding:"required,oneof=password refresh_token"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	RefreshToken string `json:"refresh_token"`
}

// UpdateUserRequest 更新用户请求
type UpdateUserRequest struct {
	Email    string         `json:"email,omitempty"`
	Password string         `json:"password,omitempty"`
	Data     map[string]any `json:"data,omitempty"`
}

type UserResponse struct {
	UserID string         `json:"user_id"`
	Email  string         `json:"email"`
	Role   model.UserRole `json:"role"`
}

// NewAuthSupabaseHandler 创建认证处理器
func NewAuthSupabaseHandler(cfg *config.Config, jwtManager *auth.JWTManager, authService service.AuthService) *AuthSupabaseHandler {
	supabaseURL := cfg.Supabase.SupabaseUrl
	supabaseKey := cfg.Supabase.SupabaseKey

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_KEY must be configured")
		return nil
	}

	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Fatal("Failed to create Supabase client")
		return nil
	}

	return &AuthSupabaseHandler{
		client:      client,
		jwtManager:  jwtManager,
		authService: authService,
	}
}

// RegisterRoutes 注册认证路由
func (h *AuthSupabaseHandler) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		// 对应supabase /auth/v1/signup
		auth.POST("/signup", h.SignUp)

		// 对应supabase /auth/v1/token?grant_type=password
		// 对应supabase /auth/v1/token?grant_type=refresh_token
		auth.POST("/token", h.Token)

		// 对应supabase /auth/v1/user
		auth.GET("/user", middleware.AuthMiddleware(h.jwtManager), h.GetUser)

		// 对应supabase /auth/v1/user
		auth.PUT("/user", middleware.AuthMiddleware(h.jwtManager), h.UpdateUser)

		// 对应supabase /auth/v1/logout
		auth.POST("/logout", middleware.AuthMiddleware(h.jwtManager), h.Logout)
	}
}

// SignUp 用户注册
func (h *AuthSupabaseHandler) SignUp(c *gin.Context) {
	var req SignUpRequest
	var logger = logger.FromContext(c.Request.Context())
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WithError(err).Warn("Invalid signup request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// 使用Supabase SDK注册用户
	signupReq := types.SignupRequest{
		Email:    req.Email,
		Password: req.Password,
		Data:     req.Data,
	}

	resp, err := h.client.Auth.Signup(signupReq)
	if err != nil {
		logger.WithError(err).WithField("email", req.Email).Error("Failed to sign up user")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to sign up", "details": err.Error()})
		return
	}

	logger.WithField("user_id", resp.User.ID).Info("User signed up successfully")
	c.JSON(http.StatusOK, gin.H{
		"user":          resp.User,
		"session":       resp.Session,
		"access_token":  resp.AccessToken,
		"refresh_token": resp.RefreshToken,
	})
}

// Token 获取访问令牌
func (h *AuthSupabaseHandler) Token(c *gin.Context) {
	var req TokenRequest
	var logger = logger.FromContext(c.Request.Context())
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WithError(err).Warn("Invalid token request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	switch req.GrantType {
	case "password":
		h.signInWithPassword(c, req)
	case "refresh_token":
		h.refreshToken(c, req)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid grant_type"})
	}
}

// signInWithPassword 使用密码登录
func (h *AuthSupabaseHandler) signInWithPassword(c *gin.Context, req TokenRequest) {
	var logger = logger.FromContext(c.Request.Context())

	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	resp, err := h.client.Auth.SignInWithEmailPassword(req.Email, req.Password)
	if err != nil {
		logger.WithError(err).WithField("email", req.Email).Error("Failed to sign in")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials", "details": err.Error()})
		return
	}

	role, ok := resp.User.UserMetadata["role"].(string)
	if !ok {
		role = "user"
	}

	user, err := h.authService.SyncFromSupabase(resp.User.ID.String(), resp.User.Email, role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sync failed", "details": err.Error()})
		return
	}

	logger.WithField("email", user.Email).Info("User signed in successfully")
	c.JSON(http.StatusOK, gin.H{
		"user":          resp.User,
		"session":       resp.Session,
		"access_token":  resp.AccessToken,
		"refresh_token": resp.RefreshToken,
	})
}

// refreshToken 刷新访问令牌
func (h *AuthSupabaseHandler) refreshToken(c *gin.Context, req TokenRequest) {
	var logger = logger.FromContext(c.Request.Context())
	if req.RefreshToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token is required"})
		return
	}

	resp, err := h.client.Auth.RefreshToken(req.RefreshToken)
	if err != nil {
		logger.WithError(err).Error("Failed to refresh token")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token", "details": err.Error()})
		return
	}

	logger.WithField("user_id", resp.User.ID).Info("Token refreshed successfully")
	c.JSON(http.StatusOK, gin.H{
		"user":          resp.User,
		"session":       resp.Session,
		"access_token":  resp.AccessToken,
		"refresh_token": resp.RefreshToken,
	})
}

// GetUser 获取当前用户信息
func (h *AuthSupabaseHandler) GetUser(c *gin.Context) {
	var logger = logger.FromContext(c.Request.Context())
	token := c.GetString("access_token")

	resp, err := h.client.Auth.WithToken(token).GetUser()
	if err != nil {
		logger.WithError(err).Error("Failed to get user")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": resp.User})
}

// UpdateUser 更新用户信息
func (h *AuthSupabaseHandler) UpdateUser(c *gin.Context) {
	var req UpdateUserRequest
	var logger = logger.FromContext(c.Request.Context())
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WithError(err).Warn("Invalid update user request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	token := c.GetString("access_token")

	updateReq := types.UpdateUserRequest{
		Email: req.Email,
		Data:  req.Data,
	}

	// Password needs to be a pointer
	if req.Password != "" {
		updateReq.Password = &req.Password
	}

	resp, err := h.client.Auth.WithToken(token).UpdateUser(updateReq)
	if err != nil {
		logger.WithError(err).Error("Failed to update user")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update user", "details": err.Error()})
		return
	}

	logger.WithField("user_id", resp.User.ID).Info("User updated successfully")
	c.JSON(http.StatusOK, gin.H{"user": resp.User})
}

// Logout 用户登出
func (h *AuthSupabaseHandler) Logout(c *gin.Context) {
	var logger = logger.FromContext(c.Request.Context())
	token := c.GetString("access_token")

	err := h.client.Auth.WithToken(token).Logout()
	if err != nil {
		logger.WithError(err).Error("Failed to logout")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to logout", "details": err.Error()})
		return
	}

	logger.Info("User logged out successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
