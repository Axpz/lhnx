// API 相关常量
export const API_ENDPOINTS = {
  COMPANIES: '/api/companies',
  PRODUCTS: '/api/products',
  OEM: '/api/oem',
  STATS: '/api/stats',
  FILTERS: '/api/filters',
} as const

// 查询键常量
export const QUERY_KEYS = {
  COMPANIES: 'companies',
  COMPANY: 'company',
  COMPANY_PRODUCTS: 'company-products',
  PRODUCTS: 'products',
  PRODUCT: 'product',
  FEATURED_PRODUCTS: 'featured-products',
  STATS: 'stats',
  COMPANY_FILTER_OPTIONS: 'company-filter-options',
  PRODUCT_FILTER_OPTIONS: 'product-filter-options',
} as const

// 规格类型
export const SPEC_TYPES = {
  BASIC: 'basic',
  TECHNICAL: 'technical',
  USAGE: 'usage',
  OTHER: 'other',
} as const

// 分页默认值
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const

// 缓存时间（毫秒）
export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1分钟
  MEDIUM: 5 * 60 * 1000,     // 5分钟
  LONG: 30 * 60 * 1000,      // 30分钟
  VERY_LONG: 60 * 60 * 1000, // 1小时
} as const

// 路由路径
export const ROUTES = {
  HOME: '/',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/[id]',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/[id]',
  OEM: '/oem',
} as const

// 联系方式
export const CONTACT_INFO = {
  EMAIL: '116586276@qq.com',
  WECHAT: '18612998605',
  WORK_HOURS: '周一至周五 9:00-18:00',
} as const

// 产品分类映射
export const categoryMap: Record<number, string> = {
  1: '电热水器',
  2: '燃气热水器',
  3: '太阳能热水器',
  4: '空气能热水器',
  5: '其他'
}
