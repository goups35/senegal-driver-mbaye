/**
 * Web Vitals tracking for performance monitoring
 */

export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

// Send metrics to analytics endpoint
export function sendToAnalytics(metric: WebVitalsMetric) {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    ...metric,
    url: window.location.href,
    timestamp: Date.now()
  })

  // Use sendBeacon for reliability
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  }
}
