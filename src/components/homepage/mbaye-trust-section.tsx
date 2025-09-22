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
            {/* Mbaye photo */}
            <img
              src="/images/senegal-6.png"
              alt="Mbaye Diop - Votre chauffeur de confiance au Sénégal"
              className="w-full h-full object-cover rounded-full border-3 border-senegal-green/30"
            />
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
            Fort de plus de 10 ans d&apos;expérience dans le transport touristique, Mbaye Diop est votre guide de confiance pour découvrir les merveilles du Sénégal. Passionné par son pays et sa culture, il saura vous faire vivre une expérience authentique et mémorable, en toute sécurité et dans le respect des traditions locales.
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