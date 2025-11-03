'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, User, Mail, Phone, Shield, Calendar, Clock } from 'lucide-react'
import { User as UserType } from '@/lib/api-user'

interface ViewUserDialogProps {
  user: UserType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 用户角色标签映射
const ROLE_LABELS = {
  user: '普通用户',
  enterprise: '企业用户',
  admin: '管理员'
}

// 用户状态标签映射
const STATUS_LABELS = {
  active: '正常',
  inactive: '未激活',
  banned: '已封禁'
}

// 获取角色徽章样式
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'enterprise':
      return 'default'
    case 'user':
      return 'secondary'
    default:
      return 'outline'
  }
}

// 获取状态徽章样式
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'banned':
      return 'destructive'
    default:
      return 'outline'
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ViewUserDialog({ user, open, onOpenChange }: ViewUserDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>查看用户信息</span>
          </DialogTitle>
          <DialogDescription>
            查看用户详细信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              <span>基本信息</span>
            </div>

            {/* 用户名 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">用户名</Label>
              <Input
                value={user.username}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>邮箱地址</span>
                {user.email_verified && (
                  <Badge variant="outline" className="text-xs">已验证</Badge>
                )}
              </Label>
              <Input
                value={user.email}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* 手机号 */}
            {user.phone && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>手机号</span>
                </Label>
                <Input
                  value={user.phone}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* 用户角色 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>用户角色</span>
              </Label>
              <div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {ROLE_LABELS[user.role] || user.role}
                </Badge>
              </div>
            </div>

            {/* 用户状态 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">用户状态</Label>
              <div>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {STATUS_LABELS[user.status] || user.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              <span>时间信息</span>
            </div>

            {/* 注册时间 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>注册时间</span>
              </Label>
              <Input
                value={formatDate(user.created_at)}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* 最后登录时间 */}
            {user.last_login_at && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">最后登录</Label>
                <Input
                  value={formatDate(user.last_login_at)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* 邮箱验证时间 */}
            {user.email_verified_at && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">邮箱验证时间</Label>
                <Input
                  value={formatDate(user.email_verified_at)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* 更新时间 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">更新时间</Label>
              <Input
                value={formatDate(user.updated_at)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* 关联信息 */}
          {user.company_id && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <span>关联信息</span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">关联企业ID</Label>
                <Input
                  value={user.company_id.toString()}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}