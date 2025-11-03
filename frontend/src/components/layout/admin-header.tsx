'use client'

import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AdminSidebar } from '../layout/admin-sidebar'
import { cn } from '@/lib/utils'

// 面包屑映射
const breadcrumbMap: Record<string, string[]> = {
  '/admin': ['系统首页'],
  '/admin/companies': ['企业管理', '企业列表'],
  '/admin/companies/pending': ['企业管理', '待审核企业'],
  '/admin/companies/new': ['企业管理', '新增企业'],
  '/admin/products': ['产品管理', '产品列表'],
  '/admin/products/categories': ['产品管理', '产品分类'],
  '/admin/oem': ['OEM需求', '需求列表'],
  '/admin/oem/stats': ['OEM需求', '需求统计'],
  '/admin/users': ['用户管理', '用户列表'],
}

export function AdminHeader() {
  const pathname = usePathname()
  
  // 获取面包屑
  const getBreadcrumb = () => {
    // 处理动态路由
    for (const [path, breadcrumb] of Object.entries(breadcrumbMap)) {
      if (pathname === path) {
        return breadcrumb
      }
    }
    
    // 处理企业详情页面
    if (pathname.match(/^\/admin\/companies\/\d+$/)) {
      return ['企业管理', '企业详情']
    }
    if (pathname.match(/^\/admin\/companies\/\d+\/edit$/)) {
      return ['企业管理', '编辑企业']
    }
    if (pathname.match(/^\/admin\/companies\/\d+\/products$/)) {
      return ['企业管理', '企业产品']
    }

    if (pathname.match(/^\/admin\/products\/\d+$/)) {
      return ['产品管理', '产品详情']
    }
    if (pathname.match(/^\/admin\/products\/\d+\/analytics$/)) {
      return ['产品管理', '数据分析']
    }
    if (pathname.match(/^\/admin\/products\/\d+\/(edit|audit|audit-log|stats)$/)) {
      return ['产品管理', '产品设置']
    }

    if (pathname.match(/^\/admin\/oem\/\d+$/)) {
      return ['OEM需求', '需求详情']
    }
    
    return ['系统后台']
  }

  const breadcrumb = getBreadcrumb()

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* 移动端菜单按钮 */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>

        {/* 面包屑导航 */}
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <span
                  className={cn(
                    index === breadcrumb.length - 1
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          {/* 通知铃铛 */}
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              3
            </span>
            <span className="sr-only">Toggle notifications</span>
          </Button>

          {/* 用户菜单 */}
          <UserNav />
        </div>
      </div>
    </header>
  )
}
