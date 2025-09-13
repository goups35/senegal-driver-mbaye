import { logError } from '@/lib/errors'

/**
 * Base service class with common functionality
 */
export abstract class BaseService {
  protected readonly serviceName: string

  constructor(serviceName: string) {
    this.serviceName = serviceName
  }

  /**
   * Log service-specific errors with context
   */
  protected logError(error: unknown, method: string, context?: Record<string, unknown>): void {
    logError(error, {
      service: this.serviceName,
      method,
      ...context,
    })
  }

  /**
   * Execute operation with error logging
   */
  protected async executeWithLogging<T>(
    operation: () => Promise<T>,
    method: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      const startTime = Date.now()
      const result = await operation()
      const duration = Date.now() - startTime
      
      // Log successful operation in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${this.serviceName}] ${method} completed in ${duration}ms`)
      }
      
      return result
    } catch (error) {
      this.logError(error, method, context)
      throw error
    }
  }

  /**
   * Validate input data before processing
   */
  protected validateInput<T>(data: unknown, validator: (data: unknown) => T): T {
    try {
      return validator(data)
    } catch (error) {
      this.logError(error, 'validateInput', { data })
      throw error
    }
  }
}

/**
 * Service registry for dependency injection
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services = new Map<string, unknown>()

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service)
  }

  get<T>(key: string): T {
    const service = this.services.get(key)
    if (!service) {
      throw new Error(`Service ${key} not found in registry`)
    }
    return service as T
  }

  has(key: string): boolean {
    return this.services.has(key)
  }

  clear(): void {
    this.services.clear()
  }
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Default service configuration
 */
export const defaultServiceConfig: Required<ServiceConfig> = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
}

/**
 * Merge service configuration with defaults
 */
export function mergeServiceConfig(config?: ServiceConfig): Required<ServiceConfig> {
  return {
    ...defaultServiceConfig,
    ...config,
  }
}