'use client'

import { useState } from 'react'
import { TripRequestForm } from '@/components/forms/trip-request-form'
import { TripQuoteDisplay } from '@/components/forms/trip-quote-display'
import { TravelChat } from '@/components/chat/travel-chat'
import { Navbar } from '@/components/navigation/navbar'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

type AppMode = 'home' | 'transport' | 'chat'

export function HomeClient() {
  const [mode, setMode] = useState<AppMode>('home')
  const [currentQuote, setCurrentQuote] = useState<TripQuote | null>(null)
  const [tripData, setTripData] = useState<TripRequestInput | null>(null)

  const handleQuoteGenerated = (quote: TripQuote, data: TripRequestInput) => {
    setCurrentQuote(quote)
    setTripData(data)
  }

  const resetToHome = () => {
    setMode('home')
    setCurrentQuote(null)
    setTripData(null)
  }

  const resetTransportForm = () => {
    setCurrentQuote(null)
    setTripData(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="mt-4 flex justify-center space-x-2 text-sm">
            <span className="px-3 py-1 bg-senegal-green text-white rounded-full font-medium">🏛️ Patrimoine</span>
            <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-medium">🏖️ Côtes</span>
            <span className="px-3 py-1 bg-teranga-orange text-white rounded-full font-medium">🌅 Déserts</span>
          </div>
        </header>

        <main className="space-y-8">
          {mode === 'home' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Mode Transport Direct */}
                <div 
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 cursor-pointer border border-sahel-sand group"
                  onClick={() => setMode('transport')}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      <svg className="w-16 h-16 mx-auto text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-8 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 16H7m10 0a3 3 0 003-3V9a1 1 0 00-1-1H5a1 1 0 00-1 1v4a3 3 0 003 3m10 0v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m10 0H7"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors">Transport Direct</h3>
                    <p className="text-black group-hover:text-white transition-colors text-sm">
                      Destination connue ? Obtenez votre devis de transport instantané 
                      avec Mbaye. Itinéraires optimisés, tarifs transparents.
                    </p>
                    <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                      ⚡ Devis immédiat • 🗺️ Vraies distances • 📱 Contact WhatsApp
                    </div>
                  </div>
                </div>

                {/* Mode Chat IA */}
                <div 
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 cursor-pointer border border-sahel-sand group relative overflow-hidden"
                  onClick={() => setMode('chat')}
                >
                  <div className="text-center space-y-4 relative z-10">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      <svg className="w-16 h-16 mx-auto text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors">Conseiller Voyage IA</h3>
                    <p className="text-black group-hover:text-white transition-colors text-sm">
                      Première visite ? Laissez Mbaye vous guider avec son expertise locale. 
                      Itinéraires sur-mesure selon vos goûts et votre temps.
                    </p>
                    <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                      🎯 Sur-mesure • 🇸🇳 Expert Sénégal • 💬 Conversation naturelle
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    NOUVEAU
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'transport' && (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={resetToHome}
                  className="text-primary hover:underline text-sm mb-4"
                >
                  ← Retour aux options
                </button>
              </div>
              
              {!currentQuote ? (
                <TripRequestForm 
                  onQuoteGenerated={handleQuoteGenerated} 
                />
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <button
                      onClick={resetTransportForm}
                      className="text-primary hover:underline text-sm"
                    >
                      ← Nouvelle demande
                    </button>
                  </div>
                  
                  {tripData && (
                    <TripQuoteDisplay 
                      quote={currentQuote} 
                      tripData={tripData}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'chat' && (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={resetToHome}
                  className="text-primary hover:underline text-sm mb-4"
                >
                  ← Retour aux options
                </button>
              </div>
              
              <TravelChat onTravelPlanReady={(plan) => console.log('Plan ready:', plan)} />
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <div className="max-w-md mx-auto space-y-2">
            <p>🇸🇳 Service de transport professionnel au Sénégal</p>
            <p>📱 Disponible 24h/24 • 🚗 Flotte moderne • ✨ Devis instantané</p>
            <p className="text-xs">
              Propulsé par l&apos;IA • Made with ❤️ for Sénégal
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}