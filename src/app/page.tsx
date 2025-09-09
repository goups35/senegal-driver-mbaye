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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Bandeau démo */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6 text-center">
          <p className="text-sm">
            🚀 <strong>Version Démo</strong> - Données simulées réalistes pour le Sénégal (pas d&apos;IA payante requise)
          </p>
        </div>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            🚗 Transport Sénégal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Service de transport premium avec devis automatique et itinéraires optimisés. 
            Réservez facilement votre trajet partout au Sénégal.
          </p>
        </header>

        <main className="space-y-8">
          {mode === 'home' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Mode Transport Direct */}
                <div 
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => setMode('transport')}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🚗</div>
                    <h3 className="text-xl font-bold text-primary">Transport Direct</h3>
                    <p className="text-muted-foreground text-sm">
                      Vous savez où aller ? Obtenez instantanément un devis de transport 
                      avec itinéraire détaillé et réservez via WhatsApp.
                    </p>
                    <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
                      ⚡ Devis en 30 secondes • 💰 Prix transparents • 📱 Réservation WhatsApp
                    </div>
                  </div>
                </div>

                {/* Mode Chat IA */}
                <div 
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 relative overflow-hidden"
                  onClick={() => setMode('chat')}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🤖</div>
                    <h3 className="text-xl font-bold text-primary">Conseiller Voyage IA</h3>
                    <p className="text-muted-foreground text-sm">
                      Pas d&apos;idée précise ? Discutez avec notre IA experte qui vous aidera 
                      à planifier votre découverte personnalisée du Sénégal.
                    </p>
                    <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
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
