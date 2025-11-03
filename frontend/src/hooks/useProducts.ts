import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api-product'
import { ProductFilters } from '@/lib/types'

// 产品列表查询
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 产品详情查询
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.detail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  })
}

// 推荐产品查询
export function useFeaturedProducts() {
  return useProducts({'limit': 12})
}

// 产品统计信息查询
export function useProductStats() {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: () => productsApi.stats(),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

