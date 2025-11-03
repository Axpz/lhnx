package middleware

import (
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lhnx/model"
	"github.com/lhnx/pkg/auth"
)

// AuthMiddleware 认证中间件
func AuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "missing authorization token",
			})
			c.Abort()
			return
		}

		claims, err := jwtManager.VerifyToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token",
			})
			c.Abort()
			return
		}

		// 将用户信息存储到上下文中
		c.Set("access_token", token)
		c.Set("user_claims", claims)

		c.Next()
	}
}

// RequireRole 角色权限中间件
func RequireRole(roles ...model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "user role not found",
			})
			c.Abort()
			return
		}

		role, ok := userRole.(model.UserRole)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "invalid user role type",
			})
			c.Abort()
			return
		}

		if !slices.Contains(roles, role) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "insufficient permissions",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin 管理员权限中间件
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(model.RoleAdmin)
}

// RequireEnterpriseOrAdmin 企业用户或管理员权限中间件
func RequireEnterpriseOrAdmin() gin.HandlerFunc {
	return RequireRole(model.RoleEnterprise, model.RoleAdmin)
}

// extractToken 从请求中提取令牌
func extractToken(c *gin.Context) string {
	// 首先尝试从 Authorization header 获取
	bearerToken := c.GetHeader("Authorization")
	bearerTokenArr := strings.Split(bearerToken, " ")
	if len(bearerTokenArr) == 2 {
		return bearerTokenArr[1]
	}

	// 然后尝试从 Cookie 获取
	token, err := c.Cookie("access_token")
	if err == nil {
		return token
	}

	return ""
}

// GetCurrentUser 获取当前用户信息的辅助函数
func GetCurrentUser(c *gin.Context) (*auth.JWTClaims, bool) {
	claims, exists := c.Get("user_claims")
	if !exists {
		return nil, false
	}

	userClaims, ok := claims.(*auth.JWTClaims)
	if !ok {
		return nil, false
	}

	return userClaims, true
}

// GetCurrentUserID 获取当前用户ID的辅助函数
func GetCurrentUserID(c *gin.Context) (int64, bool) {
	claims, exists := GetCurrentUser(c)
	if !exists {
		return 0, false
	}

	userId, ok := claims.UserMetadata["user_id"].(float64)
	if !ok {
		return 0, false
	}

	return int64(userId), true
}

// GetCurrentUserRole 获取当前用户角色的辅助函数
func GetCurrentUserRole(c *gin.Context) (model.UserRole, bool) {
	claims, exists := GetCurrentUser(c)
	if !exists {
		return "", false
	}

	r := model.RoleUser

	return r.StringToRole(claims.UserMetadata["role"].(string)), true
}
