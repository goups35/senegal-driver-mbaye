import type { Metadata } from 'next'
import { ChatClient } from './chat-client'

export const metadata: Metadata = {
  title: 'Assistant IA Personnel - Sénégal Driver',
  description: 'Planifiez votre voyage au Sénégal avec l\'assistant IA personnel de Mbaye. Itinéraires sur-mesure, conseils d\'expert, conversation naturelle.',
  keywords: [
    'assistant IA Sénégal',
    'planificateur voyage Sénégal',
    'itinéraire personnalisé Sénégal',
    'conseiller voyage IA',
    'guide Sénégal IA',
    'voyage sur-mesure Sénégal',
    'assistant voyage intelligent'
  ],
  openGraph: {
    title: 'Assistant IA Personnel - Sénégal Driver',
    description: 'Planifiez votre voyage au Sénégal avec l\'assistant IA personnel de Mbaye. Conversations naturelles pour des itinéraires sur-mesure.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Sénégal Driver'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assistant IA Personnel - Sénégal Driver',
    description: 'Assistant IA pour planifier votre voyage au Sénégal. Conseils d\'expert et itinéraires personnalisés.'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function ChatPage() {
  return <ChatClient />
}