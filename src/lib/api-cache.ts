/**
 * Advanced API caching and performance optimization
 */

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  staleWhileRevalidate?: number // SWR timeout
  maxSize?: number // Maximum cache size
  keyPrefix?: string
  compression?: boolean
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  compressed?: boolean
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private keyPrefix: string

  constructor(config: Partial<CacheConfig> = {}) {
    this.maxSize = config.maxSize || 100
    this.keyPrefix = config.keyPrefix || 'cache:'
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const fullKey = this.keyPrefix + key
    
    // Evict expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictExpired()
      
      // If still full, evict least recently used
      if (this.cache.size >= this.maxSize) {
        this.evictLRU()
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    this.cache.set(fullKey, entry)
  }

  get<T>(key: string): T | null {
    const fullKey = this.keyPrefix + key
    const entry = this.cache.get(fullKey)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(fullKey)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    return entry.data as T
  }

  has(key: string): boolean {
    const fullKey = this.keyPrefix + key
    const entry = this.cache.get(fullKey)
    
    if (!entry) return false
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(fullKey)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const fullKey = this.keyPrefix + key
    return this.cache.delete(fullKey)
  }

  clear(): void {
    this.cache.clear()
  }

  private evictExpired(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  getStats() {
    const entries = Array.from(this.cache.values())
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      avgAccessCount: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length 
        : 0,
      oldestEntry: entries.length > 0 
        ? Math.min(...entries.map(entry => entry.timestamp)) 
        : null
    }
  }
}

// Stale-While-Revalidate implementation
export class SWRCache extends MemoryCache {
  private revalidationPromises = new Map<string, Promise<any>>()

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const cached = this.get<T>(key)
    const now = Date.now()

    // Return cached data if fresh
    if (cached) {
      const entry = this.cache.get(this.keyPrefix + key)
      if (entry && (now - entry.timestamp) < config.ttl) {
        return cached
      }

      // Stale data - start revalidation in background
      if (config.staleWhileRevalidate) {
        this.revalidateInBackground(key, fetcher, config)
        return cached
      }
    }

    // No cache or expired - fetch fresh data
    return this.fetchAndCache(key, fetcher, config)
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    const fullKey = this.keyPrefix + key

    // Prevent multiple revalidations
    if (this.revalidationPromises.has(fullKey)) {
      return
    }

    const revalidationPromise = (async () => {
      try {
        const data = await fetcher()
        this.set(key, data, config.ttl)
      } catch (error) {
        console.warn('Background revalidation failed:', error)
      } finally {
        this.revalidationPromises.delete(fullKey)
      }
    })()

    this.revalidationPromises.set(fullKey, revalidationPromise)
  }

  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const data = await fetcher()
    this.set(key, data, config.ttl)
    return data
  }
}

// API response caching wrapper
export class APICache {
  private cache: SWRCache
  private defaultConfig: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.defaultConfig = {
      ttl: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: 60 * 1000, // 1 minute
      maxSize: 100,
      keyPrefix: 'api:',
      ...config
    }
    
    this.cache = new SWRCache(this.defaultConfig)
  }

  async get<T>(
    url: string,
    options: RequestInit = {},
    cacheConfig?: Partial<CacheConfig>
  ): Promise<T> {
    const config = { ...this.defaultConfig, ...cacheConfig }
    const cacheKey = this.generateCacheKey(url, options)

    return this.cache.getOrFetch(
      cacheKey,
      () => this.fetchData<T>(url, options),
      config
    )
  }

  async post<T>(
    url: string,
    data: any,
    options: RequestInit = {},
    cacheConfig?: Partial<CacheConfig>
  ): Promise<T> {
    // POST requests are typically not cached, but we can cache responses
    // for identical POST data using a hash of the request body
    if (cacheConfig?.ttl) {
      const config = { ...this.defaultConfig, ...cacheConfig }
      const cacheKey = this.generateCacheKey(url, { ...options, body: JSON.stringify(data) })

      return this.cache.getOrFetch(
        cacheKey,
        () => this.fetchData<T>(url, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        }),
        config
      )
    }

    return this.fetchData<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    })
  }

  private async fetchData<T>(url: string, options: RequestInit): Promise<T> {
    const startTime = performance.now()
    
    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        const duration = performance.now() - startTime
        console.log(`🌐 API Request: ${url} (${duration.toFixed(2)}ms)`)
      }

      return data
    } catch (error) {
      // Log error and duration
      const duration = performance.now() - startTime
      console.error(`❌ API Error: ${url} (${duration.toFixed(2)}ms)`, error)
      throw error
    }
  }

  private generateCacheKey(url: string, options: RequestInit): string {
    // Create a hash of the URL and relevant options
    const keyData = {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    }

    return btoa(JSON.stringify(keyData)).slice(0, 32)
  }

  // Cache management methods
  invalidate(pattern?: string): void {
    if (pattern) {
      // Clear entries matching pattern
      for (const [key] of this.cache['cache'].entries()) {
        if (key.includes(pattern)) {
          this.cache.delete(key.replace(this.defaultConfig.keyPrefix!, ''))
        }
      }
    } else {
      this.cache.clear()
    }
  }

  getStats() {
    return this.cache.getStats()
  }

  // Preload data
  async preload<T>(
    url: string,
    options: RequestInit = {},
    cacheConfig?: Partial<CacheConfig>
  ): Promise<void> {
    try {
      await this.get<T>(url, options, cacheConfig)
    } catch (error) {
      console.warn('Preload failed:', url, error)
    }
  }
}

// Request deduplication
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async dedupe<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }
}

// Batch requests
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{ resolve: Function; reject: Function; data: any }>
    timeout: NodeJS.Timeout
  }>()

  batch<T>(
    batchKey: string,
    requestData: any,
    batchHandler: (requests: any[]) => Promise<T[]>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let batch = this.batches.get(batchKey)

      if (!batch) {
        batch = {
          requests: [],
          timeout: setTimeout(() => {
            this.executeBatch(batchKey, batchHandler)
          }, delay)
        }
        this.batches.set(batchKey, batch)
      }

      batch.requests.push({ resolve, reject, data: requestData })
    })
  }

  private async executeBatch<T>(
    batchKey: string,
    batchHandler: (requests: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch) return

    this.batches.delete(batchKey)
    clearTimeout(batch.timeout)

    try {
      const requestsData = batch.requests.map(req => req.data)
      const results = await batchHandler(requestsData)

      batch.requests.forEach((req, index) => {
        req.resolve(results[index])
      })
    } catch (error) {
      batch.requests.forEach(req => {
        req.reject(error)
      })
    }
  }
}

// Global instances
export const apiCache = new APICache()
export const requestDeduplicator = new RequestDeduplicator()
export const requestBatcher = new RequestBatcher()

// Helper functions
export function createCachedFetcher<T>(
  baseUrl: string,
  defaultConfig?: Partial<CacheConfig>
) {
  return {
    get: (endpoint: string, config?: Partial<CacheConfig>) =>
      apiCache.get<T>(`${baseUrl}${endpoint}`, {}, { ...defaultConfig, ...config }),
    
    post: (endpoint: string, data: any, config?: Partial<CacheConfig>) =>
      apiCache.post<T>(`${baseUrl}${endpoint}`, data, {}, { ...defaultConfig, ...config }),
    
    invalidate: (pattern?: string) => apiCache.invalidate(pattern),
    
    preload: (endpoint: string, config?: Partial<CacheConfig>) =>
      apiCache.preload<T>(`${baseUrl}${endpoint}`, {}, { ...defaultConfig, ...config })
  }
}

// React hook for cached API calls
export function useCachedAPI<T>(
  url: string,
  options: RequestInit = {},
  config?: Partial<CacheConfig>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    apiCache.get<T>(url, options, config)
      .then(result => {
        if (mounted) {
          setData(result)
          setError(null)
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [url, JSON.stringify(options), JSON.stringify(config)])

  return { data, loading, error, refetch: () => apiCache.invalidate(url) }
}

import { useState, useEffect } from 'react'