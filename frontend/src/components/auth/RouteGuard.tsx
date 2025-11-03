'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { canAccessRoute, AuthUtils } from '@/lib/auth-utils'
import { Loading } from '@/components/ui/loading'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // 检查是否需要认证的路由
      const protectedRoutes = ['/admin', '/dashboard', '/profile']
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

      if (isProtectedRoute && !isAuthenticated) {
        // 未认证用户访问受保护路由，重定向到登录页
        router.push('/auth/signin')
        return
      }

      if (isAuthenticated && !canAccessRoute(user, pathname)) {
        // 已认证但权限不足，重定向到未授权页面
        router.push('/unauthorized')
        return
      }

      // 特殊处理：已登录用户访问登录页面，重定向到默认首页
      if (isAuthenticated && pathname.startsWith('/auth/signin')) {
        const defaultHome = AuthUtils.getDefaultHomePath(user)
        router.push(defaultHome)
        return
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router])

  // 加载中显示加载状态
  if (isLoading) {
    return <Loading />
  }

  return <>{children}</>
}