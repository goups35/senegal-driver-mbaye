import type { Metadata } from 'next'
import { TransportClient } from './transport-client'

export const metadata: Metadata = {
  title: 'Devis Transport - Sénégal Driver',
  description: 'Obtenez votre devis de transport personnalisé au Sénégal avec Mbaye. Service professionnel, tarifs transparents, disponible 24h/24.',
  keywords: [
    'transport Sénégal',
    'devis transport',
    'chauffeur Sénégal',
    'transport Dakar',
    'taxi Sénégal',
    'voyage Sénégal',
    'transport touristique'
  ],
  openGraph: {
    title: 'Devis Transport - Sénégal Driver',
    description: 'Service de transport professionnel au Sénégal. Obtenez votre devis instantané avec Mbaye.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Sénégal Driver'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Transport - Sénégal Driver',
    description: 'Service de transport professionnel au Sénégal. Devis instantané disponible.'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function TransportPage() {
  return <TransportClient />
}