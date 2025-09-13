'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  className?: string
}

export default function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const goToPrevious = useCallback(() => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setSelectedIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          width={800}
          height={600}
          className="object-cover w-full h-96"
          priority
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Image précédente"
            >
              ←
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Image suivante"
            >
              →
            </button>
          </>
        )}
      </div>

      {images[selectedIndex].caption && (
        <p className="text-center text-gray-600 mt-2">
          {images[selectedIndex].caption}
        </p>
      )}

      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}