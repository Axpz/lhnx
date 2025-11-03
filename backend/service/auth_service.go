package service

import (
	"context"
	"errors"

	"github.com/lhnx/config"
	"github.com/lhnx/model"
	"github.com/lhnx/pkg/logger"
	"github.com/lhnx/repository"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

// AuthService 认证服务接口
type AuthService interface {
	// SyncFromSupabase 同步Supabase用户
	SyncFromSupabase(id, email, role string) (*model.User, error)

	// 用户管理
	GetUser(id string) (*model.User, error)
	ListUsers(offset, limit int) ([]*model.User, int64, error)
	DeleteUser(id string) error
}

// authService 认证服务实现
type authService struct {
	userRepo repository.UserRepository
}

// NewAuthService 创建认证服务
func NewAuthService(
	userRepo repository.UserRepository,
	cfg *config.Config,
) AuthService {
	return &authService{
		userRepo: userRepo,
	}
}

// SyncFromSupabase 同步Supabase用户
func (s *authService) SyncFromSupabase(id, email, roleStr string) (*model.User, error) {
	if id == "" || email == "" {
		return nil, errors.New("id or email should not be null")
	}

	logger := logger.FromContext(context.Background())

	// 转换角色
	var role model.UserRole
	role = role.StringToRole(roleStr)

	// 检查用户是否已存在
	// 优先使用ID查询，因为ID是主键且来自Supabase
	existingUser, err := s.userRepo.GetByID(id)
	if err != nil {

		logger.WithError(err).Error("get user by id failed")
		return nil, err
	}

	if existingUser != nil {
		// 用户存在，检查是否需要更新
		if existingUser.Email != email || existingUser.Role != role {
			existingUser.Email = email
			existingUser.Role = role
			err := s.userRepo.Update(existingUser)
			if err != nil {
				logger.WithError(err).Error("update user failed")
				return nil, err
			}
			return existingUser, nil
		}
		return existingUser, nil
	}

	// 创建新用户
	user := &model.User{
		ID:    id,
		Email: email,
		Role:  role,
	}

	if err := s.userRepo.Create(user); err != nil {
		logger.WithError(err).Error("create user failed")
		return nil, err
	}

	return user, nil
}

// GetUser 获取用户
func (s *authService) GetUser(id string) (*model.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// ListUsers 获取用户列表
func (s *authService) ListUsers(offset, limit int) ([]*model.User, int64, error) {
	return s.userRepo.List(offset, limit)
}

// DeleteUser 删除用户
func (s *authService) DeleteUser(id string) error {
	return s.userRepo.Delete(id)
}
