'use client'

import { useState, useCallback } from 'react'
import { useOptimizedState } from './use-optimized-state'

export interface LoadingState {
  [key: string]: boolean
}

export function useLoadingStates(initialStates: LoadingState = {}) {
  const { state: loadingStates, setState: setLoadingStates } = useOptimizedState<LoadingState>(
    initialStates,
    { debounceMs: 0 }
  )

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [setLoadingStates])

  const startLoading = useCallback((key: string) => {
    setLoading(key, true)
  }, [setLoading])

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false)
  }, [setLoading])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const withLoading = useCallback(async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
    startLoading(key)
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading(key)
    }
  }, [startLoading, stopLoading])

  const resetAll = useCallback(() => {
    setLoadingStates({})
  }, [setLoadingStates])

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    resetAll,
  }
}

// Hook for managing async operations with loading states
export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: string | null
  }>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: string) => void
    }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFn()
      setState({ data: result, loading: false, error: null })
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      options?.onError?.(errorMessage)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}