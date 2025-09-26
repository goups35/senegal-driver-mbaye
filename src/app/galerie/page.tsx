import Gallery from '@/components/gallery/gallery'

export default function GalleriePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-senegal-green/5 via-white to-teranga-orange/5">
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

        {/* Gallery Component */}
        <Gallery />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Galerie Photos - Découvrez le Sénégal avec Mbaye',
  description: 'Explorez notre galerie de photos : visites, excursions et paysages du Sénégal. Découvrez les merveilles que vous pourrez visiter avec notre guide Mbaye.',
}