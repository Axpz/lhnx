'use client'

import { ComponentType } from 'react'
import { AuthGuard, AdminGuard, EnterpriseGuard, UserGuard } from './AuthGuard'
import { UserRole } from '@/lib/api-user'

// 高阶组件类型定义
type WithAuthOptions = {
  requiredRoles?: UserRole[]
  redirectTo?: string
  fallback?: React.ReactNode
  showLoading?: boolean
}

// 通用认证高阶组件
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard
        requiredRoles={options.requiredRoles ?? ["user", "enterprise", "admin"]} 
        fallback={options.fallback}
      >
        <WrappedComponent {...props} />
      </AuthGuard>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  return AuthenticatedComponent
}

// 管理员专用高阶组件
export function withAdminAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithAuthOptions, 'requiredRoles'> = {}
) {
  const AdminComponent = (props: P) => {
    return (
      <AdminGuard
        fallback={options.fallback}
      >
        <WrappedComponent {...props} />
      </AdminGuard>
    )
  }

  AdminComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  return AdminComponent
}

// 企业用户或管理员高阶组件
export function withEnterpriseAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithAuthOptions, 'requiredRoles'> = {}
) {
  const EnterpriseComponent = (props: P) => {
    return (
      <EnterpriseGuard
        fallback={options.fallback}
      >
        <WrappedComponent {...props} />
      </EnterpriseGuard>
    )
  }

  EnterpriseComponent.displayName = `withEnterpriseAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  return EnterpriseComponent
}

// 普通用户及以上权限高阶组件
export function withUserAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithAuthOptions, 'requiredRoles'> = {}
) {
  const UserComponent = (props: P) => {
    return (
      <UserGuard
        fallback={options.fallback}
      >
        <WrappedComponent {...props} />
      </UserGuard>
    )
  }

  UserComponent.displayName = `withUserAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  return UserComponent
}