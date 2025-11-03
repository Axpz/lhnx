'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { RegisterRequest, UserRole } from '@/lib/api-auth'

interface SignupFormData {
  email: string
  password: string
  username: string
  role: UserRole
}

export function SignupForm() {
  const [error, setError] = useState<string>('')
  const { signup: registerUser, isRegistering } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      role: 'user'
    }
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('')
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        data: {
          username: data.username,
          role: data.role
        }
      }
      await registerUser(registerData)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || '注册失败'
      setError(errorMessage)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">注册</CardTitle>
        <CardDescription className="text-center">
          创建您的新账户
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email', {
                required: '请输入邮箱',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '请输入有效的邮箱地址',
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="输入用户名"
              {...register('username', {
                required: '请输入用户名',
                minLength: {
                  value: 2,
                  message: '用户名至少2位',
                },
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">用户类型</Label>
            <Select onValueChange={(value) => setValue('role', value as UserRole)} defaultValue="user">
              <SelectTrigger>
                <SelectValue placeholder="选择用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="enterprise">企业用户</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="输入密码"
              {...register('password', {
                required: '请输入密码',
                minLength: {
                  value: 8,
                  message: '密码至少8位',
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? '注册中...' : '注册'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          已有账户？{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            立即登录
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}