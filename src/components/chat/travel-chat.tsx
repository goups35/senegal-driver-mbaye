'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatWhatsAppUrl } from '@/lib/utils'
import { PlanningCard } from '@/components/planning/planning-card'

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
  const [validatedPlanning, setValidatedPlanning] = useState<Record<string, unknown> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Message d'accueil automatique personnalisé
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Bonjour, je suis ravi de vous aider à planifier votre voyage. 2 choix s&apos;offrent à vous :\n\n1. cliquer sur un des boutons pour pré-sélectionner un type de voyage.\n\n2. Ecrivez directement la durée du voyage, les endroits que vous souhaitez visiter et je vous ferai une proposition de voyage à revoir ensemble !',
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
      const response = await fetch('/api/ai-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: isAutoStart ? [] : messages.map(msg => ({
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
      
      setIsDemo(data.isDemo || false)

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || data.response,
        timestamp: new Date()
      }

      if (isAutoStart) {
        setMessages([assistantMessage])
      } else {
        setMessages(prev => [...prev, assistantMessage])
      }

      // Vérifier si un planning a été validé et sauvegardé
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

        setValidatedPlanning({
          title: data.savedItinerary.title,
          destinations: mainDestinations,
          duration: parseInt(duration.toString()),
          budget,
          groupSize,
          itineraryData: data.recommendation,
          savedItinerary: data.savedItinerary
        })
        setShowWhatsAppButton(true)
        onTravelPlanReady?.(data.message)
      }

      // Vérifier si l'IA indique que le plan est prêt (contient "GO" ou des mots-clés finaux)
      else if ((data.message || data.response)?.includes('RÉCAPITULATIF PERSONNALISÉ') || 
          (data.message || data.response)?.includes('VOTRE VOYAGE') ||
          (data.message || data.response)?.includes('Envoyer via WhatsApp')) {
        setShowWhatsAppButton(true)
        onTravelPlanReady?.(data.message || data.response)
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            Maxime, l&apos;assistant IA de Mbaye
            {isDemo && (
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                DÉMO
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Discutez avec notre expert IA pour planifier votre voyage sur-mesure au Sénégal
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('Une semaine, budget moyen, j\'aime la culture et les plages')}
              disabled={isLoading}
            >
              💡 1 semaine culture + plages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppExport}
              disabled={isLoading || !showWhatsAppButton}
            >
              ✅ Valider le programme
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('je souhaite découvrir le plus possible le Sénégal en 1 semaine')}
              disabled={isLoading}
            >
              🌍 1 semaine roots
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('je souhaite organiser moi-même ma semaine, j\'ai déjà en tête les endroits à visiter')}
              disabled={isLoading}
            >
              🎯 1 semaine Guy
            </Button>
          </div>
        </div>
      </CardContent>
      </Card>
      
      {/* Encart récapitulatif du planning validé */}
      {validatedPlanning && (
        <PlanningCard
          title={validatedPlanning.title as string}
          destinations={validatedPlanning.destinations as { id: string; name: string; region: string }[]}
          duration={validatedPlanning.duration as number}
          budget={validatedPlanning.budget as string}
          groupSize={validatedPlanning.groupSize as number}
          itineraryData={validatedPlanning.itineraryData as { itinerary?: { destinations?: Array<Record<string, unknown>> } }}
          savedItinerary={validatedPlanning.savedItinerary as { id: string; title: string; whatsappMessage: string; planningUrl: string }}
          onWhatsAppSend={(message) => {
            const whatsappUrl = formatWhatsAppUrl('+33626388794', message)
            window.open(whatsappUrl, '_blank')
          }}
          onModify={() => {
            setValidatedPlanning(null)
            setShowWhatsAppButton(false)
          }}
        />
      )}
    </div>
  )
}