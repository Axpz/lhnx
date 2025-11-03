// OEM 相关 API
import { api } from './api-client'
import {
  OEMSubmission,
  OEMFilters,
  OEMProcessRequest,
  UserProfile,
  ApiResponse,
  StatsData,
  CreateOEMRequest
} from './types'

// 构建查询参数
function buildQueryParams(filters: OEMFilters): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })

  return params
}

// 获取 OEM 需求列表
export async function getOEMSubmissions(filters: OEMFilters): Promise<ApiResponse<OEMSubmission[]>> {
  const params = buildQueryParams(filters)
  return api.get<ApiResponse<OEMSubmission[]>>(`/oem?${params}`)
}

// 获取 OEM 需求详情
export async function getOEMSubmission(id: string): Promise<ApiResponse<OEMSubmission>> {
  return api.get<ApiResponse<OEMSubmission>>(`/oem/${id}`)
}

// 提交/创建 OEM 需求
export async function createOEMSubmission(data: CreateOEMRequest): Promise<ApiResponse<OEMSubmission>> {
  return api.post<ApiResponse<OEMSubmission>>('/oem', data)
}

// 更新 OEM 需求
export async function updateOEMSubmission(id: string, data: Partial<CreateOEMRequest>): Promise<ApiResponse<OEMSubmission>> {
  return api.put<ApiResponse<OEMSubmission>>(`/oem/${id}`, data)
}

// 删除 OEM 需求
export async function deleteOEMSubmission(id: string): Promise<ApiResponse<void>> {
  return api.delete<ApiResponse<void>>(`/oem/${id}`)
}

// 处理 OEM 需求
export async function processOEMSubmission(id: string, data: OEMProcessRequest): Promise<ApiResponse<void>> {
  return api.post<ApiResponse<void>>(`/oem/${id}/process`, data)
}

// 获取 OEM 统计信息
export async function getOEMStats(): Promise<ApiResponse<StatsData>> {
  return api.get<ApiResponse<StatsData>>('/oem/stats')
}

// 获取用户画像
export async function getOEMUserProfile(userID: string): Promise<ApiResponse<UserProfile>> {
  return api.get<ApiResponse<UserProfile>>(`/oem/user/${encodeURIComponent(userID)}`)
}

export const oemApi = {
  list: getOEMSubmissions,
  detail: getOEMSubmission,
  create: createOEMSubmission,
  update: updateOEMSubmission,
  delete: deleteOEMSubmission,
  process: processOEMSubmission,
  stats: getOEMStats,
  userProfile: getOEMUserProfile,
}