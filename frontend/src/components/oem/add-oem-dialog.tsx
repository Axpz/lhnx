'use client'

import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Handshake, AlertCircle } from 'lucide-react'
import { useCreateOEM } from '@/hooks/useOEM'
import { CreateOEMRequest, OEM_USER_TYPES } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AddOEMDialogProps {
  onSuccess?: () => void
}

const initialFormData: CreateOEMRequest = {
  user_type: '',
  contact_person: '',
  contact_info: '',
  quantity: 0,
  product_type: '',
  special_needs: ''
}

export function AddOEMDialog({ onSuccess }: AddOEMDialogProps) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateOEMRequest>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOEMRequest, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const { mutate: createOEM, isPending: isCreating } = useCreateOEM()

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateOEMRequest, string>> = {}

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

    if (!validateForm()) {
      return
    }

    setSubmitError('')

    createOEM({
      ...formData,
      user_id: userId ?? ''
    }, {
      onSuccess: () => {
        setOpen(false)
        setFormData(initialFormData)
        setErrors({})
        setSubmitError('')
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error('OEM submission failed:', error)
        if (error?.response?.data?.message) {
          setSubmitError(error.response.data.message)
        } else if (error?.message) {
          setSubmitError(error.message)
        } else {
          setSubmitError('提交失败，请稍后重试')
        }
      }
    })
  }

  const handleInputChange = (field: keyof CreateOEMRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>发布需求</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Handshake className="h-5 w-5 text-primary" />
            <span>发布OEM合作需求</span>
          </DialogTitle>
          <DialogDescription>
            填写您的需求信息，我们将为您匹配合适的工厂
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {isCreating ? '提交中...' : '提交需求'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}