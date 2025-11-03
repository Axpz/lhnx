package logger

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path"
	"runtime"
	"time"

	"github.com/sirupsen/logrus"
)

type ctxKey string

const logKey ctxKey = "logger"

// 全局默认 logger
var baseLogger *logrus.Logger

func generateShortTraceID() string {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to timestamp-based ID if random fails
		return hex.EncodeToString([]byte{
			byte(time.Now().Unix() >> 24),
			byte(time.Now().Unix() >> 16),
			byte(time.Now().Unix() >> 8),
			byte(time.Now().Unix()),
		})
	}
	return hex.EncodeToString(bytes)
}

func InitLogger() *logrus.Logger {
	baseLogger = logrus.New()
	baseLogger.SetLevel(logrus.DebugLevel)
	baseLogger.SetOutput(os.Stdout)
	baseLogger.SetReportCaller(true)
	baseLogger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05.000",
		CallerPrettyfier: func(f *runtime.Frame) (string, string) {
			filename := path.Base(f.File)
			return "", fmt.Sprintf("%s:%d", filename, f.Line)
		},
	})
	return baseLogger
}

// NewContextWithLogger 创建带 traceID 的 context logger
func NewContextWithLogger(ctx context.Context) context.Context {
	traceID := generateShortTraceID()
	logger := baseLogger.WithField("trace_id", traceID)
	return context.WithValue(ctx, logKey, logger)
}

// FromContext 获取 logger（带 trace_id）
func FromContext(ctx context.Context) *logrus.Entry {
	if entry, ok := ctx.Value(logKey).(*logrus.Entry); ok {
		return entry
	}
	return baseLogger.WithField("trace_id", "unknown")
}
