import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Sanitization helpers
const sanitizeString = (value: string): string => {
  // Remove potentially dangerous characters and normalize whitespace
  return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .slice(0, 1000) // Prevent extremely long strings
}

const sanitizeHtml = (value: string, allowedTags: string[] = []): string => {
  return DOMPurify.sanitize(value.trim(), { 
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'alt']
  }).slice(0, 5000)
}

// Custom Zod transforms for sanitization
const sanitizedString = (maxLength: number = 1000) => 
  z.string().transform(sanitizeString).refine(
    (val) => val.length <= maxLength,
    { message: `String must be ${maxLength} characters or less` }
  )

const phoneSchema = z.string()
  .transform(sanitizeString)
  .refine((val) => {
    // Senegalese phone number patterns
    const patterns = [
      /^(\+221)?[0-9]{9}$/, // Senegal format
      /^(\+33)?[0-9]{9,10}$/, // French format
      /^\+[1-9]\d{1,14}$/, // International format
    ]
    return patterns.some(pattern => pattern.test(val.replace(/\s/g, '')))
  }, {
    message: 'Format de téléphone invalide (ex: +221701234567 ou +33612345678)'
  })

const emailSchema = z.string()
  .transform(sanitizeString)
  .email('Format email invalide')
  .refine((val) => val.length <= 254, {
    message: 'Email trop long'
  })

const dateSchema = z.string()
  .transform(sanitizeString)
  .refine((val) => {
    // Accept ISO date format or DD/MM/YYYY
    const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(val)
    const frenchDate = /^\d{2}\/\d{2}\/\d{4}$/.test(val)
    
    if (isoDate || frenchDate) {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date >= new Date()
    }
    return false
  }, {
    message: 'Date invalide ou dans le passé (format: YYYY-MM-DD ou DD/MM/YYYY)'
  })

const timeSchema = z.string()
  .transform(sanitizeString)
  .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
    message: 'Heure invalide (format: HH:MM)'
  })

// Enhanced trip schemas with sanitization
export const tripRequestSchema = z.object({
  departure: sanitizedString(100)
    .min(2, 'Le lieu de départ doit contenir au moins 2 caractères')
    .refine((val) => !/^[0-9]+$/.test(val), {
      message: 'Le lieu de départ ne peut pas être uniquement des chiffres'
    }),
  
  destination: sanitizedString(100)
    .min(2, 'La destination doit contenir au moins 2 caractères')
    .refine((val) => !/^[0-9]+$/.test(val), {
      message: 'La destination ne peut pas être uniquement des chiffres'
    }),
  
  date: dateSchema,
  time: timeSchema,
  
  passengers: z.number()
    .int('Le nombre de passagers doit être un entier')
    .min(1, 'Au moins 1 passager requis')
    .max(8, 'Maximum 8 passagers autorisés'),
  
  vehicleType: z.enum(['standard', 'premium', 'suv'], {
    errorMap: () => ({ message: 'Type de véhicule invalide (standard, premium, ou suv)' })
  }),
  
  customerName: sanitizedString(50)
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .refine((val) => /^[a-zA-ZÀ-ÿ\s\-']+$/.test(val), {
      message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    }),
  
  customerPhone: phoneSchema,
  
  customerEmail: emailSchema.optional(),
  
  specialRequests: sanitizedString(500).optional()
    .transform((val) => val === '' ? undefined : val),
})

export const routeGenerationSchema = z.object({
  departure: sanitizedString(100).min(2),
  destination: sanitizedString(100).min(2),
  vehicleType: z.enum(['standard', 'premium', 'suv']),
  passengers: z.number().int().min(1).max(8),
})

// AI chat message validation
export const aiChatMessageSchema = z.object({
  message: sanitizedString(2000)
    .min(1, 'Le message ne peut pas être vide')
    .refine((val) => val.trim().length > 0, {
      message: 'Le message doit contenir du contenu'
    }),
  
  conversationHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: sanitizedString(5000),
    timestamp: z.string().datetime(),
    metadata: z.record(z.unknown()).optional(),
  })).max(50, 'Historique de conversation trop long').optional(),
  
  clientPreferences: z.object({
    interests: z.array(z.string()).max(10).optional(),
    culturalImmersionLevel: z.enum(['low', 'moderate', 'high']).optional(),
    activityLevel: z.enum(['relaxed', 'moderate', 'active']).optional(),
    accommodationPreference: z.enum(['budget', 'mid-range', 'luxury']).optional(),
    dietaryRestrictions: z.array(z.string()).max(5).optional(),
    languagePreference: z.array(z.string()).max(3).optional(),
    transportComfort: z.enum(['basic', 'standard', 'premium']).optional(),
  }).optional(),
  
  context: z.enum([
    'initial_inquiry',
    'preference_gathering',
    'itinerary_proposal',
    'practical_details',
    'modification_request',
    'booking_confirmation'
  ]).optional(),
})

// Email quote validation
export const emailQuoteSchema = z.object({
  tripRequestId: z.string().uuid('ID de demande invalide'),
  
  recipientEmail: emailSchema,
  
  recipientName: sanitizedString(50)
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  
  personalMessage: sanitizedString(1000).optional()
    .transform((val) => val === '' ? undefined : val),
  
  includeWhatsAppContact: z.boolean().default(true),
})

// Database record validation schemas
export const tripQuoteDbSchema = z.object({
  trip_request_id: z.string().uuid(),
  distance: z.number().positive(),
  duration: z.string(),
  base_price: z.number().positive(),
  total_price: z.number().positive(),
  route: z.array(z.object({
    instruction: sanitizedString(200),
    distance: z.string(),
    duration: z.string(),
  })),
  vehicle_info: z.object({
    type: z.enum(['standard', 'premium', 'suv']),
    name: sanitizedString(100),
    capacity: z.number().int().positive(),
    features: z.array(sanitizedString(50)),
    pricePerKm: z.number().positive(),
  }),
  created_at: z.string().datetime().optional(),
})

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  }).optional(),
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
})

// Health check schema
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  timestamp: z.string().datetime(),
  services: z.record(z.object({
    status: z.enum(['up', 'down', 'degraded']),
    responseTime: z.number().optional(),
    error: z.string().optional(),
  })),
  uptime: z.number().positive(),
})

// Export types
export type TripRequestInput = z.infer<typeof tripRequestSchema>
export type RouteGenerationInput = z.infer<typeof routeGenerationSchema>
export type AiChatMessageInput = z.infer<typeof aiChatMessageSchema>
export type EmailQuoteInput = z.infer<typeof emailQuoteSchema>
export type TripQuoteDb = z.infer<typeof tripQuoteDbSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type HealthCheck = z.infer<typeof healthCheckSchema>

// Validation helpers
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    }
  }
}