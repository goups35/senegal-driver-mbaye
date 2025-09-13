/**
 * @jest-environment node
 */

import { POST, GET } from '@/app/api/ai-expert/route'
import { createMockRequest, expectSuccessResponse, expectErrorResponse } from '../../utils/api-test-utils'

// Mock external dependencies
jest.mock('@/lib/ai-senegal-expert', () => ({
  generateAIRecommendation: jest.fn().mockResolvedValue({
    id: 'rec-123',
    itinerary: {
      name: 'Découverte Authentique du Sénégal',
      duration: 7,
      destinations: [
        {
          id: 'dakar',
          name: 'Dakar',
          description: 'Capitale dynamique du Sénégal',
          mbayeRecommendation: 'Commencez par le marché Sandaga pour une immersion authentique'
        },
        {
          id: 'saint-louis',
          name: 'Saint-Louis',
          description: 'Ancienne capitale coloniale, classée UNESCO',
          mbayeRecommendation: 'Balade en calèche dans la vieille ville au coucher du soleil'
        }
      ],
      experiences: [
        {
          id: 'cultural-tour',
          name: 'Visite culturelle',
          description: 'Découverte des traditions locales'
        }
      ],
      totalCost: {
        min: 300000,
        max: 450000,
        includes: ['Transport', 'Guide', 'Hébergement']
      },
      transportPlan: {
        vehicleRecommendation: {
          type: 'SUV climatisé'
        }
      }
    }
  }),
  extractClientInfo: jest.fn().mockReturnValue({
    budget: { amount: 400000, currency: 'XOF' },
    dates: { duration: 7 },
    groupInfo: { size: 2 },
    preferences: { interests: ['culture', 'nature'] }
  }),
  scoreRecommendation: jest.fn().mockReturnValue(87)
}))

jest.mock('@/data/senegal-destinations', () => ({
  senegalDestinations: [
    {
      id: 'dakar',
      name: 'Dakar',
      region: 'Dakar',
      type: 'city',
      description: 'Capitale du Sénégal',
      tags: ['urban', 'culture'],
      estimatedDuration: 2,
      cost: { min: 50000, max: 100000 },
      difficulty: 'easy'
    },
    {
      id: 'saint-louis',
      name: 'Saint-Louis',
      region: 'Saint-Louis',
      type: 'historical',
      description: 'Ville historique',
      tags: ['history', 'unesco'],
      estimatedDuration: 3,
      cost: { min: 75000, max: 150000 },
      difficulty: 'easy'
    }
  ]
}))

// Mock fetch for save-itinerary API call
global.fetch = jest.fn()

describe('/api/ai-expert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        itineraryId: 'itinerary-123',
        title: 'Votre voyage au Sénégal',
        whatsappMessage: 'Message WhatsApp généré',
        planningUrl: 'https://example.com/planning/123'
      })
    })
  })

  describe('POST /api/ai-expert', () => {
    describe('Success Cases', () => {
      it('should generate AI recommendation for initial inquiry', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je veux découvrir le Sénégal',
            conversationHistory: [],
            context: 'initial_inquiry'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('message')
        expect(data).toHaveProperty('recommendation')
        expect(data).toHaveProperty('extractedInfo')
        expect(data).toHaveProperty('score', 87)
        expect(data).toHaveProperty('conversationHistory')
        expect(data).toHaveProperty('suggestedActions')
        expect(data).toHaveProperty('nextSteps')
        expect(data.aiMessage).toHaveProperty('role', 'assistant')
        expect(data.aiMessage.metadata).toHaveProperty('confidence')
      })

      it('should handle preference gathering context', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'J\'aime la culture et les plages, budget 500000 XOF',
            conversationHistory: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Bonjour',
                timestamp: new Date().toISOString(),
                metadata: {}
              }
            ],
            context: 'preference_gathering'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.conversationHistory).toHaveLength(3) // Original + user + AI messages
        expect(data.message).toContain('OK, je vois mieux')
      })

      it('should generate itinerary proposal when context is itinerary_proposal', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Montrez-moi l\'itinéraire',
            conversationHistory: [],
            context: 'itinerary_proposal'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toContain('Découverte Authentique du Sénégal')
        expect(data.message).toContain('Jour')
        expect(data.message).toContain('Budget total')
        expect(data.message).toContain('Votre chauffeur-guide')
      })

      it('should handle booking confirmation and save itinerary', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Oui, je valide ce programme',
            conversationHistory: [],
            context: 'booking_confirmation'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toContain('Perfect ! ✅ Votre planning est validé')
        expect(data.message).toContain('MESSAGE POUR MBAYE (WhatsApp)')
        expect(data).toHaveProperty('savedItinerary')
        expect(data.savedItinerary).toHaveProperty('id', 'itinerary-123')
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/save-itinerary'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      })

      it('should detect intent correctly for confirmation', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'parfait',
            conversationHistory: [],
            context: 'itinerary_proposal'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.aiMessage.metadata.detectedIntent).toBe('confirm-proposal')
      })

      it('should detect modification requests', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je voudrais modifier les destinations',
            conversationHistory: [],
            context: 'itinerary_proposal'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toContain('Dites-moi ce que vous aimeriez modifier')
      })

      it('should handle practical details requests', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Comment ça marche le transport?',
            conversationHistory: [],
            context: 'practical_details'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toContain('détails pratiques')
        expect(data.message).toContain('Transport & Guide')
      })

      it('should use default client preferences when none provided', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Simple message'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        
        const { generateAIRecommendation } = require('@/lib/ai-senegal-expert')
        const aiRequest = generateAIRecommendation.mock.calls[0][0]
        
        expect(aiRequest.clientPreferences).toEqual(expect.objectContaining({
          interests: [],
          culturalImmersionLevel: 'moderate',
          activityLevel: 'moderate',
          accommodationPreference: 'mid-range'
        }))
      })
    })

    describe('Error Handling', () => {
      it('should return 400 for missing message', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            conversationHistory: []
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Message is required')
      })

      it('should handle AI service errors gracefully', async () => {
        const { generateAIRecommendation } = require('@/lib/ai-senegal-expert')
        generateAIRecommendation.mockRejectedValueOnce(new Error('AI Service Error'))
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Erreur lors de la génération de la recommandation')
      })

      it('should continue even if save-itinerary fails', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Save failed'))
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Oui, je valide',
            conversationHistory: [],
            context: 'booking_confirmation'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toContain('Perfect ! ✅')
        expect(data).not.toHaveProperty('savedItinerary')
      })

      it('should handle JSON parsing errors', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: 'invalid-json'
        })

        request.json = jest.fn(() => Promise.reject(new SyntaxError('Invalid JSON')))

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Erreur lors de la génération de la recommandation')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty conversation history', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: undefined
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.conversationHistory).toHaveLength(2) // User + AI messages
      })

      it('should handle high confidence scores appropriately', async () => {
        const { scoreRecommendation } = require('@/lib/ai-senegal-expert')
        scoreRecommendation.mockReturnValueOnce(95)
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: [],
            context: 'itinerary_proposal'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.score).toBe(95)
        expect(data.message).toContain('Cet itinéraire vous correspond parfaitement')
      })

      it('should handle low confidence scores', async () => {
        const { scoreRecommendation } = require('@/lib/ai-senegal-expert')
        scoreRecommendation.mockReturnValueOnce(65)
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: [],
            context: 'itinerary_proposal'
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.score).toBe(65)
        expect(data.message).toContain('Je peux adapter cet itinéraire')
      })
    })
  })

  describe('GET /api/ai-expert', () => {
    it('should return simplified destinations list', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('destinations')
      expect(data).toHaveProperty('totalCount', 2)
      expect(data.destinations).toHaveLength(2)
      
      const destination = data.destinations[0]
      expect(destination).toHaveProperty('id')
      expect(destination).toHaveProperty('name')
      expect(destination).toHaveProperty('region')
      expect(destination).toHaveProperty('type')
      expect(destination).toHaveProperty('description')
      expect(destination).toHaveProperty('tags')
      expect(destination).toHaveProperty('estimatedDuration')
      expect(destination).toHaveProperty('cost')
      expect(destination).toHaveProperty('difficulty')
    })

    it('should handle errors when importing destinations', async () => {
      jest.doMock('@/data/senegal-destinations', () => {
        throw new Error('Import failed')
      })

      // Re-import the module to trigger the error
      jest.resetModules()
      const { GET: newGET } = await import('@/app/api/ai-expert/route')
      
      const response = await newGET()
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Erreur lors de la récupération des destinations')
    })
  })

  describe('Intent Detection', () => {
    const testCases = [
      { message: 'bonjour', expected: 'initial-inquiry' },
      { message: 'oui', expected: 'confirm-proposal' },
      { message: 'parfait', expected: 'confirm-proposal' },
      { message: 'je valide', expected: 'confirm-proposal' },
      { message: 'modifier quelque chose', expected: 'request-modification' },
      { message: 'budget estimation', expected: 'ask-budget-info' },
      { message: 'comment ça marche', expected: 'ask-practical-info' },
      { message: 'question générale', expected: 'general-question' }
    ]

    testCases.forEach(({ message, expected }) => {
      it(`should detect intent "${expected}" for message "${message}"`, async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message,
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.aiMessage.metadata.detectedIntent).toBe(expected)
      })
    })
  })
})
