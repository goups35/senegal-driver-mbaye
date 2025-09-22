import { Navbar } from '@/components/navigation/navbar'
import Link from 'next/link'
import Image from 'next/image'

export default function MbayePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-baobab-brown mb-6">
              Découvrez Mbaye
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Votre chauffeur Mbaye - chauffeur expérimenté au Sénégal
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Photo */}
            <div className="text-center">
              <div className="relative w-80 h-80 mx-auto">
                <Image
                  src="/images/mbaye-photo.jpeg"
                  alt="Mbaye Diop - Chauffeur guide professionnel au Sénégal"
                  fill
                  className="object-cover rounded-2xl shadow-lg border border-sahel-sand"
                  priority
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-baobab-brown mb-4">
                  Mbaye Diop
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Fort de plus de 10 ans d&apos;expérience dans le transport touristique, 
                    Mbaye est votre chauffeur de confiance pour découvrir les merveilles du Sénégal.
                  </p>
                  <p>
                    Passionné par son pays et sa culture, il saura vous faire vivre une 
                    expérience authentique et mémorable, en toute sécurité et dans le respect 
                    des traditions locales.
                  </p>
                  <p>
                    Avec Mbaye, chaque voyage devient une aventure humaine riche en découvertes 
                    et en rencontres authentiques.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Points forts */}
          <div className="bg-gradient-to-r from-sahel-sand/20 to-teranga-orange/20 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-baobab-brown text-center mb-8">
              Ses points forts
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-senegal-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-baobab-brown mb-2">Plus de 10 ans d&apos;expérience</h4>
                  <p className="text-gray-600 text-sm">
                    Une expertise approfondie du tourisme sénégalais et des routes du pays
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-ocean-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12l7 10H3l7-10z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-baobab-brown mb-2">Bilingue (FR/Wolof)</h4>
                  <p className="text-gray-600 text-sm">
                    Communication fluide en français et wolof
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-teranga-orange rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-baobab-brown mb-2">Licence de tourisme officielle</h4>
                  <p className="text-gray-600 text-sm">
                    Autorisations légales et assurances complètes pour votre tranquillité
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-senegal-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-baobab-brown mb-2">Passion authentique</h4>
                  <p className="text-gray-600 text-sm">
                    Un amour sincère pour le Sénégal qu&apos;il partage avec chaque voyageur
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white p-8 rounded-2xl border border-sahel-sand">
            <h3 className="text-2xl font-bold text-baobab-brown mb-4">
              Prêt pour l&apos;aventure ?
            </h3>
            <p className="text-gray-600 mb-6">
              Découvrez le Sénégal avec Mbaye et vivez une expérience inoubliable
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-senegal-green text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Demander un devis
              </Link>
              <Link
                href="/testimonials"
                className="border border-senegal-green text-senegal-green px-8 py-3 rounded-lg hover:bg-senegal-green hover:text-white transition-colors font-medium"
              >
                Voir les témoignages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}