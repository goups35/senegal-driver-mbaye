'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatWhatsAppUrl } from '@/lib/utils'
import type { TripQuote } from '@/types'

interface TripQuoteDisplayProps {
  quote: TripQuote
  tripData: {
    departure: string
    destination: string
    date: string
    time: string
    customerName: string
    customerPhone: string
    customerEmail?: string
    passengers?: number
    vehicleType?: string
    specialRequests?: string
  }
}

export function TripQuoteDisplay({ quote, tripData }: TripQuoteDisplayProps) {
  const handleWhatsAppContact = () => {
    const message = `Bonjour,

Je souhaite réserver un transport:
📍 De: ${tripData.departure}
📍 Vers: ${tripData.destination}
📅 Date: ${tripData.date}
🕐 Heure: ${tripData.time}

💰 Devis: ${quote.totalPrice.toLocaleString()} FCFA
🚗 Véhicule: ${quote.vehicleInfo.name}
📏 Distance: ${quote.distance} km
⏱️ Durée estimée: ${quote.duration}

Nom: ${tripData.customerName}
Téléphone: ${tripData.customerPhone}

Merci de confirmer la disponibilité.`

    const whatsappUrl = formatWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+33626388794', message)
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailContact = async () => {
    try {
      await fetch('/api/trips/email-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote, tripData })
      })
      alert('Email envoyé avec succès!')
    } catch {
      alert('Erreur lors de l\'envoi de l\'email')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚗 Devis de Transport
          </CardTitle>
          <CardDescription>
            Itinéraire de {tripData.departure} vers {tripData.destination}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🚙 Véhicule sélectionné</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><strong>Modèle:</strong> {quote.vehicleInfo.name}</div>
              <div><strong>Capacité:</strong> {quote.vehicleInfo.capacity} passagers</div>
              <div><strong>Type:</strong> {quote.vehicleInfo.type}</div>
              <div><strong>Tarif/km:</strong> {quote.vehicleInfo.pricePerKm} FCFA</div>
            </div>
            <div className="mt-2">
              <strong>Équipements:</strong> {quote.vehicleInfo.features.join(', ')}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🗺️ Itinéraire détaillé</h3>
            <div className="space-y-2">
              {quote.route.map((step, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div>{step.instruction}</div>
                    <div className="text-muted-foreground text-xs">
                      {step.distance} • {step.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">📋 Récapitulatif de votre demande</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><strong>Date:</strong> {new Date(tripData.date).toLocaleDateString('fr-FR')}</div>
              <div><strong>Heure:</strong> {tripData.time}</div>
              <div><strong>Client:</strong> {tripData.customerName}</div>
              <div><strong>Téléphone:</strong> {tripData.customerPhone}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button 
              onClick={handleWhatsAppContact}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              💬 Réserver via WhatsApp
            </Button>
            <Button 
              onClick={handleEmailContact}
              variant="outline"
              className="flex-1"
            >
              📧 Recevoir par email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}