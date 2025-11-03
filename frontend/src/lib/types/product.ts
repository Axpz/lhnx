import type { Company } from './company'

// 产品状态定义
export const ProductStatus = {
  Active: 1,   // 上架/正常
  Draft: 0,    // 草稿
  Offline: -1, // 下线/停用
} as const

// 状态描述映射
export const ProductStatusMap: Record<number, string> = {
  [ProductStatus.Active]: '上架',
  [ProductStatus.Draft]: '草稿',
  [ProductStatus.Offline]: '下线',
}

// ProductInfo 对应后端 JSONMap 中的字段
export interface ProductInfo {
  name?: string
  status?: number // 状态 ID: >=0 正常, <0 下线
  category?: number
  description?: string
  heating_time?: number
  image_urls?: string // 多个图片URL用分号分隔 "url1;url2;url3"
  view_count?: number
  
  // 其他可能的动态字段
  [key: string]: any
}

// 产品类型
export interface Product {
  id: string // UUID
  name: string
  company_id: string // UUID
  info: ProductInfo
  updated_at: string
  sort_order: number
  
  // 关联数据
  company?: Company
}

export interface ProductFilters {
  keyword?: string
  user_id?: string // UUID
  product_id?: string
  company_id?: string
  category?: number
  updated_at?: string
  sort_order?: number
  product_status?: number
  heating_time?: number

  offset?: number
  limit?: number
}

// 产品统计数据类型
export interface ProductStats {
  total: number
  by_category: Record<string, number>
}

// 产品类别定义
export const ProductCategories = [
  { id: 1, name: '暖贴' },
  { id: 2, name: '发热鞋垫' },
  { id: 3, name: '暖手贴' },
  { id: 4, name: '蒸汽眼罩' },
] as const

// 发热时长选项（小时）
export const HeatingTimeDurations = [4, 6, 8, 10, 12, 24] as const
