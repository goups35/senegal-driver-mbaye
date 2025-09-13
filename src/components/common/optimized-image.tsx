'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  lazy?: boolean
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  aspectRatio = 'auto'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority || !lazy)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [lazy, priority, isInView])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = (error: Error) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(error)
    console.error('Image failed to load:', src, error)
  }

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number = 8, h: number = 8) => {
    if (blurDataURL) return blurDataURL
    
    // Create a simple blur placeholder
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
      return canvas.toDataURL()
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg=='
  }

  const aspectRatioClasses = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    'auto': ''
  }

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          aspectRatioClasses[aspectRatio],
          className
        )}
        role="img"
        aria-label={alt}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  if (!isInView && lazy && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-100',
          aspectRatioClasses[aspectRatio],
          className
        )}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    )
  }

  return (
    <div 
      ref={imgRef} 
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : ''
        )}
        onLoad={handleLoad}
        onError={(e) => {
          handleError(new Error(`Failed to load image: ${src}`))
        }}
        // Performance optimizations
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}

// Higher-order component for image optimization presets
export function HeroImage(props: Omit<OptimizedImageProps, 'sizes' | 'priority'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      sizes="100vw"
      quality={90}
      aspectRatio="16/9"
    />
  )
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) {
  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 768px) 50vw, 25vw"
      quality={75}
      aspectRatio="square"
    />
  )
}

export function CardImage(props: Omit<OptimizedImageProps, 'sizes' | 'aspectRatio'>) {
  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 768px) 100vw, 50vw"
      aspectRatio="4/3"
    />
  )
}

// Preload critical images
export function preloadImage(src: string, priority: boolean = false) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = priority ? 'preload' : 'prefetch'
  link.as = 'image'
  link.href = src
  
  // Add responsive preloading
  if (priority) {
    link.imageSizes = '100vw'
    link.imageSrcset = `
      ${src}?w=640 640w,
      ${src}?w=750 750w,
      ${src}?w=828 828w,
      ${src}?w=1080 1080w,
      ${src}?w=1200 1200w,
      ${src}?w=1920 1920w
    `
  }
  
  document.head.appendChild(link)
}

// Image format detection
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    return false
  }
}