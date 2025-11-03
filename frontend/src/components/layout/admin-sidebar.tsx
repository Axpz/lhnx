'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  Package,
  FileText,
  Users,
} from 'lucide-react'

const navigation = [
  {
    name: '系统首页',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: '企业管理',
    icon: Building2,
    children: [
      { name: '企业列表', href: '/admin/companies' },
    ],
  },
  {
    name: '产品管理',
    icon: Package,
    children: [
      { name: '产品列表', href: '/admin/products' },
    ],
  },
  {
    name: 'OEM需求',
    icon: FileText,
    children: [
      { name: '需求列表', href: '/admin/oem' },
    ],
  },
  {
    name: '用户管理',
    icon: Users,
    children: [
      { name: '用户列表', href: '/admin/users' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    // return pathname.startsWith(href)
    return href === pathname
  }

  const isParentActive = (children: { href: string }[]) => {
    // 我们不用处理parent active，因为我们不需要高亮parent
    return false //children.some(child => pathname.startsWith(child.href))
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-border">
      {/* Logo区域 */}
      <div className="flex h-16 items-center border-b border-border px-6 shrink-0">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">系统后台</span>
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.href ? (
                // 单级导航
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ) : (
                // 多级导航
                <div className="space-y-1">
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                      isParentActive(item.children || [])
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.children?.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                          isActive(child.href)
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-accent-foreground'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}