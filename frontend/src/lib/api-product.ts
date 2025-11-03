// 产品相关 API
import { api } from './api-client'
import {
  Product,
  ProductFilters,
  ApiResponse,
  StatsData
} from './types'

// ============================================================================
// Type Definitions
// ============================================================================

type ProductCreateInput = Omit<
  Product,
  'id' | 'updated_at' | 'company'
>

type ProductUpdateInput = Partial<Product>

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get paginated list of products with optional filters
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
  return api.post<ApiResponse<Product[]>>('/products/list', filters)
}

/**
 * Get single product by ID
 */
export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const response = await api.post<ApiResponse<Product[]>>('/products/list', { product_id: id }) as ApiResponse<Product[]>
  return {
    data: response.data?.[0],
  } as ApiResponse<Product>
}

/**
 * Create a new product
 */
export async function createProduct(data: ProductCreateInput): Promise<ApiResponse<Product>> {
  return api.post<ApiResponse<Product>>('/products', data)
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, data: ProductUpdateInput): Promise<ApiResponse<Product>> {
  return api.put<ApiResponse<Product>>(`/products/${id}`, data)
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  return api.delete<ApiResponse<void>>(`/products/${id}`)
}

/**
 * Get product statistics
 */
export async function getProductStats(): Promise<ApiResponse<StatsData>> {
  return api.get<ApiResponse<StatsData>>('/products/stats')
}

// ============================================================================
// Legacy API Object (for backward compatibility)
// ============================================================================

export const productsApi = {
  list: getProducts,
  detail: getProduct,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  stats: getProductStats,
} as const
