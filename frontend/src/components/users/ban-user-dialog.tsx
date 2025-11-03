'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Ban, CheckCircle, Loader2 } from 'lucide-react'
import { useBanUser, useUnbanUser } from '@/hooks/useUsers'
import { User } from '@/lib/api-user'

interface BanUserDialogProps {
  user: User | null
  action: 'ban' | 'unban'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BanUserDialog({ user, action, open, onOpenChange, onSuccess }: BanUserDialogProps) {
  const { mutate: banUser, isPending: isBanning } = useBanUser()
  const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser()

  const handleSubmit = () => {
    if (!user) return
    
    const mutation = action === 'ban' ? banUser : unbanUser
    
    mutation(user.id, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
        console.error(`${action === 'ban' ? '封禁' : '解封'}用户失败:`, error)
      }
    })
  }

  const isPending = isBanning || isUnbanning

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {action === 'ban' ? (
              <Ban className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span>{action === 'ban' ? '封禁用户' : '解封用户'}</span>
          </DialogTitle>
          <DialogDescription>
            {action === 'ban' 
              ? `确定要封禁用户 "${user.username}" 吗？封禁后该用户将无法登录系统。`
              : `确定要解封用户 "${user.username}" 吗？解封后该用户将恢复正常使用。`
            }
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className={action === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            确认{action === 'ban' ? '封禁' : '解封'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}