'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { galleryImages } from '@/data/gallery-images'

export function CombinedSocialSection() {
  const visitImages = galleryImages.filter(img => img.category === 'visite').slice(0, 4)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll pour le mini-carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visitImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [visitImages.length])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + visitImages.length) % visitImages.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visitImages.length)
  }

  return (
    <section className="bg-gradient-to-br from-sahel-sand/10 via-white to-senegal-green/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Titre principal de la section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-senegal-green mb-4">
              Découvrez & Suivez-nous
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez nos plus belles découvertes et suivez nos aventures quotidiennes
            </p>
          </div>

          {/* Grille 2 colonnes */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">

            {/* Partie Galerie Photos */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-senegal-green mb-2">
                  Nos plus belles découvertes
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez le Sénégal à travers nos yeux
                </p>

                {/* Mini-carrousel */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-6" style={{ height: '250px' }}>
                  {visitImages.length > 0 && (
                    <>
                      <Image
                        src={visitImages[currentIndex].src}
                        alt={visitImages[currentIndex].alt}
                        fill
                        className="object-cover transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />

                      {/* Navigation */}
                      <button
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-senegal-green p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Image précédente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-senegal-green p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Image suivante"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Indicateurs */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {visitImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentIndex ? 'bg-white scale-125' : 'bg-white/60'
                            }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                          />
                        ))}
                      </div>

                      {/* Overlay avec titre */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="absolute bottom-16 left-4 right-4">
                          <h4 className="text-white font-bold text-lg">
                            {visitImages[currentIndex].title}
                          </h4>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href="/galerie"
                  className="block w-full bg-gradient-to-r from-senegal-green to-green-600 text-white text-center py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Voir toute la galerie
                  <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Partie Instagram */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-senegal-green mb-2">
                  Suivez nos aventures
                </h3>
                <p className="text-gray-600 mb-6">
                  Retrouvez-nous sur Instagram pour plus de moments
                </p>

                {/* Widget Instagram */}
                <div className="text-center">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink="https://www.instagram.com/mb_tours_/"
                    data-instgrm-version="14"
                    style={{
                      background: '#FFF',
                      border: '0',
                      borderRadius: '3px',
                      boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                      margin: '1px',
                      maxWidth: '540px',
                      minWidth: '326px',
                      padding: '0',
                      width: '99.375%'
                    }}
                  >
                    <div style={{ padding: '16px' }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          backgroundColor: '#F4F4F4',
                          borderRadius: '50%',
                          height: '40px',
                          marginRight: '14px',
                          width: '40px'
                        }}></div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: '1',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            backgroundColor: '#F4F4F4',
                            borderRadius: '4px',
                            height: '14px',
                            marginBottom: '6px',
                            width: '100px'
                          }}></div>
                          <div style={{
                            backgroundColor: '#F4F4F4',
                            borderRadius: '4px',
                            height: '14px',
                            width: '60px'
                          }}></div>
                        </div>
                      </div>
                      <div style={{ padding: '19% 0' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <a
                          href="https://www.instagram.com/mb_tours_/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          Voir sur Instagram
                          <svg className="inline-block w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </blockquote>
                </div>

                {/* Script Instagram - Chargé de manière asynchrone */}
                <script
                  async
                  src="//www.instagram.com/embed.js"
                  onLoad={() => {
                    // @ts-ignore
                    if (window.instgrm) {
                      // @ts-ignore
                      window.instgrm.Embeds.process()
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}