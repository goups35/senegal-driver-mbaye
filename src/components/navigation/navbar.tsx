'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Découvrez Mbaye', href: '/mbaye' },
    { name: 'Témoignages', href: '/testimonials' },
  ]

  return (
    <nav className="bg-white border-b border-sahel-sand sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-senegal-green to-ocean-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-senegal-green via-ocean-blue to-teranga-orange bg-clip-text text-transparent">
              Transport Sénégal
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-senegal-green ${
                  pathname === item.href
                    ? 'text-senegal-green border-b-2 border-senegal-green'
                    : 'text-baobab-brown'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-baobab-brown hover:text-senegal-green">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-senegal-green ${
                  pathname === item.href
                    ? 'text-senegal-green'
                    : 'text-baobab-brown'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}