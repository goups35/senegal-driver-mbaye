'use client'

import { useAppActions } from '@/contexts/app-context'
import { TravelPlannerWrapper } from '@/components/features/travel-planner/travel-planner-wrapper'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { useKeyboardNavigation, useFocusManagement } from '@/hooks/use-keyboard-navigation'
import { useEffect } from 'react'

export function ChatSection() {
  const { resetToHome } = useAppActions()
  const { focusFirstFocusable } = useFocusManagement()

  // Focus management when section loads
  useEffect(() => {
    focusFirstFocusable()
  }, [focusFirstFocusable])

  useKeyboardNavigation({
    onEscape: resetToHome,
  })

  const handleTravelPlanReady = (plan: any) => {
    console.log('Plan ready:', plan)
    // You could extend this to navigate to a plan review page
  }

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
                Assistant IA pour votre voyage
              </h1>
              <p className="text-muted-foreground">
                Discutez avec l&apos;expert virtuel de Mbaye pour planifier votre itinéraire parfait
              </p>
            </div>
          </header>
          
          <main>
            <TravelPlannerWrapper onTravelPlanReady={handleTravelPlanReady} />
          </main>
        </div>
      </div>
    </div>
  )
}