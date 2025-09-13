import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '@/lib/errors'
import { databaseService } from '@/lib/services/database'
import { log, logHealthCheck, startTimer } from '@/lib/logger'
import { config, features } from '@/lib/config'
import type { HealthCheck } from '@/schemas/validation'

/**
 * Health check endpoint for monitoring system status
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const timer = startTimer('health_check_total')
  const startTime = Date.now()
  
  log.info('Health check requested', {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  })

  // Check database connectivity
  const dbHealthTimer = startTimer('health_check_database')
  const dbHealth = await databaseService.healthCheck()
  dbHealthTimer.end()
  
  logHealthCheck('database', dbHealth.status, dbHealth.responseTime, dbHealth.error)

  // Check AI services availability
  const aiServices: Record<string, { status: 'up' | 'down' | 'degraded'; responseTime?: number; error?: string }> = {}
  
  if (features.enableAIExpert) {
    // Check OpenAI
    if (config.OPENAI_API_KEY) {
      const openaiTimer = startTimer('health_check_openai')
      try {
        // Simple API test - just check if we can make a basic request
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })
        
        const responseTime = openaiTimer.end()
        
        aiServices.openai = {
          status: response.ok ? 'up' : 'degraded',
          responseTime,
        }
        
        if (!response.ok) {
          aiServices.openai.error = `HTTP ${response.status}`
        }
        
        logHealthCheck('openai', aiServices.openai.status, responseTime, aiServices.openai.error)
      } catch (error) {
        const responseTime = openaiTimer.end()
        aiServices.openai = {
          status: 'down',
          responseTime,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
        logHealthCheck('openai', 'down', responseTime, aiServices.openai.error)
      }
    }

    // Check Groq if available
    if (config.GROQ_API_KEY) {
      const groqTimer = startTimer('health_check_groq')
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        })
        
        const responseTime = groqTimer.end()
        
        aiServices.groq = {
          status: response.ok ? 'up' : 'degraded',
          responseTime,
        }
        
        if (!response.ok) {
          aiServices.groq.error = `HTTP ${response.status}`
        }
        
        logHealthCheck('groq', aiServices.groq.status, responseTime, aiServices.groq.error)
      } catch (error) {
        const responseTime = groqTimer.end()
        aiServices.groq = {
          status: 'down',
          responseTime,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
        logHealthCheck('groq', 'down', responseTime, aiServices.groq.error)
      }
    }
  }

  // Check email service
  let emailService: { status: 'up' | 'down' | 'degraded'; error?: string } = { status: 'up' }
  if (features.enableEmailQuotes) {
    // For Resend, we can't easily test without sending an email
    // So we'll just check if the API key is configured
    emailService = { status: 'up' }
  } else {
    emailService = { status: 'degraded', error: 'Email service not configured' }
  }

  // Determine overall system status
  const allServices = { database: dbHealth, ...aiServices, email: emailService }
  const serviceStatuses = Object.values(allServices).map(s => s.status)
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  if (serviceStatuses.every(status => status === 'up')) {
    overallStatus = 'healthy'
  } else if (serviceStatuses.some(status => status === 'down')) {
    overallStatus = 'unhealthy'
  } else {
    overallStatus = 'degraded'
  }

  // Calculate uptime (since process start)
  const uptime = Math.floor(process.uptime())
  
  const totalDuration = timer.end()

  const healthCheck: HealthCheck = {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    services: allServices,
    uptime,
  }

  // Set appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  log.info(`Health check completed: ${overallStatus}`, {
    status: overallStatus,
    duration: totalDuration,
    services: Object.keys(allServices).length,
  })

  return NextResponse.json(healthCheck, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': overallStatus,
    }
  })
})

/**
 * Liveness probe - simple endpoint to check if the service is alive
 */
export const HEAD = withErrorHandling(async (request: NextRequest) => {
  log.debug('Liveness probe requested')
  
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    }
  })
})