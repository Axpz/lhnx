package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lhnx/model"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token has expired")
	ErrTokenExpired     = errors.New("token expired")
	ErrInvalidSignature = errors.New("invalid signature")
	ErrMissingJWTSecret = errors.New("missing JWT secret")
)

// JWTClaims JWT 声明结构（用于自建认证系统）
type JWTClaims struct {
	jwt.RegisteredClaims
	Email        string         `json:"email"`
	Phone        string         `json:"phone"`
	UserMetadata map[string]any `json:"user_metadata"`
	AppMetadata  map[string]any `json:"app_metadata"`
}

// JWTManager JWT 管理器
type JWTManager struct {
	secretKey            string
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
}

// NewJWTManager 创建新的 JWT 管理器
func NewJWTManager(secretKey string, accessTokenHours, refreshTokenDays int) *JWTManager {
	return &JWTManager{
		secretKey:            secretKey,
		accessTokenDuration:  time.Duration(accessTokenHours) * time.Hour,
		refreshTokenDuration: time.Duration(refreshTokenDays) * 24 * time.Hour,
	}
}

// GenerateAccessToken 生成访问令牌
func (manager *JWTManager) GenerateAccessToken(user *model.User) (string, error) {
	// claims := JWTClaims{
	// 	UserID:   user.ID,
	// 	Email:    user.Email,
	// 	Username: user.Username,
	// 	Role:     user.Role,
	// 	RegisteredClaims: jwt.RegisteredClaims{
	// 		ExpiresAt: jwt.NewNumericDate(time.Now().Add(manager.accessTokenDuration)),
	// 		IssuedAt:  jwt.NewNumericDate(time.Now()),
	// 		NotBefore: jwt.NewNumericDate(time.Now()),
	// 		Issuer:    "axpz.org",
	// 		Subject:   user.Email,
	// 	},
	// }

	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// return token.SignedString([]byte(manager.secretKey))
	return "", nil
}

// GenerateRefreshToken 生成刷新令牌
func (manager *JWTManager) GenerateRefreshToken(user *model.User) (string, error) {
	claims := jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(manager.refreshTokenDuration)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		Issuer:    "axpz.org",
		Subject:   user.Email,
		ID:        generateTokenID(), // 用于令牌撤销
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(manager.secretKey))
}

// VerifyToken 验证令牌
func (manager *JWTManager) VerifyToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&JWTClaims{},
		func(token *jwt.Token) (any, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, ErrInvalidToken
			}
			return []byte(manager.secretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// VerifyRefreshToken 验证刷新令牌
func (manager *JWTManager) VerifyRefreshToken(tokenString string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&jwt.RegisteredClaims{},
		func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, ErrInvalidToken
			}
			return []byte(manager.secretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// generateTokenID 生成令牌ID（用于刷新令牌撤销）
func generateTokenID() string {
	return time.Now().Format("20060102150405") + randomString(8)
}

// randomString 生成随机字符串
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
