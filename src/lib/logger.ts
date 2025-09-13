import winston from 'winston'
import { config, isProduction, isDevelopment } from '@/lib/config'

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
}

winston.addColors(logColors)

// Custom log format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, method, requestId, ...meta }) => {
    let logMessage = `${timestamp} [${level}]`
    
    if (service) logMessage += ` [${service}]`
    if (method) logMessage += ` ${method}:`
    if (requestId) logMessage += ` (${requestId})`
    
    logMessage += ` ${message}`
    
    // Add metadata if present
    const metaKeys = Object.keys(meta)
    if (metaKeys.length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return logMessage
  })
)

// Create transports array
const transports: winston.transport[] = []

// Always add console transport
transports.push(
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: isDevelopment ? consoleFormat : logFormat,
    handleExceptions: true,
    handleRejections: true,
  })
)

// Add file transports in production
if (isProduction) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
  
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  )
}


// Logger interface with additional context
export interface LogContext {
  service?: string
  method?: string
  requestId?: string
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  duration?: number
  [key: string]: unknown
}

/**
 * Enhanced logger with context support
 */
class Logger {
  private logger: winston.Logger

  constructor(logger: winston.Logger) {
    this.logger = logger
  }

  /**
   * Log error with context
   */
  error(message: string, context?: LogContext): void {
    this.logger.error(message, context)
  }

  /**
   * Log warning with context
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context)
  }

  /**
   * Log info with context
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, context)
  }

  /**
   * Log HTTP request/response
   */
  http(message: string, context?: LogContext): void {
    this.logger.http(message, context)
  }

  /**
   * Log debug information
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context)
  }

  /**
   * Create a child logger with pre-filled context
   */
  child(context: LogContext): Logger {
    const childLogger = this.logger.child(context)
    return new Logger(childLogger)
  }

  /**
   * Log API request start
   */
  startRequest(method: string, path: string, context?: LogContext): void {
    this.http(`${method} ${path} - Request started`, {
      ...context,
      method,
      path,
      type: 'request_start',
    })
  }

  /**
   * Log API request completion
   */
  endRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'http'
    
    this.logger.log(level, `${method} ${path} - ${statusCode} (${duration}ms)`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
      type: 'request_end',
    })
  }

  /**
   * Log service operation
   */
  serviceOperation(
    service: string,
    operation: string,
    success: boolean,
    duration?: number,
    context?: LogContext
  ): void {
    const message = `${service}.${operation} ${success ? 'completed' : 'failed'}`
    const level = success ? 'info' : 'error'
    
    this.logger.log(level, message, {
      ...context,
      service,
      operation,
      success,
      duration,
      type: 'service_operation',
    })
  }

  /**
   * Log database operation
   */
  databaseOperation(
    table: string,
    operation: string,
    success: boolean,
    duration?: number,
    context?: LogContext
  ): void {
    const message = `DB ${operation} on ${table} ${success ? 'completed' : 'failed'}`
    const level = success ? 'debug' : 'error'
    
    this.logger.log(level, message, {
      ...context,
      table,
      operation,
      success,
      duration,
      type: 'database_operation',
    })
  }

  /**
   * Log external API call
   */
  externalApiCall(
    service: string,
    endpoint: string,
    statusCode?: number,
    duration?: number,
    context?: LogContext
  ): void {
    const message = `External API ${service} ${endpoint}`
    const level = statusCode && statusCode >= 400 ? 'warn' : 'debug'
    
    this.logger.log(level, message, {
      ...context,
      externalService: service,
      endpoint,
      statusCode,
      duration,
      type: 'external_api_call',
    })
  }

  /**
   * Log security event
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info'
    
    this.logger.log(level, `Security event: ${event}`, {
      ...context,
      event,
      severity,
      type: 'security_event',
    })
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      metric,
      value,
      unit,
      type: 'performance_metric',
    })
  }
}

// Create winston logger instance first
const winstonLogger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
      level: isDevelopment ? 'debug' : 'info',
    })
  ],
  defaultMeta: {
    service: 'senegal-driver-api',
    timestamp: new Date().toISOString()
  }
})

// Export the enhanced logger instance  
export const logger = new Logger(winstonLogger)
export const log = logger // Alias for backward compatibility

// Utility function to extract request context
export function getRequestContext(request: Request): LogContext {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        request.headers.get('cf-connecting-ip') || 
        undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  }
}

// Performance monitoring utilities
export class PerformanceTimer {
  private startTime: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.startTime = Date.now()
  }

  end(context?: LogContext): number {
    const duration = Date.now() - this.startTime
    log.performance(this.name, duration, 'ms', context)
    return duration
  }
}

// Export utility to start performance timing
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name)
}

// Health check logging
export function logHealthCheck(service: string, status: 'up' | 'down' | 'degraded', responseTime?: number, error?: string): void {
  const level = status === 'up' ? 'info' : status === 'degraded' ? 'warn' : 'error'
  
  log.logger.log(level, `Health check: ${service} is ${status}`, {
    service,
    status,
    responseTime,
    error,
    type: 'health_check',
  })
}