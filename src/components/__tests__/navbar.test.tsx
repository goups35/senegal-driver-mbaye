import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navigation/navbar'

// Mock usePathname to control the current route
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar', () => {
  it('renders the logo and navigation links', () => {
    render(<Navbar />)
    
    // Vérifier que le nouveau logo est présent
    expect(screen.getByText('Mbaye Transport')).toBeInTheDocument()
    expect(screen.getByText('SÉNÉGAL AUTHENTIQUE')).toBeInTheDocument()
    
    // Vérifier que les liens de navigation sont présents (seulement desktop car mobile est fermé par défaut)
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Découvrez Mbaye')).toBeInTheDocument() 
    expect(screen.getByText('Témoignages')).toBeInTheDocument()
  })

  it('highlights the active page', () => {
    render(<Navbar />)
    
    // Vérifier que l'état actif est appliqué quelque part (le parent du texte "Accueil")
    const accueilContainer = screen.getByText('Accueil').closest('a')
    expect(accueilContainer).toHaveClass('bg-senegal-green')
    expect(accueilContainer).toHaveClass('text-white')
  })

  it('has correct navigation links', () => {
    render(<Navbar />)
    
    const allLinks = screen.getAllByRole('link')
    
    // Vérifier les liens principaux par leur href
    const logoLink = allLinks.find(link => link.getAttribute('href') === '/')
    const mbayeLink = allLinks.find(link => link.getAttribute('href') === '/mbaye')
    const testimonialsLink = allLinks.find(link => link.getAttribute('href') === '/testimonials')
    
    expect(logoLink).toBeInTheDocument()
    expect(mbayeLink).toHaveAttribute('href', '/mbaye')
    expect(testimonialsLink).toHaveAttribute('href', '/testimonials')
  })
})