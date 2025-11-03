// API 客户端 - 使用 Axios + 现代最佳实践
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// API 错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

// Token 管理
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('access_token')
    } catch {
      return null
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('refresh_token')
    } catch {
      return null
    }
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    } catch (error) {
      console.warn('Failed to save tokens:', error)
    }
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch (error) {
      console.warn('Failed to clear tokens:', error)
    }
  },
}

// 创建 Axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 标记正在刷新的 token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// 处理队列中的请求
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 请求拦截器 - 添加认证 token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 如果是刷新 token 的请求，不添加 Authorization
    if (config.url?.includes('/auth/refresh')) {
      return config
    }

    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误和 token 刷新
axiosInstance.interceptors.response.use(
  (response) => {
    // 成功响应直接返回
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 处理 401 错误 - token 过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果是刷新 token 的请求失败，直接清除 token
      if (originalRequest.url?.includes('/auth/refresh')) {
        tokenManager.clearTokens()
        return Promise.reject(
          new ApiError('认证已过期，请重新登录', 401, error.response?.data)
        )
      }

      // 如果正在刷新 token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenManager.getRefreshToken()

      if (!refreshToken) {
        tokenManager.clearTokens()
        isRefreshing = false
        return Promise.reject(new ApiError('未授权访问', 401))
      }

      try {
        // 刷新 token
        const response = await axios.post(
          `${API_BASE}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          }
        )

        const { access_token, refresh_token } = response.data.data

        // 更新 tokens
        tokenManager.setTokens(access_token, refresh_token)

        // 处理队列中的请求
        processQueue(null, access_token)

        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.log(refreshError)

        // 刷新失败，清除 tokens
        tokenManager.clearTokens()
        processQueue(new Error('认证已过期，请重新登录'), null)
        return Promise.reject(new ApiError('认证已过期，请重新登录', 401))
      } finally {
        isRefreshing = false
      }
    }

    // 处理其他错误
    const errorData = error.response?.data as any
    const errorMessage =
      errorData?.error ||
      errorData?.message ||
      error.message ||
      `HTTP ${error.response?.status || 0}`

    throw new ApiError(
      errorMessage,
      error.response?.status || 0,
      errorData
    )
  }
)

// 请求配置接口
export interface ApiClientOptions extends AxiosRequestConfig {
  skipAuth?: boolean
}

// 基础 API 客户端
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, ...axiosOptions } = options

  try {
    const config: AxiosRequestConfig = {
      ...axiosOptions,
      url: endpoint,
    }

    // 如果需要跳过认证，临时移除拦截器的效果
    if (skipAuth && config.headers) {
      delete (config.headers as any).Authorization
    }

    const response = await axiosInstance.request<T>(config)
    console.log(response.data)
    return response.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const errorData = axiosError.response?.data as any

      throw new ApiError(
        errorData?.error || errorData?.message || axiosError.message,
        axiosError.response?.status || 0,
        errorData
      )
    }

    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败',
      0
    )
  }
}

// 便捷方法
export const api = {
  get: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      data,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      data,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      data,
    }),

  delete: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  // 文件上传方法
  upload: <T = any>(
    endpoint: string,
    formData: FormData,
    options?: ApiClientOptions & {
      onUploadProgress?: (progressEvent: any) => void
    }
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers,
      },
    }),
}

// 导出 axios 实例，以便需要时直接使用
export { axiosInstance }
