'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// 消息类型
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 窗口位置类型
interface Position {
  x: number
  y: number
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // 初始化窗口位置（只在首次打开时设置）
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return

    // 每次打开都重置到默认位置：右下角
    setPosition({
      x: window.innerWidth - 400 - 24,
      y: window.innerHeight - 600 - 24,
    })
    setIsMaximized(false)

    // 添加欢迎消息（只在消息为空时添加）
    if (messages.length === 0) {
      const now = new Date()
      const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: `您好！今天是${timeStr}，很高兴为您服务。`,
        timestamp: now,
      }
      setMessages([welcomeMessage])
    }

    // 打开窗口时自动聚焦到输入框
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }, [isOpen, messages.length])

  // 拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  // 拖动中（性能优化：直接操作 DOM，避免频繁 state 更新）
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartRef.current && cardRef.current) {
        const newX = e.clientX - dragStartRef.current.x
        const newY = e.clientY - dragStartRef.current.y
        
        // 使用 transform 而非 left/top，性能更好
        cardRef.current.style.transform = `translate(${newX - position.x}px, ${newY - position.y}px)`
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (dragStartRef.current && cardRef.current) {
        const newX = e.clientX - dragStartRef.current.x
        const newY = e.clientY - dragStartRef.current.y
        
        // 拖动结束时更新 state 并清除 transform
        cardRef.current.style.transform = ''
        setPosition({ x: newX, y: newY })
      }
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position.x, position.y])

  // 切换最大化
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto'
    
    // 计算新高度，限制在 40px（1行）到 120px（约5行）之间
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120)
    textarea.style.height = `${newHeight}px`
  }

  // 监听输入内容变化，自动调整高度
  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  // 监听 loading 状态，发送完成后自动聚焦回输入框
  useEffect(() => {
    if (!isLoading && isOpen) {
      // 使用 requestAnimationFrame 确保在 DOM 更新后聚焦
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }, [isLoading, isOpen])

  // 发送消息
  const handleSend = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    // 清空输入框并重置高度
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // 创建机器人消息占位符
    const assistantId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])

    setIsLoading(true)

    try {
      // 创建 AbortController 用于取消请求
      abortControllerRef.current = new AbortController()

      // TODO: 替换为实际的后端 API 地址
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      // 构建历史消息，只包含 role 和 content
      const history = messages.slice(-3).map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch(`${API_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: history,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      // 读取流式数据
      let accumulatedContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        // 解码数据
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            // 跳过空数据和结束标记
            if (!data || data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content || parsed.delta || parsed.text || ''
              
              if (content) {
                accumulatedContent += content
                
                // 更新机器人消息内容
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
            } catch {
              // 忽略 JSON 解析错误，继续处理下一行
              console.warn('Failed to parse SSE data:', data)
            }
          }
        }
      }

      // 如果没有接收到任何内容，显示错误消息
      if (!accumulatedContent) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: '抱歉，我没有收到回复，请稍后重试。' }
              : msg
          )
        )
      }

    } catch (error: any) {
      // 处理错误
      if (error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Chat error:', error)
        
        // 显示错误消息
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: '抱歉，发生了错误，请稍后重试。' }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // 处理回车发送（Shift+Enter 换行，Enter 发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
      // 立即重新聚焦，防止焦点丢失
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }

  // 关闭窗口时取消请求
  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsOpen(false)
    // 清空消息，下次打开重新开始
    // setMessages([])
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <>
      {/* 悬浮按钮 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          'fixed bottom-60 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110',
          'bg-blue-500 hover:bg-blue-600 text-white',
          isOpen && 'scale-0'
        )}
        aria-label="打开客服聊天"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* 聊天窗口 */}
      {isOpen && (
        <Card
          ref={cardRef}
          className={cn(
            'fixed z-50 flex flex-col shadow-2xl animate-fade-in',
            'border-blue-200 shadow-blue-100',
            isDragging ? 'cursor-grabbing transition-none' : 'transition-all duration-300',
            isDragging && 'will-change-transform'
          )}
          style={{
            left: isMaximized ? '20px' : `${position.x}px`,
            top: isMaximized ? '20px' : `${position.y}px`,
            width: isMaximized ? 'calc(100vw - 40px)' : '400px',
            height: isMaximized ? 'calc(100vh - 40px)' : '600px',
          }}
        >
          {/* 头部 - 可拖动 */}
          <CardHeader
            onMouseDown={handleMouseDown}
            className={cn(
              'flex flex-row items-center justify-between space-y-0 border-b border-blue-100 pb-4 bg-linear-to-r from-blue-50 to-white',
              !isMaximized && 'cursor-grab active:cursor-grabbing select-none'
            )}
          >
            <CardTitle className="text-lg font-semibold text-blue-900">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                客服助手
              </span>
            </CardTitle>
            
            <div className="flex gap-1">
              {/* 最大化/还原按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMaximize}
                className="h-8 w-8 cursor-pointer"
                aria-label={isMaximized ? '还原窗口' : '最大化窗口'}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              {/* 关闭按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 cursor-pointer"
                aria-label="关闭聊天窗口"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* 消息列表 */}
          <CardContent className="flex-1 space-y-4 overflow-y-auto p-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-fade-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Bot className="h-5 w-5 text-slate-600" />
                    </div>
                )}
                {/* 消息气泡 */}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  )}
                >
                  <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{message.content}</p>
                </div>
                {/* 头像图标 */}
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* 输入框 */}
          <CardFooter className="border-t border-blue-100 bg-white pt-4">
            <div className="flex w-full items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息...（Shift+Enter 换行）"
                disabled={isLoading}
                className="min-h-10 max-h-30 flex-1 resize-none border-slate-300 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                rows={1}
                aria-label="输入消息"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                aria-label="发送消息"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

