'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface ErrorDisplayProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorDisplay({ 
  title = "出错了", 
  message = "加载数据时发生错误，请稍后重试", 
  onRetry,
  showRetry = true 
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {showRetry && onRetry && (
          <CardContent className="text-center">
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// 简单的错误提示
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2 text-destructive text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}