import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitResult {
  allowed: boolean
  count: number
  resetTime: number
  retryAfter: number
  remaining: number
}

export async function rateLimitCheck(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const {
    windowMs,
    maxRequests,
    keyGenerator = getDefaultClientIdentifier,
  } = options

  const clientId = keyGenerator(request)
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up expired entries periodically
  cleanupExpiredEntries(now)

  // Get or create rate limit data for this client
  let rateLimitData = rateLimitStore.get(clientId)

  if (!rateLimitData || rateLimitData.resetTime < now) {
    // Create new window
    rateLimitData = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(clientId, rateLimitData)

    logger.debug('Rate limit: New window created', {
      clientId,
      count: 1,
      resetTime: new Date(rateLimitData.resetTime).toISOString(),
      maxRequests,
    })

    return {
      allowed: true,
      count: 1,
      resetTime: rateLimitData.resetTime,
      retryAfter: 0,
      remaining: maxRequests - 1,
    }
  }

  // Increment count
  rateLimitData.count++
  const allowed = rateLimitData.count <= maxRequests
  const remaining = Math.max(0, maxRequests - rateLimitData.count)
  const retryAfter = allowed ? 0 : Math.ceil((rateLimitData.resetTime - now) / 1000)

  logger.debug('Rate limit check', {
    clientId,
    count: rateLimitData.count,
    maxRequests,
    allowed,
    remaining,
    retryAfter,
    resetTime: new Date(rateLimitData.resetTime).toISOString(),
  })

  if (!allowed) {
    logger.warn('Rate limit exceeded', {
      clientId,
      count: rateLimitData.count,
      maxRequests,
      retryAfter,
      resetTime: new Date(rateLimitData.resetTime).toISOString(),
    })
  }

  return {
    allowed,
    count: rateLimitData.count,
    resetTime: rateLimitData.resetTime,
    retryAfter,
    remaining,
  }
}

function getDefaultClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'

  // In production, you might want to add user authentication
  const authHeader = request.headers.get('authorization')
  const userId = authHeader ? extractUserIdFromAuth(authHeader) : null

  return userId || `ip:${ip.trim()}`
}

function extractUserIdFromAuth(authHeader: string): string | null {
  try {
    // Simple extraction for bearer tokens
    if (authHeader.startsWith('Bearer ')) {
      // This would typically decode a JWT and extract user ID
      // For now, just use a hash of the token as identifier
      const token = authHeader.slice(7)
      return `user:${hashString(token).slice(0, 16)}`
    }
    return null
  } catch {
    return null
  }
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

function cleanupExpiredEntries(now: number): void {
  // Only cleanup occasionally to avoid performance impact
  if (Math.random() > 0.01) return // 1% chance to cleanup

  const deleted = []
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
      deleted.push(key)
    }
  }

  if (deleted.length > 0) {
    logger.debug('Rate limit store cleanup', {
      deletedEntries: deleted.length,
      remainingEntries: rateLimitStore.size,
    })
  }
}

// Rate limit middleware with different presets
export const rateLimitPresets = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes
  normal: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  lenient: { windowMs: 15 * 60 * 1000, maxRequests: 200 }, // 200 requests per 15 minutes
  burst: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
  chat: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 chat requests per minute
  upload: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 uploads per minute
} as const

// Advanced rate limiting with sliding window (more memory efficient for production)
export class SlidingWindowRateLimit {
  private store = new Map<string, number[]>()

  constructor(
    private windowMs: number,
    private maxRequests: number
  ) {}

  check(clientId: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing timestamps for this client
    let timestamps = this.store.get(clientId) || []

    // Remove expired timestamps
    timestamps = timestamps.filter(timestamp => timestamp > windowStart)

    // Add current timestamp
    timestamps.push(now)

    // Update store
    this.store.set(clientId, timestamps)

    const count = timestamps.length
    const allowed = count <= this.maxRequests
    const resetTime = timestamps[0] + this.windowMs
    const retryAfter = allowed ? 0 : Math.ceil((resetTime - now) / 1000)
    const remaining = Math.max(0, this.maxRequests - count)

    return {
      allowed,
      count,
      resetTime,
      retryAfter,
      remaining,
    }
  }

  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs

    for (const [clientId, timestamps] of this.store.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
      
      if (validTimestamps.length === 0) {
        this.store.delete(clientId)
      } else {
        this.store.set(clientId, validTimestamps)
      }
    }
  }
}

// Distributed rate limiting interface (for Redis implementation)
export interface DistributedRateLimit {
  check(clientId: string, windowMs: number, maxRequests: number): Promise<RateLimitResult>
  reset(clientId: string): Promise<void>
  getStats(): Promise<{ totalClients: number; totalRequests: number }>
}

// Redis-based rate limiting (implementation would go here)
export class RedisRateLimit implements DistributedRateLimit {
  constructor(private redisClient: any) {} // Redis client type

  async check(clientId: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    // TODO: Implement Redis-based sliding window rate limiting
    throw new Error('Redis rate limiting not implemented yet')
  }

  async reset(clientId: string): Promise<void> {
    // TODO: Implement Redis reset
    throw new Error('Redis rate limiting not implemented yet')
  }

  async getStats(): Promise<{ totalClients: number; totalRequests: number }> {
    // TODO: Implement Redis stats
    throw new Error('Redis rate limiting not implemented yet')
  }
}