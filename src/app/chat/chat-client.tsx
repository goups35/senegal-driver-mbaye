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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={handleBackToHome}
                className="text-primary hover:underline text-sm mb-4"
              >
                ← Retour aux options
              </button>
            </div>

            <TravelPlannerWrapper onTravelPlanReady={handleTravelPlanReady} />
          </div>
        </div>
      </div>

      {/* Footer cohérent avec l'existant */}
      <footer className="bg-white mt-16 text-center text-sm text-muted-foreground py-8">
        <div className="max-w-md mx-auto space-y-2">
          <p>🇸🇳 Service de transport professionnel au Sénégal</p>
          <p>📱 Disponible 24h/24 • 🚗 Flotte moderne • ✨ Devis instantané</p>
          <p className="text-xs">
            Propulsé par l&apos;IA • Made with ❤️ for Sénégal
          </p>
        </div>
      </footer>
    </div>
  )
}