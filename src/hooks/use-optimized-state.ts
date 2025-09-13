import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

// Optimized state management hook
export function useOptimizedState<T>(
  initialState: T,
  options?: {
    debounceMs?: number
    maxHistory?: number
    persistKey?: string
  }
) {
  const { debounceMs = 0, maxHistory = 0, persistKey } = options || {}
  
  const [state, setState] = useState<T>(() => {
    if (persistKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(persistKey)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return initialState
        }
      }
    }
    return initialState
  })

  const history = useRef<T[]>([])
  const debounceRef = useRef<NodeJS.Timeout>()

  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    const updateState = (value: T) => {
      setState(prev => {
        const next = typeof newState === 'function' ? (newState as any)(prev) : newState
        
        // Add to history
        if (maxHistory > 0) {
          history.current = [prev, ...history.current].slice(0, maxHistory)
        }

        // Persist to localStorage
        if (persistKey && typeof window !== 'undefined') {
          try {
            localStorage.setItem(persistKey, JSON.stringify(next))
          } catch (error) {
            console.warn('Failed to persist state:', error)
          }
        }

        return next
      })
    }

    if (debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => updateState(newState as T), debounceMs)
    } else {
      updateState(newState as T)
    }
  }, [debounceMs, maxHistory, persistKey])

  const undo = useCallback(() => {
    if (history.current.length > 0) {
      const [previous, ...rest] = history.current
      history.current = rest
      setState(previous)
    }
  }, [])

  const clearHistory = useCallback(() => {
    history.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    state,
    setState: optimizedSetState,
    undo,
    clearHistory,
    hasHistory: history.current.length > 0
  }
}

// Memory-efficient list management
export function useVirtualList<T>(
  items: T[],
  options?: {
    itemHeight?: number
    containerHeight?: number
    overscan?: number
  }
) {
  const { itemHeight = 50, containerHeight = 400, overscan = 5 } = options || {}
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: index + visibleRange.start
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY: visibleRange.start * itemHeight,
    setScrollTop
  }
}

// Memory cleanup hook
export function useCleanup(cleanupFn: () => void, deps: any[] = []) {
  const cleanupRef = useRef(cleanupFn)
  cleanupRef.current = cleanupFn

  useEffect(() => {
    return () => cleanupRef.current()
  }, deps)
}

// Memoized callback with automatic cleanup
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  const callbackRef = useRef<T>(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback(((...args) => {
    return callbackRef.current(...args)
  }) as T, deps)
}

// Image preload with memory management
export function useImagePreloader() {
  const cache = useRef(new Map<string, HTMLImageElement>())
  const maxCacheSize = 50

  const preloadImage = useCallback(async (src: string): Promise<HTMLImageElement> => {
    // Check cache first
    if (cache.current.has(src)) {
      return cache.current.get(src)!
    }

    // Clean cache if too large
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        cache.current.set(src, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = src
    })
  }, [])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  // Cleanup on unmount
  useCleanup(clearCache)

  return { preloadImage, clearCache }
}