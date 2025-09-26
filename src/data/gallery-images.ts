import { GalleryImage, GalleryCategory } from '@/types/gallery'

// Photos de visite en première position (comme demandé)
const visiteImages: GalleryImage[] = [
  {
    id: 'visite-1',
    src: '/images/gallerie-photos/visite-1.jpeg',
    alt: 'Visite guidée avec Mbaye - Découverte culturelle',
    title: 'Découverte culturelle',
    category: 'visite',
    description: 'Une expérience authentique de la culture sénégalaise',
    featured: true
  },
  {
    id: 'visite-2',
    src: '/images/gallerie-photos/visite-2.jpeg',
    alt: 'Excursion touristique - Sites historiques',
    title: 'Sites historiques',
    category: 'visite',
    description: 'Exploration des sites historiques emblématiques'
  },
  {
    id: 'visite-3',
    src: '/images/gallerie-photos/visite-3.jpeg',
    alt: 'Visite guidée - Patrimoine local',
    title: 'Patrimoine local',
    category: 'visite',
    description: 'Découverte du riche patrimoine sénégalais'
  },
  {
    id: 'visite-4',
    src: '/images/gallerie-photos/visite-4.jpeg',
    alt: 'Excursion culturelle - Traditions',
    title: 'Traditions sénégalaises',
    category: 'visite',
    description: 'Immersion dans les traditions locales'
  },
  {
    id: 'visite-5',
    src: '/images/gallerie-photos/visite-5.jpeg',
    alt: 'Visite guidée - Architecture locale',
    title: 'Architecture locale',
    category: 'visite',
    description: 'Architecture traditionnelle et moderne'
  },
  {
    id: 'visite-6',
    src: '/images/gallerie-photos/visite-6.jpeg',
    alt: 'Découverte touristique - Marchés locaux',
    title: 'Marchés locaux',
    category: 'visite',
    description: 'Exploration des marchés authentiques'
  },
  {
    id: 'visite-7',
    src: '/images/gallerie-photos/visite-7.jpeg',
    alt: 'Excursion guidée - Artisanat local',
    title: 'Artisanat local',
    category: 'visite',
    description: 'Rencontre avec les artisans locaux'
  },
  {
    id: 'visite-8',
    src: '/images/gallerie-photos/visite-8.jpeg',
    alt: 'Visite culturelle - Rencontres locales',
    title: 'Rencontres locales',
    category: 'visite',
    description: 'Échanges authentiques avec les habitants'
  },
  {
    id: 'visite-9',
    src: '/images/gallerie-photos/visite-9.jpeg',
    alt: 'Excursion touristique - Lieux emblématiques',
    title: 'Lieux emblématiques',
    category: 'visite',
    description: 'Visite des lieux incontournables'
  },
  {
    id: 'visite-10',
    src: '/images/gallerie-photos/visite-10.jpeg',
    alt: 'Découverte guidée - Paysages urbains',
    title: 'Paysages urbains',
    category: 'visite',
    description: 'Découverte des villes sénégalaises'
  },
  {
    id: 'visite-11',
    src: '/images/gallerie-photos/visite-11.jpeg',
    alt: 'Visite touristique - Expérience complète',
    title: 'Expérience complète',
    category: 'visite',
    description: 'Une journée complète de découvertes'
  }
]

// Photos de destinations en second
const destinationImages: GalleryImage[] = [
  {
    id: 'dest-1',
    src: '/images/gallerie-photos/1.jpeg',
    alt: 'Paysage sénégalais - Destination naturelle',
    title: 'Beauté naturelle',
    category: 'destination',
    description: 'Les merveilles naturelles du Sénégal'
  },
  {
    id: 'dest-2',
    src: '/images/gallerie-photos/2.jpeg',
    alt: 'Destination touristique - Sites remarquables',
    title: 'Sites remarquables',
    category: 'destination',
    description: 'Lieux d\'exception à découvrir'
  },
  {
    id: 'dest-3',
    src: '/images/gallerie-photos/3.jpeg',
    alt: 'Paysage sénégalais - Diversité géographique',
    title: 'Diversité géographique',
    category: 'destination',
    description: 'La richesse des paysages sénégalais'
  },
  {
    id: 'dest-4',
    src: '/images/gallerie-photos/4.jpeg',
    alt: 'Destination nature - Écosystèmes variés',
    title: 'Écosystèmes variés',
    category: 'destination',
    description: 'Biodiversité exceptionnelle'
  },
  {
    id: 'dest-5',
    src: '/images/gallerie-photos/5.jpeg',
    alt: 'Lieu touristique - Panoramas spectaculaires',
    title: 'Panoramas spectaculaires',
    category: 'destination',
    description: 'Vues imprenables sur le territoire'
  },
  {
    id: 'dest-6',
    src: '/images/gallerie-photos/6.jpeg',
    alt: 'Destination sénégalaise - Côtes atlantiques',
    title: 'Côtes atlantiques',
    category: 'destination',
    description: 'Littoral sénégalais magnifique'
  },
  {
    id: 'dest-7',
    src: '/images/gallerie-photos/7.jpeg',
    alt: 'Paysage naturel - Savane sénégalaise',
    title: 'Savane sénégalaise',
    category: 'destination',
    description: 'L\'authenticité de la savane'
  },
  {
    id: 'dest-8',
    src: '/images/gallerie-photos/8.jpeg',
    alt: 'Destination culturelle - Villages traditionnels',
    title: 'Villages traditionnels',
    category: 'destination',
    description: 'Authenticité des villages ruraux'
  },
  {
    id: 'dest-9',
    src: '/images/gallerie-photos/9.jpeg',
    alt: 'Site touristique - Merveilles cachées',
    title: 'Merveilles cachées',
    category: 'destination',
    description: 'Trésors méconnus à explorer'
  },
  {
    id: 'dest-10',
    src: '/images/gallerie-photos/10.jpeg',
    alt: 'Destination unique - Caractère sénégalais',
    title: 'Caractère sénégalais',
    category: 'destination',
    description: 'L\'âme du Sénégal authentique'
  },
  {
    id: 'dest-11',
    src: '/images/gallerie-photos/11.jpeg',
    alt: 'Paysage emblématique - Identité sénégalaise',
    title: 'Identité sénégalaise',
    category: 'destination',
    description: 'Symboles du pays de la Teranga'
  },
  {
    id: 'dest-12',
    src: '/images/gallerie-photos/12.jpeg',
    alt: 'Destination privilégiée - Expériences uniques',
    title: 'Expériences uniques',
    category: 'destination',
    description: 'Moments inoubliables garantis'
  },
  {
    id: 'dest-13',
    src: '/images/gallerie-photos/13.jpeg',
    alt: 'Site exceptionnel - Magie sénégalaise',
    title: 'Magie sénégalaise',
    category: 'destination',
    description: 'La beauté envoûtante du Sénégal'
  }
]

// Export avec photos visite en première position
export const galleryImages: GalleryImage[] = [
  ...visiteImages,
  ...destinationImages
]

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'all',
    name: 'Toutes les photos',
    description: 'Découvrez toute notre galerie',
    count: galleryImages.length
  },
  {
    id: 'visite',
    name: 'Visites & Excursions',
    description: 'Expériences guidées avec Mbaye',
    count: visiteImages.length
  },
  {
    id: 'destination',
    name: 'Destinations',
    description: 'Paysages et lieux emblématiques',
    count: destinationImages.length
  }
]