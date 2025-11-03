'use client'

import Link from 'next/link'
import { LogOut, User, UserCircle, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface UserNavProps {
  showHomeLink?: boolean
}

export function UserNav({ showHomeLink = true }: UserNavProps) {
  const { user, isAuthenticated, logout } = useAuth()

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Link href="/auth/signin">
        <User className="ml-2 h-4 w-4 hover:text-primary" />
      </Link>
    )
  }

  // Logged in
  const userInitial = user?.email?.charAt(0)?.toUpperCase() || 'U'
  const email = user?.email || '用户'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 hover:cursor-pointer border">
            <AvatarFallback className="bg-primary/10 text-muted-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showHomeLink && (
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              <span>返回首页</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

