'use client'

import { Navbar } from '@/components/navigation/navbar'
import { TravelPlannerWrapper } from '@/components/features/travel-planner/travel-planner-wrapper'
import { useRouter } from 'next/navigation'

export function ChatClient() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleTravelPlanReady = (plan: string) => {
    console.log('Plan ready:', plan)
    // TODO: Implement travel plan handling logic
  }

  return (
    <div className="min-h-screen bg-white mobile-container mobile-safe-area">
      <Navbar />

      <div className="bg-white mobile-chat-container">
        <div className="container mx-auto px-4 py-8 mobile-padding-md">
          <div className="space-y-6 mobile-chat-content">
            <div className="text-center mobile-navigation-area">
              <button
                onClick={handleBackToHome}
                className="text-primary hover:underline text-sm mb-4 mobile-touch-safe mobile-back-button p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
              >
                ← Retour aux options
              </button>
            </div>

            <TravelPlannerWrapper onTravelPlanReady={handleTravelPlanReady} />
          </div>
        </div>
      </div>

      {/* Footer cohérent avec l'existant */}
      <footer className="bg-white mt-16 text-center text-sm text-muted-foreground py-8 mobile-footer">
        <div className="max-w-md mx-auto space-y-2 mobile-footer-content mobile-padding-sm">
          <p className="mobile-text-readable">🇸🇳 Service de transport professionnel au Sénégal</p>
          <p className="mobile-text-readable">📱 Disponible 24h/24 • 🚗 Flotte moderne • ✨ Devis instantané</p>
          <p className="text-xs mobile-text-small">
            Propulsé par l&apos;IA • Made with ❤️ for Sénégal
          </p>
        </div>
      </footer>
    </div>
  )
}