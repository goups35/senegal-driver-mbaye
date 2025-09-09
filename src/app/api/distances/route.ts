import { NextRequest, NextResponse } from 'next/server'
import { getDistanceBetweenCities, getAllDistances } from '@/lib/distances'
import { z } from 'zod'

const distanceRequestSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1)
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    
    // Si pas de paramètres, retourner toutes les distances
    if (!from || !to) {
      const allDistances = await getAllDistances()
      return NextResponse.json({ distances: allDistances })
    }
    
    // Valider les paramètres
    const { from: fromCity, to: toCity } = distanceRequestSchema.parse({ from, to })
    
    // Rechercher la distance entre les deux villes
    const distance = await getDistanceBetweenCities(fromCity, toCity)
    
    if (!distance) {
      return NextResponse.json(
        { error: 'Distance non trouvée entre ces villes' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ distance })
    
  } catch (error) {
    console.error('Erreur API distances:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des distances' },
      { status: 500 }
    )
  }
}