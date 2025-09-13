import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider } from '@/contexts/app-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockTripRequest = (overrides = {}) => ({
  departure: 'Dakar',
  destination: 'Saint-Louis',
  date: '2024-12-15',
  time: '09:00',
  passengers: 2,
  vehicleType: 'standard' as const,
  customerName: 'John Doe',
  customerPhone: '+221701234567',
  customerEmail: 'john@example.com',
  specialRequests: '',
  ...overrides,
})

export const createMockTripQuote = (overrides = {}) => ({
  trip_request_id: 'test-123',
  distance: 320,
  duration: '4 hours 30 minutes',
  basePrice: 160000,
  totalPrice: 180000,
  route: [
    { instruction: 'Départ de Dakar', distance: '0 km', duration: '0 min' },
    { instruction: 'Prendre A1 vers Saint-Louis', distance: '320 km', duration: '4h 30min' },
    { instruction: 'Arrivée à Saint-Louis', distance: '0 km', duration: '0 min' },
  ],
  vehicleInfo: {
    type: 'standard' as const,
    name: 'Hyundai Accent / Toyota Vitz',
    capacity: 4,
    features: ['Climatisation', 'Radio', 'Ceintures de sécurité'],
    pricePerKm: 500,
  },
  ...overrides,
})

export const createMockApiResponse = <T>(data: T, status = 200) => ({
  json: () => Promise.resolve(data),
  status,
  ok: status >= 200 && status < 300,
})

// Mock fetch for API testing
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(response),
      status,
      ok: status >= 200 && status < 300,
    })
  ) as jest.Mock
}

// Setup environment variables for testing
export const setupTestEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.GROQ_API_KEY = 'test-groq-key'
  process.env.GEMINI_API_KEY = 'test-gemini-key'
}

// Clean up after tests
export const cleanupTestEnv = () => {
  jest.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  delete process.env.OPENAI_API_KEY
  delete process.env.GROQ_API_KEY
  delete process.env.GEMINI_API_KEY
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))