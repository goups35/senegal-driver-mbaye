/**
 * @jest-environment node
 */

import { POST } from '@/app/api/distances/route'
import { createMockRequest, expectSuccessResponse, expectErrorResponse } from '../../utils/api-test-utils'

// Mock the distances utilities
jest.mock('@/lib/distances', () => ({
  calculateDistance: jest.fn().mockReturnValue({
    distance: 320,
    duration: '4h 30min',
    route: [
      { instruction: 'Départ de Dakar', distance: '0 km', duration: '0 min' },
      { instruction: 'Prendre A1 vers Saint-Louis', distance: '320 km', duration: '4h 30min' },
      { instruction: 'Arrivée à Saint-Louis', distance: '0 km', duration: '0 min' }
    ]
  })
}))

describe('/api/distances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/distances', () => {
    describe('Success Cases', () => {
      it('should calculate distance between two cities', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('distance', 320)
        expect(data).toHaveProperty('duration', '4h 30min')
        expect(data).toHaveProperty('route')
        expect(Array.isArray(data.route)).toBe(true)
        expect(data.route).toHaveLength(3)
        
        data.route.forEach((step: any) => {
          expect(step).toHaveProperty('instruction')
          expect(step).toHaveProperty('distance')
          expect(step).toHaveProperty('duration')
        })
      })

      it('should handle different city combinations', async () => {
        const testCases = [
          { departure: 'Dakar', destination: 'Thiès' },
          { departure: 'Saint-Louis', destination: 'Tambacounda' },
          { departure: 'Ziguinchor', destination: 'Kolda' }
        ]

        for (const testCase of testCases) {
          const request = createMockRequest({
            method: 'POST',
            body: testCase
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(200)
          expect(data).toHaveProperty('distance')
          expect(data).toHaveProperty('duration')
          expect(data).toHaveProperty('route')
        }
      })

      it('should handle case-insensitive city names', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'dakar',
            destination: 'SAINT-LOUIS'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('distance')
        expect(data).toHaveProperty('duration')
      })

      it('should handle cities with special characters', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Thiès',
            destination: 'Kaédi'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('distance')
        expect(data).toHaveProperty('duration')
      })
    })

    describe('Error Handling', () => {
      it('should return 400 for missing departure', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Departure is required')
      })

      it('should return 400 for missing destination', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar'
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Destination is required')
      })

      it('should return 400 for empty departure', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: '',
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Departure is required')
      })

      it('should return 400 for empty destination', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: ''
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Destination is required')
      })

      it('should handle calculation errors', async () => {
        const { calculateDistance } = require('@/lib/distances')
        calculateDistance.mockImplementationOnce(() => {
          throw new Error('Distance calculation failed')
        })

        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Error calculating distance')
      })

      it('should handle JSON parsing errors', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: 'invalid-json'
        })

        request.json = jest.fn(() => Promise.reject(new SyntaxError('Invalid JSON')))

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Error calculating distance')
      })
    })

    describe('Edge Cases', () => {
      it('should handle same departure and destination', async () => {
        const { calculateDistance } = require('@/lib/distances')
        calculateDistance.mockReturnValueOnce({
          distance: 0,
          duration: '0 min',
          route: [
            { instruction: 'Déjà arrivé à destination', distance: '0 km', duration: '0 min' }
          ]
        })

        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: 'Dakar'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.distance).toBe(0)
        expect(data.duration).toBe('0 min')
      })

      it('should handle very long city names', async () => {
        const longCityName = 'A'.repeat(100)
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: longCityName,
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        
        // Should either succeed or return a meaningful error
        expect([200, 400, 500]).toContain(response.status)
      })

      it('should handle cities with numbers and symbols', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar-123',
            destination: 'Saint-Louis & Co'
          }
        })

        const response = await POST(request)
        
        // Should handle gracefully
        expect([200, 400]).toContain(response.status)
      })

      it('should handle unknown cities gracefully', async () => {
        const { calculateDistance } = require('@/lib/distances')
        calculateDistance.mockReturnValueOnce({
          distance: 0,
          duration: 'Unknown',
          route: [
            { instruction: 'Route inconnue', distance: '0 km', duration: '0 min' }
          ]
        })

        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'UnknownCity1',
            destination: 'UnknownCity2'
          }
        })

        const response = await POST(request)
        
        expect(response.status).toBe(200)
      })
    })

    describe('Input Validation', () => {
      it('should trim whitespace from city names', async () => {
        const { calculateDistance } = require('@/lib/distances')
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: '  Dakar  ',
            destination: '  Saint-Louis  '
          }
        })

        const response = await POST(request)
        
        expect(response.status).toBe(200)
        expect(calculateDistance).toHaveBeenCalledWith('Dakar', 'Saint-Louis')
      })

      it('should handle null values', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: null,
            destination: 'Saint-Louis'
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Departure is required')
      })

      it('should handle undefined values', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: undefined
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Destination is required')
      })

      it('should handle non-string values', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            departure: 123,
            destination: ['Saint-Louis']
          }
        })

        const response = await POST(request)
        
        // Should handle type conversion or validation error
        expect([400, 500]).toContain(response.status)
      })
    })
  })

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({
        method: 'POST',
        body: {
          departure: 'Dakar',
          destination: 'Saint-Louis'
        }
      })

      const response = await POST(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(3000) // Should respond within 3 seconds
    }, 10000)

    it('should handle multiple simultaneous requests', async () => {
      const requests = Array.from({ length: 5 }, () => 
        createMockRequest({
          method: 'POST',
          body: {
            departure: 'Dakar',
            destination: 'Saint-Louis'
          }
        })
      )

      const responses = await Promise.all(
        requests.map(request => POST(request))
      )

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })
  })
})
