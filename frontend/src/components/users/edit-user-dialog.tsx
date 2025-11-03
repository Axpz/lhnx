'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Edit, AlertCircle, Shield, Key, Eye, EyeOff } from 'lucide-react'
import { useUpdateUser } from '@/hooks/useUsers'
import { User, UpdateUserRequest } from '@/lib/api-user'
import { cn } from '@/lib/utils'

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// 用户角色常量
const USER_ROLES = [
  { value: 'user', label: '普通用户' },
  { value: 'enterprise', label: '企业用户' },
  { value: 'admin', label: '管理员' }
]

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'user',
    password: ''
  })
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateUserRequest, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        password: ''
      })
      setShowPasswordReset(false)
      setShowPassword(false)
      setErrors({})
      setSubmitError('')
    }
  }, [user])

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateUserRequest, string>> = {}

    if (!formData.username?.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符'
    }

    if (!formData.email?.trim()) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码'
    }

    if (formData.avatar && !isValidUrl(formData.avatar)) {
      newErrors.avatar = '请输入有效的头像URL'
    }

    // 如果启用了密码重置，验证密码
    if (showPasswordReset && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = '密码至少需要6个字符'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 验证URL格式
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validateForm()) {
      return
    }

    setSubmitError('')

    // 准备用户信息更新数据
    const updateData: UpdateUserRequest = {}
    if (formData.username?.trim()) updateData.username = formData.username.trim()
    if (formData.email?.trim()) updateData.email = formData.email.trim()
    if (formData.phone?.trim()) updateData.phone = formData.phone.trim()
    if (formData.avatar?.trim()) updateData.avatar = formData.avatar.trim()
    if (formData.role && formData.role !== user.role) updateData.role = formData.role
    if (showPasswordReset && formData.password?.trim()) updateData.password = formData.password.trim()

    // 如果没有任何更新，直接关闭对话框
    if (Object.keys(updateData).length === 0) {
      onOpenChange(false)
      return
    }

    // 定义成功回调
    const handleSuccess = () => {
      onOpenChange(false)
      setErrors({})
      setSubmitError('')
      onSuccess?.()
    }

    // 定义错误回调
    const handleError = (error: any) => {
      console.error('Update user failed:', error)
      if (error?.response?.data?.error) {
        setSubmitError(error.response.data.error)
      } else if (error?.message) {
        setSubmitError(error.message)
      } else {
        setSubmitError('更新用户失败，请稍后重试')
      }
    }

    // 更新用户信息
    updateUser({
      id: user.id,
      data: updateData
    }, {
      onSuccess: handleSuccess,
      onError: handleError
    })
  }

  const handleInputChange = (field: keyof UpdateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-primary" />
            <span>编辑用户信息</span>
          </DialogTitle>
          <DialogDescription>
            修改用户的基本信息
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">用户名 *</Label>
            <Input
              id="username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="请输入用户名"
              className={cn(
                errors.username && "border-red-500"
              )}
            />
            {errors.username && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.username}
              </p>
            )}
          </div>

          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">邮箱地址 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="请输入邮箱地址"
              className={cn(
                errors.email && "border-red-500"
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* 手机号 */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">手机号</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="请输入手机号（可选）"
              className={cn(
                errors.phone && "border-red-500"
              )}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* 头像URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar" className="text-sm font-medium">头像URL</Label>
            <Input
              id="avatar"
              type="url"
              value={formData.avatar || ''}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="请输入头像URL（可选）"
              className={cn(
                errors.avatar && "border-red-500"
              )}
            />
            {errors.avatar && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.avatar}
              </p>
            )}
          </div>

          {/* 用户角色 */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>用户角色</span>
            </Label>
            <Select
              value={formData.role || ""}
              onValueChange={(value: any) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择用户角色" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 密码重置选项 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="resetPassword"
                checked={showPasswordReset}
                onChange={(e) => {
                  setShowPasswordReset(e.target.checked)
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, password: '' }))
                    setShowPassword(false)
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="resetPassword" className="text-sm font-medium flex items-center space-x-1">
                <Key className="h-3 w-3" />
                <span>重置用户密码</span>
              </Label>
            </div>

            {showPasswordReset && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">新密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入新密码"
                    className={cn(
                      "pr-10",
                      errors.password && "border-red-500"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  设置新密码后，用户需要使用新密码重新登录
                </p>
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {submitError}
              </p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="cursor-pointer"
            >
              {isUpdating ? '更新中...' : '更新用户'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}