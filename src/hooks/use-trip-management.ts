'use client'

import { useCallback } from 'react'
import { useAppContext, useAppActions } from '@/contexts/app-context'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

export function useTripManagement() {
  const { state } = useAppContext()
  const { setQuote, resetQuote, setLoading, setError } = useAppActions()

  const handleQuoteGenerated = useCallback((quote: TripQuote, data: TripRequestInput) => {
    try {
      setQuote(quote, data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set quote')
    }
  }, [setQuote, setError])

  const handleResetQuote = useCallback(() => {
    try {
      resetQuote()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset quote')
    }
  }, [resetQuote, setError])

  return {
    currentQuote: state.currentQuote,
    tripData: state.tripData,
    loading: state.loading,
    error: state.error,
    handleQuoteGenerated,
    handleResetQuote,
    setLoading,
    setError,
  }
}