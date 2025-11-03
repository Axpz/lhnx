import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { preloadImage, LANDING_CONFIG } from '../lib/landing-page'

const PLACEHOLDER_IMAGE = LANDING_CONFIG.PLACEHOLDER

export interface ImageLoadState {
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  src: string
}

/**
 * 图片加载状态管理Hook
 * @param imageUrl 图片URL
 * @param fallbackUrl 可选的fallback图片URL
 * @returns 图片加载状态和重试函数
 */
export function useImageLoader(imageUrl: string, fallbackUrl?: string) {
  const [state, setState] = useState<ImageLoadState>({
    isLoading: true,
    isLoaded: false,
    hasError: false,
    src: imageUrl
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const loadImage = useCallback(async (url: string, isFallback = false) => {
    // Cancel previous load
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setState({
      isLoading: true,
      isLoaded: false,
      hasError: false,
      src: url
    })

    try {
      const success = await preloadImage(url)

      if (signal.aborted) return

      if (success) {
        setState({
          isLoading: false,
          isLoaded: true,
          hasError: false,
          src: url
        })
      } else {
        throw new Error('Image failed to load')
      }
    } catch (error) {
      if (signal.aborted) return

      // Try fallback if available and not already trying fallback
      if (fallbackUrl && !isFallback) {
        loadImage(fallbackUrl, true)
      } else {
        setState({
          isLoading: false,
          isLoaded: false,
          hasError: true,
          src: PLACEHOLDER_IMAGE
        })
      }
    }
  }, [fallbackUrl])

  const retry = useCallback(() => {
    loadImage(imageUrl)
  }, [imageUrl, loadImage])

  useEffect(() => {
    loadImage(imageUrl)

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [imageUrl, loadImage])

  return {
    ...state,
    retry
  }
}

/**
 * 批量图片加载状态管理Hook
 * @param imageUrls 图片URL数组
 * @returns 批量加载状态
 */
export function useBatchImageLoader(imageUrls: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, ImageLoadState>>({})
  const abortControllerRef = useRef<AbortController | null>(null)

  // Compute overall state from loading states
  const overallState = useMemo(() => {
    const states = Object.values(loadingStates)
    const loadedCount = states.filter(s => s.isLoaded).length
    const errorCount = states.filter(s => s.hasError).length
    const isLoading = states.some(s => s.isLoading)

    return {
      isLoading,
      loadedCount,
      errorCount,
      totalCount: imageUrls.length
    }
  }, [loadingStates, imageUrls.length])

  const loadImages = useCallback(async () => {
    // Cancel previous loading
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    // Initialize loading states
    const initialStates: Record<string, ImageLoadState> = {}
    imageUrls.forEach(url => {
      initialStates[url] = {
        isLoading: true,
        isLoaded: false,
        hasError: false,
        src: url
      }
    })
    setLoadingStates(initialStates)

    // Load all images in parallel
    const results = await Promise.allSettled(
      imageUrls.map(async (url) => {
        try {
          const success = await preloadImage(url)

          if (signal.aborted) return { url, success: false }

          return { url, success }
        } catch {
          return { url, success: false }
        }
      })
    )

    if (signal.aborted) return

    // Update all states at once
    const newStates: Record<string, ImageLoadState> = {}
    results.forEach((result, index) => {
      const url = imageUrls[index]
      if (!url) return

      const success = result.status === 'fulfilled' && result.value.success

      newStates[url] = {
        isLoading: false,
        isLoaded: success,
        hasError: !success,
        src: success ? url : PLACEHOLDER_IMAGE
      }
    })

    setLoadingStates(newStates)
  }, [imageUrls])

  const retryAll = useCallback(() => {
    loadImages()
  }, [loadImages])

  const retryImage = useCallback(async (imageUrl: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [imageUrl]: {
        isLoading: true,
        isLoaded: false,
        hasError: false,
        src: imageUrl
      }
    }))

    try {
      const success = await preloadImage(imageUrl)

      setLoadingStates(prev => ({
        ...prev,
        [imageUrl]: {
          isLoading: false,
          isLoaded: success,
          hasError: !success,
          src: success ? imageUrl : PLACEHOLDER_IMAGE
        }
      }))
    } catch {
      setLoadingStates(prev => ({
        ...prev,
        [imageUrl]: {
          isLoading: false,
          isLoaded: false,
          hasError: true,
          src: PLACEHOLDER_IMAGE
        }
      }))
    }
  }, [])

  useEffect(() => {
    if (imageUrls.length > 0) {
      loadImages()
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [imageUrls, loadImages])

  const getImageState = useCallback((url: string): ImageLoadState =>
    loadingStates[url] || {
      isLoading: true,
      isLoaded: false,
      hasError: false,
      src: url
    }, [loadingStates])

  return {
    loadingStates,
    overallState,
    retryAll,
    retryImage,
    getImageState
  }
}

interface ProductImage {
  url: string
  [key: string]: unknown
}

interface ProductGroup {
  id: number
  images: ProductImage[]
  [key: string]: unknown
}

interface GroupLoadingState {
  isLoading: boolean
  loadedCount: number
  totalCount: number
  progress: number
}

/**
 * 产品组图片加载Hook
 * @param productGroups 产品组数据
 * @returns 产品组图片加载状态
 */
export function useProductGroupImages(productGroups: ProductGroup[]) {
  const allImageUrls = useMemo(() =>
    productGroups.flatMap(group =>
      group.images.map(img => img.url)
    ), [productGroups]
  )

  const batchLoader = useBatchImageLoader(allImageUrls)

  // Memoize group URL mapping for better performance
  const groupUrlMap = useMemo(() => {
    const map = new Map<number, string[]>()
    productGroups.forEach(group => {
      map.set(group.id, group.images.map(img => img.url))
    })
    return map
  }, [productGroups])

  const getGroupLoadingState = useCallback((groupId: number): GroupLoadingState => {
    const groupImageUrls = groupUrlMap.get(groupId)

    if (!groupImageUrls || groupImageUrls.length === 0) {
      return {
        isLoading: false,
        loadedCount: 0,
        totalCount: 0,
        progress: 0
      }
    }

    const loadedCount = groupImageUrls.filter(url =>
      batchLoader.loadingStates[url]?.isLoaded
    ).length

    const isLoading = groupImageUrls.some(url =>
      batchLoader.loadingStates[url]?.isLoading
    )

    const totalCount = groupImageUrls.length

    return {
      isLoading,
      loadedCount,
      totalCount,
      progress: totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0
    }
  }, [groupUrlMap, batchLoader.loadingStates])

  return {
    ...batchLoader,
    getGroupLoadingState
  }
}