import Link from 'next/link'
import { SenegalFlag } from '@/components/ui/senegal-flag'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon avec drapeau */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
          <SenegalFlag className="w-full h-full" />
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