'use client'

import { useRouter } from 'next/navigation'

interface TestimonialSectionProps {
  className?: string;
}

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
}

export function TestimonialSection({ className = "" }: TestimonialSectionProps) {
  const router = useRouter()

  // Sample testimonial data - this could be made props or fetched from API in the future
  const testimonial: Testimonial = {
    name: "MaximeS",
    location: "Paris, France",
    rating: 5,
    comment: "Nous avons voyagé une semaine avec Mbaye à trois. Plus qu'un chauffeur, il a traduit, évité les problèmes, orienté. Il connaît bien le pays, reste professionnel et s'adapte. Il a de l'humour et est attentionné. Je le recommande vivement.",
    avatar: "/images/testimonial-avatar-placeholder.jpg" // Placeholder for future integration
  }

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-teranga-orange' : 'text-sahel-sand'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl border border-sahel-sand/30 mobile-touch-safe transition-shadow duration-300 ${className}`}>
      {/* Section Header */}
      <div className="text-center md:text-left mb-6">
        <h2 className="text-lg md:text-xl font-bold text-baobab-brown mb-2 mobile-heading-2">
          Ce que disent nos voyageurs
        </h2>
      </div>

      {/* Testimonial Card */}
      <div className="space-y-6">
        {/* Quote and Rating */}
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex items-center justify-center md:justify-start gap-1">
            {renderStars(testimonial.rating)}
            <span className="ml-2 text-sm font-medium text-baobab-brown">
              {testimonial.rating}/5
            </span>
          </div>

          {/* Quote */}
          <blockquote className="relative">
            {/* Quote Icon */}
            <div className="absolute -top-2 -left-1 text-senegal-green/30">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
              </svg>
            </div>

            <p className="text-sm md:text-base text-baobab-brown/90 leading-relaxed italic pl-6 mobile-text-readable">
              &ldquo;{testimonial.comment}&rdquo;
            </p>
          </blockquote>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-sahel-sand/50">
          {/* Customer Details */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-baobab-brown text-sm md:text-base">
              {testimonial.name}
            </h4>
          </div>

          {/* Verified Badge */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-senegal-green bg-senegal-green/10 px-2 py-1 rounded-lg">
              {/* Checkmark Icon */}
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Vérifié</span>
              <span className="sm:hidden">✓</span>
            </div>
          </div>
        </div>

        {/* CTA Button "Voir plus" - Positioned at bottom right */}
        <div className="mt-6 flex justify-center md:justify-end">
          <button
            onClick={() => {
              console.log('Voir plus testimonials clicked');
              router.push('/testimonials');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-blue to-senegal-green hover:from-ocean-blue/90 hover:to-senegal-green/90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 mobile-touch-safe"
            style={{
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
            type="button"
            aria-label="Voir plus de témoignages de voyageurs"
          >
            {/* Eye Icon */}
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>Voir plus</span>
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