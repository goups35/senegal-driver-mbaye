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
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [conversationPhase, setConversationPhase] = useState('greeting')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isChatActive, setIsChatActive] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  
  // Phase 2: Simplified scroll state for mobile optimization
  const [scrollProgress, setScrollProgress] = useState(1)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [newMessageIndicator, setNewMessageIndicator] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Phase 3: Enhanced mobile interactions
  const [isPullToRefresh, setIsPullToRefresh] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [swipeGestureActive, setSwipeGestureActive] = useState(false)
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(false)
  const pullThreshold = 80
  const swipeThreshold = 100

  // Phase 2: Optimized scroll metrics with mobile focus
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

      // Mobile-optimized threshold - larger area for mobile touch
      const nearBottomThreshold = isMobile ? 100 : 50
      const nearBottom = (maxScrollTop - currentScrollTop) <= nearBottomThreshold
      setIsNearBottom(nearBottom)

      // Show scroll to bottom button when significantly away from bottom
      const showButton = !nearBottom && progress < 0.8
      setShowScrollToBottom(showButton)
    }
  }, [isMobile])

  // Phase 2: Simplified scroll to position for mobile performance
  const scrollToPosition = useCallback((targetProgress: number) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const containerHeight = container.clientHeight
      const maxScrollTop = scrollHeight - containerHeight
      const targetScrollTop = Math.max(0, targetProgress * maxScrollTop)

      // Use instant scroll on mobile for better performance
      container.scrollTo({
        top: targetScrollTop,
        behavior: isMobile ? 'auto' : 'smooth'
      })

      // Debounced metrics update
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(updateScrollMetrics, isMobile ? 50 : 100)
    }
  }, [updateScrollMetrics, isMobile])

  // Phase 2: Mobile-optimized scroll to bottom with keyboard awareness
  const scrollToBottom = useCallback((force = false, fromKeyboard = false) => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current
      const scrollHeight = container.scrollHeight
      const containerHeight = container.clientHeight
      const maxScrollTop = scrollHeight - containerHeight

      // Mobile keyboard adjustment - add extra space when keyboard is visible
      const keyboardOffset = keyboardVisible && isMobile ? 20 : 0
      const targetScroll = Math.max(0, maxScrollTop + keyboardOffset)

      // Prevent scroll during active user scrolling (unless forced)
      if (isUserScrolling && !force && !fromKeyboard) {
        return
      }

      // Mobile-optimized conditions
      const shouldScroll = force || isNearBottom || fromKeyboard

      if (shouldScroll) {
        // Use instant scroll on mobile for better performance
        const scrollBehavior = (isMobile && !force) ? 'auto' : 'smooth'

        container.scrollTo({
          top: targetScroll,
          behavior: scrollBehavior
        })

        // Debounced metrics update
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(updateScrollMetrics, 50)
      }
    }
  }, [isNearBottom, isUserScrolling, keyboardVisible, isMobile, updateScrollMetrics])

  // Phase 2: Optimized scroll tracking with debouncing for mobile performance
  const handleScroll = useCallback(() => {
    // Set user scrolling state immediately for responsiveness
    setIsUserScrolling(true)

    // Debounce expensive scroll calculations
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      updateScrollMetrics()
      setIsUserScrolling(false)
    }, isMobile ? 100 : 50)
  }, [updateScrollMetrics, isMobile])

  // Phase 2: Simplified message scroll handling
  useEffect(() => {
    // Always scroll to bottom on new messages for better mobile UX
    if (messages.length > lastMessageCount) {
      if (messages.length <= 1) {
        // Force scroll on first message
        scrollToBottom(true)
      } else {
        // Auto-scroll for new messages if near bottom
        scrollToBottom(false)
      }

      // New message indicator
      if (lastMessageCount > 0) {
        setNewMessageIndicator(true)
        setTimeout(() => setNewMessageIndicator(false), 1500)
      }
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, scrollToBottom])

  // Phase 3: Haptic feedback detection
  useEffect(() => {
    // Check if device supports haptic feedback
    if ('vibrate' in navigator || 'hapticFeedback' in navigator) {
      setHapticFeedbackEnabled(true)
    }
  }, [])


  // Phase 3: Enhanced haptic feedback helper
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedbackEnabled) return

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      }
      navigator.vibrate(patterns[type])
    }
  }, [hapticFeedbackEnabled])

  // Phase 3: Pull-to-refresh functionality
  const handlePullToRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    triggerHapticFeedback('medium')

    try {
      // Simulate refresh with a brief delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Scroll to top and show first message
      scrollToPosition(0)

      // Show success feedback
      triggerHapticFeedback('light')
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
      setIsPullToRefresh(false)
      setPullDistance(0)
    }
  }, [isRefreshing, scrollToPosition, triggerHapticFeedback])

  // Phase 3: Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setSwipeGestureActive(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!messagesContainerRef.current) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - touchStartY
    const container = messagesContainerRef.current
    const isAtTop = container.scrollTop === 0

    // Pull-to-refresh logic
    if (isAtTop && deltaY > 0 && !isPullToRefresh) {
      setIsPullToRefresh(true)
      const distance = Math.min(deltaY * 0.5, pullThreshold * 1.5)
      setPullDistance(distance)

      // Haptic feedback at threshold
      if (distance >= pullThreshold && pullDistance < pullThreshold) {
        triggerHapticFeedback('medium')
      }
    }

    // Swipe gesture detection
    const absDeltaY = Math.abs(deltaY)
    if (absDeltaY > swipeThreshold && !swipeGestureActive) {
      setSwipeGestureActive(true)

      if (deltaY > 0) {
        // Swipe down - scroll to top
        scrollToPosition(0)
      } else {
        // Swipe up - scroll to bottom
        scrollToPosition(1)
      }

      triggerHapticFeedback('light')
    }
  }, [touchStartY, isPullToRefresh, pullDistance, pullThreshold, swipeGestureActive, scrollToPosition, triggerHapticFeedback])

  const handleTouchEnd = useCallback(() => {
    if (isPullToRefresh && pullDistance >= pullThreshold) {
      handlePullToRefresh()
    } else {
      setIsPullToRefresh(false)
      setPullDistance(0)
    }
    setSwipeGestureActive(false)
  }, [isPullToRefresh, pullDistance, pullThreshold, handlePullToRefresh])

  // Phase 2: Mobile keyboard detection and scroll initialization
  useEffect(() => {
    // Initialize scroll metrics
    const timer = setTimeout(updateScrollMetrics, 100)

    // Mobile keyboard detection
    const handleResize = () => {
      if (isMobile) {
        const currentHeight = window.innerHeight
        const initialHeight = window.screen.height
        const heightDifference = initialHeight - currentHeight

        // Detect keyboard (threshold of 150px for mobile keyboards)
        const keyboardIsVisible = heightDifference > 150
        setKeyboardVisible(keyboardIsVisible)

        // Scroll to bottom when keyboard appears if input is focused
        if (keyboardIsVisible && isInputFocused) {
          setTimeout(() => scrollToBottom(false, true), 150)
        }
      }
    }

    // Listen for resize events to detect keyboard
    if (isMobile) {
      window.addEventListener('resize', handleResize)
      // Also listen for visual viewport changes on modern browsers
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize)
      }
    }

    return () => {
      clearTimeout(timer)
      if (isMobile) {
        window.removeEventListener('resize', handleResize)
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleResize)
        }
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [updateScrollMetrics, isMobile, isInputFocused, scrollToBottom])

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

  const handleSendMessage = useCallback(async (messageText?: string, isAutoStart = false) => {
    const message = messageText || inputMessage.trim()
    if (!message && !isAutoStart) return

    // Phase 3: Enhanced loading with haptic feedback
    triggerHapticFeedback('light')

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
  }, [inputMessage, sessionId, messages, onTravelPlanReady, triggerHapticFeedback])

  const handleWhatsAppExport = () => {
    triggerHapticFeedback('medium')

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
        <CardTitle className="mobile-heading-2">
          Conseiller voyage Sénégal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden card-content-relative">
        {/* Phase 2: Simplified scroll indicator for mobile performance */}
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
        </div>

        {/* Phase 3: Pull-to-refresh indicator */}
        {isPullToRefresh && (
          <div
            className="pull-to-refresh-indicator"
            style={{
              transform: `translateY(${Math.min(pullDistance, pullThreshold)}px)`,
              opacity: Math.min(pullDistance / pullThreshold, 1)
            }}
          >
            <div className="pull-to-refresh-content">
              {isRefreshing ? (
                <div className="refresh-spinner">🔄</div>
              ) : pullDistance >= pullThreshold ? (
                <div className="refresh-ready">↗️ Relâchez pour actualiser</div>
              ) : (
                <div className="refresh-hint">⬇️ Tirez pour actualiser</div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Enhanced messages area with gesture support */}
        <div
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded mobile-chat-messages chat-messages-container smart-zones-container ${
            isNearBottom ? 'in-auto-scroll-zone' : ''
          } enhanced-mobile-interactions`}
          onScroll={handleScroll}
          onTouchStart={(e) => {
            setIsChatActive(true)
            handleTouchStart(e)
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onFocus={() => {
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
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted mr-4'
                  }`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-muted mr-4">
                <div className="text-muted-foreground">
                  Maxime réfléchit...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Phase 3: Enhanced input zone with quick replies and advanced interactions */}
        <div className={`flex-shrink-0 space-y-3 mobile-chat-input smart-input-zone mobile-form-actions enhanced-input-zone ${
          keyboardVisible ? 'keyboard-active' : ''
        }`}>
          {showScrollToBottom && (
            <div className="scroll-to-bottom-indicator">
              <button
                className="scroll-to-bottom-btn mobile-touch-safe"
                onClick={() => scrollToBottom(true)}
                aria-label="Scroll to latest messages"
              >
                ↓ New messages
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
                // Mobile-optimized keyboard handling - gentle scroll only if far from bottom
                if (isMobile && !isNearBottom) {
                  setTimeout(() => scrollToBottom(false, true), 300)
                }
              }}
              onBlur={() => {
                setIsInputFocused(false)
              }}
              onClick={(e) => {
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
          

          {/* Enhanced WhatsApp button */}
          {showWhatsAppButton && (
            <div className="enhanced-whatsapp-section">
              <Button
                onClick={handleWhatsAppExport}
                className="enhanced-whatsapp-button mobile-touch-safe"
                size="lg"
              >
                <span className="whatsapp-icon">💬</span>
                <span className="whatsapp-text">Envoyer via WhatsApp</span>
                <span className="whatsapp-arrow">→</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}