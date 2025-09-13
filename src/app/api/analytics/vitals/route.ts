import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const vitals = await request.json()
    
    // Log Core Web Vitals in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Core Web Vitals received:', {
        name: vitals.name,
        value: vitals.value,
        rating: getRating(vitals.name, vitals.value),
        url: vitals.url,
        timestamp: new Date(vitals.timestamp).toISOString()
      })
    }
    
    // In production, you would send this to your analytics service
    // Examples: Google Analytics, DataDog, New Relic, etc.
    if (process.env.NODE_ENV === 'production') {
      await sendToAnalyticsService(vitals)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics data' },
      { status: 500 }
    )
  }
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  }

  const threshold = thresholds[metricName as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

async function sendToAnalyticsService(vitals: any) {
  // Example implementations for different services
  
  // Google Analytics 4
  if (process.env.GA_MEASUREMENT_ID) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: vitals.id || 'anonymous',
          events: [{
            name: 'web_vitals',
            params: {
              metric_name: vitals.name,
              metric_value: vitals.value,
              metric_delta: vitals.delta,
              page_url: vitals.url
            }
          }]
        })
      })
    } catch (error) {
      console.warn('Failed to send to Google Analytics:', error)
    }
  }

  // DataDog (example)
  if (process.env.DATADOG_API_KEY) {
    try {
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY
        },
        body: JSON.stringify({
          series: [{
            metric: `webvitals.${vitals.name.toLowerCase()}`,
            points: [[Math.floor(vitals.timestamp / 1000), vitals.value]],
            tags: [
              `url:${new URL(vitals.url).pathname}`,
              `rating:${getRating(vitals.name, vitals.value)}`
            ]
          }]
        })
      })
    } catch (error) {
      console.warn('Failed to send to DataDog:', error)
    }
  }

  // Custom webhook (example)
  if (process.env.ANALYTICS_WEBHOOK_URL) {
    try {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_WEBHOOK_TOKEN}`
        },
        body: JSON.stringify({
          type: 'web_vitals',
          data: vitals,
          rating: getRating(vitals.name, vitals.value),
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.warn('Failed to send to webhook:', error)
    }
  }
}