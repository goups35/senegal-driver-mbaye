'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface PerformanceMetrics {
  pageLoadTime: number
  ttfb: number // Time to First Byte
  fcp: number  // First Contentful Paint
  lcp: number  // Largest Contentful Paint
  cls: number  // Cumulative Layout Shift
  fid: number  // First Input Delay
}

export function usePerformance() {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({})

  const measureMetric = useCallback((name: keyof PerformanceMetrics, value: number) => {
    metricsRef.current[name] = value
    
    // Report to analytics (if configured)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, DataDog, etc.
      console.debug(`Performance metric ${name}: ${value}ms`)
    }
  }, [])

  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return

    // Measure page load time
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationTiming) {
      const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart
      measureMetric('pageLoadTime', pageLoadTime)
      
      const ttfb = navigationTiming.responseStart - navigationTiming.navigationStart
      measureMetric('ttfb', ttfb)
    }
  }, [measureMetric])

  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          measureMetric('fcp', entry.startTime)
        }
      }
    })
    observer.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      measureMetric('lcp', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      measureMetric('cls', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        measureMetric('fid', (entry as any).processingStart - entry.startTime)
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    return () => {
      observer.disconnect()
      lcpObserver.disconnect()
      clsObserver.disconnect()
      fidObserver.disconnect()
    }
  }, [measureMetric])

  const trackUserInteraction = useCallback((action: string, target?: string) => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      console.debug(`User interaction ${action} ${target ? `on ${target}` : ''} took ${duration}ms`)
      
      // Report to analytics
      if (process.env.NODE_ENV === 'production') {
        // Example: analytics.track('user_interaction', { action, target, duration })
      }
    }
  }, [])

  const getMetrics = useCallback((): Partial<PerformanceMetrics> => {
    return { ...metricsRef.current }
  }, [])

  useEffect(() => {
    measurePageLoad()
    const cleanup = measureWebVitals()
    
    return cleanup
  }, [measurePageLoad, measureWebVitals])

  return {
    measureMetric,
    trackUserInteraction,
    getMetrics
  }
}

export function useResourceMonitoring() {
  const checkResourceUsage = useCallback(() => {
    if (typeof window === 'undefined') return

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.debug('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      })
    }

    // Connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      console.debug('Connection:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      })
    }
  }, [])

  useEffect(() => {
    // Check resource usage periodically
    const interval = setInterval(checkResourceUsage, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [checkResourceUsage])

  return { checkResourceUsage }
}