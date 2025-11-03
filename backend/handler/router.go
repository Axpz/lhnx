package handler

import "github.com/gin-gonic/gin"

// RouteRegistrar 定义路由注册接口
type RouteRegistrar interface {
	RegisterRoutes(rg *gin.RouterGroup)
}

// RegisterAllRoutes 注册所有路由
func RegisterAllRoutes(rg *gin.RouterGroup, handlers *Handlers) {
	// 注册各个模块的路由
	handlers.AuthSupabase.RegisterRoutes(rg)
	handlers.Upload.RegisterRoutes(rg)
	handlers.Chat.RegisterRoutes(rg)
}
