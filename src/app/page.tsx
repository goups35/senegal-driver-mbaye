'use client'

import { useState } from 'react'
import { TripRequestForm } from '@/components/forms/trip-request-form'
import { TripQuoteDisplay } from '@/components/forms/trip-quote-display'
import { TravelChat } from '@/components/chat/travel-chat'
import { Button } from '@/components/ui/button'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

type AppMode = 'home' | 'transport' | 'chat'

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-sahel-sand">
      <div className="container mx-auto px-4 py-8">
        {/* Bandeau démo avec thème Sénégal */}
        <div className="sahel-gradient border border-teranga-orange text-baobab-brown px-4 py-3 rounded-xl mb-6 text-center shadow-lg">
          <p className="text-sm font-medium">
            🇸🇳 <strong>Bienvenue au Sénégal</strong> - Service de transport premium avec Mbaye, votre chauffeur local
          </p>
        </div>

        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-senegal-green via-ocean-blue to-teranga-orange bg-clip-text text-transparent mb-4">
            🚗 Transport Sénégal
          </h1>
          <p className="text-lg text-baobab-brown max-w-2xl mx-auto font-medium">
            Découvrez le Sénégal avec Mbaye, votre chauffeur-guide expérimenté. 
            Transport sûr, itinéraires authentiques, tarifs transparents.
          </p>
          <div className="mt-4 flex justify-center space-x-2 text-sm">
            <span className="px-3 py-1 bg-senegal-green text-white rounded-full">🏛️ Patrimoine</span>
            <span className="px-3 py-1 bg-ocean-blue text-white rounded-full">🏖️ Côtes</span>
            <span className="px-3 py-1 bg-teranga-orange text-white rounded-full">🌅 Déserts</span>
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
                    <div className="text-6xl group-hover:scale-110 transition-transform">🚗</div>
                    <h3 className="text-xl font-bold text-senegal-green">Transport Direct</h3>
                    <p className="text-baobab-brown text-sm">
                      Destination connue ? Obtenez votre devis de transport instantané 
                      avec Mbaye. Itinéraires optimisés, tarifs transparents.
                    </p>
                    <div className="text-xs text-baobab-brown bg-sahel-sand p-3 rounded-lg">
                      ⚡ Devis immédiat • 🗺️ Vraies distances • 📱 Contact WhatsApp
                    </div>
                  </div>
                </div>

                {/* Mode Chat IA */}
                <div 
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 cursor-pointer border border-sahel-sand group relative overflow-hidden"
                  onClick={() => setMode('chat')}
                >
                  <div className="absolute top-2 right-2 senegal-gradient w-16 h-16 rounded-full opacity-20"></div>
                  <div className="text-center space-y-4 relative z-10">
                    <div className="text-6xl group-hover:scale-110 transition-transform">🧭</div>
                    <h3 className="text-xl font-bold text-ocean-blue">Conseiller Voyage IA</h3>
                    <p className="text-baobab-brown text-sm">
                      Première visite ? Laissez Mbaye vous guider avec son expertise locale. 
                      Itinéraires sur-mesure selon vos goûts et votre temps.
                    </p>
                    <div className="text-xs text-baobab-brown bg-sahel-sand p-3 rounded-lg">
                      🎯 Sur-mesure • 🇸🇳 Expert Sénégal • 💬 Conversation naturelle
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    ✨ NOUVEAU
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  🇸🇳 <strong>Transport Sénégal</strong> - Votre partenaire voyage de confiance
                </p>
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
