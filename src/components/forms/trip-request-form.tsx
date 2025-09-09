'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { tripRequestSchema, type TripRequestInput } from '@/schemas/trip'
import type { TripQuote } from '@/types'

interface TripRequestFormProps {
  onQuoteGenerated: (quote: TripQuote, tripData: TripRequestInput) => void
}

const vehicleOptions = [
  { value: 'standard', label: 'Standard (4 places)', description: 'Véhicule économique' },
  { value: 'premium', label: 'Premium (4 places)', description: 'Confort supérieur' },
  { value: 'suv', label: 'SUV (7 places)', description: 'Espace famille' }
]

export function TripRequestForm({ onQuoteGenerated }: TripRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TripRequestInput>({
    resolver: zodResolver(tripRequestSchema),
    defaultValues: {
      passengers: 1,
      vehicleType: 'standard'
    }
  })

  const onSubmit = async (data: TripRequestInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trips/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du devis')
      }

      const quote: TripQuote = await response.json()
      onQuoteGenerated(quote, data)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demande de Transport</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour obtenir un devis et un itinéraire détaillé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure">Lieu de départ</Label>
              <Input
                id="departure"
                placeholder="Ex: Dakar, Place de l'Indépendance"
                {...register('departure')}
              />
              {errors.departure && (
                <p className="text-sm text-destructive">{errors.departure.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="Ex: Aéroport Léopold Sédar Senghor"
                {...register('destination')}
              />
              {errors.destination && (
                <p className="text-sm text-destructive">{errors.destination.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date du voyage</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Heure de départ</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengers">Nombre de passagers</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="8"
                {...register('passengers', { valueAsNumber: true })}
              />
              {errors.passengers && (
                <p className="text-sm text-destructive">{errors.passengers.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Type de véhicule</Label>
              <Select {...register('vehicleType')}>
                {vehicleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </Select>
              {errors.vehicleType && (
                <p className="text-sm text-destructive">{errors.vehicleType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Votre nom</Label>
              <Input
                id="customerName"
                placeholder="Ex: Amadou Diallo"
                {...register('customerName')}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input
                id="customerPhone"
                placeholder="Ex: +221 77 123 45 67"
                {...register('customerPhone')}
              />
              {errors.customerPhone && (
                <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (optionnel)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="votre@email.com"
                {...register('customerEmail')}
              />
              {errors.customerEmail && (
                <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Demandes spéciales (optionnel)</Label>
              <Input
                id="specialRequests"
                placeholder="Ex: Siège enfant, climatisation..."
                {...register('specialRequests')}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Génération du devis...' : 'Obtenir un devis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}