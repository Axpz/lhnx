import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/lib/api'
import { CompanyFilters } from '@/lib/types'

// 企业列表查询
export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => companiesApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 企业列表查询
export function useSearchCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ['search-companies', filters],
    queryFn: () => companiesApi.search(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 企业详情查询
export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesApi.list({ company_id: id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 10分钟
  })
}

export function useCompanyStats() {
  return useQuery({
    queryKey: ['company-stats'],
    queryFn: () => companiesApi.stats(),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}
