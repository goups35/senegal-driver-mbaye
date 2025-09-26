'use client'

import { useState, useMemo } from 'react'
import { GalleryFilters } from './gallery-filters'
import { GalleryGrid } from './gallery-grid'
import { GalleryModal } from './gallery-modal'
import { galleryImages, galleryCategories } from '@/data/gallery-images'
import { GalleryImage } from '@/types/gallery'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter images based on active category
  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') {
      return galleryImages
    }
    return galleryImages.filter(image => image.category === activeCategory)
  }, [activeCategory])

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
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredImages.length - 1
    setSelectedIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  const handleNext = () => {
    const newIndex = selectedIndex < filteredImages.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  return (
    <div>
      {/* Filters */}
      <GalleryFilters
        categories={galleryCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Results count */}
      <div className="text-center mb-6">
        <p className="text-gray-600">
          {filteredImages.length} photo{filteredImages.length > 1 ? 's' : ''}
          {activeCategory !== 'all' && (
            <span className="text-senegal-green font-medium">
              {' '}dans la catégorie &ldquo;{galleryCategories.find(c => c.id === activeCategory)?.name}&rdquo;
            </span>
          )}
        </p>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
        <GalleryGrid
          images={filteredImages}
          onImageClick={handleImageClick}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Aucune photo trouvée dans cette catégorie</p>
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
        totalImages={filteredImages.length}
      />
    </div>
  )
}