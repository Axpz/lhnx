package fileutil

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

// CalculateMD5 calculates MD5 hash of a file
func CalculateMD5(file multipart.File) (string, error) {
	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	// Reset file pointer to beginning
	if _, err := file.Seek(0, 0); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// EnsureDir ensures directory exists, creates if not
func EnsureDir(dirPath string) error {
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return os.MkdirAll(dirPath, 0755)
	}
	return nil
}

// SaveFile saves uploaded file to specified path
func SaveFile(file multipart.File, destPath string) error {
	// Ensure directory exists
	dir := filepath.Dir(destPath)
	if err := EnsureDir(dir); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Create destination file
	dst, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	return nil
}

// IsImageFile checks if mime type is an image
func IsImageFile(mimeType string) bool {
	return strings.HasPrefix(mimeType, "image/")
}

// FileExists checks if file exists
func FileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// SavedFileInfo describes the result of saving an uploaded file
type SavedFileInfo struct {
	URL       string
	Filename  string
	Size      int64
	Type      string
	Duplicate bool
}

// SaveImageFromFormFile saves an image using MD5-based deduplication and returns file info.
// uploadDir is the directory to store the file, urlPrefix is the base URL for accessing it.
func SaveImageFromFormFile(fileHeader *multipart.FileHeader, uploadDir string, urlPrefix string) (*SavedFileInfo, error) {
	// Open once for hashing and potential saving; CalculateMD5 resets the reader.
	f, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer f.Close()

	md5Hash, err := CalculateMD5(f)
	if err != nil {
		return nil, err
	}

	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%s%s", md5Hash, ext)
	pathName := filepath.Join(uploadDir, filename)
	fileURL := fmt.Sprintf("%s/%s", urlPrefix, filename)

	info := &SavedFileInfo{
		URL:      fileURL,
		Filename: pathName,
		Size:     fileHeader.Size,
		Type:     fileHeader.Header.Get("Content-Type"),
	}

	if FileExists(pathName) {
		info.Duplicate = true
		return info, nil
	}

	// reader is reset by CalculateMD5, so we can reuse f to save
	if err := SaveFile(f, pathName); err != nil {
		return nil, err
	}

	return info, nil
}
