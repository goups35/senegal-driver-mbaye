'use client'

import { AccessibleButton } from '@/components/ui/accessible-button'

interface ChatQuickActionsProps {
  onSendMessage: (message: string) => void
  onWhatsAppExport: () => void
  isLoading: boolean
  showWhatsAppButton: boolean
}

const quickMessages = [
  {
    label: '💡 1 semaine culture + plages',
    message: 'Une semaine, budget moyen, j\'aime la culture et les plages',
    ariaLabel: 'Suggérer un voyage d\'une semaine alliant culture et plages'
  },
  {
    label: '🌍 1 semaine roots',
    message: 'je souhaite découvrir le plus possible le Sénégal en 1 semaine',
    ariaLabel: 'Suggérer un voyage d\'une semaine pour découvrir le Sénégal'
  },
  {
    label: '🎯 1 semaine Guy',
    message: 'je souhaite organiser moi-même ma semaine, j\'ai déjà en tête les endroits à visiter',
    ariaLabel: 'Organiser un voyage personnalisé d\'une semaine'
  }
]

export function ChatQuickActions({ 
  onSendMessage, 
  onWhatsAppExport, 
  isLoading, 
  showWhatsAppButton 
}: ChatQuickActionsProps) {
  return (
    <div className="flex gap-2 flex-wrap" role="group" aria-label="Actions rapides">
      {quickMessages.map((item, index) => (
        <AccessibleButton
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSendMessage(item.message)}
          disabled={isLoading}
          aria-label={item.ariaLabel}
        >
          {item.label}
        </AccessibleButton>
      ))}
      
      <AccessibleButton
        variant="outline"
        size="sm"
        onClick={onWhatsAppExport}
        disabled={isLoading || !showWhatsAppButton}
        aria-label="Valider le programme de voyage et l'envoyer via WhatsApp"
      >
        ✅ Valider le programme
      </AccessibleButton>
    </div>
  )
}