'use client'

import { lazy, Suspense, ComponentType } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy loading wrapper with error boundary
export function withLazyLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense 
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" aria-label="Chargement du composant" />
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Optimized loading states for different component types
export const LoadingStates = {
  Chat: () => (
    <div className="space-y-4 p-6">
      <div className="flex space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="flex space-x-3 justify-end">
        <div className="flex-1 space-y-2 max-w-xs">
          <div className="h-4 bg-blue-100 rounded animate-pulse w-full" />
          <div className="h-4 bg-blue-100 rounded animate-pulse w-2/3" />
        </div>
        <div className="w-8 h-8 bg-blue-200 rounded-full animate-pulse" />
      </div>
    </div>
  ),
  
  Transport: () => (
    <div className="grid gap-4 p-6">
      <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      </div>
      <div className="flex space-x-3">
        <div className="h-10 bg-blue-200 rounded animate-pulse flex-1" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
      </div>
    </div>
  ),
  
  Hero: () => (
    <div className="relative h-screen bg-gray-200 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 bg-gray-300 rounded w-96 mx-auto" />
          <div className="h-6 bg-gray-300 rounded w-64 mx-auto" />
          <div className="h-10 bg-blue-300 rounded w-32 mx-auto" />
        </div>
      </div>
    </div>
  ),
  
  Form: () => (
    <div className="space-y-4 p-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-blue-200 rounded animate-pulse w-24" />
    </div>
  )
}

// Preload component on hover or intersection
export function withPreloadOnHover<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LazyComponent: React.ComponentType<React.ComponentProps<T>>
) {
  let preloadPromise: Promise<{ default: T }> | null = null
  
  const preload = () => {
    if (!preloadPromise) {
      preloadPromise = importFn()
    }
    return preloadPromise
  }

  return function PreloadWrapper(props: React.ComponentProps<T>) {
    return (
      <div
        onMouseEnter={preload}
        onFocus={preload}
        onTouchStart={preload}
      >
        <LazyComponent {...props} />
      </div>
    )
  }
}

// Progressive loading for AI components
export function withProgressiveLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  lightweightFallback?: ComponentType<any>
) {
  const LazyComponent = lazy(importFn)
  
  return function ProgressiveWrapper(props: React.ComponentProps<T> & { enableAI?: boolean }) {
    const { enableAI = false, ...componentProps } = props
    
    if (!enableAI && lightweightFallback) {
      const LightweightComponent = lightweightFallback
      return <LightweightComponent {...componentProps} />
    }
    
    return (
      <Suspense 
        fallback={
          <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-center space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600">Chargement de l'IA...</p>
            </div>
          </div>
        }
      >
        <LazyComponent {...componentProps} />
      </Suspense>
    )
  }
}

// Intersection-based lazy loading
export function withIntersectionLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
) {
  const LazyComponent = lazy(importFn)
  
  return function IntersectionWrapper(props: React.ComponentProps<T>) {
    const [shouldLoad, setShouldLoad] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        },
        {
          rootMargin: '100px',
          threshold: 0.1,
          ...options
        }
      )
      
      if (ref.current) {
        observer.observe(ref.current)
      }
      
      return () => observer.disconnect()
    }, [])
    
    if (!shouldLoad) {
      return (
        <div ref={ref} className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">Préparation du contenu...</div>
        </div>
      )
    }
    
    return (
      <Suspense fallback={<LoadingStates.Form />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy loaded AI components
export const LazyAIChat = withLazyLoading(
  () => import('@/components/features/chat-section'),
  <LoadingStates.Chat />
)

export const LazyTransportForm = withLazyLoading(
  () => import('@/components/features/transport-section'),
  <LoadingStates.Transport />
)

// Lazy loaded heavy UI components
export const LazyImageGallery = withLazyLoading(
  () => import('@/components/ui/image-gallery'),
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
)

export const LazyMap = withIntersectionLoading(
  () => import('@/components/ui/interactive-map'),
  { rootMargin: '200px' }
)

// Bundle analysis utilities
export function logComponentSize(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📦 ${componentName} loaded`)
    console.log('Timestamp:', new Date().toISOString())
    
    // Log bundle size if performance API is available
    if (typeof performance !== 'undefined') {
      const entries = performance.getEntriesByType('resource')
      const jsEntries = entries.filter(entry => 
        entry.name.includes('.js') || entry.name.includes('.tsx')
      )
      
      console.log('Recent JS loads:', jsEntries.slice(-3).map(entry => ({
        name: entry.name.split('/').pop(),
        size: entry.transferSize || 0,
        duration: entry.duration
      })))
    }
    
    console.groupEnd()
  }
}

// Performance monitoring for lazy components
export function withPerformanceTracking<T extends ComponentType<any>>(
  Component: T,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: React.ComponentProps<T>) {
    useEffect(() => {
      const startTime = performance.now()
      logComponentSize(componentName)
      
      return () => {
        const endTime = performance.now()
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ ${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`)
        }
      }
    }, [])
    
    return <Component {...props} />
  }
}

import { useState, useRef, useEffect } from 'react'