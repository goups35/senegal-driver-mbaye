'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
// import { ErrorBoundary } from '@/components/common/error-boundary'

export function HomeClient() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="relative min-h-screen">
        {/* Hero Background optimisé */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: 'url(/images/senegal-1.jpg)' }}
        >
          {/* Overlay gradient renforcé pour meilleur contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"></div>
        </div>
          
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 py-16 mobile-container mobile-safe-area">
            {/* Slogan Hero */}
            <div className="text-center mb-20 pt-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg mobile-heading-1">
                Découvrez le Sénégal
              </h1>
              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium mobile-text-readable mb-8">
                Voyagez en confiance avec votre chauffeur Mbaye
              </p>

              {/* Badges de réassurance */}
              <div className="flex flex-wrap justify-center items-center gap-3 mb-12 px-4">
                {/* Badge Sécurité */}
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-sahel-sand">
                  <svg className="w-4 h-4 text-senegal-green" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-baobab-brown">Sécurisé</span>
                </div>

                {/* Badge Expert Sénégal */}
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-sahel-sand">
                  <svg className="w-4 h-4 text-ocean-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-baobab-brown">Connaissance terrain</span>
                </div>

                {/* Badge Prix transparents */}
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-sahel-sand">
                  <svg className="w-4 h-4 text-teranga-orange" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-baobab-brown">Plus de 10 ans d'expérience</span>
                </div>
              </div>
            </div>

            {/* Deux grandes sections dans le hero */}
            <div className="max-w-5xl mx-auto relative z-50">
              <div className="grid md:grid-cols-2 gap-8 mobile-grid-2">
                {/* Mode Transport Direct */}
                <button
                  className="hero-action-button bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 cursor-pointer border border-sahel-sand group relative overflow-hidden mobile-touch-safe mobile-padding-lg"
                  onClick={() => {
                    console.log('Transport button clicked');
                    router.push('/transport');
                  }}
                  type="button"
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      <svg className="w-16 h-16 mx-auto text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-8 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 16H7m10 0a3 3 0 003-3V9a1 1 0 00-1-1H5a1 1 0 00-1 1v4a3 3 0 003 3m10 0v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m10 0H7"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors mobile-heading-3">Formulaire de contact</h3>
                    <p className="text-black group-hover:text-white transition-colors text-sm">
                      Destination connue ? Obtenez votre devis de transport instantané 
                      avec Mbaye. Itinéraires optimisés, tarifs transparents.
                    </p>
                    <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                      ⚡ Devis immédiat • 🗺️ Devis 24h • 📱 Contact WhatsApp
                    </div>
                  </div>
                </button>

                {/* Mode Chat IA */}
                <button
                  className="hero-action-button bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 cursor-pointer border border-sahel-sand group relative overflow-hidden mobile-touch-safe mobile-padding-lg"
                  onClick={() => {
                    console.log('Chat button clicked');
                    router.push('/chat');
                  }}
                  type="button"
                >
                  <div className="text-center space-y-4 relative z-10">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      <svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        className="mx-auto text-black group-hover:text-white transition-colors"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="12" height="12" rx="2.5"/>
                          <path d="M9 1v2M9 17v2M1 9h2M17 9h2"/>
                          <path d="M6.5 9.5v-3M11.5 6.5v6"/>
                          <path d="M9 15c0 2.209 1.791 4 4 4h0.5c.828 0 1.5.672 1.5 1.5S14.328 22 13.5 22H13"/>
                          <path d="M18.5 13.25c-1.933 0-3.5 1.567-3.5 3.5 0 2.333 3.5 5.75 3.5 5.75s3.5-3.417 3.5-5.75c0-1.933-1.567-3.5-3.5-3.5Z"/>
                          <circle cx="18.5" cy="16.5" r="1.2"/>
                        </g>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors mobile-heading-3">Votre itinéraire personnalisé avec l&apos;IA</h3>
                    <p className="text-black group-hover:text-white transition-colors text-sm">
                      Première visite ? L&apos;assistant IA personnel de Mbaye va vous guider et vous aider à choisir vos destinations.
                    </p>
                    <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                      🎯 Sur-mesure • 🇸🇳 Expert Sénégal • 💬 Conversation naturelle
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    NOUVEAUTÉ IA
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}