package model

import (
	"time"
)

// OEMSubmission OEM合作需求提交
type OEMSubmission struct {
	ID            int       `json:"id" gorm:"primaryKey;autoIncrement"`
	
	// 用户关联
	UserID        int64     `json:"user_id" gorm:"index;comment:用户ID"`
	
	// 基本信息
	UserType      string    `json:"user_type" gorm:"size:50;not null;comment:用户类型:品牌方,渠道商,电商,创业者"`
	ContactPerson string    `json:"contact_person" gorm:"size:100;not null;comment:联系人姓名"`
	ContactInfo   string    `json:"contact_info" gorm:"size:255;not null;comment:联系方式"`
	Quantity      int       `json:"quantity" gorm:"not null;comment:预计采购数量"`
	ProductType   string    `json:"product_type" gorm:"size:255;comment:产品类型"`
	SpecialNeeds  string    `json:"special_needs" gorm:"type:text;comment:特殊需求说明"`
	
	// 状态管理
	Status       string     `json:"status" gorm:"size:20;default:'pending';comment:处理状态:pending,processing,completed,rejected"`
	ProcessedAt  *time.Time `json:"processed_at" gorm:"comment:处理时间"`
	ProcessedBy  *int       `json:"processed_by" gorm:"comment:处理人ID"`
	ProcessNote  string     `json:"process_note" gorm:"type:text;comment:处理备注"`
	
	// 系统字段
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// OEMStatus 状态常量
const (
	OEMStatusPending    = "pending"    // 待处理
	OEMStatusProcessing = "processing" // 处理中
	OEMStatusCompleted  = "completed"  // 已完成
	OEMStatusRejected   = "rejected"   // 已拒绝
)
