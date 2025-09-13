import { NextRequest, NextResponse } from 'next/server'
import { generateAIRecommendation, extractClientInfo, scoreRecommendation } from '@/lib/ai-senegal-expert'
import { aiChatMessageSchema } from '@/schemas/validation'
import { logger } from '@/lib/logger'
import { createApiResponse, ApiError } from '@/lib/errors'
import { rateLimitCheck, rateLimitPresets } from '@/lib/middleware/rate-limit'
import type { AIRecommendationRequest } from '@/types/destinations'
import type { AIConversationMessage } from '@/types/workflow'

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Rate limiting - more restrictive for AI expert
    const rateLimitResult = await rateLimitCheck(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 AI requests per minute
    })

    if (!rateLimitResult.allowed) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', {
        retryAfter: rateLimitResult.retryAfter
      })
    }

    // Validate request body
    const body = await request.json()
    const validatedData = aiChatMessageSchema.parse(body)
    
    const { 
      message, 
      conversationHistory = [],
      clientPreferences = {},
      context = 'initial_inquiry'
    } = validatedData

    logger.info('AI Expert request received', {
      requestId,
      messageLength: message.length,
      historyLength: conversationHistory.length,
      context,
      hasPreferences: Object.keys(clientPreferences).length > 0
    })

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

    logger.debug('Client info extracted', {
      requestId,
      extractedInfo: {
        hasBudget: !!extractedInfo.budget,
        hasDates: !!extractedInfo.dates,
        hasGroupInfo: !!extractedInfo.groupInfo,
        preferencesCount: extractedInfo.preferences?.interests?.length || 0
      }
    })

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
      budget: extractedInfo.budget?.amount ? {
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

    // Déterminer le contexte selon l'intention du message
    const detectedIntent = determineIntent(message)
    let actualContext = context
    
    // Si l'utilisateur confirme/valide, passer au contexte de réservation
    if (detectedIntent === 'confirm-proposal' && context === 'itinerary_proposal') {
      actualContext = 'booking_confirmation'
    } else if (detectedIntent === 'request-modification') {
      actualContext = 'modification_request'
    } else if (detectedIntent === 'ask-practical-info') {
      actualContext = 'practical_details'
    }

    logger.debug('Context determined', {
      requestId,
      originalContext: context,
      detectedIntent,
      actualContext
    })

    // Génération de la recommandation IA
    const recommendation = await generateAIRecommendation(aiRequest, actualContext)
    
    // Scoring de la recommandation
    const score = scoreRecommendation(recommendation, aiRequest.clientPreferences)

    logger.info('AI recommendation generated', {
      requestId,
      score,
      actualContext,
      destinationCount: recommendation.itinerary?.destinations?.length || 0,
      processingTime: Date.now() - startTime
    })

    // Construction de la réponse conversationnelle
    const conversationalResponse = generateConversationalResponse(
      recommendation,
      actualContext,
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
        detectedIntent: detectedIntent as any,
        extractedInfo,
        suggestedDestinations: recommendation.itinerary?.destinations?.map(d => d.id) || [],
        suggestedExperiences: recommendation.itinerary?.experiences?.map(e => e.id) || [],
        responseTime: Date.now() - startTime,
        model: 'mbaye-expert-v1'
      }
    }

    const responseData = {
      message: conversationalResponse,
      aiMessage,
      recommendation,
      extractedInfo,
      score,
      conversationHistory: [...updatedHistory, aiMessage],
      suggestedActions: generateSuggestedActions(actualContext, score),
      nextSteps: getNextSteps(actualContext, score),
      context: actualContext,
      detectedIntent
    }

    // Si on est en mode booking_confirmation, sauvegarder l'itinéraire
    if (actualContext === 'booking_confirmation') {
      try {
        logger.info('Attempting to save itinerary', { requestId })
        
        const saveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/save-itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendation,
            extractedInfo,
            conversationalResponse,
            clientName: 'Voyageur',
            clientPhone: undefined
          })
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          responseData.savedItinerary = {
            id: saveData.itineraryId,
            title: saveData.title,
            whatsappMessage: saveData.whatsappMessage,
            planningUrl: saveData.planningUrl
          }
          
          logger.info('Itinerary saved successfully', { 
            requestId, 
            itineraryId: saveData.itineraryId 
          })
        } else {
          logger.warn('Failed to save itinerary', { 
            requestId, 
            status: saveResponse.status 
          })
        }
      } catch (error) {
        logger.warn('Error saving itinerary', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        // On continue sans bloquer la réponse
      }
    }

    logger.info('AI Expert response completed', {
      requestId,
      responseLength: conversationalResponse.length,
      hasItinerary: !!responseData.savedItinerary,
      processingTime: Date.now() - startTime
    })

    return createApiResponse(responseData, {
      requestId,
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    logger.error('AI Expert API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      processingTime: Date.now() - startTime
    })

    if (error instanceof ApiError) {
      return error.toResponse({ requestId })
    }

    throw new ApiError(
      'Erreur lors de la génération de la recommandation',
      500,
      'AI_EXPERT_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}

// GET pour récupérer les destinations disponibles
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Light rate limiting for GET requests
    const rateLimitResult = await rateLimitCheck(request, rateLimitPresets.lenient)

    if (!rateLimitResult.allowed) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', {
        retryAfter: rateLimitResult.retryAfter
      })
    }

    logger.info('Destinations list requested', { requestId })

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

    logger.info('Destinations list retrieved', {
      requestId,
      count: simplifiedDestinations.length,
      processingTime: Date.now() - startTime
    })

    return createApiResponse({
      destinations: simplifiedDestinations,
      totalCount: senegalDestinations.length,
      lastUpdated: new Date().toISOString()
    }, {
      requestId,
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    logger.error('Get destinations error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      processingTime: Date.now() - startTime
    })

    if (error instanceof ApiError) {
      return error.toResponse({ requestId })
    }

    throw new ApiError(
      'Erreur lors de la récupération des destinations',
      500,
      'DESTINATIONS_FETCH_ERROR'
    )
  }
}

// Helper functions (kept from original implementation)
function generateConversationalResponse(
  recommendation: Record<string, any>,
  context: string,
  extractedInfo: Record<string, any>,
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
      const travelDuration = extractedInfo.dates?.duration
      const budget = extractedInfo.budget?.amount
      const groupSize = extractedInfo.groupInfo?.size

      // Si on a assez d'infos, proposer directement un itinéraire
      const hasEnoughInfo = (travelDuration || budget) && (interests.length > 0 || groupSize)
      
      if (hasEnoughInfo) {
        return generateConversationalResponse(recommendation, 'itinerary_proposal', extractedInfo, score)
      }

      let response = `OK, je vois mieux ! `

      if (interests.length > 0) {
        response += `${interests.join(' + ')} - excellent mélange ! `
      }

      if (travelDuration) {
        response += `${travelDuration} jours, c'est ${travelDuration > 10 ? 'parfait pour bien approfondir' : travelDuration > 5 ? 'idéal pour un bon aperçu' : 'court mais faisable'} ! `
      }

      if (budget) {
        response += `Budget ${budget} ${extractedInfo.budget?.currency}, très bien. `
      }

      if (groupSize) {
        response += `À ${groupSize}, vous allez bien profiter. `
      }

      response += `\n\nPour finaliser votre itinéraire, j'ai besoin de savoir :`

      const missingInfo = []
      if (!travelDuration) missingInfo.push("📅 **Combien de jours** exactement ?")
      if (!budget && !groupSize) missingInfo.push("💰 **Budget approximatif** pour le groupe ?")
      if (interests.length === 0) missingInfo.push("🎯 **Vos priorités** : détente, découverte culturelle, nature ?")
      
      if (missingInfo.length > 0) {
        response += `\n\n${missingInfo.join('\n')}`
      } else {
        response += "\n\nParfait, j'ai tout ce qu'il faut ! Laissez-moi vous concocter quelque chose..."
      }

      return response

    case 'itinerary_proposal':
      const duration = extractedInfo.dates?.duration || recommendation.itinerary?.duration || 7
      const destinations = recommendation.itinerary?.destinations || []
      
      // Calcul réaliste du rythme : 1-2 destinations par période de 3-4 jours
      const dailyPacing = Math.max(2, Math.ceil(duration / destinations.length))
      
      let proposal = `Parfait ! Voici l'itinéraire que je vous propose :\n\n`
      
      proposal += `# 🇸🇳 **${recommendation.itinerary?.name || 'Découverte du Sénégal'}**\n\n`
      
      let currentDay = 1
      destinations.forEach((dest: Record<string, any>) => {
        const stayDuration = Math.min(dailyPacing, duration - currentDay + 1)
        const endDay = currentDay + stayDuration - 1
        
        if (stayDuration === 1) {
          proposal += `## Jour ${currentDay} : ${dest.name}\n`
        } else {
          proposal += `## Jours ${currentDay}-${endDay} : ${dest.name}\n`
        }
        
        proposal += `${dest.description}\n\n`
        if (dest.mbayeRecommendation) {
          proposal += `**Conseil Mbaye :** ${dest.mbayeRecommendation}\n\n`
        }
        
        currentDay = endDay + 1
      })

      if (recommendation.itinerary?.totalCost) {
        proposal += `## 💰 **Budget total**\n`
        proposal += `${recommendation.itinerary.totalCost.min?.toLocaleString()} - ${recommendation.itinerary.totalCost.max?.toLocaleString()} FCFA\n`
        if (recommendation.itinerary.totalCost.includes) {
          proposal += `*Transport, guide et ${recommendation.itinerary.totalCost.includes.join(', ')} inclus*\n\n`
        }
      }

      proposal += `## 🚗 **Votre chauffeur-guide**\n`
      const vehicleType = recommendation.itinerary?.transportPlan?.vehicleRecommendation?.type || 'standard'
      proposal += `Je vous accompagne personnellement dans un véhicule ${vehicleType} confortable avec climat, WiFi et tout l'équipement nécessaire.\n\n`

      // Question concluante pour validation
      if (score >= 85) {
        proposal += `Cet itinéraire vous correspond parfaitement ! ✅\n\n`
        proposal += `**Si ce planning vous convient, dites "oui" et je prépare un texte pour envoi par WhatsApp au chauffeur Mbaye.**\n\n`
        proposal += `Vous pourrez ensuite partager directement les détails avec lui pour finaliser votre réservation.`
      } else if (score >= 70) {
        proposal += `**Si ce planning vous convient, dites "oui" et je prépare un texte pour envoi par WhatsApp au chauffeur Mbaye.**\n\n`
        proposal += `Sinon, indiquez-moi ce que vous souhaitez ajuster.`
      } else {
        proposal += `Je peux adapter cet itinéraire selon vos préférences. Que souhaitez-vous modifier ?\n\n`
        proposal += `Une fois ajusté à vos envies, je préparerai un texte pour contacter Mbaye directement.`
      }

      return proposal

    case 'practical_details':
      return `Parfait ! Voici les détails pratiques :\n\n## 🚗 **Transport & Guide**\n- Véhicule climatisé avec GPS et WiFi\n- Guide culturel et linguistique\n- Flexibilité totale d'horaires\n\n## 🎯 **Services inclus**\n- Contacts privilégiés (artisans, familles, restaurants)\n- Assistance 24h/24\n- Conseils négociation et découvertes\n\n## 💡 **Bonus authentiques**\n- Initiation wolof et thé à la menthe\n- Photos souvenirs avec communautés\n- Arrêts spontanés selon opportunités\n\n**Prêt à réserver ?** Contactez-moi au **+33 6 26 38 87 94** (WhatsApp)`

    case 'modification_request':
      return `D'accord ! Dites-moi ce que vous aimeriez modifier :\n\n🎯 **Destinations** : autres lieux à privilégier ?\n📅 **Durée** : plus/moins de temps quelque part ?\n💰 **Budget** : ajuster les prestations ?\n🚗 **Rythme** : plus détendu ou plus intensif ?\n\nJ'adapte tout selon vos souhaits.`

    case 'booking_confirmation':
      const confirmDestinations = recommendation.itinerary?.destinations || []
      const mainDestinations = confirmDestinations.slice(0, 3).map((d: Record<string, any>) => d.name).join(', ')
      const confirmDuration = extractedInfo.dates?.duration || recommendation.itinerary?.duration || '7'
      const confirmBudget = recommendation.itinerary?.totalCost ? 
        `${recommendation.itinerary.totalCost.min?.toLocaleString()} - ${recommendation.itinerary.totalCost.max?.toLocaleString()} FCFA` : 
        'Sur mesure'
      
      return `Perfect ! ✅ Votre planning est validé !\n\n## 📋 **RÉCAPITULATIF DE VOTRE VOYAGE**\n\n**🎯 Destinations principales :** ${mainDestinations}\n**📅 Durée :** ${confirmDuration} jours\n**💰 Budget estimé :** ${confirmBudget}\n**🚗 Guide :** Mbaye Diop (20 ans d'expérience)\n\n---\n\n**📱 MESSAGE POUR MBAYE (WhatsApp) :**\n\n*Salut Mbaye ! Je souhaite réserver un voyage au Sénégal :\n\n• Destinations : ${mainDestinations}\n• Durée : ${confirmDuration} jours  \n• Budget : ${confirmBudget}\n• Voyageurs : ${extractedInfo.groupInfo?.size || 1} personne(s)\n\nPeux-tu me confirmer la disponibilité et les détails pratiques ?\n\nMerci ! 🙏*\n\n---\n\n**💬 Envoyez ce message à Mbaye : +33 6 26 38 87 94**\n\nVotre planning détaillé a été sauvegardé et sera visible dans l'encart ci-dessous.`

    default:
      return `Je suis là pour vous aider à découvrir le Sénégal authentique ! Que souhaitez-vous savoir ?`
  }
}

function determineIntent(message: string): string {
  const lowerMessage = message.toLowerCase().trim()
  
  // Éviter la détection répétitive des salutations après le premier échange
  if (lowerMessage.match(/^(bonjour|hello|salut|bonsoir)[\s.,!]*$/)) {
    return 'initial-inquiry'
  }
  
  // Détection validation/confirmation du planning
  if (lowerMessage.match(/^(oui|yes|ok|d'accord|parfait|très bien|ça me va|c'est bon|validé|je valide)[\s.,!]*$/) ||
      lowerMessage.includes('je valide') || 
      lowerMessage.includes('c\'est parfait') ||
      lowerMessage.includes('ça me convient') ||
      lowerMessage.includes('planning me plaît')) {
    return 'confirm-proposal'
  }
  
  if (lowerMessage.includes('réserver') || lowerMessage.includes('confirmer') || lowerMessage.includes('ok pour')) {
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