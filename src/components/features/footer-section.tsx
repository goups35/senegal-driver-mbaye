'use client'

interface FooterSectionProps {
  showFooter: boolean
}

export function FooterSection({ showFooter }: FooterSectionProps) {
  if (!showFooter) return null

  return (
    <footer className="bg-white mt-16 text-center text-sm text-muted-foreground py-8" role="contentinfo">
      <div className="max-w-md mx-auto space-y-2">
        <p>🇸🇳 Service de transport professionnel au Sénégal</p>
        <p>📱 Disponible 24h/24 • 🚗 Flotte moderne • ✨ Devis instantané</p>
        <p className="text-xs">
          Propulsé par l&apos;IA • Made with ❤️ for Sénégal
        </p>
      </div>
    </footer>
  )
}