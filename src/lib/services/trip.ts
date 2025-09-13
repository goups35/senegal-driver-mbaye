import { BaseService } from './base'
import { databaseService } from './database'
import { ValidationError, ExternalServiceError } from '@/lib/errors'
import { tripRequestSchema, routeGenerationSchema } from '@/schemas/validation'
import type { TripRequestInput, RouteGenerationInput } from '@/schemas/validation'
import type { TripQuote, VehicleInfo, RouteStep } from '@/types'

/**
 * Vehicle database with pricing and specifications
 */
const VEHICLE_DATABASE: Record<string, VehicleInfo> = {
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

/**
 * Trip service for handling trip requests and quotes
 */
export class TripService extends BaseService {
  constructor() {
    super('TripService')
  }

  /**
   * Generate a trip quote based on request data
   */
  async generateQuote(data: unknown): Promise<TripQuote> {
    return this.executeWithLogging(async () => {
      // Validate input
      const tripData = this.validateInput(data, (d) => tripRequestSchema.parse(d))
      
      // Get vehicle information
      const vehicleInfo = VEHICLE_DATABASE[tripData.vehicleType]
      if (!vehicleInfo) {
        throw new ValidationError(`Invalid vehicle type: ${tripData.vehicleType}`)
      }

      // Validate passenger capacity
      if (tripData.passengers > vehicleInfo.capacity) {
        throw new ValidationError(
          `Too many passengers (${tripData.passengers}) for ${tripData.vehicleType} vehicle (max: ${vehicleInfo.capacity})`
        )
      }

      // Generate route (using demo data for MVP)
      const routeData = await this.generateRoute({
        departure: tripData.departure,
        destination: tripData.destination,
        vehicleType: tripData.vehicleType,
        passengers: tripData.passengers,
      })

      // Calculate pricing
      const basePrice = routeData.distance * vehicleInfo.pricePerKm
      const totalPrice = Math.round(basePrice * routeData.trafficMultiplier)

      // Save trip request to database
      let tripRequestId = `demo-${Date.now()}`
      try {
        const { id } = await databaseService.saveTripRequest(tripData)
        tripRequestId = id

        // Save quote to database
        await databaseService.saveTripQuote({
          trip_request_id: id,
          distance: routeData.distance,
          duration: routeData.formattedDuration,
          base_price: basePrice,
          total_price: totalPrice,
          route: routeData.route,
          vehicle_info: vehicleInfo,
        })
      } catch (error) {
        // Log error but don't fail the quote generation in demo mode
        this.logError(error, 'generateQuote.saveToDatabase', { tripData })
      }

      // Construct quote response
      const quote: TripQuote = {
        trip_request_id: tripRequestId,
        distance: routeData.distance,
        duration: routeData.formattedDuration,
        basePrice,
        totalPrice,
        route: routeData.route,
        vehicleInfo,
      }

      return quote
    }, 'generateQuote', { data })
  }

  /**
   * Generate route information (demo implementation)
   */
  private async generateRoute(data: RouteGenerationInput): Promise<{
    distance: number
    duration: number
    formattedDuration: string
    route: RouteStep[]
    trafficMultiplier: number
  }> {
    // Validate input
    const routeData = this.validateInput(data, (d) => routeGenerationSchema.parse(d))
    
    // In a real implementation, this would call external mapping APIs
    // For demo purposes, we'll use the existing demo data
    const { getDemoRoute } = await import('@/lib/demo-data')
    const demoRoute = getDemoRoute(routeData.departure, routeData.destination)
    
    // Add realistic delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    
    const durationMinutes = parseInt(demoRoute.duration.replace(/[^\d]/g, '')) || 30
    
    const route: RouteStep[] = demoRoute.route.map(step => ({
      instruction: step.instruction,
      distance: step.distance,
      duration: step.duration
    }))

    return {
      distance: demoRoute.distance,
      duration: durationMinutes,
      formattedDuration: `${durationMinutes} minutes`,
      route,
      trafficMultiplier: demoRoute.trafficMultiplier,
    }
  }

  /**
   * Get existing trip quote by ID
   */
  async getQuote(tripRequestId: string): Promise<TripQuote | null> {
    return this.executeWithLogging(async () => {
      try {
        const [tripRequest, tripQuote] = await Promise.all([
          databaseService.getTripRequest(tripRequestId),
          databaseService.getTripQuote(tripRequestId),
        ])

        return {
          trip_request_id: tripRequest.id,
          distance: tripQuote.distance,
          duration: tripQuote.duration,
          basePrice: tripQuote.base_price,
          totalPrice: tripQuote.total_price,
          route: tripQuote.route,
          vehicleInfo: tripQuote.vehicle_info,
        }
      } catch (error) {
        // Return null if quote not found instead of throwing
        if (error instanceof Error && error.message.includes('not found')) {
          return null
        }
        throw error
      }
    }, 'getQuote', { tripRequestId })
  }

  /**
   * Update trip quote
   */
  async updateQuote(tripRequestId: string, updates: Partial<{
    passengers: number
    vehicleType: 'standard' | 'premium' | 'suv'
    specialRequests: string
  }>): Promise<TripQuote> {
    return this.executeWithLogging(async () => {
      // Get existing trip data
      const existingTrip = await databaseService.getTripRequest(tripRequestId)
      
      // Merge updates with existing data
      const updatedTripData: TripRequestInput = {
        ...existingTrip,
        passengers: updates.passengers ?? existingTrip.passengers,
        vehicleType: updates.vehicleType ?? existingTrip.vehicleType,
        specialRequests: updates.specialRequests ?? existingTrip.specialRequests,
      }

      // Regenerate quote with updated data
      const newQuote = await this.generateQuote(updatedTripData)
      
      return newQuote
    }, 'updateQuote', { tripRequestId, updates })
  }

  /**
   * Validate trip data without generating a quote
   */
  async validateTripData(data: unknown): Promise<{ valid: true; data: TripRequestInput } | { valid: false; errors: string[] }> {
    try {
      const validatedData = tripRequestSchema.parse(data)
      
      // Additional business logic validation
      const vehicleInfo = VEHICLE_DATABASE[validatedData.vehicleType]
      if (validatedData.passengers > vehicleInfo.capacity) {
        return {
          valid: false,
          errors: [`Too many passengers (${validatedData.passengers}) for ${validatedData.vehicleType} vehicle (max: ${vehicleInfo.capacity})`]
        }
      }

      // Validate date is not in the past
      const requestDate = new Date(validatedData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (requestDate < today) {
        return {
          valid: false,
          errors: ['Trip date cannot be in the past']
        }
      }

      return { valid: true, data: validatedData }
    } catch (error) {
      const errorMessages = error instanceof Error 
        ? [error.message]
        : ['Invalid trip data']
      
      return { valid: false, errors: errorMessages }
    }
  }

  /**
   * Get available vehicle types with their specifications
   */
  getAvailableVehicles(): VehicleInfo[] {
    return Object.values(VEHICLE_DATABASE)
  }

  /**
   * Calculate pricing for a route
   */
  calculatePricing(distance: number, vehicleType: string, trafficMultiplier = 1.0): {
    basePrice: number
    totalPrice: number
    pricePerKm: number
  } {
    const vehicleInfo = VEHICLE_DATABASE[vehicleType]
    if (!vehicleInfo) {
      throw new ValidationError(`Invalid vehicle type: ${vehicleType}`)
    }

    const basePrice = distance * vehicleInfo.pricePerKm
    const totalPrice = Math.round(basePrice * trafficMultiplier)

    return {
      basePrice,
      totalPrice,
      pricePerKm: vehicleInfo.pricePerKm,
    }
  }
}

// Export singleton instance
export const tripService = new TripService()