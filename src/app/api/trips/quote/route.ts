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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tripData = tripRequestSchema.parse(body)

    // Use default vehicle type since it's no longer in the form
    const vehicleInfo = vehicleDatabase['standard']

    // Version DEMO - utilisation de données simulées avec des valeurs par défaut
    const { getDemoRoute } = await import('@/lib/demo-data')
    const demoRoute = getDemoRoute('Dakar', 'Aéroport Léopold Sédar Senghor')

    // Simulation réaliste avec un petit délai
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Structure des données simulées pour démonstration
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
        console.log('🔄 Tentative de sauvegarde en base Supabase...')
        const { supabase } = await import('@/lib/supabase')

        const tripRequestData = {
          departure: 'Dakar', // Default departure location
          destination: 'Aéroport Léopold Sédar Senghor', // Default destination
          date: tripData.date,
          time: '08:00', // Default departure time
          passengers: tripData.passengers,
          duration: tripData.duration,
          vehicle_type: 'standard', // Default vehicle type
          customer_name: tripData.customerName,
          customer_phone: tripData.customerPhone,
          customer_email: tripData.customerEmail,
          special_requests: tripData.specialRequests || null
        }

        console.log('📝 Données à sauvegarder:', tripRequestData)

        const { data: savedTrip, error: tripError } = await supabase
          .from('trip_requests')
          .insert([tripRequestData])
          .select()
          .single()

        if (tripError) {
          console.error('❌ Erreur lors de la sauvegarde trip_requests:', tripError)
        } else if (savedTrip?.id) {
          console.log('✅ Trip request sauvegardé avec succès, ID:', savedTrip.id)
          savedTripId = savedTrip.id

          // Sauvegarder le devis
          const quoteData = {
            trip_request_id: savedTrip.id,
            distance: validatedResponse.distance_km,
            duration: `${validatedResponse.duration_minutes} minutes`,
            base_price: basePrice,
            total_price: totalPrice,
            route: route,
            vehicle_info: vehicleInfo
          }

          console.log('📝 Sauvegarde du devis:', quoteData)

          const { error: quoteError } = await supabase.from('trip_quotes').insert([quoteData])

          if (quoteError) {
            console.error('❌ Erreur lors de la sauvegarde trip_quotes:', quoteError)
          } else {
            console.log('✅ Devis sauvegardé avec succès')
          }
        }
      } else {
        console.log('⚠️ Mode démo - URL Supabase non configurée')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en base:', error)
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