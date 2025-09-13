'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ onSendMessage, isLoading, placeholder = "Tapez votre message..." }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('')

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useKeyboardNavigation({
    onEnter: () => {
      if (document.activeElement === document.querySelector('input[type="text"]')) {
        handleSend()
      }
    }
  })

  return (
    <div className="flex gap-2">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1"
        aria-label="Message à envoyer"
      />
      <AccessibleButton 
        onClick={handleSend} 
        disabled={isLoading || !inputMessage.trim()}
        loading={isLoading}
        loadingText="Envoi en cours..."
        aria-describedby="chat-input-hint"
      >
        Envoyer
      </AccessibleButton>
      <div id="chat-input-hint" className="sr-only">
        Appuyez sur Entrée pour envoyer le message
      </div>
    </div>
  )
}