package model

import (
	"time"
)

// UserRole 用户角色枚举
type UserRole string

const (
	RoleUser       UserRole = "user"       // 普通用户
	RoleEnterprise UserRole = "enterprise" // 企业用户
	RoleAdmin      UserRole = "admin"      // 管理员
)

// User 用户模型
type User struct {
	// UUID 唯一标识
	ID string `json:"id" gorm:"type:char(36);uniqueIndex"`

	// 基本信息
	Email string   `json:"email" gorm:"uniqueIndex;not null"`
	Role  UserRole `json:"role" gorm:"default:user"`

	UpdatedAt time.Time `json:"updated_at"`
}

// HasRole 检查用户是否具有指定角色
func (u *User) HasRole(role UserRole) bool {
	return u.Role == role
}

// IsAdmin 检查是否为管理员
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// IsEnterprise 检查是否为企业用户
func (u *User) IsEnterprise() bool {
	return u.Role == RoleEnterprise
}

func (r UserRole) StringToRole(role string) UserRole {
	switch role {
	case "user":
		return RoleUser
	case "enterprise":
		return RoleEnterprise
	case "admin":
		return RoleAdmin
	}
	panic("role type error")
}
