'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePermission } from '@/hooks/useAuth'
import { UserRole } from '@/lib/api-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  if (requiredRoles && !canAccess(requiredRoles)) {
    return fallback || null
  }

  return <>{children}</>
}

// 管理员路由保护组件
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['admin']}
      fallback={fallback}
      redirectTo="/unauthorized"
    >
      {children}
    </ProtectedRoute>
  )
}

// 企业用户或管理员路由保护组件
export function EnterpriseRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['enterprise', 'admin']}
      fallback={fallback}
      redirectTo="/unauthorized"
    >
      {children}
    </ProtectedRoute>
  )
}