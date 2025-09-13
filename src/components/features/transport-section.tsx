'use client'

import { useAppActions } from '@/contexts/app-context'
import { useTripManagement } from '@/hooks/use-trip-management'
import { TransportQuoteWrapper } from '@/components/features/transport-quote/transport-quote-wrapper'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { useKeyboardNavigation, useFocusManagement } from '@/hooks/use-keyboard-navigation'
import { useEffect } from 'react'

export function TransportSection() {
  const { resetToHome } = useAppActions()
  const { 
    currentQuote, 
    tripData, 
    handleQuoteGenerated, 
    handleResetQuote 
  } = useTripManagement()
  const { focusFirstFocusable } = useFocusManagement()

  // Focus management when section loads
  useEffect(() => {
    focusFirstFocusable()
  }, [focusFirstFocusable])

  useKeyboardNavigation({
    onEscape: resetToHome,
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <header className="text-center">
            <AccessibleButton
              onClick={resetToHome}
              variant="ghost"
              size="sm"
              className="text-primary hover:underline mb-4"
              aria-label="Retourner à la page d'accueil"
            >
              ← Retour aux options
            </AccessibleButton>
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Demande de devis transport
              </h1>
              <p className="text-muted-foreground">
                Remplissez le formulaire ci-dessous pour obtenir votre devis personnalisé
              </p>
            </div>
          </header>
          
          <main>
            <TransportQuoteWrapper
              currentQuote={currentQuote}
              tripData={tripData}
              onQuoteGenerated={handleQuoteGenerated}
              onReset={handleResetQuote}
            />
          </main>
        </div>
      </div>
    </div>
  )
}