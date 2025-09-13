/**
 * Web Vitals monitoring and reporting
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

export interface PerformanceMetrics {
  cls: number | null
  fid: number | null
  fcp: number | null
  lcp: number | null
  ttfb: number | null
  timestamp: number
  url: string
  userAgent: string
}

export class WebVitalsReporter {
  private metrics: Partial<PerformanceMetrics> = {}
  private reported = false

  constructor(private reportUrl?: string) {
    if (typeof window !== 'undefined') {
      this.initializeMetrics()
    }
  }

  private initializeMetrics() {
    // Cumulative Layout Shift
    getCLS((metric) => {
      this.updateMetric('cls', metric)
    })

    // First Input Delay
    getFID((metric) => {
      this.updateMetric('fid', metric)
    })

    // First Contentful Paint
    getFCP((metric) => {
      this.updateMetric('fcp', metric)
    })

    // Largest Contentful Paint
    getLCP((metric) => {
      this.updateMetric('lcp', metric)
    })

    // Time to First Byte
    getTTFB((metric) => {
      this.updateMetric('ttfb', metric)
    })

    // Report when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetrics()
      }
    })
  }

  private updateMetric(name: keyof PerformanceMetrics, metric: Metric) {
    this.metrics[name] = metric.value

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name.toUpperCase()}: ${metric.value}`, {
        rating: this.getMetricRating(name, metric.value),
        metric
      })
    }
  }

  private getMetricRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      ttfb: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metricName as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  private async reportMetrics() {
    if (this.reported) return
    this.reported = true

    const completeMetrics: PerformanceMetrics = {
      cls: this.metrics.cls || null,
      fid: this.metrics.fid || null,
      fcp: this.metrics.fcp || null,
      lcp: this.metrics.lcp || null,
      ttfb: this.metrics.ttfb || null,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // Send to analytics service
    if (this.reportUrl) {
      try {
        await fetch(this.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeMetrics),
          keepalive: true
        })
      } catch (error) {
        console.error('Failed to report metrics:', error)
      }
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table(completeMetrics)
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  public forceReport(): void {
    this.reportMetrics()
  }
}

// Performance observer for custom metrics
export class CustomPerformanceObserver {
  private observer: PerformanceObserver | null = null
  private metrics: Map<string, number> = new Map()

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver()
    }
  }

  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.processEntry(entry)
      })
    })

    // Observe different entry types
    try {
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'mark'] })
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error)
    }
  }

  private processEntry(entry: PerformanceEntry) {
    // Log large resources
    if (entry.entryType === 'resource') {
      const resourceEntry = entry as PerformanceResourceTiming
      const size = resourceEntry.transferSize || 0
      
      if (size > 100000) { // 100KB
        console.warn(`Large resource detected: ${entry.name} (${(size / 1024).toFixed(1)}KB)`)
      }
    }

    // Log slow navigations
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming
      const loadTime = navEntry.loadEventEnd - navEntry.fetchStart
      
      if (loadTime > 3000) { // 3 seconds
        console.warn(`Slow page load: ${loadTime}ms`)
      }
    }
  }

  public mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name)
    }
  }

  public measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name, 'measure')[0]
        if (measure) {
          this.metrics.set(name, measure.duration)
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`)
          }
        }
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error)
      }
    }
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Resource timing analyzer
export class ResourceAnalyzer {
  public static analyzeResources(): ResourceAnalysis {
    if (typeof performance === 'undefined') {
      return { totalSize: 0, resourceTypes: {}, largeResources: [], slowResources: [] }
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    let totalSize = 0
    const resourceTypes: Record<string, { count: number; size: number }> = {}
    const largeResources: Array<{ name: string; size: number; type: string }> = []
    const slowResources: Array<{ name: string; duration: number; type: string }> = []

    resources.forEach((resource) => {
      const size = resource.transferSize || 0
      const duration = resource.duration
      const type = this.getResourceType(resource.name)

      totalSize += size

      if (!resourceTypes[type]) {
        resourceTypes[type] = { count: 0, size: 0 }
      }
      resourceTypes[type].count++
      resourceTypes[type].size += size

      // Flag large resources (>100KB)
      if (size > 100000) {
        largeResources.push({ name: resource.name, size, type })
      }

      // Flag slow resources (>1s)
      if (duration > 1000) {
        slowResources.push({ name: resource.name, duration, type })
      }
    })

    return {
      totalSize,
      resourceTypes,
      largeResources: largeResources.sort((a, b) => b.size - a.size),
      slowResources: slowResources.sort((a, b) => b.duration - a.duration)
    }
  }

  private static getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()
    
    if (['js', 'mjs'].includes(extension || '')) return 'script'
    if (['css'].includes(extension || '')) return 'stylesheet'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(extension || '')) return 'image'
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font'
    if (['json', 'xml'].includes(extension || '')) return 'xhr'
    
    return 'other'
  }
}

export interface ResourceAnalysis {
  totalSize: number
  resourceTypes: Record<string, { count: number; size: number }>
  largeResources: Array<{ name: string; size: number; type: string }>
  slowResources: Array<{ name: string; duration: number; type: string }>
}

// Initialize global performance monitoring
if (typeof window !== 'undefined') {
  // Initialize Web Vitals reporter
  const webVitalsReporter = new WebVitalsReporter('/api/analytics/performance')
  
  // Initialize custom performance observer
  const performanceObserver = new CustomPerformanceObserver()
  
  // Make available globally for debugging
  ;(window as any).__performanceMonitoring = {
    webVitals: webVitalsReporter,
    observer: performanceObserver,
    analyzer: ResourceAnalyzer
  }
}