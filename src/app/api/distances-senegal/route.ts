/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { 
  calculateTotalJourney, 
  getRouteRecommendations,
  findNearestCity,
  SENEGAL_CITIES 
} from '@/data/senegal-distances'

// GET /api/distances-senegal?from=Dakar&to=Saint-Louis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const journey = searchParams.get('journey') // villes séparées par virgules
    const season = searchParams.get('season') as 'dry' | 'rainy' || 'dry'

    // Mode recherche de villes
    if (searchParams.get('search')) {
      const query = searchParams.get('search')!
      const results = findNearestCity(query)
      return NextResponse.json({
        query,
        results,
        allCities: SENEGAL_CITIES
      })
    }

    // Mode itinéraire multiple
    if (journey) {
      const cities = journey.split(',').map(city => city.trim())
      if (cities.length < 2) {
        return NextResponse.json(
          { error: 'Au moins 2 villes requises pour un itinéraire' },
          { status: 400 }
        )
      }

      const result = calculateTotalJourney(cities)
      return NextResponse.json({
        itinerary: cities,
        ...result,
        season,
        summary: {
          totalDistance: `${result.totalDistance} km`,
          totalDuration: `${Math.floor(result.totalDuration / 60)}h${result.totalDuration % 60}`,
          estimatedCost: `${result.totalCost.toLocaleString()} FCFA`,
          routeCount: result.routes.length
        }
      })
    }

    // Mode point à point
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Paramètres "from" et "to" requis' },
        { status: 400 }
      )
    }

    const recommendations = getRouteRecommendations(from, to)
    
    if (!recommendations.route) {
      return NextResponse.json({
        error: 'Route non trouvée',
        suggestions: findNearestCity(from).concat(findNearestCity(to)),
        availableCities: SENEGAL_CITIES
      }, { status: 404 })
    }

    return NextResponse.json({
      from,
      to,
      season,
      ...recommendations,
      formattedDuration: formatDuration(recommendations.route.duration),
      formattedCost: `${recommendations.totalBudget.min.toLocaleString()} - ${recommendations.totalBudget.max.toLocaleString()} FCFA`
    })

  } catch (error) {
    console.error('Distances API Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des distances' },
      { status: 500 }
    )
  }
}

// POST pour calculs complexes avec préférences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      itinerary,
      preferences = {},
      season = 'dry',
      vehicleType = 'standard',
      groupSize = 1
    } = body

    if (!itinerary || !Array.isArray(itinerary) || itinerary.length < 2) {
      return NextResponse.json(
        { error: 'Itinéraire requis (array de villes)' },
        { status: 400 }
      )
    }

    const journey = calculateTotalJourney(itinerary)
    
    // Calculs personnalisés selon préférences
    const personalizedResult = {
      ...journey,
      season,
      vehicleType,
      groupSize,
      personalizedAdvice: generatePersonalizedAdvice(journey, preferences, season),
      budgetBreakdown: calculateDetailedBudget(journey, groupSize, vehicleType),
      timeOptimization: optimizeTimeSchedule(journey),
      warningsAndTips: {
        criticalWarnings: journey.warnings.filter(w => 
          w.includes('impraticable') || w.includes('difficile') || w.includes('obligatoire')
        ),
        seasonalAdvice: getSeasonalAdvice(journey.routes, season),
        mbayeExpertTips: journey.mbayeAdvice
      }
    }

    return NextResponse.json(personalizedResult)

  } catch (error) {
    console.error('Distances POST API Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul personnalisé' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

function generatePersonalizedAdvice(
  journey: Record<string, any>, 
  preferences: Record<string, any>, 
  season: string
): string[] {
  const advice = []
  
  if (journey.totalDuration > 360) { // Plus de 6h
    advice.push('Itinéraire long : prévoir nuit d\'étape ou départ très matinal')
  }
  
  if (season === 'rainy' && journey.warnings.some((w: string) => w.includes('pluie'))) {
    advice.push('Période hivernage : vérifier état routes avant départ')
  }
  
  if (preferences.comfort === 'high') {
    advice.push('Confort premium : pauses fréquentes et véhicule climatisé recommandés')
  }
  
  if (preferences.cultural && journey.routes.some((r: any) => r.restStops.some((s: any) => s.type === 'cultural'))) {
    advice.push('Opportunités culturelles identifiées sur votre parcours')
  }
  
  return advice
}

function calculateDetailedBudget(journey: any, groupSize: number, vehicleType: string): any {
  const baseMultiplier = vehicleType === 'premium' ? 1.3 : vehicleType === 'suv' ? 1.2 : 1.0
  const groupMultiplier = Math.ceil(groupSize / 4) // 1 véhicule par 4 personnes
  
  return {
    fuel: Math.round(journey.totalCost * baseMultiplier * groupMultiplier),
    driver: groupSize > 1 ? 15000 * Math.ceil(journey.totalDuration / 60) : 0, // 15k/heure
    meals: groupSize * 5000 * Math.ceil(journey.totalDuration / 180), // Repas si >3h
    accommodation: journey.totalDuration > 480 ? groupSize * 25000 : 0, // Nuit si >8h
    total: 0 // Calculé après
  }
}

function optimizeTimeSchedule(journey: any): any {
  const routes = journey.routes
  let currentTime = 8 * 60 // 8h00 départ recommandé
  const schedule: any[] = []
  
  routes.forEach((route: any) => {
    const arrival = currentTime + route.duration
    schedule.push({
      segment: `${route.from} → ${route.to}`,
      departure: formatTime(currentTime),
      arrival: formatTime(arrival),
      duration: formatDuration(route.duration),
      advice: getTimeAdvice(currentTime, route.duration)
    })
    
    // Ajouter pauses obligatoires
    const mandatoryStops = route.restStops?.filter((s: any) => !s.optional) || []
    mandatoryStops.forEach((stop: any) => {
      currentTime = arrival + stop.duration
    })
    
    currentTime = arrival
  })
  
  return {
    recommendedDeparture: '08:00',
    estimatedArrival: formatTime(currentTime),
    schedule,
    dayRecommendation: currentTime > 20 * 60 ? 'Prévoir nuit d\'étape' : 'Faisable en journée'
  }
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function getTimeAdvice(startTime: number, duration: number): string {
  const endTime = startTime + duration
  
  if (startTime < 7 * 60) return 'Départ très matinal'
  if (startTime > 16 * 60) return 'Départ tardif, attention à la conduite de nuit'
  if (endTime > 19 * 60) return 'Arrivée de nuit probable'
  if (duration > 180) return 'Trajet long, prévoir pauses'
  
  return 'Horaire optimal'
}

function getSeasonalAdvice(routes: any[], season: string): string[] {
  const advice = []
  
  if (season === 'rainy') {
    advice.push('Période hivernage : routes secondaires souvent impraticables')
    advice.push('Prévoir plus de temps et vérifier météo locale')
    
    const challengingRoutes = routes.filter(r => r.seasonalImpact.rainySeason > 1.5)
    if (challengingRoutes.length > 0) {
      advice.push(`Routes très affectées par pluies : ${challengingRoutes.map(r => `${r.from}-${r.to}`).join(', ')}`)
    }
  } else {
    advice.push('Saison sèche : conditions optimales de circulation')
    advice.push('Attention à la poussière sur pistes')
  }
  
  return advice
}