'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { formatWhatsAppUrl } from '@/lib/utils'
import { PlanningCard } from '@/components/planning/planning-card'
import { useChat } from '@/hooks/use-chat'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatQuickActions } from './chat-quick-actions'
import { useScreenReader } from '@/hooks/use-accessibility'

interface TravelChatProps {
  onTravelPlanReady?: (plan: string) => void
}

const WELCOME_MESSAGE = `Bonjour, je suis ravi de vous aider à planifier votre voyage. 2 choix s'offrent à vous :

1. cliquer sur un des boutons pour pré-sélectionner un type de voyage.

2. Ecrivez directement la durée du voyage, les endroits que vous souhaitez visiter et je vous ferai une proposition de voyage à revoir ensemble !`

export function TravelChat({ onTravelPlanReady }: TravelChatProps) {
  const { announce } = useScreenReader()
  
  const {
    messages,
    isLoading,
    isDemo,
    showWhatsAppButton,
    validatedPlanning,
    messagesEndRef,
    sendMessage,
    resetValidatedPlanning,
  } = useChat({ 
    onTravelPlanReady,
    welcomeMessage: WELCOME_MESSAGE
  })

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
      announce('Ouverture de WhatsApp pour envoyer votre programme de voyage', 'polite')
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
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />

          <div className="flex-shrink-0 space-y-3">
            {showWhatsAppButton && (
              <div className="text-center">
                <AccessibleButton
                  onClick={handleWhatsAppExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  size="lg"
                  aria-label="Envoyer le programme de voyage via WhatsApp"
                >
                  💬 Envoyer le programme via WhatsApp
                </AccessibleButton>
              </div>
            )}
            
            <ChatInput 
              onSendMessage={sendMessage}
              isLoading={isLoading}
              placeholder="Décrivez vos envies de voyage au Sénégal..."
            />
            
            <ChatQuickActions
              onSendMessage={sendMessage}
              onWhatsAppExport={handleWhatsAppExport}
              isLoading={isLoading}
              showWhatsAppButton={showWhatsAppButton}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Encart récapitulatif du planning validé */}
      {validatedPlanning && (
        <PlanningCard
          title={validatedPlanning.title}
          destinations={validatedPlanning.destinations}
          duration={validatedPlanning.duration}
          budget={validatedPlanning.budget}
          groupSize={validatedPlanning.groupSize}
          itineraryData={validatedPlanning.itineraryData}
          savedItinerary={validatedPlanning.savedItinerary}
          onWhatsAppSend={(message) => {
            const whatsappUrl = formatWhatsAppUrl('+33626388794', message)
            window.open(whatsappUrl, '_blank')
            announce('Ouverture de WhatsApp pour envoyer les détails du voyage', 'polite')
          }}
          onModify={resetValidatedPlanning}
        />
      )}
    </div>
  )
}