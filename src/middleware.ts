import { NextRequest, NextResponse } from 'next/server'
import { config, isProduction } from '@/lib/config'

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': isProduction
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.openai.com https://api.groq.com https://generativelanguage.googleapis.com https://*.supabase.co; frame-src 'none';"
    : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws://localhost:* http://localhost:* https://api.openai.com https://api.groq.com https://generativelanguage.googleapis.com https://*.supabase.co;",
} as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Create response
  const response = NextResponse.next()
  
  // Apply security headers to all requests
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': config.NODE_ENV === 'production' 
            ? config.NEXT_PUBLIC_APP_URL 
            : request.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    
    // Set CORS headers for API requests
    response.headers.set(
      'Access-Control-Allow-Origin',
      config.NODE_ENV === 'production' 
        ? config.NEXT_PUBLIC_APP_URL 
        : request.headers.get('origin') || '*'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Rate limiting for API routes
    const rateLimitResult = checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': config.API_RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      )
    }
    
    // Add rate limit headers to successful requests
    response.headers.set('X-RateLimit-Limit', config.API_RATE_LIMIT.toString())
    response.headers.set('X-RateLimit-Remaining', (config.API_RATE_LIMIT - rateLimitResult.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
  }
  
  // Add request ID for tracing
  response.headers.set('X-Request-ID', crypto.randomUUID())
  
  return response
}

function checkRateLimit(request: NextRequest): {
  allowed: boolean
  count: number
  resetTime: number
  retryAfter: number
} {
  // Get client identifier (IP address or user ID)
  const clientId = getClientIdentifier(request)
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const windowStart = now - windowMs
  
  // Clean up expired entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  
  // Get or create rate limit data for this client
  let rateLimitData = rateLimitStore.get(clientId)
  
  if (!rateLimitData || rateLimitData.resetTime < now) {
    // Create new window
    rateLimitData = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(clientId, rateLimitData)
    
    return {
      allowed: true,
      count: 1,
      resetTime: rateLimitData.resetTime,
      retryAfter: 0,
    }
  }
  
  // Increment count
  rateLimitData.count++
  
  const allowed = rateLimitData.count <= config.API_RATE_LIMIT
  const retryAfter = allowed ? 0 : Math.ceil((rateLimitData.resetTime - now) / 1000)
  
  return {
    allowed,
    count: rateLimitData.count,
    resetTime: rateLimitData.resetTime,
    retryAfter,
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'
  
  // In production, you might want to add user authentication
  // const userId = request.headers.get('authorization')
  // return userId || `ip:${ip}`
  
  return `ip:${ip.trim()}`
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}