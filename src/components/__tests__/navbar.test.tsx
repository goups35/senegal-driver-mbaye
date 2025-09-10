import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navigation/navbar'

// Mock usePathname to control the current route
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar', () => {
  it('renders the logo and navigation links', () => {
    render(<Navbar />)
    
    // Vérifier que le logo est présent
    expect(screen.getByText('Transport Sénégal')).toBeInTheDocument()
    
    // Vérifier que les liens de navigation sont présents (getAllBy pour gérer desktop/mobile)
    expect(screen.getAllByText('Accueil')).toHaveLength(2) // desktop + mobile
    expect(screen.getAllByText('Découvrez Mbaye')).toHaveLength(2)
    expect(screen.getAllByText('Témoignages')).toHaveLength(2)
  })

  it('highlights the active page', () => {
    render(<Navbar />)
    
    const accueilLinks = screen.getAllByText('Accueil')
    const desktopAccueilLink = accueilLinks.find(link => 
      link.className.includes('border-b-2')
    )
    
    // Vérifier que le lien actuel a les bonnes classes CSS
    expect(desktopAccueilLink).toHaveClass('text-senegal-green')
    expect(desktopAccueilLink).toHaveClass('border-senegal-green')
  })

  it('has correct navigation links', () => {
    render(<Navbar />)
    
    const allLinks = screen.getAllByRole('link')
    const accueilLink = allLinks.find(link => link.textContent === 'Accueil' && link.getAttribute('href') === '/')
    const mbayeLink = allLinks.find(link => link.textContent === 'Découvrez Mbaye')
    const testimonialsLink = allLinks.find(link => link.textContent === 'Témoignages')
    
    expect(accueilLink).toHaveAttribute('href', '/')
    expect(mbayeLink).toHaveAttribute('href', '/mbaye')
    expect(testimonialsLink).toHaveAttribute('href', '/testimonials')
  })
})