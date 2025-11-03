'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Image as ImageIcon, Loader2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MultiImageUploadProps {
  value?: string // "url1;url2;url3"
  onChange: (value: string) => void
  maxImages?: number
  disabled?: boolean
  label?: string
  className?: string
}

interface SortableImageItemProps {
  url: string
  index: number
  onRemove: () => void
  disabled?: boolean
}

function SortableImageItem({ url, index, onRemove, disabled }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // 将相对路径转换为完整URL用于显示
  const displayUrl = url.startsWith('http') 
    ? url 
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${url}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg border-2 border-gray-200 overflow-hidden bg-white",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing",
          "bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity",
          disabled && "cursor-not-allowed"
        )}
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* 删除按钮 */}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="h-3 w-3" />
      </Button>

      <Image
        src={displayUrl}
        alt={`图片 ${index + 1}`}
        width={0}
        height={0}
        sizes="100vw"
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '1 / 1',
          objectFit: 'contain',
          borderRadius: '0.5rem', // 相当于 rounded-md
        }}
        unoptimized
      />

      {/* 序号标识 */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {index === 0 ? '主图' : `图${index + 1}`}
      </div>
    </div>
  )
}

export function MultiImageUpload({
  value = '',
  onChange,
  maxImages = 10,
  disabled = false,
  label = "产品图片",
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析图片 URLs
  const images = value ? value.split(';').filter(Boolean) : []

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 上传单个文件
  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('请选择图片文件')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('图片大小不能超过 10MB')
    }

    const formData = new FormData()
    formData.append('file', file)

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
    // 只返回相对路径，不添加域名前缀
    const imageUrl = data.url.startsWith('http')
      ? new URL(data.url).pathname  // 如果是完整URL，提取路径部分
      : data.url  // 如果已经是相对路径，直接使用

    return imageUrl
  }

  // 处理多文件上传
  const handleFilesSelect = async (files: FileList) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length

    if (fileArray.length > remainingSlots) {
      alert(`最多只能上传 ${maxImages} 张图片，当前还可以上传 ${remainingSlots} 张`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []

      // 逐个上传并更新进度
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        if (!file) continue
        const url = await uploadFile(file)
        uploadedUrls.push(url)
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100))
      }

      // 合并新上传的图片
      const newImages = [...images, ...uploadedUrls]
      onChange(newImages.join(';'))
    } catch (error) {
      console.error('图片上传失败:', error)
      alert(error instanceof Error ? error.message : '图片上传失败，请重试')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
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

  // 删除图片
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages.join(';'))
  }

  // 拖拽排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string)
      const newIndex = images.indexOf(over.id as string)
      const reordered = arrayMove(images, oldIndex, newIndex)
      onChange(reordered.join(';'))
    }
  }

  const canUploadMore = images.length < maxImages

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-gray-500">
          已上传 {images.length}/{maxImages}
        </span>
      </div>

      {images.length > 0 && (
        <div className="text-xs text-gray-500">
          提示：第一张图片将作为主图
        </div>
      )}

      {/* 图片列表 - 拖拽排序 */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <SortableImageItem
                  key={url}
                  url={url}
                  index={index}
                  onRemove={() => handleRemove(index)}
                  disabled={disabled || isUploading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 上传区域 */}
      {canUploadMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
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
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="space-y-3">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
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
                支持 JPG、PNG、GIF 格式，单张最大 10MB
              </p>
              <p className="text-xs text-gray-500">
                可一次选择多张图片（还可上传 {maxImages - images.length} 张）
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">上传中... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
