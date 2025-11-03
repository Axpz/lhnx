'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
  label?: string
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  label = "图片",
  placeholder = "请选择图片或输入图片URL"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 限制文件大小为 10MB（与后端一致）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB')
      return
    }

    setIsUploading(true)
    
    try {
      // 创建 FormData 对象
      const formData = new FormData()
      formData.append('file', file)

      // 使用后端 API
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const data = await response.json()
      
      // 构建完整的图片 URL
      const imageUrl = data.url.startsWith('http') 
        ? data.url 
        : `${API_BASE}${data.url}`
      
      onChange(imageUrl)
      
      // 如果是重复文件，可以显示提示
      if (data.duplicate) {
        console.log(data.message)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      alert(error instanceof Error ? error.message : '图片上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleUrlChange = (url: string) => {
    onChange(url)
  }

  const clearImage = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      {/* 图片预览区域 */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="预览"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearImage}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* 上传区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <div className="space-y-2">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              拖拽图片到此处，或
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                点击选择
              </Button>
            </p>
            <p className="text-xs text-gray-500">
              支持 JPG、PNG、GIF 格式，最大 10MB
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">上传中...</span>
          </div>
        )}
      </div>

      {/* URL 输入框 */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">或输入图片URL</Label>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  )
}
