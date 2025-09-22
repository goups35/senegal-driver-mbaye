'use client'

import { useRouter } from 'next/navigation'

interface IAAssistantSectionProps {
  className?: string;
}

export function IAAssistantSection({ className = "" }: IAAssistantSectionProps) {
  const router = useRouter()

  return (
    <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl border border-sahel-sand/30 mobile-touch-safe transition-shadow duration-300 ${className}`}>
      {/* Mobile-first layout: stack vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {/* Image Section - Left side on desktop, top on mobile */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto md:mx-0">
            {/* Placeholder image with AI/chat icon */}
            <div className="w-full h-full bg-gradient-to-br from-senegal-green/20 via-ocean-blue/20 to-teranga-orange/20 rounded-2xl flex items-center justify-center border-2 border-senegal-green/30">
              {/* AI Assistant Icon */}
              <svg
                className="w-12 h-12 md:w-16 md:h-16 text-senegal-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Section - Right side on desktop, bottom on mobile */}
        <div className="flex-1 text-center md:text-left">
          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold text-baobab-brown mb-2 mobile-heading-2">
            Besoin de recommendations voyage ?
          </h2>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-baobab-brown/80 mb-4 leading-relaxed mobile-text-readable">
            Notre assistant IA vous aide à planifier votre voyage parfait au Sénégal
          </p>

          {/* CTA Button */}
          <button
            onClick={() => {
              console.log('IA Assistant CTA clicked');
              router.push('/chat');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-senegal-green to-ocean-blue hover:from-senegal-green/90 hover:to-ocean-blue/90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 mobile-touch-safe"
            style={{
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
            type="button"
            aria-label="Planifier votre voyage avec l'assistant IA"
          >
            {/* Chat Icon */}
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Planifier</span>
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
  )
}