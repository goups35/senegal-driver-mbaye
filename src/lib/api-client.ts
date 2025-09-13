// Optimized API client with caching, retries, and request deduplication
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
}

interface RequestOptions extends RequestConfig {
  url: string
}

class OptimizedApiClient {
  private cache = new Map<string, { data: any; expiry: number }>()
  private pendingRequests = new Map<string, Promise<any>>()
  private readonly baseURL = ''
  private readonly defaultTimeout = 10000
  private readonly defaultRetries = 3

  // Generate cache key from request
  private getCacheKey(url: string, config: RequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.body || {})}`
  }

  // Check if cached response is still valid
  private getCachedResponse(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  // Set cached response
  private setCachedResponse(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }

  // Request with timeout
  private async requestWithTimeout(url: string, config: RequestConfig): Promise<Response> {
    const timeout = config.timeout || this.defaultTimeout
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Request with retries and exponential backoff
  private async requestWithRetries(url: string, config: RequestConfig): Promise<any> {
    const retries = config.retries || this.defaultRetries
    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.requestWithTimeout(url, config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error
        }

        // Wait before retry with exponential backoff
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10s
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  // Main request method
  async request(options: RequestOptions) {
    const { url, cache = false, cacheTTL = 300000, ...config } = options
    const fullUrl = this.baseURL + url
    const cacheKey = this.getCacheKey(fullUrl, config)

    // Check cache first (only for GET requests)
    if (cache && (config.method || 'GET') === 'GET') {
      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // Check for pending identical requests (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)
    }

    // Make the request
    const requestPromise = this.requestWithRetries(fullUrl, config)
      .then(data => {
        // Cache successful responses
        if (cache && (config.method || 'GET') === 'GET') {
          this.setCachedResponse(cacheKey, data, cacheTTL)
        }
        return data
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey)
      })

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }

  // Convenience methods
  async get(url: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request({ url, method: 'GET', ...config })
  }

  async post(url: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request({ url, method: 'POST', body, ...config })
  }

  async put(url: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request({ url, method: 'PUT', body, ...config })
  }

  async delete(url: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request({ url, method: 'DELETE', ...config })
  }

  // Batch requests in parallel
  async batch(requests: RequestOptions[]): Promise<any[]> {
    return Promise.all(requests.map(request => this.request(request)))
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size
    }
  }
}

// Singleton instance
export const apiClient = new OptimizedApiClient()

// Performance tracking wrapper
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now()
    
    try {
      const result = await fn(...args)
      const duration = performance.now() - startTime
      
      // Track performance
      console.log(`${name} completed in ${duration.toFixed(2)}ms`)
      
      // Report to analytics if available
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('api_performance', {
          endpoint: name,
          duration,
          success: true
        })
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error)
      
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('api_performance', {
          endpoint: name,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      throw error
    }
  }
}

// React hook for API calls
export function useApiCall<T>(
  url: string,
  config?: RequestConfig,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeRequest = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiClient.request({ url, ...config })
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-execute on mount and dependency changes
  React.useEffect(() => {
    if (config?.method === 'GET' || !config?.method) {
      executeRequest()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: executeRequest
  }
}