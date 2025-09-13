import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, ValidationError } from '@/lib/errors'
import { tripService } from '@/lib/services/trip'
import { log, getRequestContext, startTimer } from '@/lib/logger'
import { tripRequestSchema } from '@/schemas/validation'
import type { TripQuote } from '@/types'

/**
 * Generate a trip quote based on the request
 * POST /api/v1/trips/quote
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const requestContext = getRequestContext(request)
  const timer = startTimer('trip_quote_generation')
  
  log.info('Trip quote request received', requestContext)

  try {
    // Parse request body
    const body = await request.json()
    
    log.debug('Parsing trip request data', {
      ...requestContext,
      hasData: !!body,
      dataKeys: body ? Object.keys(body) : [],
    })

    // Validate input using enhanced validation
    let tripData
    try {
      tripData = tripRequestSchema.parse(body)
      log.debug('Trip request data validated successfully', {
        ...requestContext,
        departure: tripData.departure,
        destination: tripData.destination,
        vehicleType: tripData.vehicleType,
        passengers: tripData.passengers,
      })
    } catch (validationError) {
      log.warn('Trip request validation failed', {
        ...requestContext,
        error: validationError instanceof Error ? validationError.message : 'Unknown validation error',
      })
      throw validationError
    }

    // Generate the quote
    const quote = await tripService.generateQuote(tripData)
    
    const duration = timer.end()
    
    log.info('Trip quote generated successfully', {
      ...requestContext,
      tripRequestId: quote.trip_request_id,
      distance: quote.distance,
      totalPrice: quote.totalPrice,
      vehicleType: quote.vehicleInfo.type,
      duration,
    })

    // Return the quote
    return NextResponse.json({
      success: true,
      data: quote,
      requestId: requestContext.requestId,
      timestamp: new Date().toISOString(),
    }, { 
      status: 200,
      headers: {
        'X-Response-Time': `${duration}ms`,
      }
    })

  } catch (error) {
    const duration = timer.end()
    
    log.error('Trip quote generation failed', {
      ...requestContext,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    })
    
    // Re-throw to be handled by withErrorHandling
    throw error
  }
})

/**
 * Get available vehicle types
 * GET /api/v1/trips/quote
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestContext = getRequestContext(request)
  const timer = startTimer('get_vehicle_types')
  
  log.debug('Vehicle types request received', requestContext)

  try {
    const vehicles = tripService.getAvailableVehicles()
    
    const duration = timer.end()
    
    log.debug('Vehicle types retrieved successfully', {
      ...requestContext,
      vehicleCount: vehicles.length,
      duration,
    })

    return NextResponse.json({
      success: true,
      data: {
        vehicles,
        count: vehicles.length,
      },
      requestId: requestContext.requestId,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'X-Response-Time': `${duration}ms`,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    })

  } catch (error) {
    const duration = timer.end()
    
    log.error('Failed to retrieve vehicle types', {
      ...requestContext,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    })
    
    throw error
  }
})