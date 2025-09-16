'use client'

import { Navbar } from '@/components/navigation/navbar'
import { TransportQuoteWrapper } from '@/components/features/transport-quote/transport-quote-wrapper'
import { useTripContext } from '@/context/trip-context'
import { useRouter } from 'next/navigation'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

export function TransportClient() {
  const router = useRouter()
  const { currentQuote, tripData, updateQuoteAndData, resetTrip } = useTripContext()

  const handleQuoteGenerated = (quote: TripQuote, data: TripRequestInput) => {
    updateQuoteAndData(quote, data)
  }

  const handleReset = () => {
    resetTrip()
  }

  const handleBackToHome = () => {
    resetTrip()
    router.push('/')
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

            <TransportQuoteWrapper
              currentQuote={currentQuote}
              tripData={tripData}
              onQuoteGenerated={handleQuoteGenerated}
              onReset={handleReset}
            />
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