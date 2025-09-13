import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { ApiError } from '@/lib/errors'
import { config } from '@/lib/config'

// Simple API key authentication for internal services
export interface AuthContext {
  isAuthenticated: boolean
  authType: 'none' | 'api-key' | 'jwt'
  userId?: string
  permissions: string[]
  metadata?: Record<string, unknown>
}

/**
 * Check API key authentication
 */
export function checkApiKeyAuth(request: NextRequest): AuthContext {
  const apiKey = request.headers.get('x-api-key')
  const requestId = request.headers.get('x-request-id')

  // For development/public endpoints, allow without auth
  if (!config.JWT_SECRET || config.JWT_SECRET === 'fallback-secret-for-dev') {
    logger.debug('Development mode: allowing request without authentication', { requestId })
    return {
      isAuthenticated: false,
      authType: 'none',
      permissions: ['read:public']
    }
  }

  if (!apiKey) {
    logger.warn('Missing API key in request', { 
      requestId,
      path: request.nextUrl.pathname
    })
    return {
      isAuthenticated: false,
      authType: 'none',
      permissions: []
    }
  }

  // Validate API key (in production, this would check against a database)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  const isValidKey = validApiKeys.includes(apiKey)

  if (isValidKey) {
    logger.debug('Valid API key authentication', { requestId })
    return {
      isAuthenticated: true,
      authType: 'api-key',
      permissions: ['read:all', 'write:itineraries', 'write:quotes']
    }
  }

  logger.warn('Invalid API key provided', { 
    requestId,
    keyPrefix: apiKey.slice(0, 8) + '...'
  })

  return {
    isAuthenticated: false,
    authType: 'none',
    permissions: []
  }
}

/**
 * Check JWT token authentication (for future user auth)
 */
export function checkJwtAuth(request: NextRequest): AuthContext {
  const authHeader = request.headers.get('authorization')
  const requestId = request.headers.get('x-request-id')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      authType: 'none',
      permissions: []
    }
  }

  const token = authHeader.slice(7)

  try {
    // TODO: Implement JWT verification
    // const payload = jwt.verify(token, config.JWT_SECRET)
    
    logger.debug('JWT authentication attempted', { requestId })
    
    // Placeholder implementation
    return {
      isAuthenticated: false,
      authType: 'jwt',
      permissions: []
    }
  } catch (error) {
    logger.warn('Invalid JWT token', { 
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      isAuthenticated: false,
      authType: 'none',
      permissions: []
    }
  }
}

/**
 * Combined authentication check
 */
export function authenticate(request: NextRequest): AuthContext {
  const requestId = request.headers.get('x-request-id')

  // Try API key first
  const apiKeyAuth = checkApiKeyAuth(request)
  if (apiKeyAuth.isAuthenticated) {
    return apiKeyAuth
  }

  // Try JWT
  const jwtAuth = checkJwtAuth(request)
  if (jwtAuth.isAuthenticated) {
    return jwtAuth
  }

  // For public endpoints, allow limited access
  const publicPaths = [
    '/api/v1/health',
    '/api/v1/distances',
    '/api/v1/chat',
    '/api/v1/ai-expert',
    '/api/v1/trips/quote'
  ]

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    logger.debug('Public endpoint access granted', { 
      requestId,
      path: request.nextUrl.pathname
    })

    return {
      isAuthenticated: false,
      authType: 'none',
      permissions: ['read:public', 'write:public']
    }
  }

  logger.warn('Authentication required for protected endpoint', {
    requestId,
    path: request.nextUrl.pathname
  })

  return {
    isAuthenticated: false,
    authType: 'none',
    permissions: []
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(auth: AuthContext, requiredPermission: string): boolean {
  // Admin permissions
  if (auth.permissions.includes('admin:all')) {
    return true
  }

  // Exact permission match
  if (auth.permissions.includes(requiredPermission)) {
    return true
  }

  // Wildcard permissions (e.g., 'read:all' covers 'read:itineraries')
  const [action, resource] = requiredPermission.split(':')
  const wildcardPermission = `${action}:all`
  
  if (auth.permissions.includes(wildcardPermission)) {
    return true
  }

  return false
}

/**
 * Require authentication for protected routes
 */
export function requireAuth(
  request: NextRequest,
  requiredPermissions: string[] = []
): AuthContext {
  const auth = authenticate(request)
  const requestId = request.headers.get('x-request-id')

  // Check authentication
  if (requiredPermissions.length > 0 && !auth.isAuthenticated) {
    logger.warn('Authentication required', { 
      requestId,
      requiredPermissions,
      path: request.nextUrl.pathname
    })

    throw new ApiError(
      'Authentication required',
      401,
      'AUTHENTICATION_REQUIRED',
      { requiredPermissions }
    )
  }

  // Check permissions
  for (const permission of requiredPermissions) {
    if (!hasPermission(auth, permission)) {
      logger.warn('Insufficient permissions', { 
        requestId,
        userPermissions: auth.permissions,
        requiredPermission: permission,
        path: request.nextUrl.pathname
      })

      throw new ApiError(
        'Insufficient permissions',
        403,
        'INSUFFICIENT_PERMISSIONS',
        { 
          required: permission,
          available: auth.permissions
        }
      )
    }
  }

  return auth
}

/**
 * Security event logging for suspicious activities
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  request: NextRequest,
  details?: Record<string, unknown>
): void {
  const requestId = request.headers.get('x-request-id')
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown'

  logger.security(event, severity, {
    requestId,
    ip,
    userAgent: request.headers.get('user-agent'),
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
    ...details
  })

  // In production, you might want to send alerts for critical events
  if (severity === 'critical') {
    // TODO: Send alert to security team
    console.error('🚨 CRITICAL SECURITY EVENT:', {
      event,
      requestId,
      ip,
      path: request.nextUrl.pathname
    })
  }
}

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkAuthRateLimit(clientId: string): boolean {
  const now = Date.now()
  const maxAttempts = 5
  const windowMs = 15 * 60 * 1000 // 15 minutes

  const attempts = authAttempts.get(clientId)
  
  if (!attempts) {
    authAttempts.set(clientId, { count: 1, lastAttempt: now })
    return true
  }

  // Reset counter if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(clientId, { count: 1, lastAttempt: now })
    return true
  }

  // Check if under limit
  if (attempts.count < maxAttempts) {
    attempts.count++
    attempts.lastAttempt = now
    return true
  }

  return false
}

// Cleanup old auth attempts
setInterval(() => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000

  for (const [clientId, data] of authAttempts.entries()) {
    if (now - data.lastAttempt > windowMs) {
      authAttempts.delete(clientId)
    }
  }
}, 5 * 60 * 1000) // Cleanup every 5 minutes