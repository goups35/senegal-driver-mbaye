import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { TransportClient } from '../transport-client'
import { TripProvider } from '@/context/trip-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock TransportQuoteWrapper component
jest.mock('@/components/features/transport-quote/transport-quote-wrapper', () => ({
  TransportQuoteWrapper: function MockTransportQuoteWrapper({
    onQuoteGenerated,
    onReset
  }: {
    onQuoteGenerated: (quote: { id: string; price: number }, data: { from: string; to: string }) => void
    onReset: () => void
  }) {
    return (
      <div data-testid="transport-quote-wrapper">
        <button
          onClick={() => onQuoteGenerated(
            { id: 'test-quote', price: 50000 },
            { from: 'Dakar', to: 'Saint-Louis' }
          )}
          data-testid="generate-quote-btn"
        >
          Générer devis
        </button>
        <button onClick={onReset} data-testid="reset-btn">
          Reset
        </button>
      </div>
    )
  }
}))

// Mock Navbar component
jest.mock('@/components/navigation/navbar', () => ({
  Navbar: function MockNavbar() {
    return <nav data-testid="navbar">Navigation</nav>
  }
}))

const mockPush = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush
  })
})

function renderWithContext(component: React.ReactElement) {
  return render(
    <TripProvider>
      {component}
    </TripProvider>
  )
}

describe('TransportClient', () => {
  it('renders without errors', () => {
    renderWithContext(<TransportClient />)

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('transport-quote-wrapper')).toBeInTheDocument()
    expect(screen.getByText('← Retour aux options')).toBeInTheDocument()
  })

  it('navigates to home when back button is clicked', () => {
    renderWithContext(<TransportClient />)

    const backButton = screen.getByText('← Retour aux options')
    fireEvent.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles quote generation through TripContext', () => {
    renderWithContext(<TransportClient />)

    const generateButton = screen.getByTestId('generate-quote-btn')
    fireEvent.click(generateButton)

    // Should not crash - the context should handle the update
    expect(screen.getByTestId('transport-quote-wrapper')).toBeInTheDocument()
  })

  it('handles reset through TripContext', () => {
    renderWithContext(<TransportClient />)

    const resetButton = screen.getByTestId('reset-btn')
    fireEvent.click(resetButton)

    // Should not crash - the context should handle the reset
    expect(screen.getByTestId('transport-quote-wrapper')).toBeInTheDocument()
  })

  it('renders footer correctly', () => {
    renderWithContext(<TransportClient />)

    expect(screen.getByText('🇸🇳 Service de transport professionnel au Sénégal')).toBeInTheDocument()
    expect(screen.getByText('📱 Disponible 24h/24 • 🚗 Flotte moderne • ✨ Devis instantané')).toBeInTheDocument()
    expect(screen.getByText('Propulsé par l\'IA • Made with ❤️ for Sénégal')).toBeInTheDocument()
  })
})