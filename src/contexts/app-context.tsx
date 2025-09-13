'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

// Application modes
export type AppMode = 'home' | 'transport' | 'chat'

// State interface
interface AppState {
  mode: AppMode
  currentQuote: TripQuote | null
  tripData: TripRequestInput | null
  loading: boolean
  error: string | null
}

// Action types
type AppAction = 
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_QUOTE'; payload: { quote: TripQuote; tripData: TripRequestInput } }
  | { type: 'RESET_QUOTE' }
  | { type: 'RESET_TO_HOME' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Initial state
const initialState: AppState = {
  mode: 'home',
  currentQuote: null,
  tripData: null,
  loading: false,
  error: null,
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, error: null }
    case 'SET_QUOTE':
      return { 
        ...state, 
        currentQuote: action.payload.quote, 
        tripData: action.payload.tripData,
        loading: false,
        error: null 
      }
    case 'RESET_QUOTE':
      return { ...state, currentQuote: null, tripData: null }
    case 'RESET_TO_HOME':
      return { 
        ...state, 
        mode: 'home', 
        currentQuote: null, 
        tripData: null, 
        loading: false, 
        error: null 
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Custom hooks for specific actions
export function useAppActions() {
  const { dispatch } = useAppContext()

  const setMode = (mode: AppMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }

  const setQuote = (quote: TripQuote, tripData: TripRequestInput) => {
    dispatch({ type: 'SET_QUOTE', payload: { quote, tripData } })
  }

  const resetQuote = () => {
    dispatch({ type: 'RESET_QUOTE' })
  }

  const resetToHome = () => {
    dispatch({ type: 'RESET_TO_HOME' })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  return {
    setMode,
    setQuote,
    resetQuote,
    resetToHome,
    setLoading,
    setError,
  }
}