'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/types/gallery'

interface GalleryGridProps {
  images: GalleryImage[]
  onImageClick: (image: GalleryImage, index: number) => void
}

export function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="group relative aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer bg-gray-100"
          onClick={() => onImageClick(image, index)}
        >
          {/* Loading placeholder */}
          {!loadedImages.has(image.id) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
              <div className="w-8 h-8 border-4 border-senegal-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Image */}
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className={`
              object-cover transition-all duration-500 group-hover:scale-110
              ${loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'}
            `}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onLoad={() => handleImageLoad(image.id)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                {image.title}
              </h3>
              {image.description && (
                <p className="text-white/90 text-xs line-clamp-2">
                  {image.description}
                </p>
              )}
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${image.category === 'visite'
                ? 'bg-teranga-orange text-white'
                : 'bg-senegal-green text-white'
              }
            `}>
              {image.category === 'visite' ? 'Visite' : 'Destination'}
            </span>
          </div>

          {/* Featured Badge */}
          {image.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                ⭐ Coup de cœur
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}