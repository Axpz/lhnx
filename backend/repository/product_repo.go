package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/lhnx/config"
	"github.com/lhnx/model"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ProductRepository defines product repository interface
type ProductRepository interface {
	List(ctx context.Context, filters ProductFilters) ([]model.Product, int64, error)
	Create(ctx context.Context, product *model.Product) error
	Update(ctx context.Context, product *model.Product) error
	Delete(ctx context.Context, id uuid.UUID) error

	Stats(ctx context.Context) (int64, error)
	IncrViewCount(ctx context.Context, id uuid.UUID) error
}

// ProductCategory represents a product category currently hard-coded as follows:
// 1: 暖贴
// 2: 发热鞋垫
// 3: 暖手贴
// 4: 蒸汽眼罩

// ProductFilters holds filters for product queries
type ProductFilters struct {
	Keyword       string     `json:"keyword"`
	ProductID     uuid.UUID  `json:"product_id"`
	CompanyID     uuid.UUID  `json:"company_id"`
	ProductStatus *int       `json:"product_status,omitempty"`
	SortOrder     int        `json:"sort_order"`
	Category      int        `json:"category"`
	UpdatedAt     *time.Time `json:"updated_at,omitempty"`

	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new product repository
func NewProductRepository(clientSet config.ClientSet) ProductRepository {
	return &productRepository{db: clientSet.Db}
}

// List retrieves all products with optional filters
func (r *productRepository) List(ctx context.Context, filters ProductFilters) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64
	query := r.db.WithContext(ctx).Model(&model.Product{})

	if filters.ProductID != uuid.Nil {
		query = query.Where("id = ?", filters.ProductID)
		total = 1
		if err := query.Preload("Company").First(&products).Error; err != nil {
			return nil, 0, err
		}
		return products, total, nil
	}

	if filters.CompanyID != uuid.Nil {
		query = query.Where("company_id = ?", filters.CompanyID)
	}

	if filters.Keyword != "" {
		query = query.Where("name ILIKE ?", "%"+filters.Keyword+"%")
	}

	if filters.Category > 1 {
		query = query.Where("info ->> 'category' = ?", strconv.Itoa(filters.Category))
	}

	if filters.ProductStatus != nil {
		query = query.Where(
			"COALESCE(info ->> 'status', '0') = ?",
			strconv.Itoa(*filters.ProductStatus),
		)
	}

	if filters.UpdatedAt != nil {
		query = query.Where("updated_at >= ?", filters.UpdatedAt)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Preload("Company").Order("sort_order DESC").
		Offset(filters.Offset).Limit(filters.Limit).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// Create creates a new product
func (r *productRepository) Create(ctx context.Context, product *model.Product) error {
	if product.Info == nil {
		product.Info = datatypes.JSONMap{}
	}
	return r.db.WithContext(ctx).Create(product).Error
}

// Update updates an existing product
func (r *productRepository) Update(ctx context.Context, product *model.Product) error {
	if product.Info == nil {
		product.Info = datatypes.JSONMap{}
	}
	return r.db.WithContext(ctx).Omit("Company").Save(product).Error
}

// Delete soft deletes a product
func (r *productRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.Product{}, "id = ?", id).Error
}

// GetStats retrieves product statistics
func (r *productRepository) Stats(ctx context.Context) (int64, error) {
	// 获取总数
	var total int64
	if err := r.db.WithContext(ctx).Model(&model.Product{}).Count(&total).Error; err != nil {
		return 0, fmt.Errorf("failed to get total count: %w", err)
	}

	return total, nil
}

// IncrViewCount increments the view count for a product
func (r *productRepository) IncrViewCount(ctx context.Context, id uuid.UUID) error {
	// Use raw SQL for atomic update of JSONB field
	// COALESCE((info->>'view_count')::int, 0) + 1 ensures we handle missing key or null correctly
	return r.db.WithContext(ctx).Exec("UPDATE products SET info = jsonb_set(info, '{view_count}', to_jsonb(COALESCE((info->>'view_count')::int, 0) + 1)) WHERE id = ?", id).Error
}
