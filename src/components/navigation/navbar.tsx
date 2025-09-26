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

          {/* Social Links + WhatsApp CTA Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/mb_tours_/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 transition-all hover:scale-110 group"
              aria-label="Suivez-nous sur Instagram"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@mb_tours?_t=ZM-8zxzCksEXnc&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-black transition-all hover:scale-110 group"
              aria-label="Suivez-nous sur TikTok"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
              </svg>
            </a>

            {/* WhatsApp */}
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