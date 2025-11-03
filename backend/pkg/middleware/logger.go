package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	l "github.com/lhnx/pkg/logger"
)

func LoggerInjection(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := l.NewContextWithLogger(c.Request.Context())
		c.Request = c.Request.WithContext(ctx)

		start := time.Now()
		c.Next()
		end := time.Now()

		entry := l.FromContext(ctx)
		entry.WithFields(map[string]interface{}{
			"status":  c.Writer.Status(),
			"method":  c.Request.Method,
			"path":    c.Request.URL.Path,
			"ip":      c.ClientIP(),
			"latency": end.Sub(start).Seconds(),
		}).Info("Request completed")
	}
}
