// 企业相关 API
import { api } from './api-client'
import type { 
  Company, 
  CompanyFilters, 
  StatsData,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  ApiResponse 
} from './types'

// 获取企业列表
export async function listCompanies(filters: CompanyFilters = {}): Promise<ApiResponse<Company[]>> {
  return api.post<ApiResponse<Company[]>>('/companies/list', filters)
}

// 搜索企业
export async function searchCompanies(filters: CompanyFilters = {}): Promise<ApiResponse<Company[]>> {
  return api.post<ApiResponse<Company[]>>('/companies/search', filters)
}

// 创建企业
export async function createCompany(data: CreateCompanyRequest): Promise<ApiResponse<Company>> {
  return api.post<ApiResponse<Company>>('/companies', data)
}

// 更新企业
export async function updateCompany(id: string, data: UpdateCompanyRequest): Promise<ApiResponse<Company>> {
  return api.put<ApiResponse<Company>>(`/companies/${id}`, data)
}

// 删除企业
export async function deleteCompany(id: string): Promise<ApiResponse<void>> {
  return api.delete<ApiResponse<void>>(`/companies/${id}`)
}

// 审核企业
type VerifyCompanyData = {
  action: 'approve' | 'reject'
  remark?: string
  verifier_id?: number
}

export async function verifyCompany(id: string, data: VerifyCompanyData): Promise<ApiResponse<void>> {
  return api.post<ApiResponse<void>>(`/companies/${id}/verify`, data)
}

// 获取企业统计信息
export async function getCompanyStats(): Promise<ApiResponse<StatsData>> {
  return api.get<ApiResponse<StatsData>>('/companies/stats')
}

// 为了向后兼容，导出对象形式的 API
export const companiesApi = {
  list: listCompanies,
  create: createCompany,
  update: updateCompany,
  delete: deleteCompany,
  verify: verifyCompany,
  search: searchCompanies,
  stats: getCompanyStats,
}
