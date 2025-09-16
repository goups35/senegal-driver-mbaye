import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TripProvider, useTripContext, hasCompleteQuote } from '../trip-context'
// Types imports for tests

// Composant de test pour utiliser le Context
function TestComponent() {
  const context = useTripContext()

  return (
    <div>
      <div data-testid="current-quote">
        {context.currentQuote ? JSON.stringify(context.currentQuote) : 'null'}
      </div>
      <div data-testid="trip-data">
        {context.tripData ? JSON.stringify(context.tripData) : 'null'}
      </div>
      <div data-testid="has-complete-quote">
        {hasCompleteQuote(context) ? 'true' : 'false'}
      </div>
      <button
        data-testid="set-quote"
        onClick={() => context.setCurrentQuote({
          id: 'test-quote',
          trip_request_id: 'test-trip',
          distance: 100,
          duration: '2h',
          basePrice: 50000,
          totalPrice: 55000,
          route: [],
          vehicleInfo: {
            type: 'standard',
            name: 'Berline Standard',
            capacity: 4,
            features: ['Climatisation', 'GPS'],
            pricePerKm: 500
          }
        })}
      >
        Set Quote
      </button>
      <button
        data-testid="set-trip-data"
        onClick={() => context.setTripData({
          id: 'test-trip',
          departure: 'Dakar',
          destination: 'Saint-Louis',
          date: '2024-12-25',
          time: '08:00',
          passengers: 2,
          vehicleType: 'standard',
          customerName: 'Test User',
          customerPhone: '+221771234567'
        })}
      >
        Set Trip Data
      </button>
      <button
        data-testid="reset-trip"
        onClick={() => context.resetTrip()}
      >
        Reset
      </button>
      <button
        data-testid="update-both"
        onClick={() => context.updateQuoteAndData(
          {
            id: 'both-quote',
            trip_request_id: 'both-trip',
            distance: 200,
            duration: '3h',
            basePrice: 75000,
            totalPrice: 82500,
            route: [],
            vehicleInfo: {
              type: 'premium',
              name: 'Berline Premium',
              capacity: 4,
              features: ['Climatisation', 'GPS', 'Cuir'],
              pricePerKm: 750
            }
          },
          {
            id: 'both-trip',
            departure: 'Dakar',
            destination: 'Casamance',
            date: '2024-12-30',
            time: '09:00',
            passengers: 4,
            vehicleType: 'premium',
            customerName: 'Test Premium',
            customerPhone: '+221772345678'
          }
        )}
      >
        Update Both
      </button>
    </div>
  )
}

// Composant qui n'est pas dans le Provider pour tester l'erreur
function ComponentOutsideProvider() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = useTripContext()
    return <div>Should not reach here</div>
  } catch (error) {
    return <div data-testid="error-message">{(error as Error).message}</div>
  }
}

describe('TripContext', () => {
  describe('Provider and Hook', () => {
    test('should provide initial state', () => {
      render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      expect(screen.getByTestId('current-quote')).toHaveTextContent('null')
      expect(screen.getByTestId('trip-data')).toHaveTextContent('null')
      expect(screen.getByTestId('has-complete-quote')).toHaveTextContent('false')
    })

    test('should throw error when used outside Provider', () => {
      render(<ComponentOutsideProvider />)

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'useTripContext must be used within a TripProvider'
      )
    })

    test('should update current quote', () => {
      render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      act(() => {
        screen.getByTestId('set-quote').click()
      })

      const quoteElement = screen.getByTestId('current-quote')
      expect(quoteElement).not.toHaveTextContent('null')

      const quoteData = JSON.parse(quoteElement.textContent!)
      expect(quoteData.id).toBe('test-quote')
      expect(quoteData.totalPrice).toBe(55000)
      expect(quoteData.vehicleInfo.type).toBe('standard')
    })

    test('should update trip data', () => {
      render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      act(() => {
        screen.getByTestId('set-trip-data').click()
      })

      const tripElement = screen.getByTestId('trip-data')
      expect(tripElement).not.toHaveTextContent('null')

      const tripData = JSON.parse(tripElement.textContent!)
      expect(tripData.departure).toBe('Dakar')
      expect(tripData.destination).toBe('Saint-Louis')
      expect(tripData.customerName).toBe('Test User')
    })

    test('should reset all data', () => {
      render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      // Set some data first
      act(() => {
        screen.getByTestId('set-quote').click()
      })
      act(() => {
        screen.getByTestId('set-trip-data').click()
      })

      // Verify data is set
      expect(screen.getByTestId('current-quote')).not.toHaveTextContent('null')
      expect(screen.getByTestId('trip-data')).not.toHaveTextContent('null')

      // Reset
      act(() => {
        screen.getByTestId('reset-trip').click()
      })

      // Verify data is cleared
      expect(screen.getByTestId('current-quote')).toHaveTextContent('null')
      expect(screen.getByTestId('trip-data')).toHaveTextContent('null')
      expect(screen.getByTestId('has-complete-quote')).toHaveTextContent('false')
    })

    test('should update both quote and data simultaneously', () => {
      render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      act(() => {
        screen.getByTestId('update-both').click()
      })

      const quoteElement = screen.getByTestId('current-quote')
      const tripElement = screen.getByTestId('trip-data')

      expect(quoteElement).not.toHaveTextContent('null')
      expect(tripElement).not.toHaveTextContent('null')

      const quoteData = JSON.parse(quoteElement.textContent!)
      const tripData = JSON.parse(tripElement.textContent!)

      expect(quoteData.id).toBe('both-quote')
      expect(quoteData.vehicleInfo.type).toBe('premium')
      expect(tripData.customerName).toBe('Test Premium')
      expect(tripData.destination).toBe('Casamance')

      expect(screen.getByTestId('has-complete-quote')).toHaveTextContent('true')
    })
  })

  describe('hasCompleteQuote Type Guard', () => {
    test('should return false when quote is null', () => {
      const context = {
        currentQuote: null,
        tripData: null,
        setCurrentQuote: jest.fn(),
        setTripData: jest.fn(),
        resetTrip: jest.fn(),
        updateQuoteAndData: jest.fn()
      }

      expect(hasCompleteQuote(context)).toBe(false)
    })

    test('should return false when trip data is null', () => {
      const context = {
        currentQuote: {
          id: 'quote-1',
          trip_request_id: 'trip-1',
          distance: 100,
          duration: '2h',
          basePrice: 50000,
          totalPrice: 55000,
          route: [],
          vehicleInfo: {
            type: 'standard' as const,
            name: 'Standard',
            capacity: 4,
            features: [],
            pricePerKm: 500
          }
        },
        tripData: null,
        setCurrentQuote: jest.fn(),
        setTripData: jest.fn(),
        resetTrip: jest.fn(),
        updateQuoteAndData: jest.fn()
      }

      expect(hasCompleteQuote(context)).toBe(false)
    })

    test('should return true when both quote and trip data exist', () => {
      const context = {
        currentQuote: {
          id: 'quote-1',
          trip_request_id: 'trip-1',
          distance: 100,
          duration: '2h',
          basePrice: 50000,
          totalPrice: 55000,
          route: [],
          vehicleInfo: {
            type: 'standard' as const,
            name: 'Standard',
            capacity: 4,
            features: [],
            pricePerKm: 500
          }
        },
        tripData: {
          id: 'trip-1',
          departure: 'Dakar',
          destination: 'Saint-Louis',
          date: '2024-12-25',
          time: '08:00',
          passengers: 2,
          vehicleType: 'standard' as const,
          customerName: 'Test',
          customerPhone: '+221771234567'
        },
        setCurrentQuote: jest.fn(),
        setTripData: jest.fn(),
        resetTrip: jest.fn(),
        updateQuoteAndData: jest.fn()
      }

      expect(hasCompleteQuote(context)).toBe(true)
    })
  })

  describe('Integration with existing component patterns', () => {
    test('should work with multiple renders and state updates', () => {
      const { rerender } = render(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      // Test multiple state updates
      act(() => {
        screen.getByTestId('set-quote').click()
      })

      rerender(
        <TripProvider>
          <TestComponent />
        </TripProvider>
      )

      act(() => {
        screen.getByTestId('set-trip-data').click()
      })

      expect(screen.getByTestId('has-complete-quote')).toHaveTextContent('true')

      act(() => {
        screen.getByTestId('reset-trip').click()
      })

      expect(screen.getByTestId('has-complete-quote')).toHaveTextContent('false')
    })
  })
})