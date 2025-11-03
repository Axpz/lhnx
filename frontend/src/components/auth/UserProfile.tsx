'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { UpdateUserRequest, getUserRole, getUsername } from '@/lib/api-auth'

export function UserProfile() {
  const { user, updateProfile, logout } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<{ email: string; username: string }>({
    defaultValues: {
      email: user?.email || '',
      username: getUsername(user) || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<{ password: string }>()

  const onUpdateProfile = async (data: { email: string; username: string }) => {
    try {
      setIsUpdating(true)
      setMessage(null)
      await updateProfile({
        email: data.email,
        data: {
          ...user?.user_metadata,
          username: data.username
        }
      })
      setMessage({ type: 'success', text: '资料更新成功' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || '更新失败' })
    } finally {
      setIsUpdating(false)
    }
  }

  const onChangePassword = async (data: { password: string }) => {
    try {
      setIsChangingPassword(true)
      setMessage(null)
      await updateProfile({ password: data.password })
      setMessage({ type: 'success', text: '密码修改成功' })
      resetPasswordForm()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || '密码修改失败' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) {
    return <div>加载中...</div>
  }

  const role = getUserRole(user)
  const username = getUsername(user)

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'enterprise':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'enterprise':
        return '企业用户'
      default:
        return '普通用户'
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* 用户基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>查看和管理您的账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">{username}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant={getRoleBadgeVariant(role)}>
                {getRoleText(role)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">注册时间</Label>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">更新时间</Label>
              <p>{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 更新资料 */}
      <Card>
        <CardHeader>
          <CardTitle>更新资料</CardTitle>
          <CardDescription>修改您的个人信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                {...registerProfile('username', {
                  required: '请输入用户名',
                  minLength: { value: 2, message: '用户名至少2位' },
                })}
              />
              {profileErrors.username && (
                <p className="text-sm text-red-600">{profileErrors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                {...registerProfile('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址',
                  },
                })}
              />
              {profileErrors.email && (
                <p className="text-sm text-red-600">{profileErrors.email.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? '更新中...' : '更新资料'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>更改您的登录密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新密码</Label>
              <Input
                id="password"
                type="password"
                {...registerPassword('password', {
                  required: '请输入新密码',
                  minLength: { value: 8, message: '密码至少8位' },
                })}
              />
              {passwordErrors.password && (
                <p className="text-sm text-red-600">{passwordErrors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? '修改中...' : '修改密码'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 安全设置 */}
      <Card>
        <CardHeader>
          <CardTitle>安全设置</CardTitle>
          <CardDescription>管理您的账户安全</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">登出</h4>
              <p className="text-sm text-muted-foreground">
                从当前设备登出
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              登出
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}