/**
 * Security utilities for input validation and sanitization
 * Provides protection against XSS, injection attacks, and malicious input
 */

// Rate limiting store (simple in-memory for demo)
const rateLimitStore = new Map<string, { count: number; reset: number }>()

/**
 * Advanced input sanitization
 */
export function sanitizeInput(input: string, options: {
  maxLength?: number
  allowHtml?: boolean
  allowSpecialChars?: boolean
} = {}): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }

  const {
    maxLength = 1000,
    allowHtml = false,
    allowSpecialChars = true
  } = options

  let sanitized = input.trim()

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // HTML/XSS protection
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/data:application\/javascript/gi, '')
      .replace(/[<>]/g, '')
  }

  // SQL/NoSQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\$\w+|\{\$\w+\})/g, // MongoDB operators
    /(--|#|\/\*|\*\/)/g, // SQL comments
    /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/gi // Common SQL injection patterns
  ]

  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Special characters filtering
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s\-@.]/g, '')
  }

  // Length limitation
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  return sanitized
}

/**
 * Rate limiting for API endpoints
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.reset < now) {
      rateLimitStore.delete(key)
    }
  }

  const current = rateLimitStore.get(identifier)

  if (!current || current.reset < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      reset: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.reset
    }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.reset
  }
}

/**
 * Validate email format with enhanced security
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Additional security checks
  if (email.length > 255) return false
  if (email.includes('..')) return false // Consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false
  if (email.includes(' ')) return false

  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,20}$/

  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, '')

  return phoneRegex.test(phone) && digitsOnly.length >= 9 && digitsOnly.length <= 15
}

/**
 * Generate secure session ID
 */
export function generateSecureSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `session_${timestamp}_${random}`
}

/**
 * Content Security Policy violation logger
 */
export function logCSPViolation(violation: {
  documentURI: string
  violatedDirective: string
  blockedURI: string
  lineNumber?: number
  columnNumber?: number
  sourceFile?: string
}): void {
  console.warn('🔒 CSP Violation:', {
    timestamp: new Date().toISOString(),
    ...violation
  })

  // In production, you might want to send this to a logging service
  // fetch('/api/security/csp-violation', { method: 'POST', body: JSON.stringify(violation) })
}

/**
 * Request size validation
 */
export function validateRequestSize(data: unknown, maxSizeKB: number = 100): boolean {
  const sizeInBytes = new Blob([JSON.stringify(data)]).size
  const sizeInKB = sizeInBytes / 1024

  return sizeInKB <= maxSizeKB
}