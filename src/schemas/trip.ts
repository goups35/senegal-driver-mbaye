import { z } from 'zod'

export const tripRequestSchema = z.object({
  departure: z.string().min(1, 'Le lieu de départ est requis'),
  destination: z.string().min(1, 'La destination est requise'),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  passengers: z.number().min(1, 'Au moins 1 passager').max(8, 'Maximum 8 passagers'),
  vehicleType: z.enum(['standard', 'premium', 'suv'], {
    errorMap: () => ({ message: 'Type de véhicule invalide' })
  }),
  customerName: z.string().min(1, 'Le nom est requis'),
  customerPhone: z.string().min(9, 'Numéro de téléphone invalide'),
  customerEmail: z.string().email('Email invalide').optional(),
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