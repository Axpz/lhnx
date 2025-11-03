'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ImageModalProps } from '@/lib/types'

export default function ImageModal({ isOpen, imageUrl, alt, onClose }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Stable close handler to prevent re-renders
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Handle backdrop click - only close if clicking outside the image container
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (imageContainerRef.current && !imageContainerRef.current.contains(event.target as Node)) {
      handleClose()
    }
  }, [handleClose])

  // Handle image double click for zoom
  const handleImageDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    setIsZoomed(!isZoomed)
  }, [isZoomed])

  // Reset zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false)
    }
  }, [isOpen])

  // Handle ESC key press and focus management
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      // Reset image states when modal opens
      setImageLoaded(false)
      setImageError(false)
      
      // Focus management - focus the modal container when it opens
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      aria-describedby="image-modal-description"
      tabIndex={-1}
    >
      <div 
        ref={imageContainerRef}
        className="relative w-full h-full flex items-center justify-center p-4 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-20 p-3 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm bg-black/30"
          aria-label="关闭图片查看器"
          tabIndex={0}
          data-modal-close
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Loading indicator */}
        {!imageLoaded && !imageError && (
          <div 
            className="flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="图片加载中"
          >
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
              role="progressbar"
              aria-label="加载进度"
            ></div>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div 
            className="flex flex-col items-center justify-center bg-black/20 rounded-lg text-white backdrop-blur-sm p-8"
            role="alert"
            aria-live="assertive"
          >
            <svg 
              className="w-16 h-16 mb-4 text-white/70" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              role="img"
              aria-label="错误图标"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm mb-4">图片加载失败</p>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setImageError(false)
                setImageLoaded(false)
              }}
              className="px-4 py-2 text-sm bg-white/20 text-white rounded hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors backdrop-blur-sm"
              aria-label="重新加载图片"
            >
              重试
            </button>
          </div>
        )}

        {/* Image */}
        {!imageError && (
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className={`transition-all duration-300 cursor-zoom-in ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              isZoomed 
                ? 'scale-150 cursor-zoom-out object-contain' 
                : 'max-w-full max-h-full object-contain'
            }`}
            id="image-modal-title"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onDoubleClick={handleImageDoubleClick}
            style={{ 
              display: imageError ? 'none' : 'block',
              maxWidth: isZoomed ? 'none' : 'calc(100vw - 2rem)',
              maxHeight: isZoomed ? 'none' : 'calc(100vh - 2rem)'
            }}
          />
        )}

        {/* Image info overlay */}
        {imageLoaded && !imageError && (
          <div 
            className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-lg backdrop-blur-sm"
            id="image-modal-description"
          >
            <div className="flex items-center justify-between">
              <p className="text-white text-sm">{alt}</p>
              <p className="text-white/70 text-xs">
                {isZoomed ? '双击缩小' : '双击放大'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}