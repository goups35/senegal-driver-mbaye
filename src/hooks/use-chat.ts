'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  isDemo: boolean
  showWhatsAppButton: boolean
  validatedPlanning: Record<string, unknown> | null
}

export interface UseChatOptions {
  onTravelPlanReady?: (plan: string) => void
  welcomeMessage?: string
}

export function useChat({ onTravelPlanReady, welcomeMessage }: UseChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isDemo: false,
    showWhatsAppButton: false,
    validatedPlanning: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [state.messages, scrollToBottom])

  // Initialize with welcome message
  useEffect(() => {
    if (state.messages.length === 0 && welcomeMessage) {
      const welcome: Message = {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }
      setState(prev => ({ ...prev, messages: [welcome] }))
    }
  }, [state.messages.length, welcomeMessage])

  const sendMessage = useCallback(async (messageText: string, isAutoStart = false) => {
    if (!messageText.trim() && !isAutoStart) return

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    if (!isAutoStart) {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/ai-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: isAutoStart ? [] : state.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            metadata: {}
          })),
          context: 'initial_inquiry'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la réponse')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || data.response,
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        isDemo: data.isDemo || false,
        messages: isAutoStart ? [assistantMessage] : [...prev.messages, assistantMessage],
        isLoading: false
      }))

      // Handle validated planning
      if (data.savedItinerary) {
        const destinations = data.recommendation?.itinerary?.destinations || []
        const mainDestinations = destinations.slice(0, 3).map((d: Record<string, unknown>) => ({
          id: d.id,
          name: d.name,
          region: d.region
        }))
        
        const duration = data.extractedInfo?.dates?.duration || data.recommendation?.itinerary?.duration || 7
        const budget = data.recommendation?.itinerary?.totalCost ? 
          `${data.recommendation.itinerary.totalCost.min?.toLocaleString()} - ${data.recommendation.itinerary.totalCost.max?.toLocaleString()} ${data.recommendation.itinerary.totalCost.currency}` : 
          'Sur mesure'
        const groupSize = data.extractedInfo?.groupInfo?.size || 1

        setState(prev => ({
          ...prev,
          validatedPlanning: {
            title: data.savedItinerary.title,
            destinations: mainDestinations,
            duration: parseInt(duration.toString()),
            budget,
            groupSize,
            itineraryData: data.recommendation,
            savedItinerary: data.savedItinerary
          },
          showWhatsAppButton: true
        }))
        
        onTravelPlanReady?.(data.message)
      }
      // Check if plan is ready
      else if ((data.message || data.response)?.includes('RÉCAPITULATIF PERSONNALISÉ') || 
          (data.message || data.response)?.includes('VOTRE VOYAGE') ||
          (data.message || data.response)?.includes('Envoyer via WhatsApp')) {
        setState(prev => ({ ...prev, showWhatsAppButton: true }))
        onTravelPlanReady?.(data.message || data.response)
      }

    } catch (error) {
      console.error('Erreur chat:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Pouvez-vous réessayer ?',
        timestamp: new Date()
      }
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }))
    }
  }, [state.messages, onTravelPlanReady])

  const resetValidatedPlanning = useCallback(() => {
    setState(prev => ({
      ...prev,
      validatedPlanning: null,
      showWhatsAppButton: false
    }))
  }, [])

  return {
    ...state,
    messagesEndRef,
    sendMessage,
    resetValidatedPlanning,
    scrollToBottom,
  }
}