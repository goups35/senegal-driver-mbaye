/**
 * @jest-environment node
 */

import { POST } from '@/app/api/save-itinerary/route'
import { createMockRequest, expectSuccessResponse, expectErrorResponse } from '../../utils/api-test-utils'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'itinerary-123',
              title: 'Voyage au Sénégal - 7 jours',
              description: 'Itinéraire personnalisé',
              created_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('/api/save-itinerary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/save-itinerary', () => {
    const validItineraryData = {
      recommendation: {
        id: 'rec-123',
        itinerary: {
          name: 'Découverte du Sénégal',
          duration: 7,
          destinations: [
            {
              id: 'dakar',
              name: 'Dakar',
              description: 'Capitale du Sénégal'
            },
            {
              id: 'saint-louis',
              name: 'Saint-Louis',
              description: 'Ville historique'
            }
          ],
          totalCost: {
            min: 300000,
            max: 450000,
            currency: 'XOF'
          }
        }
      },
      extractedInfo: {
        groupInfo: { size: 2 },
        budget: { amount: 400000, currency: 'XOF' },
        dates: { duration: 7 }
      },
      conversationalResponse: 'Votre itinéraire est prêt !',
      clientName: 'John Doe',
      clientPhone: '+221701234567'
    }

    describe('Success Cases', () => {
      it('should save itinerary successfully', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: validItineraryData
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('success', true)
        expect(data).toHaveProperty('itineraryId', 'itinerary-123')
        expect(data).toHaveProperty('title')
        expect(data).toHaveProperty('whatsappMessage')
        expect(data).toHaveProperty('planningUrl')
        
        expect(data.title).toContain('Sénégal')
        expect(data.whatsappMessage).toContain('Bonjour Mbaye')
        expect(data.whatsappMessage).toContain('John Doe')
        expect(data.whatsappMessage).toContain('7 jours')
        expect(data.planningUrl).toContain('/planning/itinerary-123')
      })

      it('should handle missing optional fields', async () => {
        const minimalData = {
          recommendation: validItineraryData.recommendation,
          extractedInfo: validItineraryData.extractedInfo,
          conversationalResponse: validItineraryData.conversationalResponse
        }

        const request = createMockRequest({
          method: 'POST',
          body: minimalData
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('success', true)
        expect(data.whatsappMessage).toContain('Voyageur') // Default name
      })

      it('should generate appropriate WhatsApp message format', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: validItineraryData
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toMatch(/Bonjour Mbaye!/)
        expect(data.whatsappMessage).toContain('souhaite réserver')
        expect(data.whatsappMessage).toContain('Découverte du Sénégal')
        expect(data.whatsappMessage).toContain('7 jours')
        expect(data.whatsappMessage).toContain('Dakar, Saint-Louis')
        expect(data.whatsappMessage).toContain('300.000 - 450.000 FCFA')
        expect(data.whatsappMessage).toContain('John Doe')
        expect(data.whatsappMessage).toContain('+221701234567')
      })

      it('should handle different group sizes', async () => {
        const dataWithLargeGroup = {
          ...validItineraryData,
          extractedInfo: {
            ...validItineraryData.extractedInfo,
            groupInfo: { size: 6 }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithLargeGroup
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toContain('6 personnes')
      })

      it('should handle different currencies', async () => {
        const dataWithEUR = {
          ...validItineraryData,
          recommendation: {
            ...validItineraryData.recommendation,
            itinerary: {
              ...validItineraryData.recommendation.itinerary,
              totalCost: {
                min: 500,
                max: 750,
                currency: 'EUR'
              }
            }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithEUR
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toContain('500 - 750 EUR')
      })

      it('should limit destinations list in WhatsApp message', async () => {
        const dataWithManyDestinations = {
          ...validItineraryData,
          recommendation: {
            ...validItineraryData.recommendation,
            itinerary: {
              ...validItineraryData.recommendation.itinerary,
              destinations: [
                { id: '1', name: 'Dakar' },
                { id: '2', name: 'Saint-Louis' },
                { id: '3', name: 'Thiès' },
                { id: '4', name: 'Tambacounda' },
                { id: '5', name: 'Ziguinchor' }
              ]
            }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithManyDestinations
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        // Should only show first 3 destinations + "et plus"
        const destinationCount = (data.whatsappMessage.match(/,/g) || []).length
        expect(destinationCount).toBeLessThanOrEqual(3)
        expect(data.whatsappMessage).toContain('et plus')
      })
    })

    describe('Error Handling', () => {
      it('should return 400 for missing recommendation', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            extractedInfo: validItineraryData.extractedInfo,
            conversationalResponse: validItineraryData.conversationalResponse
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Missing required data')
      })

      it('should return 400 for missing extractedInfo', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            recommendation: validItineraryData.recommendation,
            conversationalResponse: validItineraryData.conversationalResponse
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Missing required data')
      })

      it('should return 400 for missing conversationalResponse', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            recommendation: validItineraryData.recommendation,
            extractedInfo: validItineraryData.extractedInfo
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Missing required data')
      })

      it('should handle database errors', async () => {
        const { supabase } = require('@/lib/supabase')
        supabase.from().insert().select().single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection failed' }
        })

        const request = createMockRequest({
          method: 'POST',
          body: validItineraryData
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Failed to save itinerary')
      })

      it('should handle JSON parsing errors', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: 'invalid-json'
        })

        request.json = jest.fn(() => Promise.reject(new SyntaxError('Invalid JSON')))

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Failed to save itinerary')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty destinations array', async () => {
        const dataWithNoDestinations = {
          ...validItineraryData,
          recommendation: {
            ...validItineraryData.recommendation,
            itinerary: {
              ...validItineraryData.recommendation.itinerary,
              destinations: []
            }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithNoDestinations
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toContain('Itinéraire personnalisé')
      })

      it('should handle missing cost information', async () => {
        const dataWithNoCost = {
          ...validItineraryData,
          recommendation: {
            ...validItineraryData.recommendation,
            itinerary: {
              ...validItineraryData.recommendation.itinerary,
              totalCost: undefined
            }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithNoCost
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toContain('Sur mesure')
      })

      it('should handle very long itinerary names', async () => {
        const dataWithLongName = {
          ...validItineraryData,
          recommendation: {
            ...validItineraryData.recommendation,
            itinerary: {
              ...validItineraryData.recommendation.itinerary,
              name: 'A'.repeat(200)
            }
          }
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithLongName
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('success', true)
      })

      it('should handle invalid phone number format', async () => {
        const dataWithInvalidPhone = {
          ...validItineraryData,
          clientPhone: 'invalid-phone'
        }

        const request = createMockRequest({
          method: 'POST',
          body: dataWithInvalidPhone
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.whatsappMessage).toContain('invalid-phone')
      })
    })
  })

  describe('WhatsApp Message Generation', () => {
    it('should generate properly formatted message', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: validItineraryData
      })

      const response = await POST(request)
      const data = await response.json()

      const lines = data.whatsappMessage.split('\n')
      
      // Check message structure
      expect(lines[0]).toContain('Bonjour Mbaye!')
      expect(data.whatsappMessage).toContain('• Destinations:')
      expect(data.whatsappMessage).toContain('• Durée:')
      expect(data.whatsappMessage).toContain('• Voyageurs:')
      expect(data.whatsappMessage).toContain('• Budget:')
      expect(data.whatsappMessage).toContain('• Contact:')
      expect(data.whatsappMessage).toContain('Peux-tu confirmer')
    })

    it('should handle missing phone number gracefully', async () => {
      const dataWithoutPhone = {
        ...validItineraryData,
        clientPhone: undefined
      }

      const request = createMockRequest({
        method: 'POST',
        body: dataWithoutPhone
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.whatsappMessage).toContain('John Doe')
      expect(data.whatsappMessage).not.toContain('Téléphone:')
    })
  })
})
