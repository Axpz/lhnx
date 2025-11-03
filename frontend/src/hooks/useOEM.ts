import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { oemApi } from '@/lib/api'
import { CreateOEMRequest, OEMFilters, OEMProcessRequest } from '@/lib/types'

// OEM 需求列表查询
export function useOEMList(filters: OEMFilters = {}) {
  return useQuery({
    queryKey: ['oem-list', filters],
    queryFn: () => oemApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// OEM 需求详情查询
export function useOEMDetail(id: string) {
  return useQuery({
    queryKey: ['oem-detail', id],
    queryFn: () => oemApi.detail(id),
    enabled: !!id && id.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// OEM 统计信息查询
export function useOEMStats() {
  return useQuery({
    queryKey: ['oem-stats'],
    queryFn: () => oemApi.stats(),
    staleTime: 10 * 60 * 1000, // 10分钟
    gcTime: 20 * 60 * 1000, // 20分钟
  })
}

// 用户画像查询
export function useUserProfile(userID: string) {
  return useQuery({
    queryKey: ['user-profile', userID],
    queryFn: () => oemApi.userProfile(userID),
    enabled: !!userID && userID.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// OEM 需求创建
export function useCreateOEM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOEMRequest) => oemApi.create(data),
    onSuccess: () => {
      // 创建成功后刷新列表和统计数据
      queryClient.invalidateQueries({ queryKey: ['oem-list'] })
      queryClient.invalidateQueries({ queryKey: ['oem-stats'] })
    },
  })
}

// OEM 需求更新
export function useUpdateOEM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOEMRequest> }) =>
      oemApi.update(id, data),
    onSuccess: (_, { id }) => {
      // 更新成功后刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['oem-list'] })
      queryClient.invalidateQueries({ queryKey: ['oem-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['oem-stats'] })
    },
  })
}

// OEM 需求删除
export function useDeleteOEM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => oemApi.delete(id),
    onSuccess: () => {
      // 删除成功后刷新列表和统计数据
      queryClient.invalidateQueries({ queryKey: ['oem-list'] })
      queryClient.invalidateQueries({ queryKey: ['oem-stats'] })
    },
  })
}

// OEM 需求处理
export function useProcessOEM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OEMProcessRequest }) =>
      oemApi.process(id, data),
    onSuccess: (_, { id }) => {
      // 处理成功后刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['oem-list'] })
      queryClient.invalidateQueries({ queryKey: ['oem-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['oem-stats'] })
    },
  })
}