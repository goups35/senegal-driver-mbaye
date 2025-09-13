import { NextRequest, NextResponse } from 'next/server'
import { aiChatMessageSchema } from '@/schemas/validation'
import { logger } from '@/lib/logger'
import { createApiResponse, ApiError } from '@/lib/errors'
import { rateLimitCheck } from '@/lib/middleware/rate-limit'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Rate limiting
    const rateLimitResult = await rateLimitCheck(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute for chat
    })

    if (!rateLimitResult.allowed) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', {
        retryAfter: rateLimitResult.retryAfter
      })
    }

    // Validate request body
    const body = await request.json()
    const validatedData = aiChatMessageSchema.parse(body)
    const { message, conversationHistory = [], clientPreferences, context } = validatedData

    logger.info('Chat request received', {
      requestId,
      messageLength: message.length,
      historyLength: conversationHistory.length,
      context,
      clientPreferences: clientPreferences ? Object.keys(clientPreferences) : []
    })

    // Check if AI service is configured
    const hasAiService = !!(config.GROQ_API_KEY || config.OPENAI_API_KEY || config.GOOGLE_GEMINI_API_KEY)
    
    if (!hasAiService) {
      logger.warn('No AI service configured, using demo mode', { requestId })
      const demoResponse = getDemoResponse(message, conversationHistory)
      
      return createApiResponse({
        response: demoResponse,
        isDemo: true,
        context: 'demo_mode'
      }, {
        requestId,
        processingTime: Date.now() - startTime
      })
    }

    // Generate AI response
    const aiResponse = await generateAiResponse({
      message,
      conversationHistory,
      clientPreferences,
      context,
      requestId
    })

    logger.info('Chat response generated successfully', {
      requestId,
      responseLength: aiResponse.length,
      processingTime: Date.now() - startTime
    })

    return createApiResponse({
      response: aiResponse,
      isDemo: false,
      conversationId: crypto.randomUUID(), // For future conversation tracking
      suggestedActions: generateSuggestedActions(context, message)
    }, {
      requestId,
      processingTime: Date.now() - startTime
    })

  } catch (error) {
    logger.error('Chat API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      processingTime: Date.now() - startTime
    })

    if (error instanceof ApiError) {
      return error.toResponse({ requestId })
    }

    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400, 'INVALID_JSON')
    }

    throw new ApiError(
      'Internal server error during chat processing',
      500,
      'CHAT_PROCESSING_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}

async function generateAiResponse({
  message,
  conversationHistory,
  clientPreferences,
  context,
  requestId
}: {
  message: string
  conversationHistory: any[]
  clientPreferences?: any
  context?: string
  requestId: string
}): Promise<string> {
  
  try {
    // Use GROQ if available (fastest and free)
    if (config.GROQ_API_KEY && config.GROQ_API_KEY !== 'placeholder-key') {
      const { generateGroqResponse, TRAVEL_ADVISOR_PROMPT } = await import('@/lib/groq-simple')
      const { extractCitiesFromPrompt, generateDistanceContext } = await import('@/lib/distances')

      // Extract cities and get distance context
      const citiesInMessage = extractCitiesFromPrompt(message)
      const distanceContext = await generateDistanceContext(citiesInMessage)

      // Build conversation context
      let conversationContext = ''
      if (conversationHistory.length > 0) {
        conversationContext = `\n\nCONTEXTE DE LA CONVERSATION PRÉCÉDENTE:\n${conversationHistory.map(msg => 
          `${msg.role === 'user' ? 'Voyageur' : 'Conseiller'}: ${msg.content}`
        ).join('\n')}\n\nNOUVELLE QUESTION DU VOYAGEUR:`
      } else {
        conversationContext = '\n\nPREMIÈRE INTERACTION - Accueille chaleureusement le prospect et pose des questions pour comprendre ses envies de voyage au Sénégal:'
      }

      // Add client preferences context
      let preferencesContext = ''
      if (clientPreferences) {
        const prefs = []
        if (clientPreferences.interests) prefs.push(`Intérêts: ${clientPreferences.interests.join(', ')}`)
        if (clientPreferences.culturalImmersionLevel) prefs.push(`Niveau d'immersion culturelle: ${clientPreferences.culturalImmersionLevel}`)
        if (clientPreferences.activityLevel) prefs.push(`Niveau d'activité: ${clientPreferences.activityLevel}`)
        if (clientPreferences.accommodationPreference) prefs.push(`Préférence hébergement: ${clientPreferences.accommodationPreference}`)
        
        if (prefs.length > 0) {
          preferencesContext = `\n\nPRÉFÉRENCES CLIENT CONNUES:\n${prefs.join('\n')}\n`
        }
      }

      // Add context-specific instructions
      let contextInstructions = ''
      if (context) {
        switch (context) {
          case 'initial_inquiry':
            contextInstructions = '\n\nCONTEXTE: Première prise de contact - Sois accueillant et pose des questions pour découvrir les besoins.'
            break
          case 'preference_gathering':
            contextInstructions = '\n\nCONTEXTE: Collecte des préférences - Pose des questions spécifiques pour affiner les recommandations.'
            break
          case 'itinerary_proposal':
            contextInstructions = '\n\nCONTEXTE: Proposition d\'itinéraire - Présente des suggestions concrètes basées sur les préférences.'
            break
          case 'practical_details':
            contextInstructions = '\n\nCONTEXTE: Détails pratiques - Fournis des informations précises sur logistique, prix, réservations.'
            break
          case 'modification_request':
            contextInstructions = '\n\nCONTEXTE: Demande de modification - Adapte les suggestions selon les nouvelles exigences.'
            break
          case 'booking_confirmation':
            contextInstructions = '\n\nCONTEXTE: Confirmation de réservation - Guide vers la finalisation de la réservation.'
            break
        }
      }

      const fullPrompt = `${TRAVEL_ADVISOR_PROMPT}${distanceContext}${preferencesContext}${contextInstructions}

${conversationContext}
"${message}"

IMPORTANT : Réponds UNIQUEMENT avec du texte conversationnel. JAMAIS de JSON, code, ou structure technique. Comme si tu parlais à un ami au téléphone.`

      const response = await generateGroqResponse(fullPrompt)
      
      logger.info('GROQ response generated', { 
        requestId, 
        responseLength: response.length,
        citiesExtracted: citiesInMessage.length,
        hasPreferences: !!clientPreferences,
        context
      })
      
      return response
    }

    // Fallback to OpenAI if available
    if (config.OPENAI_API_KEY) {
      // Implement OpenAI integration here
      logger.warn('OpenAI fallback not implemented yet', { requestId })
    }

    // Fallback to Gemini if available
    if (config.GOOGLE_GEMINI_API_KEY) {
      // Implement Gemini integration here
      logger.warn('Gemini fallback not implemented yet', { requestId })
    }

    throw new ApiError('No AI service available', 503, 'AI_SERVICE_UNAVAILABLE')

  } catch (error) {
    logger.error('AI response generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId
    })
    throw error
  }
}

function generateSuggestedActions(context?: string, message?: string): string[] {
  const actions = []

  if (!context || context === 'initial_inquiry') {
    actions.push('Parlez-moi de vos préférences de voyage')
    actions.push('Quel est votre budget approximatif ?')
    actions.push('Combien de temps souhaitez-vous rester ?')
  }

  if (context === 'preference_gathering') {
    actions.push('Montrez-moi des suggestions d\'itinéraires')
    actions.push('Quels sont les hébergements recommandés ?')
    actions.push('Parlez-moi des activités disponibles')
  }

  if (context === 'itinerary_proposal') {
    actions.push('Modifiez cet itinéraire selon mes préférences')
    actions.push('Quel est le prix total de ce voyage ?')
    actions.push('Comment puis-je réserver ?')
  }

  return actions
}

// Demo response function (kept from original)
function getDemoResponse(message: string, history: unknown[]): string {
  const msg = message.toLowerCase()
  
  // Premier message ou salutation
  if (history.length === 0 || msg.includes('bonjour') || msg.includes('salut')) {
    return `🌍 Bonjour et bienvenue ! Je suis votre conseiller voyage spécialisé au Sénégal 🇸🇳

Je suis ravi de vous aider à planifier votre découverte de notre magnifique pays !

Pour vous proposer l'itinéraire parfait, j'aimerais en savoir plus sur vos envies :

🗓️ **Combien de temps** souhaitez-vous rester au Sénégal ?
💰 **Quel est votre budget** approximatif pour ce voyage ?
🎯 **Qu'est-ce qui vous attire le plus** : plages paradisiaques, culture et histoire, safari et nature, ou découverte des villes ?

Dites-moi tout, je vais créer un programme sur-mesure pour vous ! ✨`
  }

  // Budget mentionné
  if (msg.includes('budget') || msg.includes('euro') || msg.includes('€') || msg.includes('cher')) {
    return `Parfait ! 💡 Avec ces informations sur votre budget, je peux déjà vous orienter :

**GAMMES DE PRIX AU SÉNÉGAL :**
🏨 Hébergement : 25-300€/nuit selon standing
🚗 Transport privé : 50-150€/jour avec chauffeur  
🍽️ Restauration : 5-50€/repas selon lieu
🎭 Activités : 10-100€ selon type

**MES SUGGESTIONS selon votre budget :**
- **Économique** : Cases d'hôtes, transports en commun, restaurants locaux
- **Confort** : Hôtels 3-4⭐, chauffeur privé, mix expériences  
- **Premium** : Lodges de luxe, guide privé, expériences VIP

Et côté **durée**, vous pensez à combien de temps ? 
Cela m'aiderait aussi à savoir ce qui vous fait le plus rêver : **mer, culture, nature ou aventure** ? 🌊🏛️🌿`
  }

  // Durée mentionnée
  if (msg.includes('jour') || msg.includes('semaine') || msg.includes('temps')) {
    return `Excellent ! ⏰ Cette durée nous laisse de belles possibilités !

**VOICI MES RECOMMANDATIONS SELON LE TEMPS :**

**🗓️ 3-5 JOURS** : Focus Dakar + Île de Gorée + Lac Rose
**📅 1 SEMAINE** : Dakar + Saint-Louis + plages de Saly  
**🗓️ 2 SEMAINES** : Grand tour avec Casamance ou Niokolo-Koba
**📅 3+ SEMAINES** : Immersion totale multi-régions

**🤔 Pour affiner mes suggestions :**
- Êtes-vous plutôt **détente** ou **découverte active** ?
- Voyagez-vous **en couple, famille, entre amis** ou **solo** ?
- Des **incontournables** en tête (Gorée, plages, safari...) ?

Plus vous me parlez de vos envies, plus mon programme sera parfait ! 🎯`
  }

  // Intérêts/activités
  if (msg.includes('plage') || msg.includes('mer') || msg.includes('culture') || msg.includes('histoire') || msg.includes('nature') || msg.includes('safari')) {
    return `🎯 Parfait ! Je vois déjà se dessiner votre voyage idéal !

**SELON VOS GOÛTS, voici mes pépites :**

🏖️ **CÔTÉ MER** : Cap Skirring (plages paradisiaques), Saly (animations), Popenguine (nature)

🏛️ **CULTURE & HISTOIRE** : Île de Gorée (émouvant), Saint-Louis (UNESCO), village traditionnel de Toubacouta

🌿 **NATURE & SAFARI** : Niokolo-Koba (lions, hippopotames), Djoudj (oiseaux migrateurs), mangroves de Casamance

**🗺️ ITINÉRAIRE RECOMMANDÉ :**
Jour 1-2 : Arrivée Dakar + Gorée
Jour 3-4 : Saint-Louis + culture wolof  
Jour 5-7 : Casamance ou Saly selon préférence

**Une question importante :** préférez-vous un **rythme tranquille** (2-3 lieux max) ou **itinérant** (découvrir un maximum) ?

Dites-moi "GO" quand vous voulez que je finalise votre programme complet ! 🚀`
  }

  // Mot-clé "go" détecté
  if (msg.includes('go') || msg.includes('parfait') || msg.includes('valide')) {
    return `🎉 **VOTRE VOYAGE AU SÉNÉGAL EST PRÊT !**

**📋 RÉCAPITULATIF PERSONNALISÉ :**

**🗓️ PROGRAMME :**
• **Jour 1-2** : Dakar (Marché Sandaga, Monument Renaissance) + Île de Gorée  
• **Jour 3-4** : Saint-Louis (ville coloniale, balade en calèche)
• **Jour 5-6** : Lac Rose + villages traditionnels
• **Jour 7** : Saly (détente plage, départ)

**🚗 TRANSPORT :** Chauffeur privé francophone (4x4 climatisé)
**🏨 HÉBERGEMENT :** Mix hôtels charme + case traditionnelle  
**🍽️ RESTAURATION :** Découverte gastronomie locale + restaurants sélectionnés

**💰 BUDGET ESTIMÉ :** 800-1200€/personne (selon options)

**📱 PRÊT À RÉSERVER ?**
Cliquez sur "Envoyer via WhatsApp" pour recevoir le programme détaillé et discuter des modalités avec notre équipe ! 

Votre aventure sénégalaise vous attend ! 🇸🇳✨`
  }

  // Réponse générique
  return `Je comprends ! 😊 

Pour vous conseiller au mieux sur votre voyage au Sénégal, parlez-moi de :
- 🗓️ **Durée souhaitée** du séjour  
- 💰 **Budget approximatif** 
- 🎯 **Ce qui vous attire** le plus (plages, culture, nature...)
- 👥 **Avec qui** vous voyagez

Plus j'en sais, plus mes recommandations seront précises ! 

N'hésitez pas à me dire "GO" quand vous voulez que je finalise votre programme personnalisé ! 🚀`
}