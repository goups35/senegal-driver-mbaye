'use client'

import { useState } from 'react'
import { NavigationLinks } from './navigation-links'
import { WhatsAppLogo } from '@/components/ui/whatsapp-logo'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-baobab-brown hover:text-senegal-green hover:bg-sahel-sand/50 rounded-lg transition-all duration-200"
        aria-label="Toggle mobile menu"
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-18 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 animate-in slide-in-from-top duration-200">
            <div className="container mx-auto px-4 py-6">
              <NavigationLinks 
                isMobile={true} 
                onClick={closeMenu}
                className="space-y-1"
              />
              
              {/* Mobile CTA WhatsApp */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href="https://wa.me/33626388794?text=Bonjour%20Mbaye%2C%20j%27aimerais%20avoir%20des%20informations%20sur%20vos%20services%20de%20transport%20au%20S%C3%A9n%C3%A9gal"
                  className="flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                  onClick={closeMenu}
                >
                  <WhatsAppLogo className="w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Contacter Mbaye</span>
                    <span className="text-xs opacity-90">+33 6 26 38 87 94</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}