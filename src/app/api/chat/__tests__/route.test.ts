/**
 * API Route tests for chat endpoint
 * Testing conversation flow integration and error handling
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock the conversation flow module
jest.mock('@/lib/conversation-flow', () => ({
  TripPlanningPromptEngine: {
    buildMasterPrompt: jest.fn().mockReturnValue('Test prompt'),
    extractAndUpdateInfo: jest.fn().mockImplementation((message, state) => ({
      ...state,
      collectedInfo: { ...state.collectedInfo, duration: '7 jours' },
      phase: 'discovery'
    }))
  },
  ConversationStateManager: {
    getState: jest.fn().mockReturnValue({
      phase: 'greeting',
      collectedInfo: {},
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 1
    }),
    updateState: jest.fn()
  },
  WhatsAppMessageFormatter: {
    formatFinalItinerary: jest.fn().mockReturnValue('Test WhatsApp message')
  }
}))

// Mock Gemini client
jest.mock('@/lib/gemini', () => ({
  generateGeminiResponse: jest.fn().mockResolvedValue('Test AI response')
}))

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    delete process.env.GEMINI_API_KEY
  })

  describe('POST', () => {
    it('should handle valid chat request with Gemini API', async () => {
      // Set up Gemini API key
      process.env.GEMINI_API_KEY = 'test-gemini-key'
      
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour, je veux visiter le Sénégal',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.response).toBe('Test AI response')
      expect(data.isDemo).toBe(false)
      expect(data.provider).toBe('gemini-2.0-flash-exp')
      expect(data.conversationState).toBeDefined()
    })

    it('should fall back to demo mode when Gemini API key is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour, je veux visiter le Sénégal',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isDemo).toBe(true)
      expect(data.provider).toBe('demo')
      expect(data.response).toContain('🇸🇳 Bonjour ! Je suis Maxime')
    })

    it('should fall back to demo mode when Gemini API key is placeholder', async () => {
      process.env.GEMINI_API_KEY = 'your_new_gemini_api_key_here'
      
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.isDemo).toBe(true)
    })

    it('should validate request schema', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required message field
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Données invalides')
      expect(data.details).toBeDefined()
    })

    it('should handle empty message validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })

    it('should handle conversation history correctly', async () => {
      process.env.GEMINI_API_KEY = 'test-key'
      
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Je veux 7 jours',
          sessionId: 'test-session',
          conversationHistory: [
            { role: 'user', content: 'Bonjour' },
            { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider ?' }
          ]
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should use default sessionId if not provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should handle API errors gracefully', async () => {
      process.env.GEMINI_API_KEY = 'test-key'
      
      // Mock Gemini to throw an error
      const { generateGeminiResponse } = require('@/lib/gemini')
      generateGeminiResponse.mockRejectedValueOnce(new Error('API Error'))

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la génération de la réponse')
    })
  })

  describe('Demo Response Function', () => {
    it('should provide greeting response in demo mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.response).toContain('🇸🇳 Bonjour ! Je suis Maxime')
      expect(data.response).toContain('Qu\'est-ce qui vous attire dans l\'idée de découvrir le Sénégal')
    })

    it('should provide discovery response in demo mode', async () => {
      // Mock the conversation state to be in discovery phase
      const { ConversationStateManager } = require('@/lib/conversation-flow')
      ConversationStateManager.getState.mockReturnValue({
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      })

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Je veux découvrir la culture',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.response).toContain('Parfait !')
    })

    it('should provide planning response in demo mode', async () => {
      const { ConversationStateManager } = require('@/lib/conversation-flow')
      ConversationStateManager.getState.mockReturnValue({
        phase: 'planning',
        collectedInfo: { duration: '7 jours' },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 2
      })

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Culture et plages',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.response).toContain('Voici ce que je vous propose')
      expect(data.response).toContain('Jour 1-2')
    })

    it('should provide summary response in demo mode', async () => {
      const { ConversationStateManager } = require('@/lib/conversation-flow')
      ConversationStateManager.getState.mockReturnValue({
        phase: 'summary',
        collectedInfo: { 
          duration: '7 jours',
          interests: ['culture']
        },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 5
      })

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Validé !',
          sessionId: 'test-session'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.response).toBe('Test WhatsApp message')
    })
  })
})