'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tripRequestSchema, type TripRequestInput } from '@/schemas/trip'
import type { TripQuote } from '@/types'

interface TripRequestFormProps {
  onQuoteGenerated: (quote: TripQuote, tripData: TripRequestInput) => void
}


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
      duration: 7
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
    <Card className="w-full max-w-2xl mx-auto mobile-form-wrapper">
      <CardHeader>
        <CardTitle>Demande de Transport</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour obtenir un devis et un itinéraire détaillé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mobile-form-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="date" className="mobile-form-label">Date du voyage</Label>
              <Input
                id="date"
                type="date"
                className="mobile-form-input mobile-touch-safe"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive mobile-error-text">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="passengers" className="mobile-form-label">Nombre de passagers</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="8"
                className="mobile-form-input mobile-touch-safe"
                {...register('passengers', { valueAsNumber: true })}
              />
              {errors.passengers && (
                <p className="text-sm text-destructive mobile-error-text">{errors.passengers.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 mobile-form-field">
            <Label htmlFor="duration" className="mobile-form-label">Durée du voyage (en jours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              className="mobile-form-input mobile-touch-safe"
              {...register('duration', { valueAsNumber: true })}
            />
            {errors.duration && (
              <p className="text-sm text-destructive mobile-error-text">{errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="customerName" className="mobile-form-label">Votre nom</Label>
              <Input
                id="customerName"
                placeholder="Ex: Amadou Diallo"
                className="mobile-form-input mobile-touch-safe"
                {...register('customerName')}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive mobile-error-text">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="customerPhone" className="mobile-form-label">Téléphone</Label>
              <Input
                id="customerPhone"
                placeholder="Ex: +221 77 123 45 67"
                className="mobile-form-input mobile-touch-safe"
                {...register('customerPhone')}
              />
              {errors.customerPhone && (
                <p className="text-sm text-destructive mobile-error-text">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="customerEmail" className="mobile-form-label">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="votre@email.com"
                className="mobile-form-input mobile-touch-safe"
                {...register('customerEmail')}
              />
              {errors.customerEmail && (
                <p className="text-sm text-destructive mobile-error-text">{errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2 mobile-form-field">
              <Label htmlFor="specialRequests" className="mobile-form-label">Demandes spéciales (optionnel)</Label>
              <Input
                id="specialRequests"
                placeholder="Ex: Siège enfant, climatisation..."
                className="mobile-form-input mobile-touch-safe"
                {...register('specialRequests')}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive mobile-error-text">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full mobile-form-button mobile-touch-safe" disabled={isLoading}>
            {isLoading ? 'Génération du devis...' : 'Obtenir un devis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}