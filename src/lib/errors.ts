import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isProduction } from '@/lib/config'
import { logger } from '@/lib/logger'

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }

  toResponse(metadata?: { requestId?: string; processingTime?: number }): NextResponse {
    const response = {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        ...((!isProduction || this.statusCode < 500) && this.details && { details: this.details }),
      },
      ...(metadata?.requestId && { requestId: metadata.requestId }),
      timestamp: new Date().toISOString(),
      ...(metadata?.processingTime && { processingTime: metadata.processingTime }),
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add rate limit headers if applicable
    if (this.statusCode === 429 && this.details && typeof this.details === 'object' && 'retryAfter' in this.details) {
      headers['Retry-After'] = String(this.details.retryAfter)
    }

    return NextResponse.json(response, { status: this.statusCode, headers })
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_ERROR', { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(`${service} service error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', details)
    this.name = 'ExternalServiceError'
  }
}

// Error response format
interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
    requestId?: string
    timestamp: string
  }
}

// Error handler for API routes
export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  console.error('API Error:', {
    error,
    requestId,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
  })

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))

    return NextResponse.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
          requestId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    )
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        requestId,
        timestamp: new Date().toISOString(),
      },
    }

    // Only include details in development or for client errors
    if (!isProduction || error.statusCode < 500) {
      response.error.details = error.details
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle generic errors
  if (error instanceof Error) {
    const response: ErrorResponse = {
      error: {
        message: isProduction ? 'Internal server error' : error.message,
        code: 'INTERNAL_ERROR',
        requestId,
        timestamp: new Date().toISOString(),
      },
    }

    // Only include stack trace in development
    if (!isProduction) {
      response.error.details = {
        stack: error.stack,
        name: error.name,
      }
    }

    return NextResponse.json(response, { status: 500 })
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}

// Async error wrapper for API handlers
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract request ID if available
      const request = args.find(arg => arg && typeof arg === 'object' && 'headers' in arg)
      const requestId = request?.headers?.get?.('x-request-id')
      
      return handleApiError(error, requestId)
    }
  }
}

// Error logging utility
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context,
  }

  if (isProduction) {
    // In production, use a proper logging service (e.g., Sentry, DataDog)
    console.error('Application Error:', JSON.stringify(errorInfo, null, 2))
    
    // TODO: Send to external logging service
    // await sendToSentry(errorInfo)
  } else {
    // In development, log to console with formatting
    console.error('🚨 Application Error:', errorInfo)
  }
}

// Client-side error boundary helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

// Retry utility for external service calls
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }

      // Don't retry client errors (4xx)
      if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
        break
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }

  throw lastError
}

// API Response utilities
export function createApiResponse<T>(
  data: T,
  metadata?: {
    requestId?: string
    processingTime?: number
    cacheInfo?: {
      cached: boolean
      ttl?: number
    }
  }
): NextResponse {
  const response = {
    success: true,
    data,
    ...(metadata?.requestId && { requestId: metadata.requestId }),
    timestamp: new Date().toISOString(),
    ...(metadata?.processingTime && { processingTime: metadata.processingTime }),
    ...(metadata?.cacheInfo && { cache: metadata.cacheInfo }),
  }

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      ...(metadata?.requestId && { 'X-Request-ID': metadata.requestId }),
    },
  })
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown,
  metadata?: { requestId?: string; processingTime?: number }
): NextResponse {
  return new ApiError(message, statusCode, code, details).toResponse(metadata)
}