import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
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
  client_name?: string
  client_phone?: string
  destinations: Destination[]
  itinerary_data: any
  ai_recommendation: any
  whatsapp_message: string
  duration: number
  budget_min?: number
  budget_max?: number
  budget_currency: string
  group_size: number
  status: string
  created_at: string
  updated_at: string
}

async function getItinerary(id: string): Promise<SavedItinerary | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/save-itinerary?id=${id}`, {
      cache: 'no-store' // Toujours récupérer la version la plus récente
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur récupération itinéraire:', error)
    return null
  }
}

export default async function PlanningPage({ params }: { params: { id: string } }) {
  const itinerary = await getItinerary(params.id)

  if (!itinerary) {
    notFound()
  }

  const generateDayByDaySchedule = () => {
    if (!itinerary.itinerary_data?.itinerary?.destinations) return []
    
    const destinations = itinerary.itinerary_data.itinerary.destinations
    const daysPerDestination = Math.max(1, Math.floor(itinerary.duration / destinations.length))
    let currentDay = 1
    
    return destinations.map((dest: any, index: number) => {
      const isLast = index === destinations.length - 1
      const daysForThisDestination = isLast ? (itinerary.duration - currentDay + 1) : daysPerDestination
      const endDay = currentDay + daysForThisDestination - 1
      
      const result = {
        days: daysForThisDestination === 1 ? `Jour ${currentDay}` : `Jours ${currentDay}-${endDay}`,
        destination: dest.name,
        region: dest.region || '',
        description: dest.description || '',
        activities: dest.authenticExperiences?.map((exp: any) => ({
          name: exp.name,
          description: exp.description,
          duration: exp.duration
        })) || [],
        mbayeAdvice: dest.mbayeRecommendation || '',
        estimatedCost: dest.cost || null
      }
      
      currentDay = endDay + 1
      return result
    })
  }

  const schedule = generateDayByDaySchedule()
  const budgetDisplay = itinerary.budget_min && itinerary.budget_max 
    ? `${itinerary.budget_min.toLocaleString()} - ${itinerary.budget_max.toLocaleString()} ${itinerary.budget_currency}`
    : 'Sur mesure'

  const handleWhatsAppShare = () => {
    const whatsappUrl = formatWhatsAppUrl('+33626388794', itinerary.whatsapp_message)
    window.open(whatsappUrl, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🇸🇳 {itinerary.title}
          </h1>
          <p className="text-gray-600">
            Planning généré le {new Date(itinerary.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Résumé du voyage */}
        <Card className="mb-8 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle>📋 Résumé de votre voyage</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-2">🎯 Destinations</h3>
                <p className="text-sm">
                  {itinerary.destinations.map(d => d.name).join(', ')}
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-2">📅 Durée</h3>
                <p className="text-lg font-bold text-green-600">{itinerary.duration} jours</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-2">👥 Voyageurs</h3>
                <p className="text-lg">{itinerary.group_size} personne{itinerary.group_size > 1 ? 's' : ''}</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-2">💰 Budget</h3>
                <p className="text-sm font-medium">{budgetDisplay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planning détaillé jour par jour */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-700">📅 Planning détaillé jour par jour</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {schedule.map((day, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-6 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-green-700">{day.days}</h3>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{day.destination}</p>
                      {day.region && <p className="text-sm text-gray-500">{day.region}</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">📍 Description</h4>
                    <p className="text-gray-600 leading-relaxed">{day.description}</p>
                  </div>

                  {day.activities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-3">🎯 Activités prévues</h4>
                      <div className="grid gap-3">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <h5 className="font-medium text-green-700 mb-1">{activity.name}</h5>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            {activity.duration && (
                              <p className="text-xs text-green-600 mt-1">
                                Durée recommandée: {activity.duration.recommended}h - {activity.duration.optimal}h
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {day.mbayeAdvice && (
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-700 mb-2">💡 Conseil de Mbaye</h4>
                      <p className="text-blue-800 italic">{day.mbayeAdvice}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informations pratiques */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700">🚗 Informations pratiques</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📞 Votre chauffeur-guide</h4>
                <div className="space-y-2">
                  <p><strong>Mbaye Diop</strong></p>
                  <p>📱 WhatsApp: +33 6 26 38 87 94</p>
                  <p>🇫🇷 Français / 🇬🇧 English / Wolof</p>
                  <p>⭐ 20+ ans d'expérience</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">🎒 Ce qui est inclus</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Transport en véhicule climatisé</li>
                  <li>✅ Guide culturel et linguistique</li>
                  <li>✅ Assistance 24h/24</li>
                  <li>✅ Contacts privilégiés locaux</li>
                  <li>✅ Flexibilité totale d'horaires</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap justify-center mb-8 print:hidden">
          <Button
            onClick={handleWhatsAppShare}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            size="lg"
          >
            💬 Contacter Mbaye (WhatsApp)
          </Button>
          
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            size="lg"
          >
            🖨️ Imprimer le planning
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 text-lg"
            size="lg"
          >
            ← Retour
          </Button>
        </div>

        {/* Footer informations */}
        <div className="text-center text-sm text-gray-500 print:block">
          <p>Planning généré par Transport Sénégal - Votre voyage authentique au Sénégal</p>
          <p>ID du planning: {itinerary.id}</p>
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          body { 
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const itinerary = await getItinerary(params.id)

  if (!itinerary) {
    return {
      title: 'Planning non trouvé',
    }
  }

  return {
    title: `${itinerary.title} - Planning Sénégal`,
    description: `Planning de voyage au Sénégal: ${itinerary.destinations.map(d => d.name).join(', ')} - ${itinerary.duration} jours`,
  }
}