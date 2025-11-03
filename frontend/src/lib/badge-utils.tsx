import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  Building2,
  Star,
  Zap,
  ShoppingCart,
  Eye,
  TrendingUp,
} from 'lucide-react'

// Badge configuration
interface BadgeConfig {
  label: string
  className: string
  icon?: React.ComponentType<{ className?: string }>
}

// All status configurations in one flat object
const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  // 企业状态
  '正常': { label: '正常', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  '注销': { label: '注销', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  '吊销': { label: '吊销', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  '迁出': { label: '迁出', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  '停业': { label: '停业', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
  '清算': { label: '清算', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },

  // 认证状态
  'approved': { label: '已认证', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'pending': { label: '审核中', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  'rejected': { label: '已拒绝', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  '已认证': { label: '已认证', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  '审核中': { label: '审核中', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  '已拒绝': { label: '已拒绝', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },

  // 产品状态
  'active': { label: '上架中', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'draft': { label: '草稿', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  'inactive': { label: '已下架', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  '1': { label: '上架中', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  '0': { label: '草稿', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  '-1': { label: '已下架', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  '已上架': { label: '已上架', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  '已下架': { label: '已下架', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },

  // 企业类型
  'OEM': { label: 'OEM', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Building2 },
  '品牌方': { label: '品牌方', className: 'bg-green-100 text-green-800 border-green-200', icon: Star },
  '贸易商': { label: '贸易商', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: ShoppingCart },
  '制造商': { label: '制造商', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package },
  '供应商': { label: '供应商', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: TrendingUp },
  '经销商': { label: '经销商', className: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Building2 },
  'OEM制造商': { label: 'OEM制造商', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Building2 },
  '研发型': { label: '研发型', className: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Zap },
  '综合类型': { label: '综合类型', className: 'bg-slate-100 text-slate-800 border-slate-200', icon: Building2 },

  // OEM状态
  '待报价': { label: '待报价', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  '已报价': { label: '已报价', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle },
  '洽谈中': { label: '洽谈中', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Eye },
  'processing': { label: '处理中', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp },
  'completed': { label: '已完成', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },

  // 订单状态
  'confirmed': { label: '已确认', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  'shipped': { label: '已发货', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: TrendingUp },
  'delivered': { label: '已送达', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'cancelled': { label: '已取消', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },

  // 支付状态
  'paid': { label: '已支付', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'failed': { label: '支付失败', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  'refunded': { label: '已退款', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },

  // 用户状态
  'banned': { label: '已封禁', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },

  // 用户角色
  'admin': { label: '管理员', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Star },
  'enterprise': { label: '企业用户', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Building2 },
  'user': { label: '普通用户', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },

  // 产品特性
  'new': { label: '新品', className: 'bg-green-500 text-white hover:bg-green-600', icon: Star },
  'hot': { label: '热销', className: 'bg-red-500 text-white hover:bg-red-600', icon: TrendingUp },
  'featured': { label: '推荐', className: 'bg-primary text-white hover:bg-primary/90', icon: Star },
  'customizable': { label: '可定制', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  'oem_support': { label: '支持OEM', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Building2 },

  // 完成状态
  'in_progress': { label: '进行中', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
}

/**
 * Minimalist badge component - single entry point
 * @param status - The status value
 * @returns JSX Badge element
 */
export function getStatusBadge(status: string | number | undefined) {
  if (status === undefined) return null
  const config = BADGE_CONFIGS[status.toString()]
  
  if (!config) {
    // Fallback for unknown status
    return (
      <Badge variant="outline" className="text-xs">
        {status}
      </Badge>
    )
  }

  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('text-xs', config.className)}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  )
}