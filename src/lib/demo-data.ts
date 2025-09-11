import type { RouteStep } from '@/types'

// Données de démonstration pour les trajets au Sénégal
export const demoRoutes: Record<string, {
  distance: number
  duration: string
  route: RouteStep[]
  trafficMultiplier: number
}> = {
  'dakar-airport': {
    distance: 15,
    duration: '35 minutes',
    route: [
      {
        instruction: 'Sortir de Dakar centre par l\'Avenue Léopold Sédar Senghor',
        distance: '3.2 km',
        duration: '8 min'
      },
      {
        instruction: 'Continuer sur la Route de l\'Aéroport (N1)',
        distance: '8.5 km',
        duration: '18 min'
      },
      {
        instruction: 'Prendre la sortie vers l\'Aéroport International',
        distance: '2.8 km',
        duration: '6 min'
      },
      {
        instruction: 'Arriver à l\'Aéroport Léopold Sédar Senghor',
        distance: '0.5 km',
        duration: '3 min'
      }
    ],
    trafficMultiplier: 1.4
  },
  'dakar-thies': {
    distance: 70,
    duration: '1h 45min',
    route: [
      {
        instruction: 'Sortir de Dakar par la Route Nationale N2',
        distance: '12 km',
        duration: '25 min'
      },
      {
        instruction: 'Continuer sur l\'autoroute à péage A1 vers Thiès',
        distance: '50 km',
        duration: '65 min'
      },
      {
        instruction: 'Prendre la sortie Thiès Centre',
        distance: '6 km',
        duration: '12 min'
      },
      {
        instruction: 'Arriver au centre-ville de Thiès',
        distance: '2 km',
        duration: '8 min'
      }
    ],
    trafficMultiplier: 1.2
  },
  'default': {
    distance: 25,
    duration: '50 minutes',
    route: [
      {
        instruction: 'Départ du point d\'origine',
        distance: '2 km',
        duration: '8 min'
      },
      {
        instruction: 'Suivre la route principale',
        distance: '18 km',
        duration: '32 min'
      },
      {
        instruction: 'Prendre la sortie vers la destination',
        distance: '4 km',
        duration: '8 min'
      },
      {
        instruction: 'Arriver à destination',
        distance: '1 km',
        duration: '2 min'
      }
    ],
    trafficMultiplier: 1.3
  }
}

export function getDemoRoute(departure: string, destination: string) {
  const key = `${departure.toLowerCase()}-${destination.toLowerCase()}`
  
  // Cas spécifiques pour le Sénégal
  if (key.includes('dakar') && key.includes('aéroport') || key.includes('airport')) {
    return demoRoutes['dakar-airport']
  }
  
  if (key.includes('dakar') && key.includes('thiès') || key.includes('thies')) {
    return demoRoutes['dakar-thies']
  }
  
  // Si c'est un long trajet (plus de 50 caractères combinés)
  if ((departure + destination).length > 50) {
    return {
      ...demoRoutes['dakar-thies'],
      distance: Math.floor(Math.random() * 100) + 50,
      duration: `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 45) + 15}min`
    }
  }
  
  // Trajet par défaut
  return {
    ...demoRoutes['default'],
    distance: Math.floor(Math.random() * 40) + 10,
    duration: `${Math.floor(Math.random() * 60) + 20} minutes`
  }
}