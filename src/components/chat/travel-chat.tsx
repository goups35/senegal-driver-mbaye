'use client'

import React, { useState, useRef, useEffect } from 'react'
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

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
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 flex-wrap">
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
        <p className="text-sm text-muted-foreground">
          Création d&apos;un voyage personnalisé jour par jour - Phase {conversationPhase === 'greeting' ? '1' : conversationPhase === 'discovery' ? '2' : conversationPhase === 'planning' ? '3' : conversationPhase === 'refinement' ? '4' : '5'}/5
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
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
          ))}
          
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

        {/* Zone de saisie */}
        <div className="flex-shrink-0 space-y-3">
          {showWhatsAppButton && (
            <div className="text-center">
              <Button
                onClick={handleWhatsAppExport}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                size="lg"
              >
                💬 Envoyer le programme via WhatsApp
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Décrivez vos envies de voyage au Sénégal..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={isLoading || !inputMessage.trim()}
            >
              Envoyer
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
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
  )
}