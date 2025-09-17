'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatWhatsAppUrl } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TravelChatProps {
  onTravelPlanReady?: (plan: string) => void
}

export function TravelChat({ onTravelPlanReady }: TravelChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [conversationPhase, setConversationPhase] = useState('greeting')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isChatActive, setIsChatActive] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  
  // Smart Zones state
  const [scrollProgress, setScrollProgress] = useState(1)
  const [isInAutoScrollZone, setIsInAutoScrollZone] = useState(true)
  const [isManualScrollMode, setIsManualScrollMode] = useState(false)
  const [newMessageIndicator, setNewMessageIndicator] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const [lastUserScrollTime, setLastUserScrollTime] = useState(0)

  // Enhanced scroll function with Smart Zones logic
  const updateScrollMetrics = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const containerHeight = container.clientHeight
      const currentScrollTop = container.scrollTop
      const maxScrollTop = scrollHeight - containerHeight
      
      // Calculate scroll progress (0 to 1)
      const progress = maxScrollTop > 0 ? currentScrollTop / maxScrollTop : 1
      setScrollProgress(progress)
      
      // Define auto-scroll zone (bottom 20%)
      const autoScrollThreshold = 0.8
      const isInZone = progress >= autoScrollThreshold
      setIsInAutoScrollZone(isInZone)
      
      // Set manual scroll mode if user scrolled up significantly
      const isManualMode = progress < autoScrollThreshold
      setIsManualScrollMode(isManualMode)
    }
  }, [])

  // Enhanced scroll to position function
  const scrollToPosition = useCallback((targetProgress: number) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const containerHeight = container.clientHeight
      const maxScrollTop = scrollHeight - containerHeight
      const targetScrollTop = Math.max(0, targetProgress * maxScrollTop)
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
      
      // Update metrics after scroll
      setTimeout(updateScrollMetrics, 100)
    }
  }, [updateScrollMetrics])

  const scrollToBottom = useCallback((force = false, fromInputFocus = false) => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const containerHeight = container.clientHeight
      const currentScrollTop = container.scrollTop
      const maxScrollTop = scrollHeight - containerHeight
      
      // Only auto-scroll if user is near bottom or force is true
      const isNearBottom = currentScrollTop >= maxScrollTop - 100
      
      // Prevent aggressive scrolling when user focuses input unless absolutely necessary
      if (fromInputFocus && isNearBottom) {
        return
      }

      // Enhanced: Prevent scroll if user is actively scrolling
      if (hasUserScrolled && !force && (Date.now() - lastUserScrollTime) < 1000) {
        return
      }
      
      // Additional safety: don't auto-scroll if input is actively focused and user didn't explicitly request it
      if (isInputFocused && !force && !fromInputFocus) {
        return
      }
      
      if (force || isNearBottom) {
        // Use requestAnimationFrame for smooth scrolling optimization
        const smoothScroll = () => {
          container.scrollTo({
            top: maxScrollTop,
            behavior: force && !fromInputFocus ? 'auto' : 'smooth'
          })
        }
        
        // Use a slight delay to ensure DOM updates are complete
        requestAnimationFrame(() => {
          smoothScroll()
          // Update metrics after scroll with optimized timing
          setTimeout(updateScrollMetrics, force ? 50 : 150)
        })
      }
    }
  }, [isInputFocused, updateScrollMetrics, hasUserScrolled, lastUserScrollTime])

  // Enhanced scroll tracking on scroll events
  const handleScroll = useCallback((e: React.UIEvent) => {
    e.stopPropagation()
    updateScrollMetrics()

    // Track that user has manually scrolled
    if (!hasUserScrolled) {
      setHasUserScrolled(true)
    }
    setLastUserScrollTime(Date.now())
  }, [updateScrollMetrics, hasUserScrolled])

  useEffect(() => {
    // Force scroll on first load or when messages are added
    scrollToBottom(messages.length <= 1, false)
    
    // Track new messages for indicator
    if (messages.length > lastMessageCount && lastMessageCount > 0) {
      setNewMessageIndicator(true)
      // Clear indicator after animation
      setTimeout(() => setNewMessageIndicator(false), 2000)
      
      // Show scroll hint after several messages if user hasn't scrolled
      if (messages.length >= 4 && !hasUserScrolled && !showScrollHint) {
        setShowScrollHint(true)
        setTimeout(() => setShowScrollHint(false), 5000)
      }
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, scrollToBottom, hasUserScrolled, showScrollHint])

  // Initialize scroll metrics
  useEffect(() => {
    const timer = setTimeout(updateScrollMetrics, 100)
    return () => clearTimeout(timer)
  }, [updateScrollMetrics])

  // Body scroll prevention when chat is active
  useEffect(() => {
    const preventBodyScroll = () => {
      if (isChatActive) {
        document.body.classList.add('chat-active-no-scroll')
        document.documentElement.classList.add('chat-active-no-scroll')
      } else {
        document.body.classList.remove('chat-active-no-scroll')
        document.documentElement.classList.remove('chat-active-no-scroll')
      }
    }

    preventBodyScroll()
    
    return () => {
      document.body.classList.remove('chat-active-no-scroll')
      document.documentElement.classList.remove('chat-active-no-scroll')
    }
  }, [isChatActive])

  // Set chat as active when user interacts
  useEffect(() => {
    const handleChatInteraction = (e: Event) => {
      // Only activate if not clicking on input (input has its own handler)
      const target = e.target as HTMLElement
      if (!target.closest('input')) {
        setIsChatActive(true)
      }
    }

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const chatContainer = document.querySelector('.travel-chat-container')
      
      if (chatContainer && !chatContainer.contains(target)) {
        setIsChatActive(false)
        setIsInputFocused(false)
      }
    }

    // Add listeners for chat interaction
    const chatContainer = document.querySelector('.travel-chat-container')
    if (chatContainer) {
      chatContainer.addEventListener('click', handleChatInteraction)
      chatContainer.addEventListener('focus', handleChatInteraction, true)
    }

    // Add global click listener to detect clicks outside chat
    document.addEventListener('click', handleGlobalClick)

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('click', handleChatInteraction)
        chatContainer.removeEventListener('focus', handleChatInteraction, true)
      }
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  // Mobile detection and viewport handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    const handleResize = () => {
      checkMobile()
      // Handle mobile browser address bar hide/show
      if (window.innerWidth < 768) {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }
    
    checkMobile()
    handleResize()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  useEffect(() => {
    // Message d'accueil personnalisé avec la nouvelle stratégie
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: '🇸🇳 Bonjour ! Je suis Maxime, votre conseiller voyage spécialisé Sénégal.\n\nJe vais vous aider à créer un voyage personnalisé jour par jour, parfaitement adapté à vos envies !\n\nCommencez par me parler de votre projet : qu&apos;est-ce qui vous attire dans l&apos;idée de découvrir le Sénégal ? 😊',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [messages.length])

  const handleSendMessage = async (messageText?: string, isAutoStart = false) => {
    const message = messageText || inputMessage.trim()
    if (!message && !isAutoStart) return

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    if (!isAutoStart) {
      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          conversationHistory: isAutoStart ? [] : messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la réponse')
      }

      const data = await response.json()
      
      setIsDemo(data.isDemo || false)
      
      // Mettre à jour la phase de conversation
      if (data.conversationState?.phase) {
        setConversationPhase(data.conversationState.phase)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      if (isAutoStart) {
        setMessages([assistantMessage])
      } else {
        setMessages(prev => [...prev, assistantMessage])
      }

      // Vérifier si nous sommes arrivés au récapitulatif final
      if (data.response.includes('RÉCAPITULATIF PERSONNALISÉ') || 
          data.conversationState?.phase === 'summary' ||
          data.response.includes('Jour 1:') && data.response.includes('Jour 2:')) {
        setShowWhatsAppButton(true)
        onTravelPlanReady?.(data.response)
      }

    } catch (error) {
      console.error('Erreur chat:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Pouvez-vous réessayer ?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleWhatsAppExport = () => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      const travelPlan = `🇸🇳 MON VOYAGE AU SÉNÉGAL - Programme personnalisé

${lastMessage.content}

---
Généré via Transport Sénégal - Votre conseiller voyage`

      const whatsappUrl = formatWhatsAppUrl(
        process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '+33626388794', 
        travelPlan
      )
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`w-full travel-chat-container ${isMobile ? 'h-full' : 'max-w-4xl mx-auto'}`}>
      <Card className={`w-full flex flex-col ${
        isMobile 
          ? 'h-full mobile-chat-container border-0 rounded-none' 
          : 'max-w-4xl mx-auto h-[600px] md:h-[700px] lg:h-[600px]'
      }`}>
      <CardHeader className="flex-shrink-0 mobile-padding-md">
        <CardTitle className="flex items-center gap-2 flex-wrap mobile-heading-2">
          Maxime, votre conseiller voyage Sénégal
          {isDemo && (
            <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              DÉMO
            </span>
          )}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
            {conversationPhase === 'greeting' && '👋 Accueil'}
            {conversationPhase === 'discovery' && '🔍 Découverte'}
            {conversationPhase === 'planning' && '🗺️ Planification'}
            {conversationPhase === 'refinement' && '✨ Affinement'}
            {conversationPhase === 'summary' && '🎉 Récapitulatif'}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mobile-helper-text">
          Création d&apos;un voyage personnalisé jour par jour - Phase {conversationPhase === 'greeting' ? '1' : conversationPhase === 'discovery' ? '2' : conversationPhase === 'planning' ? '3' : conversationPhase === 'refinement' ? '4' : '5'}/5
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden card-content-relative">
        {/* Smart Zones: Visual scroll indicator */}
        <div 
          className="smart-scroll-indicator" 
          style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const y = e.clientY - rect.top
            const progress = Math.max(0, Math.min(1, y / rect.height))
            scrollToPosition(progress)
          }}
        >
          <div className="scroll-progress-bar"></div>
          {newMessageIndicator && (
            <div className="scroll-indicator-bounce"></div>
          )}
          {showScrollHint && (
            <div className="scroll-hint-tooltip">
              Scroll to explore
            </div>
          )}
        </div>

        {/* Zone des messages avec Smart Zones */}
        <div 
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded mobile-chat-messages chat-messages-container smart-zones-container ${
            isInAutoScrollZone ? 'in-auto-scroll-zone' : ''
          }`}
          onScroll={handleScroll}
          onTouchStart={() => {
            // Activate chat when user touches message area
            setIsChatActive(true)
          }}
          onFocus={() => {
            // Activate chat when focused
            setIsChatActive(true)
          }}
          tabIndex={0}
          role="log"
          aria-live="polite"
          aria-label="Messages de conversation"
        >
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            const isNewMessage = isLastMessage && newMessageIndicator
            
            return (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } ${isNewMessage ? 'new-message-highlight' : ''}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-white border border-border mr-4'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            )
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-border p-3 rounded-lg mr-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie avec Smart Zones overlay */}
        <div className={`flex-shrink-0 space-y-3 mobile-chat-input smart-input-zone mobile-form-actions ${
          isManualScrollMode ? 'manual-scroll-overlay' : ''
        }`}>
          {isManualScrollMode && (
            <div className="manual-scroll-indicator">
              <span className="manual-scroll-text">Scroll down to resume auto-updates</span>
              <button 
                className="scroll-to-bottom-btn mobile-touch-safe"
                onClick={() => scrollToBottom(true)}
                aria-label="Scroll to bottom"
              >
                ↓
              </button>
            </div>
          )}
          {showWhatsAppButton && (
            <div className="text-center">
              <Button
                onClick={handleWhatsAppExport}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 mobile-form-button mobile-touch-safe"
                size="lg"
              >
                💬 Envoyer le programme via WhatsApp
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 mobile-input-group">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                setIsChatActive(true)
                setIsInputFocused(true)
                // Only scroll if user is significantly above the bottom to avoid unwanted jumps
                if (messagesContainerRef.current) {
                  const container = messagesContainerRef.current
                  const scrollHeight = container.scrollHeight
                  const containerHeight = container.clientHeight
                  const currentScrollTop = container.scrollTop
                  const maxScrollTop = scrollHeight - containerHeight
                  const isSignificantlyAbove = currentScrollTop < maxScrollTop - 200

                  if (isSignificantlyAbove) {
                    // Use a shorter delay and gentler scroll for input focus
                    setTimeout(() => scrollToBottom(false, true), 50)
                  }
                }
              }}
              onBlur={() => {
                setIsInputFocused(false)
              }}
              onClick={(e) => {
                // Prevent any unwanted scroll behavior when clicking input
                e.stopPropagation()
                setIsChatActive(true)
                setIsInputFocused(true)
              }}
              type="text"
              inputMode="text"
              placeholder="Décrivez vos envies de voyage au Sénégal..."
              disabled={isLoading}
              className="flex-1 mobile-form-input mobile-touch-safe"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="mobile-form-button mobile-touch-safe"
            >
              Envoyer
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap mobile-button-group-horizontal">
            {conversationPhase === 'greeting' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('J\'aimerais découvrir la culture sénégalaise pendant une semaine')}
                  disabled={isLoading}
                >
                  🎨 Culture & traditions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Je rêve de plages paradisiaques et de nature pour 10 jours')}
                  disabled={isLoading}
                >
                  🏖️ Plages & nature
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Je veux tout voir en 2 semaines : culture, plages et aventure')}
                  disabled={isLoading}
                >
                  🌍 Découverte complète
                </Button>
              </>
            )}
            
            {(conversationPhase === 'refinement' || conversationPhase === 'summary') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage('Parfait, je valide cet itinéraire !')}
                disabled={isLoading}
              >
                ✅ Valider l&apos;itinéraire
              </Button>
            )}
            
            {showWhatsAppButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppExport}
                disabled={isLoading}
                className="bg-green-50 border-green-300 hover:bg-green-100"
              >
                📱 Copier pour WhatsApp
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}