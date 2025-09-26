'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/types/gallery'

interface GalleryModalProps {
  image: GalleryImage | null
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  currentIndex: number
  totalImages: number
}

export function GalleryModal({
  image,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalImages
}: GalleryModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious()
          break
        case 'ArrowRight':
          onNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose, onPrevious, onNext])

  if (!isOpen || !image) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full max-w-7xl max-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 z-10">
          <div className="text-white">
            <h3 className="text-xl font-bold">{image.title}</h3>
            <p className="text-gray-300 text-sm">
              {currentIndex + 1} sur {totalImages}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative flex items-center justify-center">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            priority
          />

          {/* Navigation Buttons */}
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full hover:bg-white/10 transition-colors"
            disabled={currentIndex === 0}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full hover:bg-white/10 transition-colors"
            disabled={currentIndex === totalImages - 1}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        {image.description && (
          <div className="mt-4 text-center">
            <p className="text-gray-300 max-w-2xl mx-auto">
              {image.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}