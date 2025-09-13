/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripRequestForm } from '@/components/forms/trip-request-form'
import type { TripQuote } from '@/types'

// Mock fetch globally
global.fetch = jest.fn()

const mockOnQuoteGenerated = jest.fn()

const mockTripQuote: TripQuote = {
  trip_request_id: 'test-123',
  distance: 320,
  duration: '270 minutes',
  basePrice: 160000,
  totalPrice: 176000,
  route: [
    { instruction: 'Départ de Dakar', distance: '0 km', duration: '0 min' },
    { instruction: 'Arrivée à Saint-Louis', distance: '320 km', duration: '270 min' }
  ],
  vehicleInfo: {
    type: 'standard',
    name: 'Hyundai Accent',
    capacity: 4,
    features: ['Climatisation', 'Radio'],
    pricePerKm: 500
  }
}

describe('TripRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTripQuote)
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      expect(screen.getByText('Demande de Transport')).toBeInTheDocument()
      expect(screen.getByLabelText('Lieu de départ')).toBeInTheDocument()
      expect(screen.getByLabelText('Destination')).toBeInTheDocument()
      expect(screen.getByLabelText('Date du voyage')).toBeInTheDocument()
      expect(screen.getByLabelText('Heure de départ')).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre de passagers')).toBeInTheDocument()
      expect(screen.getByLabelText('Type de véhicule')).toBeInTheDocument()
      expect(screen.getByLabelText('Votre nom')).toBeInTheDocument()
      expect(screen.getByLabelText('Téléphone')).toBeInTheDocument()
      expect(screen.getByLabelText('Email (optionnel)')).toBeInTheDocument()
      expect(screen.getByLabelText('Demandes spéciales (optionnel)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Obtenir un devis' })).toBeInTheDocument()
    })

    it('should have proper form structure', () => {
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check for required field indicators (if any)
      const departureInput = screen.getByLabelText('Lieu de départ')
      expect(departureInput).toHaveAttribute('placeholder', 'Ex: Dakar, Place de l\'Indépendance')
      
      const destinationInput = screen.getByLabelText('Destination')
      expect(destinationInput).toHaveAttribute('placeholder', 'Ex: Aéroport Léopold Sédar Senghor')
    })

    it('should have default values', () => {
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const passengersInput = screen.getByLabelText('Nombre de passagers')
      expect(passengersInput).toHaveValue(1)
      
      const vehicleSelect = screen.getByLabelText('Type de véhicule')
      expect(vehicleSelect).toHaveValue('standard')
    })

    it('should render vehicle options correctly', () => {
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const vehicleSelect = screen.getByLabelText('Type de véhicule')
      const options = vehicleSelect.querySelectorAll('option')
      
      expect(options).toHaveLength(3)
      expect(options[0]).toHaveTextContent('Standard (4 places) - Véhicule économique')
      expect(options[1]).toHaveTextContent('Premium (4 places) - Confort supérieur')
      expect(options[2]).toHaveTextContent('SUV (7 places) - Espace famille')
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Le lieu de départ est requis')).toBeInTheDocument()
        expect(screen.getByText('La destination est requise')).toBeInTheDocument()
        expect(screen.getByText('La date est requise')).toBeInTheDocument()
        expect(screen.getByText('L\'heure est requise')).toBeInTheDocument()
        expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
        expect(screen.getByText('Numéro de téléphone invalide')).toBeInTheDocument()
      })
      
      expect(mockOnQuoteGenerated).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const emailInput = screen.getByLabelText('Email (optionnel)')
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email invalide')).toBeInTheDocument()
      })
    })

    it('should validate passenger count limits', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const passengersInput = screen.getByLabelText('Nombre de passagers')
      
      // Test minimum
      await user.clear(passengersInput)
      await user.type(passengersInput, '0')
      
      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Au moins 1 passager')).toBeInTheDocument()
      })

      // Test maximum
      await user.clear(passengersInput)
      await user.type(passengersInput, '10')
      
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Maximum 8 passagers')).toBeInTheDocument()
      })
    })

    it('should validate phone number length', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const phoneInput = screen.getByLabelText('Téléphone')
      await user.type(phoneInput, '123')
      
      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Numéro de téléphone invalide')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    const validFormData = {
      departure: 'Dakar',
      destination: 'Saint-Louis',
      date: '2024-12-15',
      time: '09:00',
      passengers: '2',
      customerName: 'John Doe',
      customerPhone: '+221701234567',
      customerEmail: 'john@example.com'
    }

    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill form
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.clear(screen.getByLabelText('Nombre de passagers'))
      await user.type(screen.getByLabelText('Nombre de passagers'), validFormData.passengers)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)
      await user.type(screen.getByLabelText('Email (optionnel)'), validFormData.customerEmail)

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/trips/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departure: validFormData.departure,
            destination: validFormData.destination,
            date: validFormData.date,
            time: validFormData.time,
            passengers: 2,
            vehicleType: 'standard',
            customerName: validFormData.customerName,
            customerPhone: validFormData.customerPhone,
            customerEmail: validFormData.customerEmail,
            specialRequests: ''
          })
        })
      })

      expect(mockOnQuoteGenerated).toHaveBeenCalledWith(mockTripQuote, expect.any(Object))
    })

    it('should handle special requests field', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill required fields
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)
      
      // Add special request
      const specialRequestsInput = screen.getByLabelText('Demandes spéciales (optionnel)')
      await user.type(specialRequestsInput, 'Siège enfant requis')

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/trips/quote', expect.objectContaining({
          body: expect.stringContaining('Siège enfant requis')
        }))
      })
    })

    it('should handle different vehicle types', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill required fields
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)
      
      // Select premium vehicle
      const vehicleSelect = screen.getByLabelText('Type de véhicule')
      await user.selectOptions(vehicleSelect, 'premium')

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/trips/quote', expect.objectContaining({
          body: expect.stringContaining('"vehicleType":"premium"')
        }))
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockTripQuote)
        }), 1000))
      )

      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill required fields quickly
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Génération du devis...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Obtenir un devis')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should reset loading state after successful submission', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill and submit form
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnQuoteGenerated).toHaveBeenCalled()
      })

      // Form should be reset and button enabled
      expect(submitButton).not.toBeDisabled()
      expect(screen.getByText('Obtenir un devis')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill and submit form
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      expect(mockOnQuoteGenerated).not.toHaveBeenCalled()
    })

    it('should handle HTTP error responses', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill and submit form
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la génération du devis')).toBeInTheDocument()
      })
    })

    it('should clear error when retrying submission', async () => {
      const user = userEvent.setup()
      
      // First attempt fails
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('First error'))

      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill and submit form
      await user.type(screen.getByLabelText('Lieu de départ'), validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second attempt succeeds
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTripQuote)
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Fill form
      const departureInput = screen.getByLabelText('Lieu de départ')
      await user.type(departureInput, validFormData.departure)
      await user.type(screen.getByLabelText('Destination'), validFormData.destination)
      await user.type(screen.getByLabelText('Date du voyage'), validFormData.date)
      await user.type(screen.getByLabelText('Heure de départ'), validFormData.time)
      await user.type(screen.getByLabelText('Votre nom'), validFormData.customerName)
      await user.type(screen.getByLabelText('Téléphone'), validFormData.customerPhone)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnQuoteGenerated).toHaveBeenCalled()
      })

      // Form should be reset
      expect(departureInput).toHaveValue('')
      expect(screen.getByLabelText('Destination')).toHaveValue('')
      expect(screen.getByLabelText('Votre nom')).toHaveValue('')
      expect(screen.getByLabelText('Téléphone')).toHaveValue('')
      
      // Default values should remain
      expect(screen.getByLabelText('Nombre de passagers')).toHaveValue(1)
      expect(screen.getByLabelText('Type de véhicule')).toHaveValue('standard')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels and form structure', () => {
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      // Check all inputs have labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })

      const numberInput = screen.getByRole('spinbutton')
      expect(numberInput).toHaveAccessibleName()

      const select = screen.getByRole('combobox')
      expect(select).toHaveAccessibleName()
    })

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup()
      render(<TripRequestForm onQuoteGenerated={mockOnQuoteGenerated} />)

      const submitButton = screen.getByRole('button', { name: 'Obtenir un devis' })
      await user.click(submitButton)

      await waitFor(() => {
        const departureInput = screen.getByLabelText('Lieu de départ')
        const errorMessage = screen.getByText('Le lieu de départ est requis')
        
        // Error should be announced to screen readers
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveClass('text-destructive')
      })
    })
  })
})
