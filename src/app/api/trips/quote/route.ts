import { NextRequest, NextResponse } from 'next/server'
import { tripRequestSchema } from '@/schemas/trip'
import { z } from 'zod'
import type { TripQuote, VehicleInfo, RouteStep } from '@/types'

const vehicleDatabase: Record<string, VehicleInfo> = {
  standard: {
    type: 'standard',
    name: 'Hyundai Accent / Toyota Vitz',
    capacity: 4,
    features: ['Climatisation', 'Radio', 'Ceintures de sécurité'],
    pricePerKm: 500
  },
  premium: {
    type: 'premium',
    name: 'Toyota Camry / Honda Accord',
    capacity: 4,
    features: ['Climatisation', 'Sièges cuir', 'GPS', 'WiFi'],
    pricePerKm: 750
  },
  suv: {
    type: 'suv',
    name: 'Toyota RAV4 / Honda Pilot',
    capacity: 7,
    features: ['Climatisation', 'Espace bagages XL', 'GPS', '7 places'],
    pricePerKm: 900
  }
}

// Schema pour validation de réponse (non utilisé actuellement)
// const routeResponseSchema = z.object({
//   distance_km: z.number(),
//   duration_minutes: z.number(),
//   route_steps: z.array(z.object({
//     instruction: z.string(),
//     distance_km: z.number(),
//     duration_minutes: z.number()
//   })),
//   estimated_traffic_multiplier: z.number().min(1).max(3)
// })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tripData = tripRequestSchema.parse(body)

    const vehicleInfo = vehicleDatabase[tripData.vehicleType]

    // Version DEMO - utilisation de données simulées au lieu d'OpenAI
    const { getDemoRoute } = await import('@/lib/demo-data')
    const demoRoute = getDemoRoute(tripData.departure, tripData.destination)

    // Simulation réaliste avec un petit délai
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Structure des données simulées comme si elles venaient d'OpenAI
    const validatedResponse = {
      distance_km: demoRoute.distance,
      duration_minutes: parseInt(demoRoute.duration.replace(/[^\d]/g, '')) || 30,
      route_steps: demoRoute.route.map(step => ({
        instruction: step.instruction,
        distance_km: parseFloat(step.distance.replace(/[^\d.]/g, '')) || 1,
        duration_minutes: parseInt(step.duration.replace(/[^\d]/g, '')) || 5
      })),
      estimated_traffic_multiplier: demoRoute.trafficMultiplier
    }

    const route: RouteStep[] = validatedResponse.route_steps.map(step => ({
      instruction: step.instruction,
      distance: `${step.distance_km.toFixed(1)} km`,
      duration: `${step.duration_minutes} min`
    }))

    const basePrice = validatedResponse.distance_km * vehicleInfo.pricePerKm
    const totalPrice = Math.round(basePrice * validatedResponse.estimated_traffic_multiplier)

    // Tentative de sauvegarde en base (optionnelle en mode démo)
    let savedTripId = 'demo-' + Date.now()
    
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
        const { supabase } = await import('@/lib/supabase')
        
        const { data: savedTrip, error: tripError } = await supabase
          .from('trip_requests')
          .insert([{
            departure: tripData.departure,
            destination: tripData.destination,
            date: tripData.date,
            time: tripData.time,
            passengers: tripData.passengers,
            vehicle_type: tripData.vehicleType,
            customer_name: tripData.customerName,
            customer_phone: tripData.customerPhone,
            customer_email: tripData.customerEmail || null,
            special_requests: tripData.specialRequests || null
          }])
          .select()
          .single()

        if (!tripError && savedTrip?.id) {
          savedTripId = savedTrip.id
          
          // Sauvegarder le devis
          await supabase.from('trip_quotes').insert([{
            trip_request_id: savedTrip.id,
            distance: validatedResponse.distance_km,
            duration: `${validatedResponse.duration_minutes} minutes`,
            base_price: basePrice,
            total_price: totalPrice,
            route: route,
            vehicle_info: vehicleInfo
          }])
        }
      }
    } catch (error) {
      console.log('Mode démo - base de données non disponible:', error)
    }

    const quote: TripQuote = {
      trip_request_id: savedTripId,
      distance: validatedResponse.distance_km,
      duration: `${validatedResponse.duration_minutes} minutes`,
      basePrice,
      totalPrice,
      route,
      vehicleInfo
    }

    return NextResponse.json(quote)

  } catch (error) {
    console.error('Erreur API route:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la génération du devis' },
      { status: 500 }
    )
  }
}