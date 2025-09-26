'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navigation/navbar'
import { VisitCarousel } from '@/components/gallery/visit-carousel'
import { DestinationGallery } from '@/components/gallery/destination-gallery'
import { GalleryModal } from '@/components/gallery/gallery-modal'
import { Footer } from '@/components/footer/footer'
import { galleryImages } from '@/data/gallery-images'
import { GalleryImage } from '@/types/gallery'

export default function GalleriePage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = (image: GalleryImage) => {
    // Calculate actual index in the full gallery
    const allImages = galleryImages
    const actualIndex = allImages.findIndex(img => img.id === image.id)

    setSelectedImage(image)
    setSelectedIndex(actualIndex)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : galleryImages.length - 1
    setSelectedIndex(newIndex)
    setSelectedImage(galleryImages[newIndex])
  }

  const handleNext = () => {
    const newIndex = selectedIndex < galleryImages.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedImage(galleryImages[newIndex])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-senegal-green/5 via-white to-teranga-orange/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-senegal-green mb-4">
            Galerie Photos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez le Sénégal à travers les yeux de Mbaye : visites exceptionnelles,
            paysages magnifiques et moments inoubliables partagés avec nos voyageurs.
          </p>
        </div>

        {/* Bandeau défilant des visites */}
        <section className="mb-12">
          <VisitCarousel onImageClick={handleImageClick} />
        </section>

        {/* Galerie des destinations */}
        <section>
          <DestinationGallery />
        </section>
      </div>

      <Footer />

      {/* Modal partagé */}
      <GalleryModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentIndex={selectedIndex}
        totalImages={galleryImages.length}
      />
    </div>
  )
}

