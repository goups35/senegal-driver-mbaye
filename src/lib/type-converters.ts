import type { TripRequest } from '@/types'
import type { TripRequestInput } from '@/schemas/trip'

/**
 * Convertit TripRequestInput (données de formulaire) vers TripRequest (données Context)
 * Cette fonction résout l'incompatibilité de types entre les formulaires et le Context
 */
export function convertTripRequestInputToTripRequest(input: TripRequestInput): TripRequest {
  return {
    ...input,
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  }
}

/**
 * Convertit TripRequest vers TripRequestInput (pour l'édition de formulaires)
 * Supprime les champs techniques pour pouvoir réutiliser dans un formulaire
 */
export function convertTripRequestToTripRequestInput(tripRequest: TripRequest): TripRequestInput {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, ...inputData } = tripRequest
  return inputData
}

/**
 * Vérifie si les données sont compatibles entre les deux types
 */
export function isCompatibleTripData(data: unknown): data is TripRequestInput {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>

  return (
    typeof obj.date === 'string' &&
    typeof obj.passengers === 'number' &&
    typeof obj.duration === 'number' &&
    typeof obj.customerName === 'string' &&
    typeof obj.customerPhone === 'string' &&
    typeof obj.customerEmail === 'string'
  )
}