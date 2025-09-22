'use client'

import { useRouter } from 'next/navigation'

interface MbayeTrustSectionProps {
  className?: string;
}

export function MbayeTrustSection({ className = "" }: MbayeTrustSectionProps) {
  const router = useRouter()

  return (
    <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl border border-sahel-sand/30 mobile-touch-safe transition-shadow duration-300 ${className}`}>
      {/* Mobile-first layout: stack vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {/* Image Section - Left side on desktop, top on mobile */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0">
            {/* Placeholder image with Mbaye photo - circular design */}
            <div className="w-full h-full bg-gradient-to-br from-senegal-green/20 via-ocean-blue/20 to-teranga-orange/20 rounded-full flex items-center justify-center border-3 border-senegal-green/30 overflow-hidden">
              {/* Driver/Person Icon as placeholder */}
              <svg
                className="w-16 h-16 md:w-20 md:h-20 text-senegal-green"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section - Right side on desktop, bottom on mobile */}
        <div className="flex-1 text-center md:text-left">
          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold text-baobab-brown mb-3 mobile-heading-2">
            Votre chauffeur de confiance au Sénégal
          </h2>

          {/* Description narrative */}
          <p className="text-sm md:text-base text-baobab-brown/90 mb-6 leading-relaxed mobile-text-readable">
            Fort de plus de 10 ans d&apos;expérience dans le transport touristique, Mbaye est votre guide de confiance pour découvrir les merveilles du Sénégal. Passionné par son pays et sa culture, il saura vous faire vivre une expérience authentique et mémorable, en toute sécurité et dans le respect des traditions locales.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => {
                console.log('Rencontrer Mbaye CTA clicked');
                router.push('/mbaye');
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teranga-orange to-senegal-green hover:from-teranga-orange/90 hover:to-senegal-green/90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 mobile-touch-safe"
              style={{
                minHeight: '44px',
                touchAction: 'manipulation',
              }}
              type="button"
              aria-label="Rencontrer Mbaye - En savoir plus sur votre chauffeur"
            >
              {/* Person/Meet Icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Rencontrer Mbaye</span>
              {/* Arrow Icon */}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}