package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lhnx/config"
	"github.com/lhnx/pkg/fileutil"
)

type UploadHandler struct {
	cfg *config.Config
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	return &UploadHandler{cfg: cfg}
}

// RegisterRoutes registers upload routes
func (h *UploadHandler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.POST("/upload", h.UploadFile)
}

// UploadFile handles file upload
// @Summary Upload file
// @Description Upload image file with MD5 deduplication
// @Tags Upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/upload [post]
func (h *UploadHandler) UploadFile(c *gin.Context) {
	// Get file from form
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "没有找到文件",
		})
		return
	}

	// Validate file type
	if !fileutil.IsImageFile(fileHeader.Header.Get("Content-Type")) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "只支持图片文件",
		})
		return
	}

	// Validate file size (10MB)
	maxSize := h.cfg.Upload.MaxFileSize
	if fileHeader.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "文件大小不能超过 10MB",
		})
		return
	}

	info, err := fileutil.SaveImageFromFormFile(fileHeader, h.cfg.Upload.UploadDir, h.cfg.Upload.URLPrefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件处理失败"})
		return
	}

	if info.Duplicate {
		c.JSON(http.StatusOK, gin.H{
			"url":       info.URL,
			"filename":  info.Filename,
			"size":      info.Size,
			"type":      info.Type,
			"duplicate": true,
			"message":   "文件已存在，使用现有文件",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      info.URL,
		"filename": info.Filename,
		"size":     info.Size,
		"type":     info.Type,
	})
}
