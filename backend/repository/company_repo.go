package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/lhnx/config"
	"github.com/lhnx/model"
	"github.com/lhnx/pkg/logger"
	"github.com/olivere/elastic/v7"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// CompanyRepository defines company repository interface
type CompanyRepository interface {
	List(ctx context.Context, filter CompanyFilters) ([]model.Company, int64, error)
	Create(ctx context.Context, company *model.Company) error
	Update(ctx context.Context, company *model.Company) error
	Delete(ctx context.Context, id uuid.UUID) error

	EsSync(ctx context.Context, daysAgo int) error
	EsSearch(ctx context.Context, filter CompanyFilters) (*elastic.SearchResult, error)
	EsFeatured(ctx context.Context) (*elastic.SearchResult, error)
	EsStats(ctx context.Context) (int64, error)
	EsBulkIndex(ctx context.Context, infos []model.CompanyESInfo) (*elastic.BulkResponse, error)
	EsIndex(ctx context.Context, company *model.Company) error
	EsDelete(ctx context.Context, id uuid.UUID) error
}

type companyRepository struct {
	db      *gorm.DB
	es      *elastic.Client
	esIndex string
}

type CompanyFilters struct {
	Keyword       string     `json:"keyword"`
	UserID        uuid.UUID  `json:"user_id"`
	CompanyID     uuid.UUID  `json:"company_id"`
	CreditCode    string     `json:"credit_code"`
	Type          string     `json:"type"`
	CompanyStatus string     `json:"company_status"`
	IsVerified    *bool      `json:"is_verified"`
	IsActive      *bool      `json:"is_active"`
	IsFeatured    *bool      `json:"is_featured"`
	UpdatedAt     *time.Time `json:"updated_at,omitempty"`

	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

func NewCompanyRepository(clientSet config.ClientSet) CompanyRepository {
	return &companyRepository{db: clientSet.Db, es: clientSet.Es, esIndex: "companies"}
}

// List 获取企业列表
func (r *companyRepository) List(ctx context.Context, filter CompanyFilters) ([]model.Company, int64, error) {
	var companies []model.Company
	var total int64
	var hasFilter bool

	query := r.db.WithContext(ctx).Model(&model.Company{})

	if filter.CompanyID != uuid.Nil {
		// 优化: ID查询直接返回，无需Count和排序，避免在大数据量下不必要的开销
		if err := query.Where("id = ?", filter.CompanyID).First(&companies).Error; err != nil {
			return nil, 0, err
		}
		return companies, 1, nil
	}

	if filter.CreditCode != "" {
		if err := query.Where("credit_code = ?", filter.CreditCode).First(&companies).Error; err != nil {
			return nil, 0, err
		}
		return companies, 1, nil
	}

	if filter.UserID != uuid.Nil {
		query = query.Where("user_id = ?", filter.UserID)

		if filter.Keyword != "" {
			query = query.Where("info ->> 'name' ILIKE ?", "%"+filter.Keyword+"%")
		}
		hasFilter = true
	}

	if filter.UpdatedAt != nil {
		query = query.Where("updated_at >= ?", filter.UpdatedAt)
		hasFilter = true
	}

	if !hasFilter {
		return nil, 0, errors.New("no filter provided")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("updated_at DESC").
		Offset(filter.Offset).Limit(filter.Limit).Find(&companies).Error; err != nil {
		return nil, 0, err
	}

	return companies, total, nil
}

// Create 创建企业
func (r *companyRepository) Create(ctx context.Context, company *model.Company) error {
	if company.Info == nil {
		company.Info = datatypes.JSONMap{}
	}
	company.UpdatedAt = time.Now().UTC()
	return r.db.WithContext(ctx).Create(company).Error
}

// Update 更新企业
func (r *companyRepository) Update(ctx context.Context, company *model.Company) error {
	if company.Info == nil {
		company.Info = datatypes.JSONMap{}
	}
	return r.db.WithContext(ctx).Save(company).Error
}

// Delete 删除企业（软删除）
func (r *companyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.Company{}, "id = ?", id).Error
}

func (r *companyRepository) toESInfo(company *model.Company) model.CompanyESInfo {
	getString := func(m map[string]any, key string) string {
		if v, ok := m[key]; ok {
			return v.(string)
		}
		return ""
	}

	getInt := func(m map[string]any, key string) int {
		if v, ok := m[key]; ok {
			num, err := v.(json.Number).Int64()
			if err != nil {
				return 0
			}
			return int(num)
		}
		return 0
	}

	return model.CompanyESInfo{
		ID:                company.ID,
		Name:              getString(company.Info, "name"),
		LegalPerson:       getString(company.Info, "legal_person"),
		RegisteredCapital: getString(company.Info, "registered_capital"),
		FoundedTime:       getString(company.Info, "founded_time"),
		CompanyStatus:     getString(company.Info, "company_status"),
		Type:              getString(company.Info, "type"),
		CreditCode:        getString(company.Info, "credit_code"),
		Address:           getString(company.Info, "address"),
		BusinessScope:     getString(company.Info, "business_scope"),
		Website:           getString(company.Info, "website"),
		Email:             getString(company.Info, "email"),
		Phone:             getString(company.Info, "phone"),
		SortOrder:         getInt(company.Info, "sort_order"),
		UpdatedAt:         company.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func (r *companyRepository) EsBulkIndex(ctx context.Context, infos []model.CompanyESInfo) (*elastic.BulkResponse, error) {
	bulk := r.es.Bulk()
	for _, info := range infos {
		req := elastic.NewBulkIndexRequest().
			Index(r.esIndex).
			Id(info.ID.String()).
			Doc(info)
		bulk.Add(req)
	}
	return bulk.Do(ctx)
}

func (r *companyRepository) EsSync(ctx context.Context, daysAgo int) error {
	logger := logger.FromContext(ctx)

	var lastID uuid.UUID
	limit := 1000

	startTime := time.Now().UTC().AddDate(0, 0, -daysAgo)
	count := 0

	for {
		var companies []model.Company

		query := r.db.WithContext(ctx).Model(&model.Company{}).Order("id ASC").Limit(limit)
		if daysAgo > 0 {
			query = query.Where("updated_at >= ?", startTime)
		}

		if lastID != uuid.Nil {
			query = query.Where("id > ?", lastID)
		}

		if err := query.Find(&companies).Error; err != nil {
			return err
		}
		if len(companies) == 0 {
			break
		}

		infos := make([]model.CompanyESInfo, len(companies))
		for i, company := range companies {
			infos[i] = r.toESInfo(&company)
		}

		if _, err := r.EsBulkIndex(ctx, infos); err != nil {
			return err
		}

		lastID = companies[len(companies)-1].ID
		count += len(companies)
		logger.WithField("last_id", lastID).WithField("count", count).Info("Synced companies to Elasticsearch")

		if lastID == uuid.Nil {
			break
		}
	}
	logger.WithField("count", count).Info("Synced companies to Elasticsearch completed")
	return nil
}

func (r *companyRepository) EsSearch(ctx context.Context, filter CompanyFilters) (*elastic.SearchResult, error) {
	logger := logger.FromContext(ctx)
	startTime := time.Now()

	keyword := filter.Keyword

	searchFields := []string{
		"name^3",
		"legal_person",
		"address",
		"type",
		"business_scope",
	}

	query := elastic.NewMultiMatchQuery(keyword, searchFields...).
		Type("best_fields").
		Operator("and")

	// // 创建聚合
	// byProvinceAgg := elastic.NewTermsAggregation().Field("province").Size(10)
	// if true {
	// 	byCityAgg := elastic.NewTermsAggregation().Field("city").Size(10)
	// 	byProvinceAgg = byProvinceAgg.SubAggregation("by_city", byCityAgg)
	// }

	// byIndustryAgg := elastic.NewTermsAggregation().Field("industry").Size(10)

	// 构建搜索请求
	result, err := r.es.Search().
		Index(r.esIndex).
		Query(query).
		// Aggregation("by_province", byProvinceAgg).
		// Aggregation("by_industry", byIndustryAgg).
		From(filter.Offset).
		Size(filter.Limit).
		TrackTotalHits(true).
		Do(ctx)
	if err != nil {
		logger.Error("Search failed", err)
		return nil, errors.New("Search failed: " + err.Error())
	}

	duration := time.Since(startTime)

	logger.WithField("duration", duration.Milliseconds()).
		WithField("hits", result.Hits.TotalHits.Value).
		Infof("Search %s", keyword)
	return result, nil
}

func (r *companyRepository) EsFeatured(ctx context.Context) (*elastic.SearchResult, error) {
	query := elastic.NewRangeQuery("sort_order").Gt(0)
	return r.es.Search().
		Index(r.esIndex).
		Query(query).
		Sort("sort_order", false).
		Size(10).
		Do(ctx)
}

func (r *companyRepository) EsStats(ctx context.Context) (int64, error) {
	return r.es.Count(r.esIndex).Do(ctx)
}

// EsIndex 索引单条数据到 Elasticsearch
func (r *companyRepository) EsIndex(ctx context.Context, company *model.Company) error {
	info := r.toESInfo(company)
	_, err := r.es.Index().
		Index(r.esIndex).
		Id(info.ID.String()).
		BodyJson(info).
		Do(ctx)
	return err
}

// EsDelete 从 Elasticsearch 删除单条数据
func (r *companyRepository) EsDelete(ctx context.Context, id uuid.UUID) error {
	// 检查文档是否存在
	exists, err := r.es.Exists().Index(r.esIndex).Id(id.String()).Do(ctx)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	_, err = r.es.Delete().
		Index(r.esIndex).
		Id(id.String()).
		Do(ctx)
	return err
}
