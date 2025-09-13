import { NextRequest } from 'next/server'
import { createRequest, createResponse } from 'node-mocks-http'

// Create mock NextRequest for API testing
export function createMockRequest(options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url?: string
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string>
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
    params = {}
  } = options

  // Create the request with proper URL structure
  const req = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // Cast to NextRequest (this works for testing purposes)
  const nextRequest = req as NextRequest
  
  // Add nextUrl property for route parameters
  nextRequest.nextUrl = new URL(url)
  
  // Mock the params if provided
  if (Object.keys(params).length > 0) {
    // Mock route params - this is a simplified version
    (nextRequest as any).params = params
  }

  return nextRequest
}

// API response validation helpers
export function expectSuccessResponse(response: Response, expectedData?: any) {
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('application/json')
  
  if (expectedData) {
    return response.json().then(data => {
      expect(data).toEqual(expectedData)
      return data
    })
  }
  
  return response.json()
}

export function expectErrorResponse(response: Response, expectedStatus: number, expectedError?: string) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
  
  return response.json().then(data => {
    expect(data).toHaveProperty('error')
    if (expectedError) {
      expect(data.error).toContain(expectedError)
    }
    return data
  })
}

// Mock external API responses
export const mockExternalAPIResponse = {
  openai: {
    success: {
      choices: [
        {
          message: {
            content: JSON.stringify({
              distance_km: 320,
              duration_minutes: 270,
              route_steps: [
                { instruction: 'Départ de Dakar', distance_km: 0, duration_minutes: 0 },
                { instruction: 'Prendre A1 vers Saint-Louis', distance_km: 320, duration_minutes: 270 },
              ],
              estimated_traffic_multiplier: 1.1
            })
          }
        }
      ]
    },
    error: {
      error: {
        message: 'API rate limit exceeded',
        type: 'rate_limit_error'
      }
    }
  },
  supabase: {
    insert: {
      success: { data: { id: 'test-123' }, error: null },
      error: { data: null, error: { message: 'Database connection failed' } }
    },
    select: {
      success: { 
        data: [{ 
          id: 'test-123', 
          departure: 'Dakar', 
          destination: 'Saint-Louis',
          created_at: '2024-12-15T10:00:00Z'
        }], 
        error: null 
      },
      empty: { data: [], error: null },
      error: { data: null, error: { message: 'Query failed' } }
    }
  }
}

// Test database setup/cleanup
export async function setupTestDatabase() {
  // In a real app, you might set up a test database here
  console.log('Setting up test database...')
}

export async function cleanupTestDatabase() {
  // Clean up test data
  console.log('Cleaning up test database...')
}

// Performance testing helpers
export function measureApiPerformance<T>(
  apiCall: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now()
  
  return apiCall().then(result => {
    const endTime = performance.now()
    return {
      result,
      duration: endTime - startTime
    }
  })
}

// Mock data generators
export const mockTripData = {
  valid: {
    departure: 'Dakar',
    destination: 'Saint-Louis',
    date: '2024-12-15',
    time: '09:00',
    passengers: 2,
    vehicleType: 'standard',
    customerName: 'John Doe',
    customerPhone: '+221701234567',
    customerEmail: 'john@example.com'
  },
  invalid: {
    missingFields: {
      departure: '',
      destination: 'Saint-Louis'
    },
    invalidEmail: {
      departure: 'Dakar',
      destination: 'Saint-Louis',
      date: '2024-12-15',
      time: '09:00',
      passengers: 2,
      vehicleType: 'standard',
      customerName: 'John Doe',
      customerPhone: '+221701234567',
      customerEmail: 'invalid-email'
    },
    invalidPassengers: {
      departure: 'Dakar',
      destination: 'Saint-Louis',
      date: '2024-12-15',
      time: '09:00',
      passengers: 0,
      vehicleType: 'standard',
      customerName: 'John Doe',
      customerPhone: '+221701234567'
    }
  }
}