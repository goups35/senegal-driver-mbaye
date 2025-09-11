import { NextRequest, NextResponse } from 'next/server'
import { generateAIRecommendation, extractClientInfo, scoreRecommendation } from '@/lib/ai-senegal-expert'
import type { AIRecommendationRequest } from '@/types/destinations'
import type { AIConversationMessage } from '@/types/workflow'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      message, 
      conversationHistory = [],
      clientPreferences = {},
      context = 'initial_inquiry'
    } = body

    // Validation des données d'entrée
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Construction de l'historique avec le nouveau message
    const updatedHistory: AIConversationMessage[] = [
      ...conversationHistory,
      {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
        metadata: {}
      }
    ]

    // Extraction des informations client depuis l'historique
    const extractedInfo = extractClientInfo(updatedHistory)

    // Construction de la requête pour l'IA
    const aiRequest: AIRecommendationRequest = {
      clientPreferences: {
        interests: [],
        culturalImmersionLevel: 'moderate',
        activityLevel: 'moderate',
        accommodationPreference: 'mid-range',
        dietaryRestrictions: [],
        languagePreference: ['français'],
        transportComfort: 'standard',
        ...clientPreferences
      },
      travelDates: {
        arrival: '',
        departure: ''
      },
      groupSize: extractedInfo.groupInfo?.size || 1,
      budget: extractedInfo.budget ? {
        min: extractedInfo.budget.amount * 0.8,
        max: extractedInfo.budget.amount * 1.2,
        currency: extractedInfo.budget.currency as 'XOF' | 'EUR' | 'USD',
        includes: [],
        excludes: []
      } : {
        min: 100000,
        max: 500000,
        currency: 'XOF',
        includes: [],
        excludes: []
      },
      specialRequests: '',
      conversationHistory: updatedHistory
    }

    // Génération de la recommandation IA
    const recommendation = await generateAIRecommendation(aiRequest, context)
    
    // Scoring de la recommandation
    const score = scoreRecommendation(recommendation, aiRequest.clientPreferences)

    // Construction de la réponse conversationnelle
    const conversationalResponse = generateConversationalResponse(
      recommendation,
      context,
      extractedInfo,
      score
    )

    // Ajout du message IA à l'historique
    const aiMessage: AIConversationMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      content: conversationalResponse,
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: score / 100,
        detectedIntent: determineIntent(message),
        extractedInfo,
        suggestedDestinations: recommendation.itinerary.destinations.map(d => d.id),
        suggestedExperiences: recommendation.itinerary.experiences.map(e => e.id),
        responseTime: 0, // TODO: mesurer le temps réel
        model: 'mbaye-expert-v1'
      }
    }

    const response = {
      message: conversationalResponse,
      aiMessage,
      recommendation,
      extractedInfo,
      score,
      conversationHistory: [...updatedHistory, aiMessage],
      suggestedActions: generateSuggestedActions(context, score),
      nextSteps: getNextSteps(context, score)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Expert API Error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de la recommandation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateConversationalResponse(
  recommendation: any,
  context: string,
  extractedInfo: any,
  score: number
): string {
  // Réponses contextuelles selon l'étape de conversation
  switch (context) {
    case 'initial_inquiry':
      // Vérifier si c'est vraiment un premier contact
      const hasBasicInfo = extractedInfo.budget || extractedInfo.dates || extractedInfo.groupInfo
      
      if (hasBasicInfo) {
        // Si on a déjà des infos, passer directement à l'étape suivante
        return generateConversationalResponse(recommendation, 'preference_gathering', extractedInfo, score)
      }
      
      return `Salut ! Mbaye à votre service. Je suis chauffeur-guide au Sénégal depuis plus de 20 ans.

Alors, le Sénégal vous tente ? Parfait choix ! 

Pour vous concocter le voyage parfait, dites-moi :
🎯 **Vos centres d'intérêt** : culture, plages, nature, histoire ?  
📅 **Votre durée** de séjour  
👥 **Nombre de personnes** dans votre groupe

Et hop, je vous concocte quelque chose d'authentique !`

    case 'preference_gathering':
      const interests = extractedInfo.preferences?.interests || []
      const duration = extractedInfo.dates?.duration
      const budget = extractedInfo.budget?.amount
      const groupSize = extractedInfo.groupInfo?.size

      // Si on a assez d'infos, proposer directement un itinéraire
      const hasEnoughInfo = (duration || budget) && (interests.length > 0 || groupSize)
      
      if (hasEnoughInfo) {
        return generateConversationalResponse(recommendation, 'itinerary_proposal', extractedInfo, score)
      }

      let response = `OK, je vois mieux ! `

      if (interests.length > 0) {
        response += `${interests.join(' + ')} - excellent mélange ! `
      }

      if (duration) {
        response += `${duration} jours, c'est ${duration > 10 ? 'parfait pour bien approfondir' : duration > 5 ? 'idéal pour un bon aperçu' : 'court mais faisable'} ! `
      }

      if (budget) {
        response += `Budget ${budget} ${extractedInfo.budget?.currency}, très bien. `
      }

      if (groupSize) {
        response += `À ${groupSize}, vous allez bien profiter. `
      }

      response += `\n\nPour finaliser votre itinéraire, j'ai besoin de savoir :`

      const missingInfo = []
      if (!duration) missingInfo.push("📅 **Combien de jours** exactement ?")
      if (!budget && !groupSize) missingInfo.push("💰 **Budget approximatif** pour le groupe ?")
      if (interests.length === 0) missingInfo.push("🎯 **Vos priorités** : détente, découverte culturelle, nature ?")
      
      if (missingInfo.length > 0) {
        response += `\n\n${missingInfo.join('\n')}`
      } else {
        response += "\n\nParfait, j'ai tout ce qu'il faut ! Laissez-moi vous concocter quelque chose..."
      }

      return response

    case 'itinerary_proposal':
      const duration = extractedInfo.dates?.duration || recommendation.itinerary.duration || 7
      const destinations = recommendation.itinerary.destinations || []
      
      // Calcul réaliste du rythme : 1-2 destinations par période de 3-4 jours
      const dailyPacing = Math.max(2, Math.ceil(duration / destinations.length))
      
      let proposal = `Parfait ! Voici l'itinéraire que je vous propose :\n\n`
      
      proposal += `# 🇸🇳 **${recommendation.itinerary.name}**\n\n`
      
      let currentDay = 1
      destinations.forEach((dest: any, index: number) => {
        const stayDuration = Math.min(dailyPacing, duration - currentDay + 1)
        const endDay = currentDay + stayDuration - 1
        
        if (stayDuration === 1) {
          proposal += `## Jour ${currentDay} : ${dest.name}\n`
        } else {
          proposal += `## Jours ${currentDay}-${endDay} : ${dest.name}\n`
        }
        
        proposal += `${dest.description}\n\n`
        proposal += `**Conseil Mbaye :** ${dest.mbayeRecommendation}\n\n`
        
        currentDay = endDay + 1
      })

      proposal += `## 💰 **Budget total**\n`
      proposal += `${recommendation.itinerary.totalCost.min.toLocaleString()} - ${recommendation.itinerary.totalCost.max.toLocaleString()} FCFA\n`
      proposal += `*Transport, guide et ${recommendation.itinerary.totalCost.includes.join(', ')} inclus*\n\n`

      proposal += `## 🚗 **Votre chauffeur-guide**\n`
      proposal += `Je vous accompagne personnellement dans un véhicle ${recommendation.itinerary.transportPlan.vehicleRecommendation.type} confortable avec climat, WiFi et tout l'équipement nécessaire.\n\n`

      // Clôture selon le score - haute qualité = proposition de réservation
      if (score >= 85) {
        proposal += `Cet itinéraire correspond parfaitement à vos attentes ! ✅\n\n`
        proposal += `**Pour réserver :** Contactez-moi directement au **+33 6 26 38 87 94** (WhatsApp)\n`
        proposal += `Je vous enverrai tous les détails pratiques et nous finaliserons ensemble.\n\n`
        proposal += `*Acompte : 30% - Solde : à votre arrivée au Sénégal*`
      } else if (score >= 70) {
        proposal += `Cette proposition vous convient-elle ou souhaitez-vous que je l'ajuste ?`
      } else {
        proposal += `Je peux adapter cet itinéraire selon vos préférences. Que souhaitez-vous modifier ?`
      }

      return proposal

    case 'practical_details':
      return `Parfait ! Voici les détails pratiques :\n\n## 🚗 **Transport & Guide**\n- Véhicule climatisé avec GPS et WiFi\n- Guide culturel et linguistique\n- Flexibilité totale d'horaires\n\n## 🎯 **Services inclus**\n- Contacts privilégiés (artisans, familles, restaurants)\n- Assistance 24h/24\n- Conseils négociation et découvertes\n\n## 💡 **Bonus authentiques**\n- Initiation wolof et thé à la menthe\n- Photos souvenirs avec communautés\n- Arrêts spontanés selon opportunités\n\n**Prêt à réserver ?** Contactez-moi au **+33 6 26 38 87 94** (WhatsApp)`

    case 'modification_request':
      return `D'accord ! Dites-moi ce que vous aimeriez modifier :\n\n🎯 **Destinations** : autres lieux à privilégier ?\n📅 **Durée** : plus/moins de temps quelque part ?\n💰 **Budget** : ajuster les prestations ?\n🚗 **Rythme** : plus détendu ou plus intensif ?\n\nJ'adapte tout selon vos souhaits.`

    case 'booking_confirmation':
      return `Fantastique ! 🎉\n\nJe suis ravi de vous accompagner dans cette aventure sénégalaise. Voici comment finaliser votre réservation :\n\n## 📱 **Contact WhatsApp direct :**\n**+33 6 26 38 87 94**\n\nÉcrivez-moi avec le message : *"Réservation itinéraire [votre nom]"*\n\n## 📋 **Récapitulatif final :**\n- Dates : ${recommendation.itinerary.client.travelDates.arrival} - ${recommendation.itinerary.client.travelDates.departure}\n- Destinations : ${recommendation.itinerary.destinations.map((d: any) => d.name).join(', ')}\n- Budget : ${recommendation.itinerary.totalCost.min.toLocaleString()} - ${recommendation.itinerary.totalCost.max.toLocaleString()} FCFA\n\n## ✅ **Prochaines étapes :**\n1. Contact WhatsApp pour confirmer les détails\n2. Acompte de réservation (30%)\n3. Je vous envoie le guide pratique personnalisé\n4. RDV à votre arrivée au Sénégal !\n\nJ'ai hâte de vous faire découvrir MON Sénégal ! 🇸🇳`

    default:
      return `Je suis là pour vous aider à découvrir le Sénégal authentique ! Que souhaitez-vous savoir ?`
  }
}

function determineIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Éviter la détection répétitive des salutations après le premier échange
  if (lowerMessage.match(/^(bonjour|hello|salut|bonsoir)[\s.,!]*$/)) {
    return 'initial-inquiry'
  }
  
  if (lowerMessage.includes('réserver') || lowerMessage.includes('confirmer') || lowerMessage.includes('ok pour') || lowerMessage.includes('validé')) {
    return 'confirm-proposal'
  }
  
  if (lowerMessage.includes('modifier') || lowerMessage.includes('changer') || lowerMessage.includes('différent') || lowerMessage.includes('autre')) {
    return 'request-modification'
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('tarif')) {
    return 'ask-budget-info'
  }
  
  if (lowerMessage.includes('transport') || lowerMessage.includes('comment') || lowerMessage.includes('pratique') || lowerMessage.includes('détails')) {
    return 'ask-practical-info'
  }
  
  return 'general-question'
}

function generateSuggestedActions(context: string, score: number): string[] {
  switch (context) {
    case 'initial_inquiry':
      return [
        'Parlez-moi de vos centres d\'intérêt',
        'Combien de temps avez-vous ?',
        'Quel est votre budget approximatif ?'
      ]
    
    case 'preference_gathering':
      return [
        'Cette proposition me plaît',
        'J\'aimerais voir autre chose',
        'Donnez-moi plus de détails'
      ]
    
    case 'itinerary_proposal':
      if (score >= 80) {
        return [
          'Parfait, je valide !',
          'Une petite modification...',
          'Infos pratiques SVP'
        ]
      } else {
        return [
          'Proposez-moi une alternative',
          'Ajustez le budget',
          'Modifiez les destinations'
        ]
      }
    
    case 'practical_details':
      return [
        'Comment réserver ?',
        'Que dois-je apporter ?',
        'Contact WhatsApp'
      ]
    
    default:
      return [
        'Recommencez l\'itinéraire',
        'Contactez Mbaye',
        'Plus d\'informations'
      ]
  }
}

function getNextSteps(context: string, score: number): string[] {
  switch (context) {
    case 'initial_inquiry':
      return ['Préciser les préférences', 'Établir le budget', 'Définir la durée']
    
    case 'preference_gathering':
      return ['Générer la proposition', 'Affiner les intérêts', 'Calculer les coûts']
    
    case 'itinerary_proposal':
      if (score >= 80) {
        return ['Finaliser les détails', 'Procéder à la réservation', 'Contact WhatsApp']
      } else {
        return ['Ajuster la proposition', 'Explorer alternatives', 'Reconsidérer budget']
      }
    
    case 'practical_details':
      return ['Réservation WhatsApp', 'Préparation voyage', 'Suivi personnalisé']
    
    default:
      return ['Continuer la conversation', 'Clarifier les besoins', 'Proposer assistance']
  }
}

// GET pour récupérer les destinations disponibles
export async function GET() {
  try {
    const { senegalDestinations } = await import('@/data/senegal-destinations')
    
    const simplifiedDestinations = senegalDestinations.map(dest => ({
      id: dest.id,
      name: dest.name,
      region: dest.region,
      type: dest.type,
      description: dest.description,
      tags: dest.tags,
      estimatedDuration: dest.estimatedDuration,
      cost: dest.cost,
      difficulty: dest.difficulty
    }))

    return NextResponse.json({
      destinations: simplifiedDestinations,
      totalCount: senegalDestinations.length
    })

  } catch (error) {
    console.error('GET AI Expert API Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des destinations' },
      { status: 500 }
    )
  }
}