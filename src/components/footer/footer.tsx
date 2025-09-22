interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-white mt-16 text-center text-sm text-muted-foreground py-8 ${className}`}>
      <div className="max-w-md mx-auto">
        <p>Propulsé par l&apos;IA ⚪ Site développé avec ❤️ par des anciens clients de Mbaye</p>
      </div>
    </footer>
  )
}