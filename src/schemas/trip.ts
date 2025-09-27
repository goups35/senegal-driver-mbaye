import { z } from 'zod'

// Helper function for sanitizing strings
const sanitizeString = (value: string) => {
  return value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000) // Limit length
}

// Enhanced validation schema with security
export const tripRequestSchema = z.object({
  date: z.string()
    .min(1, 'La date est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .refine((date) => {
      const inputDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return inputDate >= today
    }, 'La date ne peut pas être dans le passé'),

  passengers: z.number()
    .int('Nombre entier requis')
    .min(1, 'Au moins 1 passager')
    .max(8, 'Maximum 8 passagers'),

  duration: z.number()
    .int('Nombre entier requis')
    .min(1, 'Durée minimale 1 jour')
    .max(30, 'Durée maximale 30 jours'),

  customerName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/, 'Le nom contient des caractères invalides')
    .transform(sanitizeString),

  customerPhone: z.string()
    .min(9, 'Numéro de téléphone trop court')
    .max(20, 'Numéro de téléphone trop long')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format de téléphone invalide')
    .transform(sanitizeString),

  customerEmail: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long')
    .toLowerCase()
    .transform(sanitizeString),

  specialRequests: z.string()
    .max(500, 'Les demandes spéciales ne peuvent dépasser 500 caractères')
    .transform(sanitizeString)
    .optional()
})

export const routeGenerationSchema = z.object({
  departure: z.string().min(1),
  destination: z.string().min(1),
  vehicleType: z.enum(['standard', 'premium', 'suv']),
  passengers: z.number().min(1).max(8)
})

export type TripRequestInput = z.infer<typeof tripRequestSchema>
export type RouteGenerationInput = z.infer<typeof routeGenerationSchema>