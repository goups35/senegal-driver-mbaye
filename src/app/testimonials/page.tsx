import { Navbar } from '@/components/navigation/navbar'
import Link from 'next/link'

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Marie & Pierre Dubois",
      location: "Paris, France",
      date: "Mars 2024",
      rating: 5,
      text: "Mbaye a transformé notre voyage au Sénégal en une expérience magique. Sa connaissance du pays, sa gentillesse et sa disponibilité ont fait de ces 10 jours des moments inoubliables. Nous recommandons vivement !",
      trip: "Circuit 10 jours Dakar-Saint-Louis-Saly"
    },
    {
      id: 2,
      name: "James Thompson",
      location: "Londres, UK",
      date: "Janvier 2024",
      rating: 5,
      text: "Exceptional service from Mbaye! His English is perfect, and he showed us hidden gems of Senegal that we would never have discovered alone. Professional, safe, and incredibly knowledgeable.",
      trip: "Safari Niokolo-Koba + Lac Rose"
    },
    {
      id: 3,
      name: "Familia Rodriguez",
      location: "Madrid, Espagne",
      date: "Février 2024",
      rating: 5,
      text: "Mbaye s&apos;est occupé de notre famille avec 3 enfants de manière exceptionnelle. Toujours patient, attentionné et plein de bonnes idées d&apos;activités. Les enfants ont adoré !",
      trip: "Vacances familiales Saly-Toubacouta"
    },
    {
      id: 4,
      name: "Sophie Martin",
      location: "Lyon, France",
      date: "Novembre 2023",
      rating: 5,
      text: "Un voyage en solo réussi grâce à Mbaye. Je me suis sentie en sécurité tout au long du parcours. Ses explications culturelles ont enrichi chaque visite. Une belle découverte humaine !",
      trip: "Solo trip Casamance 5 jours"
    },
    {
      id: 5,
      name: "Andreas & Lisa Weber",
      location: "Berlin, Allemagne", 
      date: "Décembre 2023",
      rating: 5,
      text: "Mbaye hat unsere Reise nach Senegal perfekt organisiert. Seine Professionalität und sein Lächeln haben unseren Aufenthalt unvergesslich gemacht. Sehr zu empfehlen!",
      trip: "Circuit culturel 7 jours"
    },
    {
      id: 6,
      name: "Emma & David Johnson",
      location: "Toronto, Canada",
      date: "Octobre 2023",
      rating: 5,
      text: "We couldn&apos;t have asked for a better guide! Mbaye&apos;s passion for his country is contagious. Every day brought new surprises and authentic experiences. Thank you for this incredible journey!",
      trip: "Découverte authentique 12 jours"
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-baobab-brown mb-6">
            Témoignages clients
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez ce que nos voyageurs disent de leur expérience avec Mbaye
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-senegal-green">4.9/5</div>
              <div className="text-sm text-gray-500">Note moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-blue">150+</div>
              <div className="text-sm text-gray-500">Voyages réalisés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teranga-orange">98%</div>
              <div className="text-sm text-gray-500">Clients satisfaits</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-sahel-sand rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-baobab-brown">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <p className="text-xs text-gray-400">{testimonial.date}</p>
                  </div>
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                {/* Trip type */}
                <div className="mb-4">
                  <span className="text-xs bg-sahel-sand text-baobab-brown px-3 py-1 rounded-full">
                    {testimonial.trip}
                  </span>
                </div>

                {/* Testimonial text */}
                <blockquote className="text-gray-700 text-sm leading-relaxed italic">
                  &quot;{testimonial.text}&quot;
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Laisser un avis */}
        <div className="text-center mt-16 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto border border-blue-200">
            <h3 className="text-2xl font-bold text-baobab-brown mb-4">
              Vous avez voyagé avec Mbaye ?
            </h3>
            <p className="text-gray-600 mb-6">
              Partagez votre expérience et aidez d&apos;autres voyageurs
            </p>
            <a
              href="mailto:legoupil.alexandre@gmail.com?subject=Mon%20avis%20sur%20Transport%20Sénégal%20-%20Voyage%20avec%20Mbaye&body=Bonjour%2C%0A%0AJe%20souhaite%20partager%20mon%20expérience%20de%20voyage%20avec%20Mbaye%20:%0A%0A%F0%9F%93%85%20Dates%20du%20voyage%20:%20%0A%F0%9F%9A%97%20Type%20de%20voyage%20:%20%0A%E2%AD%90%20Note%20sur%205%20:%20%0A%F0%9F%93%9D%20Mon%20témoignage%20:%0A%0A%0A%0ACordialement%2C%0A[Votre%20nom]%0A[Votre%20ville%2C%20pays]"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              ✨ Laisser mon avis
            </a>
            <p className="text-xs text-gray-500 mt-3">
              Votre avis sera vérifié avant publication
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-sahel-sand/20 to-teranga-orange/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-baobab-brown mb-4">
              Rejoignez nos voyageurs heureux
            </h3>
            <p className="text-gray-600 mb-6">
              Planifiez votre voyage sur-mesure au Sénégal avec Mbaye
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-senegal-green text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Demander un devis
              </Link>
              <Link
                href="/mbaye"
                className="border border-senegal-green text-senegal-green px-8 py-3 rounded-lg hover:bg-senegal-green hover:text-white transition-colors font-medium"
              >
                En savoir plus sur Mbaye
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}