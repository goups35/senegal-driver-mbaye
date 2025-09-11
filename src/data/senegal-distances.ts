// Système de distances réelles du Sénégal - Données terrain Mbaye

export interface SenegalRoute {
  from: string
  to: string
  distance: number // en km
  duration: number // en minutes
  roadQuality: 'excellent' | 'good' | 'fair' | 'challenging'
  seasonalImpact: {
    drySeason: number // facteur multiplicateur (1.0 = normal)
    rainySeason: number // facteur multiplicateur 
  }
  tollCost?: number // FCFA
  fuelCost: number // FCFA estimation
  restStops: RestStop[]
  warnings: string[]
  mbayeNotes: string
}

export interface RestStop {
  name: string
  km: number // distance depuis le départ
  type: 'fuel' | 'food' | 'restroom' | 'scenic' | 'cultural'
  duration: number // minutes recommandées
  optional: boolean
  description: string
}

// MATRICE COMPLÈTE DES DISTANCES SÉNÉGAL
export const SENEGAL_DISTANCES: SenegalRoute[] = [
  
  // RÉGION DAKAR ↔ AUTRES RÉGIONS
  {
    from: 'Dakar',
    to: 'Thiès',
    distance: 70,
    duration: 90,
    roadQuality: 'excellent',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.1 },
    tollCost: 2000,
    fuelCost: 8000,
    restStops: [
      {
        name: 'Station Elton Rufisque',
        km: 25,
        type: 'fuel',
        duration: 10,
        optional: true,
        description: 'Dernière grande station avant Thiès'
      }
    ],
    warnings: ['Trafic dense sortie Dakar heures de pointe'],
    mbayeNotes: 'Route excellent état, autoroute à péage. Éviter 7h-9h et 17h-19h pour trafic Dakar.'
  },

  {
    from: 'Dakar',
    to: 'Saint-Louis',
    distance: 270,
    duration: 240, // 4h
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.3 },
    fuelCost: 30000,
    restStops: [
      {
        name: 'Thiès - Pause déjeuner',
        km: 70,
        type: 'food',
        duration: 45,
        optional: false,
        description: 'Excellent thieboudjen chez Awa'
      },
      {
        name: 'Louga - Station Total',
        km: 180,
        type: 'fuel',
        duration: 15,
        optional: true,
        description: 'Dernière grande station avant Saint-Louis'
      }
    ],
    warnings: ['Route dégradée après Louga en saison des pluies', 'Animaux sur route secteur Kebemer'],
    mbayeNotes: 'Magnifique route, paysages changeants. Prévoir pause repas Thiès obligatoire. En saison pluies, attention nids de poule après Louga.'
  },

  {
    from: 'Dakar',
    to: 'Lac Rose',
    distance: 35,
    duration: 60, // 1h
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.2 },
    fuelCost: 4000,
    restStops: [
      {
        name: 'Village artisanal Ngor',
        km: 15,
        type: 'cultural',
        duration: 20,
        optional: true,
        description: 'Potiers et sculpteurs traditionnels'
      }
    ],
    warnings: ['Derniers 3km sur piste sablonneuse'],
    mbayeNotes: 'Route goudronnée jusqu\'au village, puis piste. SUV recommandé pour accès direct au lac. Couleur rose optimale 16h-18h.'
  },

  {
    from: 'Dakar',
    to: 'Mbour',
    distance: 80,
    duration: 90, // 1h30
    roadQuality: 'excellent',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.1 },
    fuelCost: 9000,
    restStops: [
      {
        name: 'Diamniadio - Nouveau pôle urbain',
        km: 35,
        type: 'fuel',
        duration: 10,
        optional: true,
        description: 'Grande station moderne'
      }
    ],
    warnings: ['Trafic dense weekend vers plages'],
    mbayeNotes: 'Route côtière magnifique, autoroute en excellent état. Très fréquentée le weekend, partir tôt. Saly à 5km de Mbour.'
  },

  {
    from: 'Dakar',
    to: 'Joal-Fadiouth',
    distance: 114,
    duration: 135, // 2h15
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.2 },
    fuelCost: 13000,
    restStops: [
      {
        name: 'Mbour - Pause plage',
        km: 80,
        type: 'scenic',
        duration: 20,
        optional: true,
        description: 'Vue sur océan, restaurants de poisson'
      }
    ],
    warnings: ['Route étroite après Mbour'],
    mbayeNotes: 'Route vers l\'île aux coquillages ! Magnifique côte sérère. Joal, village natal de Senghor. Fadiouth, île unique au monde.'
  },

  {
    from: 'Dakar',
    to: 'Lompoul',
    distance: 208,
    duration: 180, // 3h
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.3 },
    fuelCost: 25000,
    restStops: [
      {
        name: 'Thiès - Pause technique',
        km: 70,
        type: 'fuel',
        duration: 15,
        optional: false,
        description: 'Plein obligatoire avant le désert'
      },
      {
        name: 'Kebemer - Carrefour routes',
        km: 160,
        type: 'fuel',
        duration: 10,
        optional: true,
        description: 'Dernière station avant Lompoul'
      }
    ],
    warnings: ['Derniers 15km sur piste sablonneuse vers campement'],
    mbayeNotes: 'Route vers le petit Sahara sénégalais ! Dunes magnifiques. Prévoir 4x4 pour accès direct au campement. Coucher de soleil inoubliable.'
  },

  // CÔTE PETITE-CÔTE
  {
    from: 'Mbour',
    to: 'Joal-Fadiouth',
    distance: 34,
    duration: 50, // 50mn
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.1 },
    fuelCost: 4000,
    restStops: [],
    warnings: ['Route côtière étroite'],
    mbayeNotes: 'Belle route côtière directe. Paysages sérères authentiques. Parfait complément après plages de Saly.'
  },

  // LOMPOUL ↔ NORD
  {
    from: 'Lompoul',
    to: 'Saint-Louis',
    distance: 88,
    duration: 78, // 1h18
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.2 },
    fuelCost: 11000,
    restStops: [
      {
        name: 'Louga - Croisement routes',
        km: 45,
        type: 'fuel',
        duration: 10,
        optional: true,
        description: 'Station et petite restauration'
      }
    ],
    warnings: ['Animaux sur route secteur rural'],
    mbayeNotes: 'Route directe du désert vers la ville historique. Contraste saisissant entre dunes et architecture coloniale. Belle transition.'
  },

  // THIÈS ↔ AUTRES VILLES
  {
    from: 'Thiès',
    to: 'Saint-Louis',
    distance: 200,
    duration: 135, // 2h15
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.2 },
    fuelCost: 24000,
    restStops: [
      {
        name: 'Louga - Carrefour du Nord',
        km: 110,
        type: 'fuel',
        duration: 15,
        optional: true,
        description: 'Grande station et restaurants'
      }
    ],
    warnings: ['Animaux sur route secteur Kebemer'],
    mbayeNotes: 'Route directe vers Saint-Louis, plus rapide que par Dakar. Belle traversée du Cayor et du Walo.'
  },

  {
    from: 'Thiès',
    to: 'Kaolack',
    distance: 150,
    duration: 120, // 2h
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.4 },
    fuelCost: 18000,
    restStops: [
      {
        name: 'Diourbel - Marché central',
        km: 75,
        type: 'cultural',
        duration: 30,
        optional: true,
        description: 'Grand marché authentique, capitale du Mouridisme'
      }
    ],
    warnings: ['Route très dégradée Diourbel-Kaolack en hivernage'],
    mbayeNotes: 'Traversée du Baol, région arachidière. Route correcte mais attention en saison pluies. Diourbel mérite arrêt culturel.'
  },

  // SAINT-LOUIS ↔ AUTRES RÉGIONS
  {
    from: 'Saint-Louis',
    to: 'Podor',
    distance: 180,
    duration: 150, // 2h30
    roadQuality: 'fair',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.8 },
    fuelCost: 22000,
    restStops: [
      {
        name: 'Richard Toll - Complexe sucrier',
        km: 60,
        type: 'cultural',
        duration: 25,
        optional: true,
        description: 'Visite usine sucrière et château du Baron Roger'
      }
    ],
    warnings: ['Route très difficile en hivernage', 'Traversées de marigots'],
    mbayeNotes: 'Route du fleuve, paysages magnifiques mais état difficile. À éviter absolument de juillet à octobre. Véhicule 4x4 obligatoire en saison pluies.'
  },

  {
    from: 'Saint-Louis',
    to: 'Parc Djoudj',
    distance: 60,
    duration: 90,
    roadQuality: 'challenging',
    seasonalImpact: { drySeason: 1.0, rainySeason: 2.0 },
    fuelCost: 8000,
    restStops: [],
    warnings: ['Piste difficile derniers 20km', 'Impraticable en saison pluies'],
    mbayeNotes: 'Magnifique mais difficile d\'accès. SUV obligatoire. Meilleure période novembre-mars pour oiseaux et routes. Départ très matinal recommandé.'
  },

  // KAOLACK ↔ SUD
  {
    from: 'Kaolack',
    to: 'Tambacounda',
    distance: 220,
    duration: 180, // 3h
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.3 },
    fuelCost: 26000,
    restStops: [
      {
        name: 'Kaffrine - Nouveau chef-lieu',
        km: 110,
        type: 'fuel',
        duration: 20,
        optional: false,
        description: 'Ravitaillement obligatoire, nouvelle région'
      }
    ],
    warnings: ['Peu de stations après Kaffrine'],
    mbayeNotes: 'Route correcte, passage par nouvelle région Kaffrine. Plein obligatoire à Kaffrine car peu de stations ensuite. Paysages de savane.'
  },

  {
    from: 'Kaolack',
    to: 'Ziguinchor',
    distance: 280,
    duration: 240, // 4h
    roadQuality: 'fair',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.6 },
    fuelCost: 35000,
    restStops: [
      {
        name: 'Foundiougne - Pont sur Saloum',
        km: 90,
        type: 'scenic',
        duration: 15,
        optional: true,
        description: 'Vue magnifique sur les bolongs'
      },
      {
        name: 'Bignona - Dernière grande ville',
        km: 220,
        type: 'fuel',
        duration: 25,
        optional: false,
        description: 'Plein obligatoire et pause repas'
      }
    ],
    warnings: ['Route dégradée après Foundiougne', 'Contrôles fréquents'],
    mbayeNotes: 'Route longue et fatigante. Pause obligatoire Bignona. Belle traversée Sine-Saloum mais route difficile. Prévoir journée complète.'
  },

  // CASAMANCE
  {
    from: 'Ziguinchor',
    to: 'Cap Skirring',
    distance: 70,
    duration: 90,
    roadQuality: 'good',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.4 },
    fuelCost: 9000,
    restStops: [
      {
        name: 'Oussouye - Capitale Diola',
        km: 35,
        type: 'cultural',
        duration: 30,
        optional: true,
        description: 'Centre culturel diola authentique'
      }
    ],
    warnings: ['Pluies rendent pistes secondaires impraticables'],
    mbayeNotes: 'Belle route vers les plages. Oussouye incontournable pour culture diola. Meilleures plages du Sénégal au Cap Skirring.'
  },

  // SÉNÉGAL ORIENTAL
  {
    from: 'Tambacounda',
    to: 'Kédougou',
    distance: 180,
    duration: 150, // 2h30
    roadQuality: 'fair',
    seasonalImpact: { drySeason: 1.0, rainySeason: 1.7 },
    fuelCost: 22000,
    restStops: [
      {
        name: 'Salémata - Village carrefour',
        km: 120,
        type: 'food',
        duration: 30,
        optional: false,
        description: 'Dernière étape avant région aurifère'
      }
    ],
    warnings: ['Route très dégradée certains tronçons', 'Orpaillage artisanal, circulation modifiée'],
    mbayeNotes: 'Route vers l\'or ! Magnifiques paysages montagneux mais route difficile. 4x4 recommandé en saison pluies. Région exceptionnelle pour nature.'
  }
]

// FONCTIONS UTILITAIRES

export function findRoute(from: string, to: string): SenegalRoute | null {
  // Recherche directe
  let route = SENEGAL_DISTANCES.find(r => 
    r.from.toLowerCase() === from.toLowerCase() && 
    r.to.toLowerCase() === to.toLowerCase()
  )
  
  // Recherche inverse
  if (!route) {
    const reverseRoute = SENEGAL_DISTANCES.find(r => 
      r.to.toLowerCase() === from.toLowerCase() && 
      r.from.toLowerCase() === to.toLowerCase()
    )
    if (reverseRoute) {
      route = {
        ...reverseRoute,
        from: reverseRoute.to,
        to: reverseRoute.from
      }
    }
  }
  
  return route
}

export function calculateTotalJourney(cities: string[]): {
  totalDistance: number
  totalDuration: number
  totalCost: number
  routes: SenegalRoute[]
  warnings: string[]
  mbayeAdvice: string[]
} {
  let totalDistance = 0
  let totalDuration = 0
  let totalCost = 0
  const routes: SenegalRoute[] = []
  const warnings: string[] = []
  const mbayeAdvice: string[] = []

  for (let i = 0; i < cities.length - 1; i++) {
    const route = findRoute(cities[i], cities[i + 1])
    if (route) {
      routes.push(route)
      totalDistance += route.distance
      totalDuration += route.duration
      totalCost += route.fuelCost + (route.tollCost || 0)
      warnings.push(...route.warnings)
      mbayeAdvice.push(`${route.from} → ${route.to}: ${route.mbayeNotes}`)
    }
  }

  return {
    totalDistance,
    totalDuration,
    totalCost,
    routes,
    warnings: [...new Set(warnings)], // Supprime doublons
    mbayeAdvice
  }
}

export function getSeasonalDuration(route: SenegalRoute, season: 'dry' | 'rainy'): number {
  const factor = season === 'dry' ? route.seasonalImpact.drySeason : route.seasonalImpact.rainySeason
  return Math.round(route.duration * factor)
}

export function getRouteRecommendations(from: string, to: string): {
  route: SenegalRoute | null
  bestTime: string
  vehicleRecommendation: string
  totalBudget: { min: number, max: number }
  mbayeAdvice: string
} {
  const route = findRoute(from, to)
  
  if (!route) {
    return {
      route: null,
      bestTime: 'Route non disponible',
      vehicleRecommendation: 'Consultation nécessaire',
      totalBudget: { min: 0, max: 0 },
      mbayeAdvice: 'Cette route nécessite une étude personnalisée. Contactez-moi directement.'
    }
  }

  const vehicleRec = route.roadQuality === 'excellent' || route.roadQuality === 'good' 
    ? 'Véhicule standard suffisant'
    : 'SUV/4x4 recommandé'

  const bestTimeAdvice = route.seasonalImpact.rainySeason > 1.3
    ? 'Période sèche recommandée (novembre-mai)'
    : 'Praticable toute l\'année'

  const budget = {
    min: route.fuelCost + (route.tollCost || 0),
    max: (route.fuelCost + (route.tollCost || 0)) * 1.5 // +50% pour imprévus
  }

  return {
    route,
    bestTime: bestTimeAdvice,
    vehicleRecommendation: vehicleRec,
    totalBudget: budget,
    mbayeAdvice: route.mbayeNotes
  }
}

// Fonction pour recherche fuzzy (approximative)
export function findNearestCity(query: string): string[] {
  const cities = [...new Set([
    ...SENEGAL_DISTANCES.map(r => r.from),
    ...SENEGAL_DISTANCES.map(r => r.to)
  ])]
  
  return cities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(city.toLowerCase())
  )
}

// Export des villes principales pour autocomplete
export const SENEGAL_CITIES = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Tambacounda', 
  'Ziguinchor', 'Kédougou', 'Kolda', 'Louga', 'Fatick',
  'Diourbel', 'Podor', 'Kaffrine', 'Cap Skirring', 'Lac Rose',
  'Parc Djoudj', 'Richard Toll', 'Foundiougne', 'Bignona',
  'Mbour', 'Saly', 'Joal-Fadiouth', 'Lompoul'
]