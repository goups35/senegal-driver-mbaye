'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

    const whatsappUrl = formatWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+33626388794', message)
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚗 Devis de Transport
          </CardTitle>
          <CardDescription>
            Votre devis pour Dakar → Aéroport Léopold Sédar Senghor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Résumé du devis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {quote.totalPrice.toLocaleString()} FCFA
              </div>
              <div className="text-sm text-muted-foreground">Prix total</div>
            </div>

            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {quote.distance} km
              </div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </div>

            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {quote.duration}
              </div>
              <div className="text-sm text-muted-foreground">Durée estimée</div>
            </div>
          </div>

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
              Vous n'avez pas WhatsApp ? Envoyez-nous votre demande par email avec{' '}
              <a
                href="mailto:legoupil.alexandre@gmail.com?subject=Demande%20de%20transport%20Sénégal&body=Bonjour%2C%0A%0AJe%20souhaite%20faire%20une%20demande%20de%20transport%20au%20Sénégal.%0A%0AMerci"
                className="text-primary hover:underline font-medium"
              >
                legoupil.alexandre@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}