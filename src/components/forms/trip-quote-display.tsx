'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatWhatsAppUrl } from '@/lib/utils'
import type { TripQuote } from '@/types'

interface TripQuoteDisplayProps {
  quote: TripQuote
  tripData: {
    date: string
    customerName: string
    customerPhone: string
    customerEmail: string
    passengers?: number
    duration?: number
    specialRequests?: string
  }
}

export function TripQuoteDisplay({ quote, tripData }: TripQuoteDisplayProps) {
  const handleWhatsAppContact = () => {
    const message = `Bonjour,

Je souhaite réserver un transport:
📍 De: Dakar
📍 Vers: Aéroport Léopold Sédar Senghor
📅 Date: ${tripData.date}
🕐 Heure: 08:00
📆 Durée: ${tripData.duration || 7} jours

💰 Devis: ${quote.totalPrice.toLocaleString()} FCFA
🚗 Véhicule: ${quote.vehicleInfo.name}
📏 Distance: ${quote.distance} km
⏱️ Durée estimée: ${quote.duration}

Nom: ${tripData.customerName}
Téléphone: ${tripData.customerPhone}
Email: ${tripData.customerEmail}

Merci de confirmer la disponibilité.`

    const whatsappUrl = formatWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+221775762203', message)
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚗 Devis de Transport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Récapitulatif de la demande */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">📋 Récapitulatif de votre demande</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Date:</strong> {new Date(tripData.date).toLocaleDateString('fr-FR')}</div>
              <div><strong>Heure:</strong> 08:00</div>
              <div><strong>Durée:</strong> {tripData.duration || 7} jours</div>
              <div><strong>Passagers:</strong> {tripData.passengers || 1}</div>
              <div><strong>Client:</strong> {tripData.customerName}</div>
              <div><strong>Téléphone:</strong> {tripData.customerPhone}</div>
              <div className="md:col-span-2"><strong>Email:</strong> {tripData.customerEmail}</div>
              {tripData.specialRequests && (
                <div className="md:col-span-2"><strong>Demandes spéciales:</strong> {tripData.specialRequests}</div>
              )}
            </div>
          </div>

          {/* Bouton WhatsApp et alternative email */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-8 py-3"
              size="lg"
            >
              💬 Réserver par WhatsApp
            </Button>

            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas WhatsApp ? Envoyez votre demande à Mbaye sur{' '}
              <a
                href="https://www.instagram.com/mb_tours_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 underline font-medium"
              >
                Instagram
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}