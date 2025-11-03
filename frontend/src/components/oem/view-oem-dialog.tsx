'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getStatusBadge } from '@/lib/badge-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye } from 'lucide-react'
import { CreateOEMRequest, OEMSubmission } from '@/lib/types'

interface ViewOEMDialogProps {
  request: OEMSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOEMDialog({ request, open, onOpenChange }: ViewOEMDialogProps) {
  const [formData, setFormData] = useState<CreateOEMRequest>({
    user_type: '',
    contact_person: '',
    contact_info: '',
    quantity: 0,
    product_type: '',
    special_needs: ''
  })

  // Initialize form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        user_type: request.user_type || '',
        contact_person: request.contact_person || '',
        contact_info: request.contact_info || '',
        quantity: request.quantity || 0,
        product_type: request.product_type || '',
        special_needs: request.special_needs || ''
      })
    }
  }, [request])

  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>查看OEM需求</span>
          </DialogTitle>
          <DialogDescription>
            查看需求详细信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Type */}
          <div className="space-y-2">
            <Label htmlFor="user_type" className="text-sm font-medium">我是：{getStatusBadge(formData.user_type)}</Label>
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contact_person" className="text-sm font-medium">联系人</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              placeholder="请输入您的姓名"
              readOnly
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact_info" className="text-sm font-medium">联系方式</Label>
            <Input
              id="contact_info"
              value={formData.contact_info}
              placeholder="请输入电话/微信号或邮箱"
              readOnly
            />
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label htmlFor="product_type" className="text-sm font-medium">产品类型</Label>
            <Input
              id="product_type"
              value={formData.product_type}
              placeholder="如：足贴、暖宫贴、手贴等"
              readOnly
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">预计采购数量</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              placeholder="请输入预计采购数量"
              readOnly
            />
          </div>

          {/* Special Needs */}
          <div className="space-y-2">
            <Label htmlFor="special_needs" className="text-sm font-medium">特殊需求说明</Label>
            <Textarea
              id="special_needs"
              value={formData.special_needs || ''}
              placeholder="请描述您的特殊需求，如包装要求、材料要求、认证需求等"
              rows={3}
              readOnly
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}