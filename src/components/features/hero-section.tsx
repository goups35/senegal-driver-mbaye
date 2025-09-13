'use client'

import { useAppActions } from '@/contexts/app-context'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useSkipLinks } from '@/hooks/use-accessibility'
import { AccessibleButton } from '@/components/ui/accessible-button'

export function HeroSection() {
  const { setMode } = useAppActions()

  // Add skip links for better accessibility
  useSkipLinks([
    { target: 'main-content', text: 'Aller au contenu principal' },
    { target: 'service-options', text: 'Aller aux options de service' }
  ])

  const handleTransportClick = () => {
    setMode('transport')
  }
  
  const handleChatClick = () => {
    setMode('chat')
  }

  useKeyboardNavigation({
    onEnter: () => {
      const focused = document.activeElement
      if (focused?.getAttribute('data-action') === 'transport') {
        handleTransportClick()
      } else if (focused?.getAttribute('data-action') === 'chat') {
        handleChatClick()
      }
    }
  })

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/senegal-1.jpg)' }}
      >
        {/* Overlay gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Slogan Hero */}
        <header className="text-center mb-20 pt-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Découvrez le Sénégal
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            Voyagez en confiance avec Mbaye, chauffeur expert
          </p>
        </header>

        {/* Service Options */}
        <main id="main-content" className="max-w-5xl mx-auto">
          <div id="service-options" className="grid md:grid-cols-2 gap-8" role="group" aria-label="Options de service">
            {/* Mode Transport Direct */}
            <AccessibleButton
              onClick={handleTransportClick}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 border border-sahel-sand group text-left h-auto flex-col"
              aria-label="Accéder au formulaire de contact pour devis transport"
              data-action="transport"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl group-hover:scale-110 transition-transform" aria-hidden="true">
                  <svg className="w-16 h-16 mx-auto text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-8 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 16H7m10 0a3 3 0 003-3V9a1 1 0 00-1-1H5a1 1 0 00-1 1v4a3 3 0 003 3m10 0v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m10 0H7"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-black group-hover:text-white transition-colors">
                  Formulaire de contact
                </h2>
                <p className="text-black group-hover:text-white transition-colors text-sm">
                  Destination connue ? Obtenez votre devis de transport instantané 
                  avec Mbaye. Itinéraires optimisés, tarifs transparents.
                </p>
                <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                  ⚡ Devis immédiat • 🗺️ Devis 24h • 📱 Contact WhatsApp
                </div>
              </div>
            </AccessibleButton>

            {/* Mode Chat IA */}
            <AccessibleButton
              onClick={handleChatClick}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover-senegal transition-all duration-300 border border-sahel-sand group relative overflow-hidden text-left h-auto flex-col"
              aria-label="Accéder à l'assistant IA pour itinéraire personnalisé"
              data-action="chat"
            >
              <div className="text-center space-y-4 relative z-10">
                <div className="text-6xl group-hover:scale-110 transition-transform" aria-hidden="true">
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
                <h2 className="text-xl font-bold text-black group-hover:text-white transition-colors">
                  Votre itinéraire personnalisé avec l&apos;IA
                </h2>
                <p className="text-black group-hover:text-white transition-colors text-sm">
                  Première visite ? L&apos;assistant IA personnel de Mbaye va vous guider et vous aider à choisir vos destinations.
                </p>
                <div className="text-xs text-black group-hover:text-black bg-sahel-sand p-3 rounded-lg">
                  🎯 Sur-mesure • 🇸🇳 Expert Sénégal • 💬 Conversation naturelle
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full" aria-label="Nouvelle fonctionnalité">
                NOUVEAUTÉ IA
              </div>
            </AccessibleButton>
          </div>
        </main>
      </div>
    </div>
  )
}