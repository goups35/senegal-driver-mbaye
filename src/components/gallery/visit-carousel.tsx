'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { galleryImages } from '@/data/gallery-images'
import { GalleryImage } from '@/types/gallery'

interface VisitCarouselProps {
  onImageClick: (image: GalleryImage) => void
}

export function VisitCarousel({ onImageClick }: VisitCarouselProps) {
  const visitImages = galleryImages.filter(img => img.category === 'visite')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get number of visible images based on screen size - changed to 3
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1 // mobile
    if (window.innerWidth < 1024) return 2 // tablet
    return 3 // desktop - changed from 4 to 3
  }

  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount())
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = visitImages.length - visibleCount
      return prevIndex <= 0 ? Math.max(0, maxIndex) : prevIndex - 1
    })
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = visitImages.length - visibleCount
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const visibleImages = visitImages.slice(currentIndex, currentIndex + visibleCount)
  const totalSlides = Math.max(0, visitImages.length - visibleCount + 1)

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Carousel Container - increased height */}
      <div className="relative h-80 sm:h-96 md:h-[32rem] lg:h-[36rem]">
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
              className="flex-1 relative overflow-hidden cursor-pointer"
              onClick={() => onImageClick(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 2}
              />

            </div>
          ))}
        </div>
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

      </div>
    </div>
  )
}