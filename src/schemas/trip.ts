import { z } from 'zod'

export const tripRequestSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  passengers: z.number().min(1, 'Au moins 1 passager').max(8, 'Maximum 8 passagers'),
  duration: z.number().min(1, 'Durée minimale 1 jour').max(30, 'Durée maximale 30 jours'),
  customerName: z.string().min(1, 'Le nom est requis'),
  customerPhone: z.string().min(9, 'Numéro de téléphone invalide'),
  customerEmail: z.string().email('Email invalide'),
  specialRequests: z.string().optional()
})

export const routeGenerationSchema = z.object({
  departure: z.string().min(1),
  destination: z.string().min(1),
  vehicleType: z.enum(['standard', 'premium', 'suv']),
  passengers: z.number().min(1).max(8)
})

export type TripRequestInput = z.infer<typeof tripRequestSchema>
export type RouteGenerationInput = z.infer<typeof routeGenerationSchema>