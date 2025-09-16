import {
  convertTripRequestInputToTripRequest,
  convertTripRequestToTripRequestInput,
  isCompatibleTripData
} from '../type-converters'
import type { TripRequestInput } from '@/schemas/trip'

describe('Type Converters', () => {
  const sampleTripRequestInput: TripRequestInput = {
    date: '2024-12-25',
    passengers: 2,
    duration: 7,
    customerName: 'Test User',
    customerPhone: '+221771234567',
    customerEmail: 'test@example.com',
    specialRequests: 'Aucune'
  }

  describe('convertTripRequestInputToTripRequest', () => {
    test('should convert TripRequestInput to TripRequest with generated ID and timestamp', () => {
      const result = convertTripRequestInputToTripRequest(sampleTripRequestInput)

      // Should preserve all original fields
      expect(result.date).toBe(sampleTripRequestInput.date)
      expect(result.passengers).toBe(sampleTripRequestInput.passengers)
      expect(result.duration).toBe(sampleTripRequestInput.duration)
      expect(result.customerName).toBe(sampleTripRequestInput.customerName)
      expect(result.customerPhone).toBe(sampleTripRequestInput.customerPhone)
      expect(result.customerEmail).toBe(sampleTripRequestInput.customerEmail)
      expect(result.specialRequests).toBe(sampleTripRequestInput.specialRequests)

      // Should add generated fields
      expect(result.id).toBeDefined()
      expect(result.id).toMatch(/^trip_\d+_[a-z0-9]+$/)
      expect(result.created_at).toBeDefined()
      expect(new Date(result.created_at!)).toBeInstanceOf(Date)
    })

    test('should generate unique IDs for multiple conversions', async () => {
      const result1 = convertTripRequestInputToTripRequest(sampleTripRequestInput)

      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))

      const result2 = convertTripRequestInputToTripRequest(sampleTripRequestInput)

      expect(result1.id).not.toBe(result2.id)
      // IDs should be different due to random component
      expect(result1.id).toMatch(/^trip_\d+_[a-z0-9]+$/)
      expect(result2.id).toMatch(/^trip_\d+_[a-z0-9]+$/)
    })
  })

  describe('convertTripRequestToTripRequestInput', () => {
    test('should convert TripRequest back to TripRequestInput by removing technical fields', () => {
      const tripRequest = convertTripRequestInputToTripRequest(sampleTripRequestInput)
      const result = convertTripRequestToTripRequestInput(tripRequest)

      expect(result).toEqual(sampleTripRequestInput)
      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('created_at')
    })
  })

  describe('isCompatibleTripData', () => {
    test('should return true for valid TripRequestInput data', () => {
      expect(isCompatibleTripData(sampleTripRequestInput)).toBe(true)
    })

    test('should return true for minimal valid data', () => {
      const minimalData = {
        date: '2024-12-25',
        passengers: 1,
        duration: 7,
        customerName: 'Test',
        customerPhone: '+221771234567',
        customerEmail: 'test@example.com'
      }

      expect(isCompatibleTripData(minimalData)).toBe(true)
    })

    test('should return false for invalid data types', () => {
      const invalidCases = [
        null,
        undefined,
        'string',
        123,
        [],
        { date: 123 }, // wrong type
        { date: '2024-12-25' }, // missing fields
        {
          ...sampleTripRequestInput,
          passengers: '2' // wrong type (string instead of number)
        }
      ]

      invalidCases.forEach(invalidData => {
        expect(isCompatibleTripData(invalidData)).toBe(false)
      })
    })

    test('should handle edge cases', () => {
      // Empty object
      expect(isCompatibleTripData({})).toBe(false)

      // Object with extra properties (should still be valid)
      const dataWithExtras = {
        ...sampleTripRequestInput,
        extraProperty: 'should not affect validation'
      }
      expect(isCompatibleTripData(dataWithExtras)).toBe(true)
    })
  })

  describe('Integration flow', () => {
    test('should handle complete conversion flow', () => {
      // 1. Start with form input
      const formInput = sampleTripRequestInput

      // 2. Convert to TripRequest for Context
      const tripRequest = convertTripRequestInputToTripRequest(formInput)

      // 3. Convert back to input for editing
      const backToInput = convertTripRequestToTripRequestInput(tripRequest)

      // 4. Should be identical to original
      expect(backToInput).toEqual(formInput)

      // 5. Validate each step
      expect(isCompatibleTripData(formInput)).toBe(true)
      expect(isCompatibleTripData(backToInput)).toBe(true)
    })
  })
})