import { User, UserRole } from './api-auth'

// 角色权限级别定义
export const ROLE_LEVELS = {
  user: 1,
  enterprise: 2,
  admin: 3,
} as const

// 权限检查工具函数
export class AuthUtils {
  /**
   * 检查用户是否具有指定角色
   */
  static hasRole(user: User | null, role: UserRole): boolean {
    return user?.user_metadata?.role === role
  }

  /**
   * 检查用户是否具有指定角色中的任意一个
   */
  static hasAnyRole(user: User | null, roles: readonly UserRole[]): boolean {
    if (!user) return false
    return roles.includes(user?.user_metadata?.role || 'user')
  }

  /**
   * 检查用户是否具有足够的权限级别
   */
  static hasMinimumRole(user: User | null, minimumRole: UserRole): boolean {
    if (!user) return false
    const userLevel = ROLE_LEVELS[user?.user_metadata?.role || 'user']
    const requiredLevel = ROLE_LEVELS[minimumRole]
    return userLevel >= requiredLevel
  }

  /**
   * 检查用户是否为管理员
   */
  static isAdmin(user: User | null): boolean {
    return user?.user_metadata?.role === 'admin'
  }

  /**
   * 检查用户是否为企业用户
   */
  static isEnterprise(user: User | null): boolean {
    return user?.user_metadata?.role === 'enterprise'
  }

  /**
   * 检查用户是否为普通用户
   */
  static isUser(user: User | null): boolean {
    return user?.user_metadata?.role === 'user'
  }

  /**
   * 检查用户是否可以访问管理后台
   */
  static canAccessAdmin(user: User | null): boolean {
    return this.hasAnyRole(user, ['admin', 'enterprise'])
  }

  /**
   * 检查用户是否可以管理企业
   */
  static canManageCompanies(user: User | null): boolean {
    return this.isAdmin(user)
  }

  /**
   * 检查用户是否可以审核企业
   */
  static canReviewCompanies(user: User | null): boolean {
    return this.isAdmin(user)
  }

  /**
   * 检查用户是否可以管理产品
   */
  static canManageProducts(user: User | null): boolean {
    return this.hasAnyRole(user, ['admin', 'enterprise'])
  }

  /**
   * 检查用户是否可以管理OEM
   */
  static canManageOEM(user: User | null): boolean {
    return this.hasAnyRole(user, ['admin', 'enterprise'])
  }

  /**
   * 根据用户角色获取默认首页路径
   */
  static getDefaultHomePath(user: User | null): string {
    if (!user) return '/'

    switch (user?.user_metadata?.role) {
      case 'admin':
        return '/admin'
      case 'enterprise':
        return '/ent'
      case 'user':
        return '/'
      default:
        return '/'
    }
  }

  /**
   * 获取角色显示名称
   */
  static getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      admin: '管理员',
      enterprise: '企业用户',
      user: '普通用户',
    }
    return roleNames[role] || '未知角色'
  }

  /**
   * 获取角色描述
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions = {
      admin: '拥有系统最高权限，可以管理所有功能',
      enterprise: '企业用户，可以管理企业相关信息和产品',
      user: '普通用户，可以浏览和查看产品信息',
    }
    return descriptions[role] || '未知角色'
  }
}

// 路由权限配置
export const ROUTE_PERMISSIONS = {
  // 管理员专用路径 - 仅管理员可访问
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/companies': ['admin'],
  '/admin/companies/pending': ['admin'],
  '/admin/products': ['admin'],
  '/admin/products/categories': ['admin'],
  '/admin/oem': ['admin'],
  '/admin/oem/stats': ['admin'],

  // 企业用户路径 - 企业用户或管理员可访问
  '/ent': ['enterprise', 'admin'],
  '/ent/company': ['enterprise', 'admin'],
  '/ent/companies': ['enterprise', 'admin'],
  '/ent/companies/create': ['enterprise', 'admin'],
  '/ent/products': ['enterprise', 'admin'],
  '/ent/products/categories': ['enterprise', 'admin'],
  '/ent/oem': ['enterprise', 'admin'],
  '/ent/oem/stats': ['enterprise', 'admin'],
  '/ent/analytics': ['enterprise', 'admin'],
  '/ent/settings': ['enterprise', 'admin'],

  // 普通用户及以上权限路径
  '/dashboard': ['user', 'enterprise', 'admin'],
  '/profile': ['user', 'enterprise', 'admin'],
  '/companies': ['user', 'enterprise', 'admin'],
  '/products': ['user', 'enterprise', 'admin'],
} as const

/**
 * 检查用户是否可以访问指定路径
 */
export function canAccessRoute(user: User | null, path: string): boolean {
  // 查找最匹配的路由规则
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter(route => path.startsWith(route))
    .sort((a, b) => b.length - a.length)[0] // 选择最长匹配的路由

  if (!matchedRoute) {
    // 如果没有匹配的路由规则，默认允许访问
    return true
  }

  const requiredRoles = ROUTE_PERMISSIONS[matchedRoute as keyof typeof ROUTE_PERMISSIONS]
  return AuthUtils.hasAnyRole(user, requiredRoles)
}