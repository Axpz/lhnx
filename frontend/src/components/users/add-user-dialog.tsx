'use client'

import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, UserPlus, AlertCircle } from 'lucide-react'
import { useCreateUser } from '@/hooks/useUsers'
import { CreateUserRequest } from '@/lib/api-user'
import { cn } from '@/lib/utils'

interface AddUserDialogProps {
  onSuccess?: () => void
}

// 用户角色常量
const USER_ROLES = [
  { value: 'user', label: '普通用户' },
  { value: 'enterprise', label: '企业用户' },
  { value: 'admin', label: '管理员' }
]

const initialFormData: CreateUserRequest = {
  email: '',
  username: '',
  password: '',
  role: 'user',
  phone: ''
}

export function AddUserDialog({ onSuccess }: AddUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateUserRequest>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserRequest, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const { mutate: createUser, isPending: isCreating } = useCreateUser()

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserRequest, string>> = {}

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符'
    }

    if (!formData.password.trim()) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    if (!formData.role) {
      newErrors.role = '请选择用户角色'
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitError('')

    createUser(formData, {
      onSuccess: () => {
        setOpen(false)
        setFormData(initialFormData)
        setErrors({})
        setSubmitError('')
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error('User creation failed:', error)
        if (error?.response?.data?.message) {
          setSubmitError(error.response.data.message)
        } else if (error?.message) {
          setSubmitError(error.message)
        } else {
          setSubmitError('创建用户失败，请稍后重试')
        }
      }
    })
  }

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>添加用户</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>添加新用户</span>
          </DialogTitle>
          <DialogDescription>
            创建新的用户账户
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">邮箱地址 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
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

          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">用户名 *</Label>
            <Input
              id="username"
              value={formData.username}
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

          {/* 密码 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">密码 *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="请输入密码（至少6位）"
              className={cn(
                errors.password && "border-red-500"
              )}
            />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* 用户角色 */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">用户角色 *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className={cn(
                errors.role && "border-red-500"
              )}>
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
            {errors.role && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.role}
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
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="cursor-pointer"
            >
              {isCreating ? '创建中...' : '创建用户'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}