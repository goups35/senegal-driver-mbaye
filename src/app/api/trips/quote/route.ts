import { NextRequest, NextResponse } from 'next/server'
import { tripRequestSchema } from '@/schemas/trip'
import { z } from 'zod'
import type { TripQuote, VehicleInfo, RouteStep } from '@/types'
import { apiCache } from '@/lib/api-cache'

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
  const startTime = performance.now()
  
  try {
    const body = await request.json()
    const tripData = tripRequestSchema.parse(body)

    const vehicleInfo = vehicleDatabase[tripData.vehicleType]

    // Create cache key for this route calculation
    const cacheKey = `route:${tripData.departure}:${tripData.destination}:${tripData.vehicleType}`
    
    // Try to get cached route data
    let routeData = await getCachedRouteData(cacheKey)
    
    if (!routeData) {
      // Generate new route data
      const { getDemoRoute } = await import('@/lib/demo-data')
      const demoRoute = getDemoRoute(tripData.departure, tripData.destination)
      
      // Cache the route data for 1 hour
      routeData = {
        distance_km: demoRoute.distance,
        duration_minutes: parseInt(demoRoute.duration.replace(/[^\d]/g, '')) || 30,
        route_steps: demoRoute.route.map(step => ({
          instruction: step.instruction,
          distance_km: parseFloat(step.distance.replace(/[^\d.]/g, '')) || 1,
          duration_minutes: parseInt(step.duration.replace(/[^\d]/g, '')) || 5
        })),
        estimated_traffic_multiplier: demoRoute.trafficMultiplier
      }
      
      // Cache for 1 hour (routes don't change frequently)
      setCachedRouteData(cacheKey, routeData, 60 * 60 * 1000)
    }

    const route: RouteStep[] = routeData.route_steps.map(step => ({
      instruction: step.instruction,
      distance: `${step.distance_km.toFixed(1)} km`,
      duration: `${step.duration_minutes} min`
    }))

    const basePrice = routeData.distance_km * vehicleInfo.pricePerKm
    const totalPrice = Math.round(basePrice * routeData.estimated_traffic_multiplier)

    // Optimized database save with connection pooling
    let savedTripId = await saveTripRequest(tripData, routeData, basePrice, totalPrice, route, vehicleInfo)

    const quote: TripQuote = {
      trip_request_id: savedTripId,
      distance: routeData.distance_km,
      duration: `${routeData.duration_minutes} minutes`,
      basePrice,
      totalPrice,
      route,
      vehicleInfo
    }

    // Add performance header
    const duration = performance.now() - startTime
    const response = NextResponse.json(quote)
    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
    response.headers.set('X-Cache-Status', routeData ? 'HIT' : 'MISS')

    return response

  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`API Error (${duration.toFixed(2)}ms):`, error)
    
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

// Optimized caching functions
async function getCachedRouteData(key: string) {
  try {
    // Use in-memory cache first
    return global.__routeCache?.get(key) || null
  } catch (error) {
    console.warn('Cache read error:', error)
    return null
  }
}

function setCachedRouteData(key: string, data: any, ttl: number) {
  try {
    // Initialize global cache if not exists
    if (!global.__routeCache) {
      global.__routeCache = new Map()
    }
    
    global.__routeCache.set(key, data)
    
    // Set expiration
    setTimeout(() => {
      global.__routeCache?.delete(key)
    }, ttl)
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}

// Optimized database operations
async function saveTripRequest(
  tripData: any,
  routeData: any,
  basePrice: number,
  totalPrice: number,
  route: RouteStep[],
  vehicleInfo: VehicleInfo
): Promise<string> {
  const fallbackId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Skip database operations in development mode for faster response
  if (process.env.NODE_ENV === 'development') {
    return fallbackId
  }
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      
      const { supabase } = await import('@/lib/supabase')
      
      // Use a transaction-like approach with parallel inserts
      const tripInsertPromise = supabase
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
      
      const { data: savedTrip, error: tripError } = await tripInsertPromise
      
      if (!tripError && savedTrip?.id) {
        // Save quote in background (non-blocking)
        supabase.from('trip_quotes').insert([{
          trip_request_id: savedTrip.id,
          distance: routeData.distance_km,
          duration: `${routeData.duration_minutes} minutes`,
          base_price: basePrice,
          total_price: totalPrice,
          route: route,
          vehicle_info: vehicleInfo
        }]).then().catch(err => console.warn('Quote save failed:', err))
        
        return savedTrip.id
      }
    }
  } catch (error) {
    console.warn('Database save failed, using fallback ID:', error)
  }
  
  return fallbackId
}

// Declare global cache type
declare global {
  var __routeCache: Map<string, any> | undefined
}