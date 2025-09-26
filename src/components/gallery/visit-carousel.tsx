'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { galleryImages } from '@/data/gallery-images'
import { GalleryImage } from '@/types/gallery'

export function VisitCarousel() {
  const visitImages = galleryImages.filter(img => img.category === 'visite')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Get number of visible images based on screen size
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth < 640) return 1 // mobile
    if (window.innerWidth < 1024) return 2 // tablet
    return 4 // desktop
  }

  const [visibleCount, setVisibleCount] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount())
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = visitImages.length - visibleCount
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, visitImages.length, visibleCount])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => {
      const maxIndex = visitImages.length - visibleCount
      return prevIndex <= 0 ? Math.max(0, maxIndex) : prevIndex - 1
    })
    // Resume auto-play after 8 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => {
      const maxIndex = visitImages.length - visibleCount
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
    // Resume auto-play after 8 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
    // Resume auto-play after 8 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const visibleImages = visitImages.slice(currentIndex, currentIndex + visibleCount)
  const totalSlides = Math.max(0, visitImages.length - visibleCount + 1)

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Carousel Container */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px]">
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-senegal-green p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Image précédente"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-senegal-green p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Image suivante"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Images Grid */}
        <div className="flex h-full">
          {visibleImages.map((image, index) => (
            <div
              key={`${image.id}-${currentIndex}-${index}`}
              className="flex-1 relative group overflow-hidden cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index < 2}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-1">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-white/90 text-xs sm:text-sm line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <span className="bg-teranga-orange text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Visite
                </span>
              </div>

              {/* Featured Badge */}
              {image.featured && (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    ⭐ Coup de cœur
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Auto-play indicator */}
        {isAutoPlaying && (
          <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2">
            <div className="bg-black/60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center space-x-2 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teranga-orange rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Défilement automatique</span>
              <span className="sm:hidden">Auto</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicators */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-center items-center space-x-2 sm:space-x-3">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-senegal-green scale-110 sm:scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller à la vue ${index + 1}`}
            />
          ))}
        </div>

        {/* Image counter */}
        <div className="text-center mt-2">
          <p className="text-gray-600 text-xs sm:text-sm">
            {currentIndex + 1} - {Math.min(currentIndex + visibleCount, visitImages.length)} sur {visitImages.length} visites
          </p>
        </div>
      </div>
    </div>
  )
}