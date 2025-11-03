// 统一的 API 导出文件
// 提供向后兼容性和现代化的导入方式

// 认证相关
export * from './api-auth'

// 企业相关
export * from './api-company'
export { companiesApi } from './api-company'

// 产品相关
export * from './api-product'
export { productsApi } from './api-product'

// OEM 相关
export * from './api-oem'
export { oemApi } from './api-oem'

// 基础设施
export { api, apiClient, tokenManager, ApiError } from './api-client'

// 类型定义
export * from './types'