import type { Product } from './product'

// 认证信息接口
export interface Certification {
  name: string
  issuer: string
  number: string
  expire_date: string
}

// 资质证书接口
export interface Qualification {
  name: string
  issuer: string
  number: string
  expire_date: string
}

export interface CompanyImage {
  id: number
  company_id: number
  image_url: string
}

// CompanyInfo 对应后端 JSONMap 中的字段
export interface CompanyInfo {
  // 基础信息
  name: string
  type?: string // e.g. '个人独资企业', 'OEM', '品牌方', etc.
  email?: string
  phone?: string
  address?: string // 实际经营地址
  
  // 工商信息
  credit_code?: string // 统一社会信用代码 (在 Info 中也存储一份)
  legal_person?: string
  registered_capital?: string
  business_scope?: string
  registered_address?: string
  founded_time?: string
  company_status?: string // '正常' | '注销' | '吊销' | '迁出' | '停业' | '清算'
  
  // 审核状态
  is_active?: boolean
  sort_order?: number
  is_verified?: boolean
  verify_status?: string // 'pending' | 'approved' | 'rejected'

  // 其他可能的动态字段
  [key: string]: any
}

export interface Company {
  id: string // UUID
  credit_code?: string // 数据库列中的 credit_code
  user_id?: string // UUID
  info: CompanyInfo
  updated_at: string

  // 关联数据（可选）
  products?: Product[]
}

// 筛选相关类型
export interface CompanyFilters {
  keyword?: string
  user_id?: string // UUID
  company_id?: string // UUID
  credit_code?: string
  type?: string
  company_status?: string
  verify_status?: string
  is_verified?: boolean
  is_active?: boolean
  is_featured?: boolean
  updated_at?: string

  offset?: number
  limit?: number
}

// 创建企业请求数据结构
export interface CreateCompanyRequest {
  name: string
  type?: string
  region?: string
  legal_person?: string
  credit_code?: string
  // registered_code?: string
  // registered_capital?: string
  registered_address?: string
  // registered_authority?: string
  founded_time?: string
  industry?: string
  business_scope?: string

  // 联系信息
  phone?: string
  email?: string
  // province?: string
  // city?: string
  // district?: string
  address?: string
  contact?: string
  website?: string
  description?: string

  // 认证信息
  // certifications?: any // JSON
  // qualifications?: any // JSON
}

// 更新企业请求数据结构
export interface UpdateCompanyRequest {
  name?: string
  type?: string
  region?: string
  founded_time?: string
  contact?: string
  main_products?: string
  description?: string
  logo_url?: string
  website_url?: string

  // 工商信息
  legal_person?: string
  registered_capital?: string
  business_scope?: string
  registered_address?: string
  license_number?: string
  registration_date?: string
  registration_authority?: string

  // 联系信息
  phone?: string
  email?: string
  address?: string
  postal_code?: string

  // 企业规模
  employee_count?: string
  annual_revenue?: string

  // 认证信息
  certifications?: string // JSON string in request
  qualifications?: string // JSON string in request

  // 系统字段
  is_active?: boolean
  sort_order?: number

  user_id?: string
}

export const CompanyTypes: readonly string[] = [
  '有限责任公司',
  '股份有限公司',
  '外商投资企业',
  '个体工商户',
  '其他',
] as const

export type CompanyType = typeof CompanyTypes[number]

export function getCompanyType(company: Company): string {
  if (company.info.type) {
    return company.info.type;
  }

  const creditCode = company.info.credit_code || '';
  if (!/^[0-9A-Z]{18}$/.test(creditCode)) {
    return "其他";
  }

  const typeChar = creditCode.charAt(1);

  switch (typeChar) {
    case "1": return "企业法人";
    case "2": return "个体工商户";
    case "3": return "机关法人";
    case "4": return "事业单位法人";
    case "5": return "社会组织法人";
    case "6": return "民办非企业单位";
    case "7": return "基金会";
    case "8": return "外国企业常驻机构";
    default:  return "其他";
  }
}