package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/lhnx/config"
	"github.com/lhnx/model"
	"gorm.io/gorm"
)

// OEMRepository defines OEM repository interface
type OEMRepository interface {
	Create(ctx context.Context, submission *model.OEMSubmission) error
	List(ctx context.Context, filter OEMFilter) ([]model.OEMSubmission, int64, error)
	Update(ctx context.Context, submission *model.OEMSubmission) error
	Delete(ctx context.Context, id uuid.UUID) error

	Stats(ctx context.Context) (int64, error)
}

// OEMFilter OEM筛选条件
type OEMFilter struct {
	ID        uuid.UUID `json:"id"`
	Status    string    `json:"status"`
	UserType  string    `json:"user_type"`
	Search    string    `json:"search"`
	StartDate string    `json:"start_date"`
	EndDate   string    `json:"end_date"`

	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

type oemRepository struct {
	db *gorm.DB
}

// NewOEMRepository creates a new OEM repository
func NewOEMRepository(clientSet config.ClientSet) OEMRepository {
	return &oemRepository{db: clientSet.Db}
}

// Create creates a new OEM submission
func (r *oemRepository) Create(ctx context.Context, submission *model.OEMSubmission) error {
	return r.db.WithContext(ctx).Create(submission).Error
}

// List retrieves OEM submissions with pagination
func (r *oemRepository) List(ctx context.Context, filter OEMFilter) ([]model.OEMSubmission, int64, error) {
	var submissions []model.OEMSubmission
	var total int64
	if err := r.db.WithContext(ctx).Model(&model.OEMSubmission{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	return submissions, total, nil
}

// Update updates an existing OEM submission
func (r *oemRepository) Update(ctx context.Context, submission *model.OEMSubmission) error {
	return r.db.WithContext(ctx).Save(submission).Error
}

// Delete soft deletes an OEM submission
func (r *oemRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.OEMSubmission{}, id).Error
}

// Stats retrieves OEM submission statistics
func (r *oemRepository) Stats(ctx context.Context) (int64, error) {
	// 总提交数
	var total int64
	if err := r.db.WithContext(ctx).Model(&model.OEMSubmission{}).Count(&total).Error; err != nil {
		return 0, err
	}

	return total, nil
}
