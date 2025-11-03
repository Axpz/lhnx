'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePermission } from '@/hooks/useAuth'
import { UserRole } from '@/lib/api-auth'
import { Loading } from '@/components/ui/loading'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
  showLoading?: boolean
}

export function AuthGuard({
  children,
  requiredRoles,
  fallback,
  redirectTo = '/auth/signin',
  showLoading = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { canAccess } = usePermission()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRoles && !canAccess(requiredRoles)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isLoading, canAccess, requiredRoles, router, redirectTo])

  if (isLoading && showLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  if (requiredRoles && !canAccess(requiredRoles)) {
    return fallback || null
  }

  return <>{children}</>
}

// 管理员专用路由保护
export function AdminGuard({
  children,
  fallback,
  showLoading = true
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoading?: boolean
}) {
  return (
    <AuthGuard
      requiredRoles={['admin']}
      fallback={fallback}
      redirectTo="/unauthorized"
      showLoading={showLoading}
    >
      {children}
    </AuthGuard>
  )
}

// 企业用户或管理员路由保护
export function EnterpriseGuard({
  children,
  fallback,
  showLoading = true
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoading?: boolean
}) {
  return (
    <AuthGuard
      requiredRoles={['enterprise', 'admin']}
      fallback={fallback}
      redirectTo="/unauthorized"
      showLoading={showLoading}
    >
      {children}
    </AuthGuard>
  )
}

// 普通用户及以上权限路由保护
export function UserGuard({
  children,
  fallback,
  showLoading = true
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoading?: boolean
}) {
  return (
    <AuthGuard
      requiredRoles={['user', 'enterprise', 'admin']}
      fallback={fallback}
      redirectTo="/auth/signin"
      showLoading={showLoading}
    >
      {children}
    </AuthGuard>
  )
}