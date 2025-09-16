import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { HomeClient } from '@/components/home-client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock Navbar component
jest.mock('@/components/navigation/navbar', () => ({
  Navbar: function MockNavbar() {
    return <nav data-testid="navbar">Navigation</nav>
  }
}))

// Mock TravelPlannerWrapper component
jest.mock('@/components/features/travel-planner/travel-planner-wrapper', () => ({
  TravelPlannerWrapper: function MockTravelPlannerWrapper() {
    return <div data-testid="travel-planner-wrapper">Travel Planner</div>
  }
}))

const mockPush = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush
  })
})

describe('Transport Navigation from Home', () => {
  it('navigates to /transport when transport button is clicked', () => {
    render(<HomeClient />)

    // Find the transport button
    const transportButton = screen.getByText('Formulaire de contact')
      .closest('button')

    expect(transportButton).toBeInTheDocument()

    // Click the transport button
    fireEvent.click(transportButton!)

    // Verify navigation was called
    expect(mockPush).toHaveBeenCalledWith('/transport')
  })

  it('keeps chat functionality in home page', () => {
    render(<HomeClient />)

    // Find the chat button
    const chatButton = screen.getByText('Votre itinéraire personnalisé avec l\'IA')
      .closest('button')

    expect(chatButton).toBeInTheDocument()

    // Click the chat button
    fireEvent.click(chatButton!)

    // Should not navigate, just change mode
    expect(mockPush).not.toHaveBeenCalled()

    // Should show travel planner
    expect(screen.getByTestId('travel-planner-wrapper')).toBeInTheDocument()
  })

  it('shows correct hero content on home page', () => {
    render(<HomeClient />)

    expect(screen.getByText('Découvrez le Sénégal')).toBeInTheDocument()
    expect(screen.getByText('Voyagez en confiance avec votre chauffeur Mbaye')).toBeInTheDocument()

    // Both action buttons should be visible
    expect(screen.getByText('Formulaire de contact')).toBeInTheDocument()
    expect(screen.getByText('Votre itinéraire personnalisé avec l\'IA')).toBeInTheDocument()
  })
})