'use client'

import { Message } from '@/hooks/use-chat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function ChatMessages({ messages, isLoading, messagesEndRef }: ChatMessagesProps) {
  return (
    <div 
      className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded"
      role="log"
      aria-live="polite"
      aria-label="Conversation avec l'assistant"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-4'
                : 'bg-white border border-border mr-4'
            }`}
            role={message.role === 'assistant' ? 'article' : undefined}
            aria-label={message.role === 'assistant' ? 'Message de l\'assistant' : 'Votre message'}
          >
            {message.content}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start" aria-live="assertive">
          <div className="bg-white border border-border p-3 rounded-lg mr-4">
            <LoadingSpinner size="sm" />
            <span className="sr-only">L'assistant est en train d'écrire...</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}