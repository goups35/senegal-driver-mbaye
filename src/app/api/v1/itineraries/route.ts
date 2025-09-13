import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { createApiResponse, ApiError } from '@/lib/errors'
import { rateLimitCheck, rateLimitPresets } from '@/lib/middleware/rate-limit'
import { z } from 'zod'

const saveItinerarySchema = z.object({
  recommendation: z.record(z.unknown()),
  extractedInfo: z.record(z.unknown()),
  conversationalResponse: z.string().min(1).max(5000),
  clientName: z.string().max(100).optional(),
  clientPhone: z.string().max(20).optional()
})

const getItinerarySchema = z.object({
  id: z.string().uuid('Invalid itinerary ID format')
})

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Rate limiting
    const rateLimitResult = await rateLimitCheck(request, rateLimitPresets.normal)

    if (!rateLimitResult.allowed) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', {
        retryAfter: rateLimitResult.retryAfter
      })
    }

    // Validate request body
    const body = await request.json()
    const validatedData = saveItinerarySchema.parse(body)
    const { recommendation, extractedInfo, conversationalResponse, clientName, clientPhone } = validatedData

    logger.info('Itinerary save request received', {
      requestId,
      hasClientName: !!clientName,
      hasClientPhone: !!clientPhone,
      responseLength: conversationalResponse.length
    })

    // Extraire les informations principales
    const destinations = recommendation.itinerary?.destinations || []
    const mainDestinations = destinations.slice(0, 3).map((d: any) => ({
      id: d.id,
      name: d.name,
      region: d.region,
      type: d.type
    }))

    const duration = extractedInfo.dates?.duration || recommendation.itinerary?.duration || 7
    const groupSize = extractedInfo.groupInfo?.size || 1
    
    // Générer le titre automatiquement
    const destinationNames = mainDestinations.map((d: any) => d.name).join(' + ')
    const title = `${destinationNames} (${duration}j)`

    // Extraire budget
    const budgetMin = recommendation.itinerary?.totalCost?.min || null
    const budgetMax = recommendation.itinerary?.totalCost?.max || null
    const budgetCurrency = recommendation.itinerary?.totalCost?.currency || 'FCFA'

    // Générer le message WhatsApp optimisé
    const whatsappMessage = generateWhatsAppMessage({
      destinations: mainDestinations,
      duration,
      budget: budgetMin && budgetMax ? `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} ${budgetCurrency}` : 'Sur mesure',
      groupSize,
      clientName: clientName || 'Voyageur'
    })

    logger.debug('Itinerary data prepared', {
      requestId,
      title,
      destinationCount: mainDestinations.length,
      duration,
      groupSize,
      hasBudget: !!(budgetMin && budgetMax)
    })

    // Sauvegarder en base avec gestion d'erreur améliorée
    const { data, error } = await supabase
      .from('saved_itineraries')
      .insert({
        title,
        client_name: clientName,
        client_phone: clientPhone,
        destinations: mainDestinations,
        itinerary_data: recommendation,
        ai_recommendation: {
          response: conversationalResponse,
          extractedInfo,
          timestamp: new Date().toISOString(),
          requestId
        },
        whatsapp_message: whatsappMessage,
        duration: parseInt(duration.toString()),
        budget_min: budgetMin,
        budget_max: budgetMax,
        budget_currency: budgetCurrency,
        group_size: groupSize,
        status: 'draft', // Add status tracking
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Database error saving itinerary', {
        requestId,
        error: error.message,
        code: error.code,
        details: error.details
      })

      throw new ApiError(
        'Failed to save itinerary to database',
        500,
        'DATABASE_SAVE_ERROR',
        { dbError: error.message }
      )
    }

    const responseData = {
      success: true,
      itinerary: {
        id: data.id,
        title,
        whatsappMessage,
        planningUrl: `/planning/${data.id}`,
        createdAt: new Date().toISOString()
      },
      statistics: {
        destinationCount: mainDestinations.length,
        duration,
        groupSize,
        estimatedCost: budgetMin && budgetMax ? {
          min: budgetMin,
          max: budgetMax,
          currency: budgetCurrency
        } : null
      }
    }

    logger.info('Itinerary saved successfully', {
      requestId,
      itineraryId: data.id,
      title,
      processingTime: Date.now() - startTime
    })

    return createApiResponse(responseData, {
      requestId,
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    logger.error('Save itinerary error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      processingTime: Date.now() - startTime
    })

    if (error instanceof ApiError) {
      return error.toResponse({ requestId })
    }

    if (error instanceof z.ZodError) {
      throw new ApiError(
        'Invalid itinerary data',
        400,
        'VALIDATION_ERROR',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      )
    }

    throw new ApiError(
      'Failed to save itinerary',
      500,
      'ITINERARY_SAVE_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}

// GET pour récupérer un itinéraire sauvegardé
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Rate limiting
    const rateLimitResult = await rateLimitCheck(request, rateLimitPresets.lenient)

    if (!rateLimitResult.allowed) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', {
        retryAfter: rateLimitResult.retryAfter
      })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new ApiError(
        'Itinerary ID is required',
        400,
        'MISSING_ITINERARY_ID'
      )
    }

    // Validate ID format
    const { id: validatedId } = getItinerarySchema.parse({ id })

    logger.info('Itinerary retrieval request', {
      requestId,
      itineraryId: validatedId
    })

    const { data, error } = await supabase
      .from('saved_itineraries')
      .select(`
        id,
        title,
        client_name,
        client_phone,
        destinations,
        itinerary_data,
        ai_recommendation,
        whatsapp_message,
        duration,
        budget_min,
        budget_max,
        budget_currency,
        group_size,
        status,
        created_at,
        updated_at
      `)
      .eq('id', validatedId)
      .single()

    if (error || !data) {
      logger.warn('Itinerary not found', {
        requestId,
        itineraryId: validatedId,
        error: error?.message
      })

      throw new ApiError(
        'Itinerary not found',
        404,
        'ITINERARY_NOT_FOUND',
        { itineraryId: validatedId }
      )
    }

    // Enrich response with computed fields
    const enrichedData = {
      ...data,
      planningUrl: `/planning/${data.id}`,
      whatsappUrl: `https://wa.me/33626388794?text=${encodeURIComponent(data.whatsapp_message)}`,
      summary: {
        destinationCount: data.destinations?.length || 0,
        hasBudget: !!(data.budget_min && data.budget_max),
        estimatedDuration: data.duration,
        groupSize: data.group_size
      }
    }

    logger.info('Itinerary retrieved successfully', {
      requestId,
      itineraryId: validatedId,
      title: data.title,
      processingTime: Date.now() - startTime
    })

    return createApiResponse(enrichedData, {
      requestId,
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    logger.error('Get itinerary error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      processingTime: Date.now() - startTime
    })

    if (error instanceof ApiError) {
      return error.toResponse({ requestId })
    }

    if (error instanceof z.ZodError) {
      throw new ApiError(
        'Invalid itinerary ID format',
        400,
        'VALIDATION_ERROR',
        error.errors
      )
    }

    throw new ApiError(
      'Failed to retrieve itinerary',
      500,
      'ITINERARY_FETCH_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}

function generateWhatsAppMessage({ destinations, duration, budget, groupSize, clientName }: {
  destinations: any[]
  duration: number | string
  budget: string
  groupSize: number
  clientName: string
}): string {
  const destinationNames = destinations.map(d => d.name).join(', ')
  
  return `🇸🇳 Salut Mbaye ! ${clientName} souhaite réserver un voyage au Sénégal :

📍 Destinations : ${destinationNames}
📅 Durée : ${duration} jours
👥 Voyageurs : ${groupSize} personne${groupSize > 1 ? 's' : ''}
💰 Budget : ${budget}

Peux-tu me confirmer la disponibilité et envoyer les détails pratiques ?

Merci ! 🙏

---
Planning généré via Transport Sénégal`
}