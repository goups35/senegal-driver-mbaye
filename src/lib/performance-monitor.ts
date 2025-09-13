// Performance monitoring and optimization
interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  bundleSize: number
  apiResponseTimes: Record<string, number[]>
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private apiTimes: Record<string, number[]> = {}

  // Core Web Vitals tracking
  trackCoreWebVitals() {
    if (typeof window === 'undefined') return

    // LCP - Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      this.metrics.largestContentfulPaint = lastEntry.startTime
      this.reportMetric('lcp', lastEntry.startTime)
    })
    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime
        this.reportMetric('fid', entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // CLS - Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.metrics.cumulativeLayoutShift = clsValue
      this.reportMetric('cls', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // FCP - First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime
          this.reportMetric('fcp', entry.startTime)
        }
      })
    })
    fcpObserver.observe({ entryTypes: ['paint'] })
  }

  // API performance tracking
  trackApiCall(endpoint: string, duration: number) {
    if (!this.apiTimes[endpoint]) {
      this.apiTimes[endpoint] = []
    }
    this.apiTimes[endpoint].push(duration)
    
    // Keep only last 10 calls per endpoint
    if (this.apiTimes[endpoint].length > 10) {
      this.apiTimes[endpoint] = this.apiTimes[endpoint].slice(-10)
    }

    // Report slow API calls
    if (duration > 2000) {
      this.reportMetric('slow_api', duration, { endpoint })
    }
  }

  // Memory usage tracking
  trackMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window) || !('memory' in (window.performance as any))) {
      return null
    }

    const memory = (window.performance as any).memory
    const usage = {
      usedHeapSize: memory.usedHeapSize,
      totalHeapSize: memory.totalHeapSize,
      limit: memory.jsHeapSizeLimit
    }

    // Alert if memory usage is high
    const usagePercent = (usage.usedHeapSize / usage.limit) * 100
    if (usagePercent > 80) {
      this.reportMetric('high_memory_usage', usagePercent)
    }

    return usage
  }

  // Resource loading tracking
  trackResourceLoading() {
    if (typeof window === 'undefined') return

    const resources = performance.getEntriesByType('resource')
    const slowResources = resources.filter(resource => resource.duration > 1000)
    
    slowResources.forEach(resource => {
      this.reportMetric('slow_resource', resource.duration, {
        name: resource.name,
        type: (resource as any).initiatorType
      })
    })

    return {
      totalResources: resources.length,
      slowResources: slowResources.length,
      totalLoadTime: resources.reduce((sum, r) => sum + r.duration, 0)
    }
  }

  // Bundle analysis
  analyzeBundleSize() {
    if (typeof window === 'undefined') return

    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    
    const bundleInfo = {
      scriptCount: scripts.length,
      styleCount: styles.length,
      estimatedScriptSize: scripts.length * 50, // Rough estimate in KB
      estimatedStyleSize: styles.length * 10
    }

    this.metrics.bundleSize = bundleInfo.estimatedScriptSize + bundleInfo.estimatedStyleSize
    
    return bundleInfo
  }

  // Performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = []

    if ((this.metrics.largestContentfulPaint || 0) > 2500) {
      recommendations.push('LCP too slow - optimize images and critical resources')
    }

    if ((this.metrics.firstInputDelay || 0) > 100) {
      recommendations.push('FID too high - reduce JavaScript execution time')
    }

    if ((this.metrics.cumulativeLayoutShift || 0) > 0.1) {
      recommendations.push('CLS too high - add dimensions to images and avoid dynamic content insertion')
    }

    if ((this.metrics.bundleSize || 0) > 500) {
      recommendations.push('Bundle size too large - implement code splitting')
    }

    // API performance recommendations
    Object.entries(this.apiTimes).forEach(([endpoint, times]) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      if (avgTime > 1000) {
        recommendations.push(`API endpoint ${endpoint} is slow (${avgTime.toFixed(0)}ms avg) - add caching`)
      }
    })

    return recommendations
  }

  // Report metrics to analytics
  private reportMetric(name: string, value: number, metadata?: Record<string, any>) {
    // In production, send to analytics service
    console.log(`Performance metric: ${name}`, { value, metadata })
    
    // Example: Send to analytics
    // analytics.track('performance_metric', {
    //   metric_name: name,
    //   value,
    //   ...metadata
    // })
  }

  // Generate performance report
  generateReport(): PerformanceMetrics & { recommendations: string[] } {
    return {
      ...this.metrics,
      apiResponseTimes: this.apiTimes,
      recommendations: this.getRecommendations()
    } as PerformanceMetrics & { recommendations: string[] }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export const usePerformanceMonitor = () => {
  const trackApiCall = (endpoint: string, startTime: number) => {
    const duration = Date.now() - startTime
    performanceMonitor.trackApiCall(endpoint, duration)
  }

  const getMemoryUsage = () => {
    return performanceMonitor.trackMemoryUsage()
  }

  return {
    trackApiCall,
    getMemoryUsage,
    getReport: () => performanceMonitor.generateReport()
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.trackCoreWebVitals()
  
  // Track page load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.analyzeBundleSize()
      performanceMonitor.trackResourceLoading()
    }, 100)
  })
}