package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Company struct {
	ID         uuid.UUID         `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CreditCode *string           `json:"credit_code" gorm:"type:varchar(50);unique"`
	UserID     *uuid.UUID        `json:"user_id" gorm:"type:uuid"`
	Info       datatypes.JSONMap `json:"info" gorm:"type:jsonb;not null;default:'{}'::jsonb"`
	UpdatedAt  time.Time         `json:"updated_at"`

	Products []Product `json:"products,omitempty" gorm:"foreignKey:CompanyID"`
}

type CompanyESInfo struct {
	ID                uuid.UUID `json:"id"`
	Name              string    `json:"name"`
	LegalPerson       string    `json:"legal_person"`
	RegisteredCapital string    `json:"registered_capital,omitempty"`
	FoundedTime       string    `json:"founded_time,omitempty"`
	CompanyStatus     string    `json:"company_status,omitempty"`
	Type              string    `json:"type,omitempty"`
	CreditCode        string    `json:"credit_code,omitempty"`
	Address           string    `json:"address,omitempty"`
	BusinessScope     string    `json:"business_scope,omitempty"`
	Website           string    `json:"website,omitempty"`
	Email             string    `json:"email,omitempty"`
	Phone             string    `json:"phone,omitempty"`
	SortOrder         int       `json:"sort_order,omitempty"`
	UpdatedAt         string    `json:"updated_at,omitempty"`
}

// MergeInfo merges the provided key-value pairs into the company info payload.
func (c *Company) MergeInfo(updates datatypes.JSONMap) {
	if c.Info == nil {
		c.Info = datatypes.JSONMap{}
	}
	for k, v := range updates {
		if v == nil {
			delete(c.Info, k)
			continue
		}
		c.Info[k] = v
	}
}

// CompanyVerifyStatus 审核状态常量
const (
	VerifyStatusPending  = "pending"  // 待审核
	VerifyStatusApproved = "approved" // 已通过
	VerifyStatusRejected = "rejected" // 已拒绝
)

// CompanyStatus 企业状态常量
const (
	CompanyStatusNormal     = "正常" // 正常
	CompanyStatusCancelled  = "注销" // 注销
	CompanyStatusRevoked    = "吊销" // 吊销
	CompanyStatusMoved      = "迁出" // 迁出
	CompanyStatusSuspended  = "停业" // 停业
	CompanyStatusLiquidated = "清算" // 清算
)

// EmployeeCountRange 员工人数范围常量
const (
	EmployeeCount1to10    = "1-10人"
	EmployeeCount11to50   = "11-50人"
	EmployeeCount51to200  = "51-200人"
	EmployeeCount201to500 = "201-500人"
	EmployeeCount500Plus  = "500人以上"
)

// AnnualRevenueRange 年营业额范围常量
const (
	Revenue100WBelow    = "100万以下"
	Revenue100Wto500W   = "100万-500万"
	Revenue500Wto1000W  = "500万-1000万"
	Revenue1000Wto5000W = "1000万-5000万"
	Revenue5000WPlus    = "5000万以上"
)

// CompanyStats represents the company statistics response structure
type CompanyStats struct {
	Total  int64            `json:"total"`
	ByType map[string]int64 `json:"by_type"`
}
