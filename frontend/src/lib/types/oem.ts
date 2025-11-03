// OEM 表单类型
export interface CreateOEMRequest {
  user_id?: string
  user_type: string // 品牌方, 渠道商, 电商, 创业者
  contact_person: string
  contact_info: string // 微信/邮箱
  quantity: number // 预计采购数量
  product_type: string // 想要的产品类型
  special_needs?: string // 特殊需求说明
}

// OEM 提交记录类型
export interface OEMSubmission {
  id: string
  user_id?: string
  user_type: string
  contact_person: string
  contact_info: string
  quantity: number
  product_type: string
  special_needs?: string

  // 状态管理
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  processed_at?: string
  processed_by?: string
  process_note?: string

  // 系统字段
  created_at: string
  updated_at: string
}

// OEM 筛选条件
export interface OEMFilters {
  status?: string | undefined
  user_type?: string | undefined
  search?: string | undefined
  start_date?: string | undefined
  end_date?: string | undefined
  offset?: number
  limit?: number
}

// OEM 处理请求
export interface OEMProcessRequest {
  status: 'processing' | 'completed' | 'rejected'
  process_note?: string
  processed_by: string
}

// OEM 状态常量
export const OEM_STATUS = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  REJECTED: 'rejected' as const,
}

// 用户类型常量
export const OEM_USER_TYPES = [
  { value: '品牌方', label: '品牌方' },
  { value: '贸易商', label: '贸易商' },
  { value: '制造商', label: '制造商' },
  { value: '研发型', label: '研发型' },
  { value: '综合类型', label: '综合类型' }
]

// 用户统计信息类型
export interface UserStats {
  status_counts: Record<string, number>
  product_types: Record<string, number>
  total_quantity: number
  avg_quantity: number
}

// 用户画像类型（基于联系信息聚合）
export interface UserProfile {
  contact_info: string
  contact_person: string
  user_type: string
  total_submissions: number
  first_submission: string
  last_submission: string
  submissions: OEMSubmission[]
  stats: UserStats
}

