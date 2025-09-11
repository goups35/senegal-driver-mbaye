import type { SenegalDestination, AuthenticExperience } from '@/types/destinations'

// Base de données authentique des destinations du Sénégal
export const senegalDestinations: SenegalDestination[] = [
  {
    id: 'goree-island',
    name: 'Île de Gorée',
    region: 'Dakar',
    type: 'unesco-heritage',
    coordinates: {
      latitude: 14.6667,
      longitude: -17.3833
    },
    description: 'Site historique majeur de la traite atlantique, inscrit au patrimoine mondial de l\'UNESCO. Un lieu de mémoire incontournable pour comprendre l\'histoire du Sénégal et de l\'Afrique.',
    authenticExperiences: [
      {
        id: 'goree-memory-tour',
        name: 'Visite guidée de la Maison des Esclaves',
        category: 'historical-tour',
        description: 'Parcours émouvant dans la Maison des Esclaves avec guide historien local. Comprend la visite du musée historique et la "Porte du voyage sans retour".',
        duration: '2-3 heures',
        cost: {
          min: 5000,
          max: 15000,
          currency: 'XOF',
          includes: ['Guide expert', 'Entrée musée', 'Documentation historique'],
          excludes: ['Transport maritime', 'Restauration']
        },
        groupSizeRecommendation: {
          min: 1,
          max: 15,
          optimal: 8
        },
        seasonalAvailability: ['year-round'],
        culturalContext: 'Lieu de mémoire de la traite atlantique. Respect et silence requis dans certaines zones.',
        whatToExpect: 'Visite émotionnellement intense. Témoignages historiques authentiques. Vue sur l\'océan depuis la "porte du voyage sans retour".',
        whatToBring: ['Chapeau', 'Eau', 'Appareil photo (zones autorisées)', 'Tenue respectueuse'],
        languageSupport: ['français', 'wolof', 'english'],
        accessibility: {
          wheelchairAccessible: false,
          walkingDifficulty: 'moderate',
          ageRecommendations: {
            minAge: 12,
            maxAge: null,
            notes: 'Contenu historique intense, recommandé pour adolescents et adultes'
          },
          healthConsiderations: ['Escaliers étroits', 'Espaces confinés', 'Chaleur en saison sèche']
        },
        mbayeNotes: 'Je recommande fortement cette visite le matin pour éviter la foule. Les guides locaux connaissent des histoires que les livres ne racontent pas.'
      }
    ],
    bestTimeToVisit: ['dry-season'],
    culturalSignificance: 'Symbole de la mémoire africaine et de la résilience. Premier site sénégalais inscrit au patrimoine mondial UNESCO (1978).',
    practicalInfo: {
      accessByRoad: 'Ferry depuis le port de Dakar (20 minutes)',
      parkingAvailability: false,
      entryFees: {
        min: 2000,
        max: 5000,
        currency: 'XOF',
        includes: ['Ferry aller-retour'],
        excludes: ['Musées', 'Guides']
      },
      openingHours: 'Ferries 7h-19h, dernière traversée retour 18h30',
      bestTimeOfDay: 'Matin (8h-11h) pour éviter la chaleur et l\'affluence',
      weatherConsiderations: 'Venteux, prévoir vêtement léger. Éviter en cas de forte houle.',
      safetyNotes: 'Traversée maritime sécurisée. Attention aux pickpockets près du port.',
      requiredPermits: []
    },
    transportOptions: [
      {
        type: 'mbaye-direct',
        description: 'Transport jusqu\'au port + accompagnement ferry + récupération',
        duration: '4-6 heures total',
        cost: {
          min: 25000,
          max: 45000,
          currency: 'XOF',
          includes: ['Transport aller-retour', 'Attente', 'Accompagnement'],
          excludes: ['Ferry', 'Repas', 'Entrées musées']
        },
        comfort: 'premium',
        recommendations: 'Service complet avec explication culturelle pendant le trajet'
      }
    ],
    estimatedDuration: {
      minimum: 4,
      recommended: 6,
      maximum: 8,
      notes: 'Inclut transport, ferry et visite complète'
    },
    difficulty: 'moderate',
    cost: {
      min: 30000,
      max: 60000,
      currency: 'XOF',
      includes: ['Transport', 'Ferry', 'Guide de base'],
      excludes: ['Repas', 'Souvenirs', 'Guide spécialisé']
    },
    tags: ['UNESCO', 'Histoire', 'Mémoire', 'Incontournable', 'Émotion', 'Culture'],
    images: ['goree-maison-esclaves.jpg', 'goree-port.jpg', 'goree-vue-dakar.jpg'],
    mbayeRecommendation: 'C\'est LE site à voir absolument au Sénégal. J\'y emmène tous mes clients, et chaque fois c\'est un moment fort. Prévoyez du temps, ne vous précipitez pas.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  {
    id: 'lac-rose',
    name: 'Lac Rose (Lac Retba)',
    region: 'Dakar',
    type: 'natural-park',
    coordinates: {
      latitude: 14.8439,
      longitude: -17.2161
    },
    description: 'Lac salé aux eaux roses spectaculaires, ancien point d\'arrivée du rallye Paris-Dakar. Phénomène naturel unique dû aux micro-algues et à la forte salinité.',
    authenticExperiences: [
      {
        id: 'lac-rose-salt-harvest',
        name: 'Récolte traditionnelle du sel avec les sauniers',
        category: 'cultural-immersion',
        description: 'Participation à la récolte du sel avec les sauniers locaux. Apprentissage des techniques ancestrales et compréhension de cette économie locale unique.',
        duration: '2-3 heures',
        cost: {
          min: 15000,
          max: 25000,
          currency: 'XOF',
          includes: ['Démonstration', 'Participation', 'Explication technique', 'Photos avec sauniers'],
          excludes: ['Transport', 'Achats de sel', 'Boissons']
        },
        groupSizeRecommendation: {
          min: 2,
          max: 8,
          optimal: 5
        },
        seasonalAvailability: ['dry-season'],
        culturalContext: 'Activité économique vitale pour la communauté locale. Respect du travail et des traditions.',
        whatToExpect: 'Travail physique dans l\'eau salée. Couleur rose plus intense selon luminosité. Rencontre authentique avec les travailleurs.',
        whatToBring: ['Maillot de bain', 'Serviette', 'Crème solaire', 'Sandales plastique', 'Appareil photo étanche'],
        languageSupport: ['français', 'wolof'],
        accessibility: {
          wheelchairAccessible: false,
          walkingDifficulty: 'moderate',
          ageRecommendations: {
            minAge: 8,
            maxAge: 65,
            notes: 'Activité physique dans l\'eau salée, attention aux personnes avec problèmes de peau'
          },
          healthConsiderations: ['Contact avec eau très salée', 'Exposition solaire intense', 'Marche dans le sable']
        },
        mbayeNotes: 'Les sauniers sont très accueillants mais c\'est leur gagne-pain. Un petit pourboire est toujours apprécié. La couleur rose est plus intense en fin d\'après-midi.'
      }
    ],
    bestTimeToVisit: ['dry-season'],
    culturalSignificance: 'Économie locale basée sur l\'extraction du sel. Communauté de sauniers avec traditions spécifiques.',
    practicalInfo: {
      accessByRoad: '30 km de Dakar par route goudronnée, puis 2 km de piste',
      parkingAvailability: true,
      entryFees: {
        min: 1000,
        max: 2000,
        currency: 'XOF',
        includes: ['Accès au site'],
        excludes: ['Activités', 'Guide']
      },
      openingHours: '6h-18h (lumière naturelle recommandée)',
      bestTimeOfDay: 'Fin d\'après-midi (16h-18h) pour couleur optimale',
      weatherConsiderations: 'Très chaud et sans ombre. Vent de sable possible.',
      safetyNotes: 'Eau très salée, éviter contact avec les yeux. Terrain sablonneux.',
      requiredPermits: []
    },
    transportOptions: [
      {
        type: 'mbaye-direct',
        description: 'Transport direct avec véhicule adapté aux pistes',
        duration: '45 minutes depuis Dakar',
        cost: {
          min: 20000,
          max: 35000,
          currency: 'XOF',
          includes: ['Transport aller-retour', 'Attente sur site'],
          excludes: ['Entrée site', 'Activités', 'Boissons']
        },
        comfort: 'standard',
        recommendations: 'Véhicule SUV recommandé pour la piste finale'
      }
    ],
    estimatedDuration: {
      minimum: 3,
      recommended: 4,
      maximum: 6,
      notes: 'Inclut transport et activités sur site'
    },
    difficulty: 'easy',
    cost: {
      min: 25000,
      max: 50000,
      currency: 'XOF',
      includes: ['Transport', 'Entrée', 'Guide local'],
      excludes: ['Activités spécialisées', 'Repas', 'Achats']
    },
    tags: ['Nature', 'Unique', 'Photo', 'Sel', 'Tradition', 'Insolite'],
    images: ['lac-rose-panorama.jpg', 'sauniers-travail.jpg', 'lac-rose-sunset.jpg'],
    mbayeRecommendation: 'Magnifique mais attention à bien choisir l\'heure ! En milieu de journée avec le soleil blanc, on ne voit pas le rose. Fin d\'après-midi, c\'est magique.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  {
    id: 'saint-louis',
    name: 'Saint-Louis du Sénégal',
    region: 'Saint-Louis',
    type: 'unesco-heritage',
    coordinates: {
      latitude: 16.0174,
      longitude: -16.4984
    },
    description: 'Ancienne capitale de l\'AOF, ville coloniale inscrite au patrimoine UNESCO. Architecture créole unique, jazz, et porte d\'entrée vers le parc du Djoudj.',
    authenticExperiences: [
      {
        id: 'saint-louis-architecture-walk',
        name: 'Balade architecturale dans la vieille ville',
        category: 'cultural-immersion',
        description: 'Découverte de l\'architecture coloniale et créole unique avec guide historien. Visite des maisons de commerce, de la place Faidherbe et du pont métallique.',
        duration: '2-3 heures',
        cost: {
          min: 10000,
          max: 20000,
          currency: 'XOF',
          includes: ['Guide historien', 'Entrée sites principaux', 'Documentation'],
          excludes: ['Transport', 'Boissons', 'Souvenirs']
        },
        groupSizeRecommendation: {
          min: 2,
          max: 12,
          optimal: 6
        },
        seasonalAvailability: ['year-round'],
        culturalContext: 'Ville historique vivante. Population majoritairement Saint-Louisienne avec culture métissée.',
        whatToExpect: 'Architecture coloniale remarquable, ambiance décontractée, rencontres avec artisans locaux.',
        whatToBring: ['Chapeau', 'Chaussures confortables', 'Appareil photo', 'Eau'],
        languageSupport: ['français', 'wolof'],
        accessibility: {
          wheelchairAccessible: true,
          walkingDifficulty: 'easy',
          ageRecommendations: {
            minAge: 0,
            maxAge: null,
            notes: 'Accessible à tous, terrain plat'
          },
          healthConsiderations: ['Marche sur pavés anciens', 'Chaleur en journée']
        },
        mbayeNotes: 'Saint-Louis a une âme particulière. Les anciens racontent des histoires passionnantes. N\'hésitez pas à vous arrêter prendre un thé à la menthe.'
      },
      {
        id: 'djoudj-bird-park',
        name: 'Parc ornithologique du Djoudj',
        category: 'nature-wildlife',
        description: 'L\'un des plus grands sanctuaires ornithologiques au monde. Plus de 400 espèces d\'oiseaux, notamment les pélicans blancs et les flamants roses.',
        duration: '4-6 heures',
        cost: {
          min: 25000,
          max: 45000,
          currency: 'XOF',
          includes: ['Entrée parc', 'Guide ornithologique', 'Pirogue traditionnelle'],
          excludes: ['Transport depuis Saint-Louis', 'Repas', 'Jumelles']
        },
        groupSizeRecommendation: {
          min: 2,
          max: 8,
          optimal: 4
        },
        seasonalAvailability: ['dry-season'],
        culturalContext: 'Parc géré en collaboration avec les communautés locales. Écotourisme responsable.',
        whatToExpect: 'Concentration exceptionnelle d\'oiseaux migrateurs, navigation en pirogue, silence nécessaire.',
        whatToBring: ['Jumelles', 'Appareil photo zoom', 'Chapeau', 'Crème solaire', 'Vêtements kaki/beige'],
        languageSupport: ['français', 'english'],
        accessibility: {
          wheelchairAccessible: false,
          walkingDifficulty: 'easy',
          ageRecommendations: {
            minAge: 6,
            maxAge: null,
            notes: 'Navigation en pirogue, attention aux jeunes enfants'
          },
          healthConsiderations: ['Navigation en pirogue', 'Exposition solaire', 'Moustiques en fin de journée']
        },
        mbayeNotes: 'Lever très tôt pour cette excursion ! Les oiseaux sont plus actifs au petit matin. C\'est un spectacle que même moi, après 20 ans, je trouve toujours magique.'
      }
    ],
    bestTimeToVisit: ['dry-season'],
    culturalSignificance: 'Ancienne capitale de l\'Afrique Occidentale Française. Berceau du jazz sénégalais et de l\'architecture coloniale.',
    practicalInfo: {
      accessByRoad: '270 km de Dakar par route excellente (3h30)',
      parkingAvailability: true,
      entryFees: null,
      openingHours: 'Ville ouverte 24h/24',
      bestTimeOfDay: 'Matinée et fin d\'après-midi pour éviter la chaleur',
      weatherConsiderations: 'Plus frais que Dakar, vent océanique. Poussière en saison sèche.',
      safetyNotes: 'Ville sûre, attention aux courants près du fleuve.',
      requiredPermits: []
    },
    transportOptions: [
      {
        type: 'mbaye-direct',
        description: 'Transport direct avec possibilité d\'arrêts culturels en route',
        duration: '3h30 depuis Dakar',
        cost: {
          min: 60000,
          max: 100000,
          currency: 'XOF',
          includes: ['Transport aller-retour', 'Arrêts route', 'Attente'],
          excludes: ['Hébergement', 'Repas', 'Activités']
        },
        comfort: 'premium',
        recommendations: 'Départ matinal recommandé pour profiter de la journée complète'
      }
    ],
    estimatedDuration: {
      minimum: 8,
      recommended: 12,
      maximum: 24,
      notes: 'Une journée minimum, idéalement avec nuit sur place'
    },
    difficulty: 'easy',
    cost: {
      min: 80000,
      max: 150000,
      currency: 'XOF',
      includes: ['Transport', 'Visites de base', 'Guide'],
      excludes: ['Hébergement', 'Tous les repas', 'Parc du Djoudj']
    },
    tags: ['UNESCO', 'Architecture', 'Histoire', 'Nature', 'Oiseaux', 'Jazz', 'Fleuve'],
    images: ['saint-louis-pont.jpg', 'saint-louis-maisons-coloniales.jpg', 'djoudj-pelicans.jpg'],
    mbayeRecommendation: 'Ma ville coup de cœur ! Plus calme que Dakar, avec une vraie authenticité. Si vous aimez l\'histoire et la nature, c\'est parfait. Dormez une nuit là-bas si possible.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Expériences transversales disponibles partout
export const universalExperiences: AuthenticExperience[] = [
  {
    id: 'teranga-family-meal',
    name: 'Repas en famille sénégalaise (Teranga)',
    category: 'teranga-experience',
    description: 'Partage d\'un repas traditionnel dans une famille sénégalaise. Découverte du thiéboudjen, du attaya et des traditions culinaires.',
    duration: '3-4 heures',
    cost: {
      min: 15000,
      max: 25000,
      currency: 'XOF',
      includes: ['Repas complet', 'Boissons traditionnelles', 'Échanges culturels'],
      excludes: ['Transport', 'Cadeaux pour la famille']
    },
    groupSizeRecommendation: {
      min: 1,
      max: 6,
      optimal: 4
    },
    seasonalAvailability: ['year-round'],
    culturalContext: 'La Teranga (hospitalité) est la valeur fondamentale sénégalaise. Respect et ouverture essentiels.',
    whatToExpect: 'Accueil chaleureux, partage du bol commun, conversations sur la culture sénégalaise.',
    whatToBring: ['Petit cadeau pour la famille', 'Respect des traditions', 'Curiosité'],
    languageSupport: ['français', 'wolof'],
    accessibility: {
      wheelchairAccessible: true,
      walkingDifficulty: 'easy',
      ageRecommendations: {
        minAge: 0,
        maxAge: null,
        notes: 'Excellente activité familiale'
      },
      healthConsiderations: ['Épices possibles', 'Partage du bol commun']
    },
    mbayeNotes: 'C\'est l\'expérience que je recommande le plus ! Ma propre famille adore recevoir les visiteurs. Vous repartirez avec des amis sénégalais pour la vie.'
  },
  
  {
    id: 'artisan-workshop-visit',
    name: 'Visite d\'atelier d\'artisan traditionnel',
    category: 'traditional-craft',
    description: 'Découverte des savoir-faire traditionnels : poterie, tissage, sculpture sur bois, maroquinerie. Initiation possible.',
    duration: '2-3 heures',
    cost: {
      min: 10000,
      max: 30000,
      currency: 'XOF',
      includes: ['Visite atelier', 'Démonstration', 'Initiation basique'],
      excludes: ['Achats', 'Transport', 'Cours approfondis']
    },
    groupSizeRecommendation: {
      min: 1,
      max: 8,
      optimal: 4
    },
    seasonalAvailability: ['year-round'],
    culturalContext: 'Transmission de savoir-faire ancestraux. Respect du travail artisanal et des maîtres.',
    whatToExpected: 'Démonstrations de techniques traditionnelles, possibilité de s\'essayer, achat direct au producteur.',
    whatToBring: ['Vêtements qui ne craignent rien', 'Appareil photo', 'Curiosité'],
    languageSupport: ['français', 'wolof'],
    accessibility: {
      wheelchairAccessible: false,
      walkingDifficulty: 'easy',
      ageRecommendations: {
        minAge: 5,
        maxAge: null,
        notes: 'Activité adaptable selon l\'âge'
      },
      healthConsiderations: ['Poussière possible', 'Position assise ou debout prolongée']
    },
    mbayeNotes: 'J\'ai mes artisans de confiance dans chaque région. Des vrais maîtres qui perpétuent les traditions. Les prix sont justes et la qualité exceptionnelle.'
  }
]

// Fonctions utilitaires
export function getDestinationsByRegion(region: string): SenegalDestination[] {
  return senegalDestinations.filter(dest => dest.region === region)
}

export function getDestinationsByType(type: string): SenegalDestination[] {
  return senegalDestinations.filter(dest => dest.type === type)
}

export function getDestinationById(id: string): SenegalDestination | undefined {
  return senegalDestinations.find(dest => dest.id === id)
}

export function searchDestinations(query: string): SenegalDestination[] {
  const lowerQuery = query.toLowerCase()
  return senegalDestinations.filter(dest => 
    dest.name.toLowerCase().includes(lowerQuery) ||
    dest.description.toLowerCase().includes(lowerQuery) ||
    dest.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    dest.culturalSignificance.toLowerCase().includes(lowerQuery)
  )
}

export function getRecommendedDuration(destinations: string[]): number {
  const dests = destinations.map(id => getDestinationById(id)).filter(Boolean)
  return dests.reduce((total, dest) => total + (dest?.estimatedDuration.recommended || 0), 0)
}

export function calculateEstimatedCost(destinations: string[], groupSize: number = 1): { min: number, max: number } {
  const dests = destinations.map(id => getDestinationById(id)).filter(Boolean)
  const min = dests.reduce((total, dest) => total + (dest?.cost.min || 0), 0) * groupSize
  const max = dests.reduce((total, dest) => total + (dest?.cost.max || 0), 0) * groupSize
  return { min, max }
}