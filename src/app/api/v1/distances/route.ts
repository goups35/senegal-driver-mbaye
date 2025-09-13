import { NextRequest, NextResponse } from 'next/server'
import { getDistanceBetweenCities, getAllDistances } from '@/lib/distances'
import { logger } from '@/lib/logger'
import { createApiResponse, ApiError } from '@/lib/errors'
import { rateLimitCheck, rateLimitPresets } from '@/lib/middleware/rate-limit'
import { z } from 'zod'

const distanceRequestSchema = z.object({
  from: z.string().min(1).max(100).transform(s => s.trim()),
  to: z.string().min(1).max(100).transform(s => s.trim())
})

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    
    logger.info('Distance API request', {
      requestId,
      from,
      to,
      hasParams: !!(from && to)
    })

    // Si pas de paramètres, retourner toutes les distances
    if (!from || !to) {
      logger.debug('Fetching all distances', { requestId })
      
      const allDistances = await getAllDistances()
      
      logger.info('All distances retrieved successfully', {
        requestId,
        distanceCount: allDistances.length,
        processingTime: Date.now() - startTime
      })

      return createApiResponse({
        distances: allDistances,
        totalCount: allDistances.length
      }, {
        requestId,
        processingTime: Date.now() - startTime
      })
    }
    
    // Valider les paramètres
    const { from: fromCity, to: toCity } = distanceRequestSchema.parse({ from, to })
    
    logger.debug('Fetching distance between cities', {
      requestId,
      fromCity,
      toCity
    })

    // Rechercher la distance entre les deux villes
    const distance = await getDistanceBetweenCities(fromCity, toCity)
    
    if (!distance) {
      throw new ApiError(
        `Distance non trouvée entre ${fromCity} et ${toCity}`,
        404,
        'DISTANCE_NOT_FOUND',
        { from: fromCity, to: toCity }
      )
    }

    logger.info('Distance found successfully', {
      requestId,
      fromCity,
      toCity,
      distance: distance.distance,
      processingTime: Date.now() - startTime
    })
    
    return createApiResponse({
      distance,
      from: fromCity,
      to: toCity
    }, {
      requestId,
      processingTime: Date.now() - startTime
    })
    
  } catch (error) {
    logger.error('Distance API error', {
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
        'Paramètres invalides',
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
      'Erreur lors de la récupération des distances',
      500,
      'DISTANCE_FETCH_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}