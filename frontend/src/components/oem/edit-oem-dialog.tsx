'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Edit, AlertCircle, Shield } from 'lucide-react'
import { useUpdateOEM } from '@/hooks/useOEM'
import { CreateOEMRequest, OEMSubmission, OEM_USER_TYPES, OEM_STATUS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EditOEMDialogProps {
  request: OEMSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isAdmin?: boolean // 新增：是否为管理员模式
}

export function EditOEMDialog({ request, open, onOpenChange, onSuccess, isAdmin = false }: EditOEMDialogProps) {
  const [formData, setFormData] = useState<CreateOEMRequest & { status?: string }>({
    user_type: '',
    contact_person: '',
    contact_info: '',
    quantity: 0,
    product_type: '',
    special_needs: '',
    status: 'pending'
  })
  const [errors, setErrors] = useState<Partial<Record<keyof (CreateOEMRequest & { status: string }), string>>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const { mutate: updateOEM, isPending: isUpdating } = useUpdateOEM()

  // Initialize form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        user_type: request.user_type || '',
        contact_person: request.contact_person || '',
        contact_info: request.contact_info || '',
        quantity: request.quantity || 0,
        product_type: request.product_type || '',
        special_needs: request.special_needs || '',
        status: request.status || 'pending'
      })
      setErrors({})
      setSubmitError('')
    }
  }, [request])

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof (CreateOEMRequest & { status: string }), string>> = {}

    if (!formData.user_type) {
      newErrors.user_type = '请选择您的身份类型'
    }
    if (!formData.contact_person.trim()) {
      newErrors.contact_person = '请输入联系人姓名'
    }
    if (!formData.contact_info.trim()) {
      newErrors.contact_info = '请输入联系方式'
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = '请输入有效的采购数量'
    }
    if (!formData.product_type.trim()) {
      newErrors.product_type = '请输入产品类型'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!request || !validateForm()) {
      return
    }

    setSubmitError('')

    // 准备更新数据，管理员模式下包含状态
    const baseData = {
      user_type: formData.user_type,
      contact_person: formData.contact_person,
      contact_info: formData.contact_info,
      quantity: formData.quantity,
      product_type: formData.product_type,
      ...(formData.special_needs && { special_needs: formData.special_needs })
    }

    const updateData = isAdmin ? formData : baseData

    updateOEM({
      id: request.id,
      data: updateData
    }, {
      onSuccess: () => {
        onOpenChange(false)
        setErrors({})
        setSubmitError('')
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error('OEM update failed:', error)
        if (error?.response?.data?.message) {
          setSubmitError(error.response.data.message)
        } else if (error?.message) {
          setSubmitError(error.message)
        } else {
          setSubmitError('更新失败，请稍后重试')
        }
      }
    })
  }

  const handleInputChange = (field: keyof (CreateOEMRequest & { status: string }), value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!request) return null

  const statusOptions = [
    { value: OEM_STATUS.PENDING, label: '待处理' },
    { value: OEM_STATUS.PROCESSING, label: '处理中' },
    { value: OEM_STATUS.COMPLETED, label: '已完成' },
    { value: OEM_STATUS.REJECTED, label: '已拒绝' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isAdmin ? <Shield className="h-5 w-5 text-primary" /> : <Edit className="h-5 w-5 text-primary" />}
            <span>{isAdmin ? '管理员编辑OEM需求' : '编辑OEM需求'}</span>
          </DialogTitle>
          <DialogDescription>
            {isAdmin ? '管理员可以编辑需求信息和处理状态' : '修改您的需求信息，更新后将重新匹配合适的工厂'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status - Admin Only */}
          {isAdmin && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                处理状态（管理员权限）
              </Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className={cn(
                  errors.status && "border-red-500"
                )}>
                  <SelectValue placeholder="请选择处理状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.status}
                </p>
              )}
            </div>
          )}

          {/* User Type */}
          <div className="space-y-2">
            <Label htmlFor="user_type" className="text-sm font-medium">我是：</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) => handleInputChange('user_type', value)}
            >
              <SelectTrigger className={cn(
                errors.user_type && "border-red-500"
              )}>
                <SelectValue placeholder="请选择您的身份" />
              </SelectTrigger>
              <SelectContent>
                {OEM_USER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_type && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.user_type}
              </p>
            )}
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contact_person" className="text-sm font-medium">联系人</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              placeholder="请输入您的姓名"
              className={cn(
                errors.contact_person && "border-red-500"
              )}
            />
            {errors.contact_person && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.contact_person}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact_info" className="text-sm font-medium">联系方式</Label>
            <Input
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => handleInputChange('contact_info', e.target.value)}
              placeholder="请输入电话/微信号或邮箱"
              className={cn(
                errors.contact_info && "border-red-500"
              )}
            />
            {errors.contact_info && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.contact_info}
              </p>
            )}
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label htmlFor="product_type" className="text-sm font-medium">产品类型</Label>
            <Input
              id="product_type"
              value={formData.product_type}
              onChange={(e) => handleInputChange('product_type', e.target.value)}
              placeholder="如：足贴、暖宫贴、手贴等"
              className={cn(
                errors.product_type && "border-red-500"
              )}
            />
            {errors.product_type && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.product_type}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">预计采购数量</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              placeholder="请输入预计采购数量"
              className={cn(
                errors.quantity && "border-red-500"
              )}
              min="1"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.quantity}
              </p>
            )}
          </div>

          {/* Special Needs */}
          <div className="space-y-2">
            <Label htmlFor="special_needs" className="text-sm font-medium">特殊需求说明</Label>
            <Textarea
              id="special_needs"
              value={formData.special_needs || ''}
              onChange={(e) => handleInputChange('special_needs', e.target.value)}
              placeholder="请描述您的特殊需求，如包装要求、材料要求、认证需求等"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {submitError}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
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
              {isUpdating ? '更新中...' : '更新需求'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}