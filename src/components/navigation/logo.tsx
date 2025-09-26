import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon avec image MB Tours */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/images/mb_tours.jpg"
            alt="MB Tours Logo"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-baobab-brown leading-tight">
          Mbaye Transport
        </span>
        <span className="text-xs text-senegal-green font-medium tracking-wide">
          SÉNÉGAL AUTHENTIQUE
        </span>
      </div>
    </Link>
  )
}