/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface SaveItineraryRequest {
  recommendation: Record<string, any>
  extractedInfo: Record<string, any>
  conversationalResponse: string
  clientName?: string
  clientPhone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveItineraryRequest = await request.json()
    const { recommendation, extractedInfo, conversationalResponse, clientName, clientPhone } = body

    if (!recommendation || !conversationalResponse) {
      return NextResponse.json(
        { error: 'Données de recommandation requises' },
        { status: 400 }
      )
    }

    // Extraire les informations principales
    const destinations = recommendation.itinerary?.destinations || []
    const mainDestinations = destinations.slice(0, 3).map((d: any) => ({
      id: d.id,
      name: d.name,
      region: d.region
    }))

    const duration = extractedInfo.dates?.duration || recommendation.itinerary?.duration || 7
    const groupSize = extractedInfo.groupInfo?.size || 1
    
    // Générer le titre automatiquement
    const destinationNames = mainDestinations.map((d: any) => d.name).join(' + ')
    const title = `${destinationNames} (${duration}j)`

    // Extraire budget
    const budgetMin = recommendation.itinerary?.totalCost?.min || null
    const budgetMax = recommendation.itinerary?.totalCost?.max || null
    const budgetCurrency = recommendation.itinerary?.totalCost?.currency || 'FCFA'

    // Générer le message WhatsApp optimisé
    const whatsappMessage = generateWhatsAppMessage({
      destinations: mainDestinations,
      duration,
      budget: budgetMin && budgetMax ? `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} ${budgetCurrency}` : 'Sur mesure',
      groupSize,
      clientName: clientName || 'Voyageur'
    })

    // Sauvegarder en base
    const { data, error } = await supabase
      .from('saved_itineraries')
      .insert({
        title,
        client_name: clientName,
        client_phone: clientPhone,
        destinations: mainDestinations,
        itinerary_data: recommendation,
        ai_recommendation: {
          response: conversationalResponse,
          extractedInfo,
          timestamp: new Date().toISOString()
        },
        whatsapp_message: whatsappMessage,
        duration: parseInt(duration.toString()),
        budget_min: budgetMin,
        budget_max: budgetMax,
        budget_currency: budgetCurrency,
        group_size: groupSize
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erreur sauvegarde Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      itineraryId: data.id,
      title,
      whatsappMessage,
      planningUrl: `/planning/${data.id}`
    })

  } catch (error) {
    console.error('Save Itinerary API Error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la sauvegarde de l\'itinéraire',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET pour récupérer un itinéraire sauvegardé
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'itinéraire requis' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Itinéraire non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Get Itinerary API Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'itinéraire' },
      { status: 500 }
    )
  }
}

function generateWhatsAppMessage({ destinations, duration, budget, groupSize, clientName }: {
  destinations: any[]
  duration: number | string
  budget: string
  groupSize: number
  clientName: string
}): string {
  const destinationNames = destinations.map(d => d.name).join(', ')
  
  return `🇸🇳 Salut Mbaye ! ${clientName} souhaite réserver un voyage au Sénégal :

📍 Destinations : ${destinationNames}
📅 Durée : ${duration} jours
👥 Voyageurs : ${groupSize} personne${groupSize > 1 ? 's' : ''}
💰 Budget : ${budget}

Peux-tu me confirmer la disponibilité et envoyer les détails pratiques ?

Merci ! 🙏

---
Planning généré via Transport Sénégal`
}