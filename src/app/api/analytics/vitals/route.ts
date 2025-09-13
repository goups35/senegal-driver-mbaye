import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log performance metrics
    logger.performance('Web Vitals metric received', {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      url: body.url,
      userAgent: request.headers.get('user-agent')?.slice(0, 100)
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error('Failed to process web vitals', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({ success: false }, { status: 500 })
  }
}