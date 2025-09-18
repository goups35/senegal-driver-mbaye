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

              {/* Badges de réassurance - Consolidated backdrop-blur */}
              <div className="flex flex-wrap justify-center items-center gap-3 mb-12 px-4">
                <div className="flex flex-wrap justify-center items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border border-sahel-sand">
                  {/* Badge Sécurité */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-senegal-green" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-baobab-brown">Sécurisé</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-4 bg-sahel-sand"></div>

                  {/* Badge Expert Sénégal */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-ocean-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-baobab-brown">Connaissance terrain</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-4 bg-sahel-sand"></div>

                  {/* Badge Prix transparents */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teranga-orange" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-baobab-brown">Plus de 10 ans d&apos;expérience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs modernes et optimisés */}
            <div className="max-w-4xl mx-auto relative z-50">
              <div className="grid md:grid-cols-2 gap-6 px-4">
                {/* CTA Planifier mon voyage - Design glass-morphism */}
                <button
                  className="hero-action-button group relative overflow-hidden text-white hover:text-white bg-black/60 hover:bg-black/70 backdrop-blur-sm border border-white/80 hover:border-white/90 rounded-2xl shadow-md hover:shadow-xl transition-[background-color,border-color,box-shadow,transform] duration-300 cursor-pointer mobile-touch-safe"
                  style={{
                    padding: '20px 24px',
                    minHeight: '72px',
                    touchAction: 'manipulation',
                    '--high-contrast-bg': '#000000',
                    '--high-contrast-border': '#ffffff',
                    '--high-contrast-text': '#ffffff'
                  } as React.CSSProperties & { [key: string]: string }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.willChange = 'background-color, border-color, box-shadow, transform'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.willChange = 'auto'
                  }}
                  onClick={() => {
                    console.log('Chat button clicked');
                    router.push('/chat');
                  }}
                  type="button"
                  aria-label="Planifier mon voyage avec l'IA"
                >
                  <div className="relative text-center">
                    <h3 className="text-xl md:text-2xl font-bold transition-colors duration-300">
                      Planifier mon voyage
                    </h3>
                  </div>
                </button>

                {/* CTA Parler à Mbaye */}
                <button
                  className="hero-action-button group relative overflow-hidden bg-gradient-to-br from-teranga-orange via-teranga-orange to-orange-500 hover:from-senegal-green hover:via-senegal-green hover:to-green-600 border-2 border-teranga-orange hover:border-senegal-green rounded-2xl shadow-md hover:shadow-xl transition-[background,border-color,box-shadow,transform] duration-300 cursor-pointer mobile-touch-safe"
                  style={{
                    padding: '20px 24px',
                    minHeight: '72px',
                    touchAction: 'manipulation'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.willChange = 'background, border-color, box-shadow, transform'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.willChange = 'auto'
                  }}
                  onClick={() => {
                    console.log('Transport button clicked');
                    router.push('/transport');
                  }}
                  type="button"
                  aria-label="Contacter Mbaye pour le transport"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                  <div className="relative text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white transition-all duration-300">
                      Contacter Mbaye
                    </h3>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
    </div>
  )
}