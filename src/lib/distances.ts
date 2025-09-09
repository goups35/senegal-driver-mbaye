import { supabase } from './supabase'

export interface DistanceData {
  distance_km: number
  travel_time_hours: number
  road_condition: string
  season_affected: boolean
  vehicle_type: string
}

export async function getDistanceBetweenCities(city1: string, city2: string): Promise<DistanceData | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_distance_between_cities', {
        city1: city1.trim(),
        city2: city2.trim()
      })

    if (error) {
      console.error('Erreur Supabase distances:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Erreur lors de la récupération des distances:', error)
    return null
  }
}

export async function getAllDistances(): Promise<unknown[]> {
  try {
    const { data, error } = await supabase
      .from('distances_senegal')
      .select('*')
      .order('from_city')

    if (error) {
      console.error('Erreur Supabase distances:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les distances:', error)
    return []
  }
}

// Fonction pour extraire les noms de villes depuis un prompt
export function extractCitiesFromPrompt(prompt: string): string[] {
  const cities = [
    'Dakar', 'Saint-Louis', 'Thiès', 'Saly', 'Kaolack', 'Tambacounda', 
    'Ziguinchor', 'Cap Skirring', 'Touba', 'Lac Rose', 'Richard Toll',
    'Podor', 'Joal-Fadiouth', 'Diourbel', 'Fatick', 'Kaffrine',
    'Niokolo-Koba', 'Kédougou', 'Oussouye', 'Bignona', 'Matam'
  ]
  
  const foundCities = cities.filter(city => 
    prompt.toLowerCase().includes(city.toLowerCase())
  )
  
  return foundCities
}

// Générer un contexte de distances pour l'IA
export async function generateDistanceContext(cities: string[]): Promise<string> {
  if (cities.length < 2) return ''
  
  const distanceInfo: string[] = []
  
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const distance = await getDistanceBetweenCities(cities[i], cities[j])
      if (distance) {
        const seasonNote = distance.season_affected ? ' (affecté par l\'hivernage)' : ''
        const vehicleNote = distance.vehicle_type !== 'standard' ? ` (${distance.vehicle_type} recommandé)` : ''
        
        distanceInfo.push(
          `${cities[i]} ↔ ${cities[j]}: ${distance.distance_km}km, ${distance.travel_time_hours}h, route ${distance.road_condition}${seasonNote}${vehicleNote}`
        )
      }
    }
  }
  
  if (distanceInfo.length === 0) return ''
  
  return `\n\nDONNÉES DISTANCES RÉELLES:\n${distanceInfo.join('\n')}\n`
}