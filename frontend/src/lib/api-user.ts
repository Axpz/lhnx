// 用户相关 API
import { api } from './api-client'
import { ApiResponse } from './types'

// 用户类型定义
export type UserRole = 'user' | 'enterprise' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'banned'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  phone?: string
  status: UserStatus
  role: UserRole
  email_verified: boolean
  email_verified_at?: string
  last_login_at?: string
  created_at: string
  updated_at: string
  company_id?: string
  company?: any
}

export interface UserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  offset?: number
  limit?: number
}

export interface CreateUserRequest {
  email: string
  username: string
  password: string
  role: UserRole
  phone?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  phone?: string
  avatar?: string
  role?: UserRole
  password?: string
}

export interface UserStats {
  total: number
  active: number
  banned: number
  pending: number
  by_role: Record<string, number>
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// 获取用户列表
export async function getUsers(filters: UserFilters = {}): Promise<ApiResponse<User[]>> {
  const queryString = buildQueryString(filters)
  return api.get<ApiResponse<User[]>>(`/auth/admin/users${queryString}`)
}

// 获取用户详情
export async function getUser(id: string): Promise<ApiResponse<User>> {
  return api.get<ApiResponse<User>>(`/auth/admin/users/${id}`)
}

// 创建用户
export async function createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
  return api.post<ApiResponse<User>>('/auth/admin/users', data)
}

// 更新用户
export async function updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
  return api.put<ApiResponse<User>>(`/auth/admin/users/${id}`, data)
}

// 删除用户
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return api.delete<ApiResponse<void>>(`/auth/admin/users/${id}`)
}

// 分配角色
export async function assignRole(id: string, role: UserRole): Promise<ApiResponse<void>> {
  return api.put<ApiResponse<void>>(`/auth/admin/users/${id}/role`, { role })
}

// 封禁用户
export async function banUser(id: string): Promise<ApiResponse<void>> {
  return api.post<ApiResponse<void>>(`/auth/admin/users/${id}/ban`)
}

// 解封用户
export async function unbanUser(id: string): Promise<ApiResponse<void>> {
  return api.post<ApiResponse<void>>(`/auth/admin/users/${id}/unban`)
}

// 获取用户统计信息
export async function getUserStats(): Promise<ApiResponse<UserStats>> {
  return api.get<ApiResponse<UserStats>>('/auth/admin/users/stats')
}

// 为了向后兼容，导出对象形式的 API
export const usersApi = {
  list: getUsers,
  detail: getUser,
  create: createUser,
  update: updateUser,
  delete: deleteUser,
  assignRole,
  ban: banUser,
  unban: unbanUser,
  stats: getUserStats,
}