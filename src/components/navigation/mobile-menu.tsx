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
              
              {/* Mobile Social Links + WhatsApp */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {/* Social Links */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/mb_tours_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 transition-all hover:scale-110 group"
                    aria-label="Suivez-nous sur Instagram"
                    onClick={closeMenu}
                  >
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@mb_tours?_t=ZM-8zxzCksEXnc&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl hover:bg-black transition-all hover:scale-110 group"
                    aria-label="Suivez-nous sur TikTok"
                    onClick={closeMenu}
                  >
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
                    </svg>
                  </a>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/221775762203?text=Bonjour%20Mbaye%2C%20j%27aimerais%20avoir%20des%20informations%20sur%20vos%20services%20de%20transport%20au%20S%C3%A9n%C3%A9gal"
                  className="flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                  onClick={closeMenu}
                >
                  <WhatsAppLogo className="w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Contacter Mbaye</span>
                    <span className="text-xs opacity-90">+221 77 576 22 03</span>
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