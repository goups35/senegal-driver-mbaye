'use client'

import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { TripQuote, TripRequest } from '@/types'

interface TripContextType {
  // State
  currentQuote: TripQuote | null
  tripData: TripRequest | null

  // Actions
  setCurrentQuote: (quote: TripQuote | null) => void
  setTripData: (data: TripRequest | null) => void
  resetTrip: () => void
  updateQuoteAndData: (quote: TripQuote, data: TripRequest) => void
}

const TripContext = createContext<TripContextType | undefined>(undefined)

interface TripProviderProps {
  children: ReactNode
}

export function TripProvider({ children }: TripProviderProps) {
  const [currentQuote, setCurrentQuote] = useState<TripQuote | null>(null)
  const [tripData, setTripData] = useState<TripRequest | null>(null)

  const resetTrip = () => {
    setCurrentQuote(null)
    setTripData(null)
  }

  const updateQuoteAndData = (quote: TripQuote, data: TripRequest) => {
    setCurrentQuote(quote)
    setTripData(data)
  }

  const value: TripContextType = {
    currentQuote,
    tripData,
    setCurrentQuote,
    setTripData,
    resetTrip,
    updateQuoteAndData
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}

export function useTripContext(): TripContextType {
  const context = useContext(TripContext)

  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider')
  }

  return context
}

// Type guard pour vérifier si on a un devis complet
export function hasCompleteQuote(context: TripContextType): context is TripContextType & {
  currentQuote: TripQuote
  tripData: TripRequest
} {
  return context.currentQuote !== null && context.tripData !== null
}