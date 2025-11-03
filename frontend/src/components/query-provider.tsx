'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认缓存时间
            staleTime: 60 * 1000, // 1分钟
            gcTime: 5 * 60 * 1000, // 5分钟
            // 重试配置
            retry: (failureCount, error) => {
              // 4xx 错误不重试
              if (error instanceof Error && error.message.includes('4')) {
                return false
              }
              // 最多重试 2 次
              return failureCount < 2
            },
            // 重新获取配置
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            // 突变重试配置
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}