'use client'

import { useState } from 'react'
import { GalleryGrid } from './gallery-grid'
import { GalleryModal } from './gallery-modal'
import { galleryImages } from '@/data/gallery-images'
import { GalleryImage } from '@/types/gallery'

export function DestinationGallery() {
  const destinationImages = galleryImages.filter(img => img.category === 'destination')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = (image: GalleryImage, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : destinationImages.length - 1
    setSelectedIndex(newIndex)
    setSelectedImage(destinationImages[newIndex])
  }

  const handleNext = () => {
    const newIndex = selectedIndex < destinationImages.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedImage(destinationImages[newIndex])
  }

  return (
    <div>
      {/* Results count */}
      <div className="text-center mb-8">
        <p className="text-gray-600">
          De merveilleuses destinations à découvrir
        </p>
      </div>

      {/* Gallery Grid */}
      {destinationImages.length > 0 ? (
        <GalleryGrid
          images={destinationImages}
          onImageClick={handleImageClick}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Aucune destination disponible</p>
        </div>
      )}

      {/* Modal */}
      <GalleryModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentIndex={selectedIndex}
        totalImages={destinationImages.length}
      />
    </div>
  )
}