'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatWhatsAppUrl } from '@/lib/utils'

interface Destination {
  id: string
  name: string
  region?: string
}

interface SavedItinerary {
  id: string
  title: string
  whatsappMessage: string
  planningUrl: string
}

interface PlanningCardProps {
  title: string
  destinations: Destination[]
  duration: number
  budget: string
  groupSize: number
  itineraryData: Record<string, unknown>
  savedItinerary?: SavedItinerary
  whatsappPhone?: string
  onWhatsAppSend?: (message: string) => void
  onModify?: () => void
}

export function PlanningCard({ 
  title, 
  destinations, 
  duration, 
  budget, 
  groupSize,
  itineraryData,
  savedItinerary,
  whatsappPhone = '+33626388794',
  onWhatsAppSend,
  onModify 
}: PlanningCardProps) {
  
  const handleWhatsAppShare = () => {
    const message = savedItinerary?.whatsappMessage || generateDefaultMessage()
    
    if (onWhatsAppSend) {
      onWhatsAppSend(message)
    } else {
      const whatsappUrl = formatWhatsAppUrl(whatsappPhone, message)
      window.open(whatsappUrl, '_blank')
    }
  }

  const generateDefaultMessage = () => {
    const destinationNames = destinations.map(d => d.name).join(', ')
    return `🇸🇳 Salut Mbaye ! Je souhaite réserver un voyage au Sénégal :

📍 Destinations : ${destinationNames}
📅 Durée : ${duration} jours
👥 Voyageurs : ${groupSize} personne${groupSize > 1 ? 's' : ''}
💰 Budget : ${budget}

Peux-tu me confirmer la disponibilité et envoyer les détails pratiques ?

Merci ! 🙏`
  }

  const generateDayByDaySchedule = () => {
    if (!itineraryData?.itinerary?.destinations) return []
    
    const destinations = itineraryData.itinerary.destinations
    const daysPerDestination = Math.max(1, Math.floor(duration / destinations.length))
    let currentDay = 1
    
    return destinations.map((dest: Record<string, unknown>, index: number) => {
      const isLast = index === destinations.length - 1
      const daysForThisDestination = isLast ? (duration - currentDay + 1) : daysPerDestination
      const endDay = currentDay + daysForThisDestination - 1
      
      const result = {
        days: daysForThisDestination === 1 ? `Jour ${currentDay}` : `Jours ${currentDay}-${endDay}`,
        destination: dest.name,
        description: dest.description?.substring(0, 100) + '...' || '',
        activities: (dest.authenticExperiences as Record<string, unknown>[] || [])?.slice(0, 2).map((exp: Record<string, unknown>) => exp.name) || []
      }
      
      currentDay = endDay + 1
      return result
    })
  }

  const schedule = generateDayByDaySchedule()

  return (
    <Card className="w-full max-w-4xl mx-auto border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">✅ {title}</h3>
            <p className="text-green-100 text-sm mt-1">
              Planning validé et sauvegardé
            </p>
          </div>
          <div className="text-right text-sm">
            <div>{duration} jours</div>
            <div>{groupSize} voyageur{groupSize > 1 ? 's' : ''}</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Récapitulatif en tête */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-700 mb-2">🎯 Destinations</h4>
            <p className="text-sm">
              {destinations.map(d => d.name).join(', ')}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-700 mb-2">💰 Budget</h4>
            <p className="text-sm">{budget}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-700 mb-2">🚗 Guide</h4>
            <p className="text-sm">Mbaye Diop</p>
            <p className="text-xs text-gray-500">+33 6 26 38 87 94</p>
          </div>
        </div>

        {/* Planning jour par jour */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-4">📅 Planning jour par jour</h4>
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-green-700">{day.days}</h5>
                  <span className="text-sm font-semibold text-gray-600">{day.destination}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                {day.activities.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {day.activities.map((activity, actIndex) => (
                      <span 
                        key={actIndex}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={handleWhatsAppShare}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2"
          >
            <span>💬</span>
            Envoyer à Mbaye (WhatsApp)
          </Button>
          
          {savedItinerary?.planningUrl && (
            <Button
              onClick={() => window.open(savedItinerary.planningUrl, '_blank')}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-2 flex items-center gap-2"
            >
              <span>📋</span>
              Voir planning complet
            </Button>
          )}
          
          {onModify && (
            <Button
              onClick={onModify}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-2 flex items-center gap-2"
            >
              <span>✏️</span>
              Modifier le planning
            </Button>
          )}
        </div>

        {/* Info de sauvegarde */}
        {savedItinerary && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              🔒 Planning sauvegardé • ID: {savedItinerary.id.substring(0, 8)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}