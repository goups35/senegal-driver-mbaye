import { Navbar } from '@/components/navigation/navbar'
import { VisitCarousel } from '@/components/gallery/visit-carousel'
import { DestinationGallery } from '@/components/gallery/destination-gallery'
import { Footer } from '@/components/footer/footer'

export default function Galerie2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-senegal-green/5 via-white to-teranga-orange/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-senegal-green mb-4">
            Découvrez le Sénégal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez nos visites exceptionnelles et les plus beaux paysages du Sénégal
            à travers les yeux de Mbaye, votre guide passionné.
          </p>
        </div>

        {/* Bandeau défilant des visites */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-senegal-green mb-4">
              Nos Visites & Excursions
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Découvrez nos expériences guidées authentiques avec Mbaye
            </p>
          </div>
          <VisitCarousel />
        </section>

        {/* Galerie des destinations */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-senegal-green mb-4">
              Destinations & Paysages
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Les merveilles naturelles et culturelles que vous découvrirez
            </p>
          </div>
          <DestinationGallery />
        </section>
      </div>

      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Galerie Alternative - Découvrez le Sénégal avec Mbaye',
  description: 'Explorez nos visites guidées et les plus beaux paysages du Sénégal. Bandeau défilant de nos excursions et galerie complète des destinations.',
}