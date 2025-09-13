/**
 * @jest-environment node
 */

import { POST } from '@/app/api/trips/quote/route'
import { 
  createMockRequest, 
  expectSuccessResponse, 
  expectErrorResponse,
  mockTripData,
  setupTestDatabase,
  cleanupTestDatabase
} from '../../utils/api-test-utils'

// Mock external dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-trip-123' },
            error: null
          }))
        }))
      }))
    }))
  }
}))

jest.mock('@/lib/demo-data', () => ({
  getDemoRoute: jest.fn(() => ({
    distance: 320,
    duration: '4h 30min',
    route: [
      { instruction: 'Départ de Dakar', distance: '0 km', duration: '0 min' },
      { instruction: 'Prendre A1 vers Saint-Louis', distance: '320 km', duration: '4h 30min' },
      { instruction: 'Arrivée à Saint-Louis', distance: '0 km', duration: '0 min' }
    ],
    trafficMultiplier: 1.1
  }))
}))

describe('/api/trips/quote', () => {
  beforeEach(async () => {
    await setupTestDatabase()
    // Set up environment for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  afterEach(async () => {
    await cleanupTestDatabase()
    jest.clearAllMocks()
  })

  describe('POST /api/trips/quote', () => {
    it('should generate a valid trip quote for standard vehicle', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.valid
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      
      // Verify response structure
      expect(data).toHaveProperty('trip_request_id')
      expect(data).toHaveProperty('distance', 320)
      expect(data).toHaveProperty('duration', '270 minutes')
      expect(data).toHaveProperty('basePrice')
      expect(data).toHaveProperty('totalPrice')
      expect(data).toHaveProperty('route')
      expect(data).toHaveProperty('vehicleInfo')
      
      // Verify vehicle info
      expect(data.vehicleInfo).toEqual({
        type: 'standard',
        name: 'Hyundai Accent / Toyota Vitz',
        capacity: 4,
        features: ['Climatisation', 'Radio', 'Ceintures de sécurité'],
        pricePerKm: 500
      })
      
      // Verify pricing calculation
      expect(data.basePrice).toBe(160000) // 320km * 500 CFA
      expect(data.totalPrice).toBe(176000) // basePrice * 1.1 traffic multiplier
      
      // Verify route structure
      expect(Array.isArray(data.route)).toBe(true)
      expect(data.route.length).toBeGreaterThan(0)
      data.route.forEach((step: any) => {
        expect(step).toHaveProperty('instruction')
        expect(step).toHaveProperty('distance')
        expect(step).toHaveProperty('duration')
      })
    })

    it('should generate quote for premium vehicle with correct pricing', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          ...mockTripData.valid,
          vehicleType: 'premium'
        }
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.vehicleInfo.type).toBe('premium')
      expect(data.vehicleInfo.pricePerKm).toBe(750)
      expect(data.basePrice).toBe(240000) // 320km * 750 CFA
      expect(data.totalPrice).toBe(264000) // basePrice * 1.1
    })

    it('should generate quote for SUV with correct pricing', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          ...mockTripData.valid,
          vehicleType: 'suv'
        }
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.vehicleInfo.type).toBe('suv')
      expect(data.vehicleInfo.pricePerKm).toBe(900)
      expect(data.basePrice).toBe(288000) // 320km * 900 CFA
      expect(data.totalPrice).toBe(316800) // basePrice * 1.1
    })

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.invalid.missingFields
      })

      const response = await POST(request)
      
      await expectErrorResponse(response, 400, 'Données invalides')
    })

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.invalid.invalidEmail
      })

      const response = await POST(request)
      
      await expectErrorResponse(response, 400, 'Données invalides')
    })

    it('should return 400 for invalid passenger count', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.invalid.invalidPassengers
      })

      const response = await POST(request)
      
      await expectErrorResponse(response, 400, 'Données invalides')
    })

    it('should handle invalid vehicle type', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          ...mockTripData.valid,
          vehicleType: 'invalid-type'
        }
      })

      const response = await POST(request)
      
      await expectErrorResponse(response, 400, 'Données invalides')
    })

    it('should work in demo mode without database', async () => {
      // Remove database environment
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.valid
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.trip_request_id).toMatch(/^demo-/)
    })

    it('should handle JSON parsing errors', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: 'invalid-json'
      })

      // Override the json method to simulate parsing error
      const originalJson = request.json
      request.json = jest.fn(() => Promise.reject(new SyntaxError('Invalid JSON')))

      const response = await POST(request)
      
      await expectErrorResponse(response, 500, 'Erreur lors de la génération du devis')
    })

    it('should handle large passenger groups correctly', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          ...mockTripData.valid,
          passengers: 8,
          vehicleType: 'suv' // SUV can handle 7+ passengers
        }
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.vehicleInfo.capacity).toBe(7)
    })

    it('should handle edge case destinations', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          ...mockTripData.valid,
          departure: 'Remote Village',
          destination: 'Unknown Destination'
        }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      // Should still work with demo data fallback
    })

    it('should include all required vehicle features', async () => {
      const vehicleTypes = ['standard', 'premium', 'suv']
      
      for (const vehicleType of vehicleTypes) {
        const request = createMockRequest({
          method: 'POST',
          body: {
            ...mockTripData.valid,
            vehicleType
          }
        })

        const response = await POST(request)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(Array.isArray(data.vehicleInfo.features)).toBe(true)
        expect(data.vehicleInfo.features.length).toBeGreaterThan(0)
        expect(data.vehicleInfo.features).toContain('Climatisation')
      }
    })
  })

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({
        method: 'POST',
        body: mockTripData.valid
      })

      const response = await POST(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(3000) // Should respond within 3 seconds
    }, 10000)
  })
})