'use client'

import { createContext, useContext, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  signin,
  signup,
  logout,
  getProfile,
  updateProfile,
  getUserRole,
  type User,
  type UserRole,
  type SigninRequest,
  type RegisterRequest,
  type UpdateUserRequest,
} from '@/lib/api-auth'

// 查询键
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// ==================== React Query Hooks ====================

// 获取用户资料 Query
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    retry: (failureCount, error: any) => {
      // 401 错误不重试（认证失败）
      if (error?.status === 401) return false
      return failureCount < 3
    },
  })
}

// 登录 Mutation
export function useSignin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signin,
    onSuccess: (data) => {
      // 缓存用户数据
      queryClient.setQueryData(authKeys.profile(), data.user)
      router.push('/')
    },
    onError: (error: any) => {
      console.error('Login failed:', error.message || '登录失败')
    },
  })
}

// 注册 Mutation
export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // 缓存用户数据
      // queryClient.setQueryData(authKeys.profile(), data.user)

      router.push('/auth/signin')
    },
    onError: (error: any) => {
      console.error('Register failed:', error.message || '注册失败')
    },
  })
}

// 登出 Mutation
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear()

      router.push('/auth/signin')
    },
    onError: (error: any) => {
      // 即使登出失败，也清除本地状态
      queryClient.clear()
      router.push('/auth/signin')
    },
  })
}

// 更新资料 Mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // 乐观更新缓存
      queryClient.setQueryData(authKeys.profile(), updatedUser)
    },
    onError: (error: any) => {
      console.error('Update profile failed:', error.message || '更新失败')

      // 重新获取数据
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// ==================== Context & Provider ====================

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signin: (data: SigninRequest) => Promise<any>
  signup: (data: RegisterRequest) => Promise<any>
  logout: () => void
  updateProfile: (data: UpdateUserRequest) => void
  // 操作状态
  isLoggingIn: boolean
  isRegistering: boolean
  isLoggingOut: boolean
  isUpdatingProfile: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证状态管理Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 认证Provider组件 - 基于 React Query
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useProfile()
  const loginMutation = useSignin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()
  const updateProfileMutation = useUpdateProfile()

  const isAuthenticated = !!user

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    signin: loginMutation.mutateAsync,
    signup: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    // 操作状态
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 权限检查Hook
export function usePermission() {
  const { user } = useAuth()

  const hasRole = useCallback((role: UserRole) => {
    return getUserRole(user) === role
  }, [user])

  const isAdmin = useCallback(() => {
    return getUserRole(user) === 'admin'
  }, [user])

  const isEnterprise = useCallback(() => {
    return getUserRole(user) === 'enterprise'
  }, [user])

  const canAccess = useCallback((requiredRoles: UserRole[]) => {
    if (!user) return false
    return requiredRoles.includes(getUserRole(user))
  }, [user])

  return {
    hasRole,
    isAdmin,
    isEnterprise,
    canAccess,
  }
}

// 路由保护Hook
export function useRequireAuth(redirectTo = '/auth/signin') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

// 管理员权限保护Hook
export function useRequireAdmin(redirectTo = '/') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || getUserRole(user) !== 'admin')) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { isAdmin: getUserRole(user) === 'admin', isLoading }
}