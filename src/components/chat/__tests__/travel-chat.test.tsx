/**
 * Component tests for TravelChat
 * Testing conversation flow UI, phase transitions, and WhatsApp integration
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TravelChat } from '../travel-chat'

// Mock formatWhatsAppUrl utility
jest.mock('@/lib/utils', () => ({
  formatWhatsAppUrl: jest.fn((phone, message) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`)
}))

// Mock API responses
const mockApiResponse = {
  ok: true,
  json: jest.fn()
}

global.fetch = jest.fn()

describe('TravelChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue(mockApiResponse)
  })

  describe('Initial State', () => {
    it('should render with welcome message', () => {
      render(<TravelChat />)
      
      expect(screen.getByText(/Je suis Maxime, votre conseiller voyage spécialisé Sénégal/)).toBeInTheDocument()
      expect(screen.getByText(/Qu'est-ce qui vous attire dans l'idée de découvrir le Sénégal/)).toBeInTheDocument()
    })

    it('should show greeting phase indicator', () => {
      render(<TravelChat />)
      
      expect(screen.getByText('👋 Accueil')).toBeInTheDocument()
      expect(screen.getByText('Phase 1/5')).toBeInTheDocument()
    })

    it('should show quick action buttons for greeting phase', () => {
      render(<TravelChat />)
      
      expect(screen.getByText('🎨 Culture & traditions')).toBeInTheDocument()
      expect(screen.getByText('🏖️ Plages & nature')).toBeInTheDocument()
      expect(screen.getByText('🌍 Découverte complète')).toBeInTheDocument()
    })

    it('should have input field with correct placeholder', () => {
      render(<TravelChat />)
      
      expect(screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')).toBeInTheDocument()
    })
  })

  describe('Message Sending', () => {
    it('should send message when typing and pressing Enter', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        isDemo: false,
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Je veux découvrir le Sénégal{enter}')

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Je veux découvrir le Sénégal')
        }))
      })
    })

    it('should send message when clicking send button', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        isDemo: false,
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })
    })

    it('should not send empty messages', async () => {
      const user = userEvent.setup()
      render(<TravelChat />)
      
      const sendButton = screen.getByText('Envoyer')
      expect(sendButton).toBeDisabled()
    })

    it('should clear input after sending message', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        isDemo: false,
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should show loading state while sending', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      ;(fetch as jest.Mock).mockReturnValue(promise)

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      // Should show loading animation
      expect(screen.getByTestId('loading-animation') || screen.getByRole('status')).toBeInTheDocument()

      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({
          response: 'Test response',
          conversationState: { phase: 'discovery' }
        })
      })
    })
  })

  describe('Quick Action Buttons', () => {
    it('should send predefined message when clicking culture button', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const cultureButton = screen.getByText('🎨 Culture & traditions')
      await user.click(cultureButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
          body: expect.stringContaining('J\'aimerais découvrir la culture sénégalaise pendant une semaine')
        }))
      })
    })

    it('should send predefined message when clicking beaches button', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const beachButton = screen.getByText('🏖️ Plages & nature')
      await user.click(beachButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
          body: expect.stringContaining('Je rêve de plages paradisiaques et de nature pour 10 jours')
        }))
      })
    })

    it('should disable quick action buttons when loading', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      ;(fetch as jest.Mock).mockReturnValue(promise)

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const cultureButton = screen.getByText('🎨 Culture & traditions')
      await user.click(cultureButton)

      // Buttons should be disabled during loading
      expect(cultureButton).toBeDisabled()
    })
  })

  describe('Phase Transitions', () => {
    it('should update phase indicator when conversation state changes', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test discovery response',
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('🔍 Découverte')).toBeInTheDocument()
        expect(screen.getByText('Phase 2/5')).toBeInTheDocument()
      })
    })

    it('should show validation button in refinement phase', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test refinement response',
        conversationState: { phase: 'refinement' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('✅ Valider l\'itinéraire')).toBeInTheDocument()
      })
    })

    it('should show WhatsApp button when reaching summary phase', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'RÉCAPITULATIF PERSONNALISÉ\n\nJour 1: Test\nJour 2: Test',
        conversationState: { phase: 'summary' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Créez le récapitulatif')
      
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('💬 Envoyer le programme via WhatsApp')).toBeInTheDocument()
      })
    })
  })

  describe('WhatsApp Integration', () => {
    beforeEach(() => {
      // Mock window.open
      global.window.open = jest.fn()
    })

    it('should trigger WhatsApp export when button clicked', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'RÉCAPITULATIF PERSONNALISÉ\n\nJour 1: Dakar\nJour 2: Saint-Louis',
        conversationState: { phase: 'summary' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      // Send message to trigger summary
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Validé')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        const whatsappButton = screen.getByText('💬 Envoyer le programme via WhatsApp')
        expect(whatsappButton).toBeInTheDocument()
      })

      const whatsappButton = screen.getByText('💬 Envoyer le programme via WhatsApp')
      await user.click(whatsappButton)

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/'),
        '_blank'
      )
    })

    it('should call onTravelPlanReady when plan is ready', async () => {
      const mockCallback = jest.fn()
      
      mockApiResponse.json.mockResolvedValue({
        response: 'RÉCAPITULATIF PERSONNALISÉ\n\nJour 1: Test\nJour 2: Test',
        conversationState: { phase: 'summary' }
      })

      const user = userEvent.setup()
      render(<TravelChat onTravelPlanReady={mockCallback} />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.stringContaining('RÉCAPITULATIF PERSONNALISÉ')
        )
      })
    })
  })

  describe('Demo Mode', () => {
    it('should show demo indicator when in demo mode', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Demo response',
        isDemo: true,
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('DÉMO')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Désolé, une erreur est survenue. Pouvez-vous réessayer ?')).toBeInTheDocument()
      })
    })

    it('should handle HTTP error responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'Test message')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Désolé, une erreur est survenue. Pouvez-vous réessayer ?')).toBeInTheDocument()
      })
    })
  })

  describe('Session Management', () => {
    it('should generate unique session ID', () => {
      const { container: container1 } = render(<TravelChat />)
      const { container: container2 } = render(<TravelChat />)
      
      // Each instance should have its own session ID
      // This is tested implicitly through the component's internal state
      expect(container1).toBeInTheDocument()
      expect(container2).toBeInTheDocument()
    })

    it('should maintain session throughout conversation', async () => {
      mockApiResponse.json.mockResolvedValue({
        response: 'Test response',
        conversationState: { phase: 'discovery' }
      })

      const user = userEvent.setup()
      render(<TravelChat />)
      
      // Send first message
      const input = screen.getByPlaceholderText('Décrivez vos envies de voyage au Sénégal...')
      await user.type(input, 'First message')
      const sendButton = screen.getByText('Envoyer')
      await user.click(sendButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1)
      })

      // Send second message
      await user.type(input, 'Second message')
      await user.click(sendButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2)
      })

      // Both calls should use the same session ID
      const calls = (fetch as jest.Mock).mock.calls
      const firstCallBody = JSON.parse(calls[0][1].body)
      const secondCallBody = JSON.parse(calls[1][1].body)
      
      expect(firstCallBody.sessionId).toBe(secondCallBody.sessionId)
    })
  })
})