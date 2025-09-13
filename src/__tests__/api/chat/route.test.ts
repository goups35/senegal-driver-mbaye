/**
 * @jest-environment node
 */

import { POST } from '@/app/api/chat/route'
import { createMockRequest, expectSuccessResponse, expectErrorResponse } from '../../utils/api-test-utils'

// Mock external dependencies
jest.mock('@/lib/groq-simple', () => ({
  generateGroqResponse: jest.fn().mockResolvedValue('Mocked GROQ response'),
  TRAVEL_ADVISOR_PROMPT: 'Mocked prompt'
}))

jest.mock('@/lib/distances', () => ({
  extractCitiesFromPrompt: jest.fn().mockReturnValue(['Dakar', 'Saint-Louis']),
  generateDistanceContext: jest.fn().mockResolvedValue('\nDistances: Dakar to Saint-Louis: 320km')
}))

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    delete process.env.GROQ_API_KEY
  })

  describe('POST /api/chat', () => {
    describe('Demo Mode', () => {
      it('should return demo response when GROQ API key is not configured', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Bonjour, je veux visiter le Sénégal',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('response')
        expect(data).toHaveProperty('isDemo', true)
        expect(typeof data.response).toBe('string')
        expect(data.response).toContain('Bonjour et bienvenue')
      })

      it('should return appropriate demo response for budget inquiry', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Quel est le budget pour un voyage de 7 jours?',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.isDemo).toBe(true)
        expect(data.response).toContain('budget')
        expect(data.response).toContain('GAMMES DE PRIX')
      })

      it('should return duration-specific demo response', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je veux rester 2 semaines au Sénégal',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.response).toContain('2 SEMAINES')
        expect(data.response).toContain('Grand tour')
      })

      it('should trigger final proposal when user says "go"', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'GO',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.response).toContain('VOTRE VOYAGE AU SÉNÉGAL EST PRÊT')
        expect(data.response).toContain('RÉCAPITULATIF PERSONNALISÉ')
      })

      it('should handle interest-based inquiries', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je suis intéressé par les plages et la culture',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.response).toContain('CÔTÉ MER')
        expect(data.response).toContain('CULTURE & HISTOIRE')
      })
    })

    describe('Production Mode with GROQ', () => {
      beforeEach(() => {
        process.env.GROQ_API_KEY = 'test-groq-key'
      })

      it('should use GROQ API when properly configured', async () => {
        const { generateGroqResponse } = require('@/lib/groq-simple')
        const { extractCitiesFromPrompt, generateDistanceContext } = require('@/lib/distances')
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je veux aller de Dakar à Saint-Louis',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('response')
        expect(data).toHaveProperty('isDemo', false)
        expect(extractCitiesFromPrompt).toHaveBeenCalledWith('Je veux aller de Dakar à Saint-Louis')
        expect(generateDistanceContext).toHaveBeenCalledWith(['Dakar', 'Saint-Louis'])
        expect(generateGroqResponse).toHaveBeenCalled()
      })

      it('should include conversation history in GROQ prompt', async () => {
        const { generateGroqResponse } = require('@/lib/groq-simple')
        
        const conversationHistory = [
          { role: 'user', content: 'Bonjour' },
          { role: 'assistant', content: 'Bonjour, comment puis-je vous aider?' }
        ]

        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Je veux visiter Saint-Louis',
            conversationHistory
          }
        })

        const response = await POST(request)
        
        expect(response.status).toBe(200)
        expect(generateGroqResponse).toHaveBeenCalled()
        
        const calledPrompt = generateGroqResponse.mock.calls[0][0]
        expect(calledPrompt).toContain('CONTEXTE DE LA CONVERSATION')
        expect(calledPrompt).toContain('Voyageur: Bonjour')
        expect(calledPrompt).toContain('Conseiller: Bonjour, comment puis-je vous aider?')
      })

      it('should handle first interaction properly', async () => {
        const { generateGroqResponse } = require('@/lib/groq-simple')
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Bonjour',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        
        expect(response.status).toBe(200)
        expect(generateGroqResponse).toHaveBeenCalled()
        
        const calledPrompt = generateGroqResponse.mock.calls[0][0]
        expect(calledPrompt).toContain('PREMIÈRE INTERACTION')
        expect(calledPrompt).toContain('Accueille chaleureusement')
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
        
        await expectErrorResponse(response, 400, 'Données invalides')
      })

      it('should return 400 for empty message', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: '',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Données invalides')
      })

      it('should return 400 for invalid conversation history format', async () => {
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: [
              { role: 'invalid', content: 'test' }
            ]
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 400, 'Données invalides')
      })

      it('should handle GROQ API errors gracefully', async () => {
        process.env.GROQ_API_KEY = 'test-groq-key'
        
        const { generateGroqResponse } = require('@/lib/groq-simple')
        generateGroqResponse.mockRejectedValueOnce(new Error('GROQ API Error'))
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'Test message',
            conversationHistory: []
          }
        })

        const response = await POST(request)
        
        await expectErrorResponse(response, 500, 'Erreur lors de la génération de la réponse')
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
        
        await expectErrorResponse(response, 500, 'Erreur lors de la génération de la réponse')
      })
    })

    describe('Edge Cases', () => {
      it('should handle very long messages', async () => {
        const longMessage = 'A'.repeat(5000)
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: longMessage,
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('response')
      })

      it('should handle special characters in message', async () => {
        const specialMessage = 'Café à Gorée! Coût: 5000€ 🇸🇳'
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: specialMessage,
            conversationHistory: []
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('response')
      })

      it('should handle large conversation history', async () => {
        const largeHistory = Array.from({ length: 100 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`
        }))
        
        const request = createMockRequest({
          method: 'POST',
          body: {
            message: 'New message',
            conversationHistory: largeHistory
          }
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('response')
      })
    })
  })

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({
        method: 'POST',
        body: {
          message: 'Performance test message',
          conversationHistory: []
        }
      })

      const response = await POST(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(5000) // Should respond within 5 seconds
    }, 10000)
  })
})
