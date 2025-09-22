import { Logo } from './logo'
import { NavigationLinks } from './navigation-links'
import { MobileMenu } from './mobile-menu'
import { WhatsAppLogo } from '@/components/ui/whatsapp-logo'

export function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <NavigationLinks />

          {/* CTA Button Desktop - WhatsApp Style */}
          <div className="hidden md:block">
            <a
              href="https://wa.me/221775762203?text=Bonjour%20Mbaye%2C%20j%27aimerais%20avoir%20des%20informations%20sur%20vos%20services%20de%20transport%20au%20S%C3%A9n%C3%A9gal"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <WhatsAppLogo className="w-4 h-4" />
              <span className="text-sm">+221 77 576 22 03</span>
            </a>
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}