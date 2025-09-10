'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Accueil', href: '/' },
  { name: 'Découvrez Mbaye', href: '/mbaye' },
  { name: 'Témoignages', href: '/testimonials' },
]

interface NavigationLinksProps {
  className?: string
  isMobile?: boolean
  onClick?: () => void
}

export function NavigationLinks({ className = '', isMobile = false, onClick }: NavigationLinksProps) {
  const pathname = usePathname()

  const linkBaseClass = isMobile
    ? "px-4 py-3 rounded-xl transition-all duration-200"
    : "px-4 py-2 rounded-lg transition-all duration-200"

  const getLinkClass = (href: string) => {
    const isActive = pathname === href
    
    if (isMobile) {
      return `${linkBaseClass} ${
        isActive
          ? 'bg-senegal-green text-white font-semibold shadow-md'
          : 'text-baobab-brown hover:bg-sahel-sand hover:text-senegal-green'
      }`
    }
    
    return `${linkBaseClass} ${
      isActive
        ? 'bg-senegal-green text-white font-semibold shadow-md scale-105'
        : 'text-baobab-brown hover:bg-sahel-sand/50 hover:text-senegal-green hover:scale-105'
    }`
  }

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'hidden md:flex space-x-2'} ${className}`}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={getLinkClass(item.href)}
        >
          <span className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  )
}