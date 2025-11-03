// 通用 API 响应类型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  
  // 分页信息（当需要时）
  total?: number
  offset?: number
  limit?: number
}

// 统计数据类型（通用）
export interface StatsData {
  stats?: Record<string, number>
}

