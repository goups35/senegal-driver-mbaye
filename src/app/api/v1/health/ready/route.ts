import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '@/lib/errors'
import { databaseService } from '@/lib/services/database'
import { log, startTimer } from '@/lib/logger'

/**
 * Readiness probe - checks if the service is ready to serve traffic
 * This checks that all critical dependencies are available
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const timer = startTimer('readiness_check')
  
  log.debug('Readiness probe requested')

  // Check database connectivity (critical dependency)
  const dbHealth = await databaseService.healthCheck()
  
  if (dbHealth.status === 'down') {
    log.warn('Readiness check failed: database unavailable', {
      dbError: dbHealth.error,
      responseTime: dbHealth.responseTime,
    })
    
    timer.end()
    
    return NextResponse.json({
      status: 'not_ready',
      reason: 'Database unavailable',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  }

  const duration = timer.end()
  
  log.debug('Readiness check passed', {
    duration,
    dbResponseTime: dbHealth.responseTime,
  })

  return NextResponse.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'ok'
    }
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    }
  })
})