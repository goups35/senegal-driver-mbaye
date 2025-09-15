import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateGeminiResponse } from '@/lib/gemini'
import { 
  TripPlanningPromptEngine, 
  ConversationStateManager,
  WhatsAppMessageFormatter 
} from '@/lib/conversation-flow'

const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  sessionId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId = 'default' } = chatRequestSchema.parse(body)

    // Gestion de l'état de conversation
    let conversationState = ConversationStateManager.getState(sessionId)
    
    // Mise à jour de l'état avec le nouveau message
    conversationState = TripPlanningPromptEngine.extractAndUpdateInfo(message, conversationState)
    ConversationStateManager.updateState(sessionId, conversationState)

    // Vérifier si l'API Gemini est disponible
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === '' || geminiKey === 'your_new_gemini_api_key_here' || geminiKey.trim() === '') {
      console.log('Mode démo activé - Gemini API non configuré')
      return NextResponse.json({ 
        response: getAdvancedDemoResponse(message, conversationState), 
        isDemo: true,
        provider: 'demo',
        conversationState
      })
    }

    // Construire le prompt avec la stratégie de conversation avancée
    const fullPrompt = TripPlanningPromptEngine.buildMasterPrompt(message, conversationState)

    // Générer la réponse avec Gemini
    const aiResponse = await generateGeminiResponse(fullPrompt)
    
    return NextResponse.json({ 
      response: aiResponse, 
      isDemo: false,
      provider: 'gemini-2.0-flash-exp',
      conversationState
    })

  } catch (error) {
    console.error('Erreur chat API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    )
  }
}

/**
 * Advanced demo responses using conversation flow
 */
function getAdvancedDemoResponse(message: string, state: Record<string, unknown>): string {
  const { phase, collectedInfo } = state
  
  switch (phase) {
    case 'greeting':
      return `🇸🇳 Bonjour ! Je suis Maxime, votre conseiller voyage spécialisé Sénégal.

C'est fantastique que vous pensiez au Sénégal pour votre prochain voyage ! Ce pays a tant à offrir.

Qu'est-ce qui vous attire dans l'idée de découvrir le Sénégal ? La richesse culturelle, les paysages uniques, ou peut-être l'accueil légendaire des Sénégalais ? 😊`

    case 'discovery':
      const nextQuestion = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      return `Parfait ! ${getPersonalizedInsight(message)}

${nextQuestion}

${getOptionsForQuestion(state)}`

    case 'planning':
      return `Excellent choix ! Avec ${collectedInfo.duration || 'le temps que vous avez'}, nous pouvons créer quelque chose de magnifique.

Voici ce que je vous propose :
- Jour 1-2 : Dakar et île de Gorée (histoire et culture)
- Jour 3-4 : Saint-Louis (patrimoine UNESCO)
- Jour 5-7 : Lac Rose et côte (nature et détente)

Qu'en pensez-vous ? Y a-t-il des ajustements que vous aimeriez ?`

    case 'refinement':
      return `Parfait ! Votre itinéraire prend forme. Juste quelques derniers détails...

Êtes-vous satisfait(e) de cette proposition ou souhaitez-vous modifier quelque chose ?`

    case 'summary':
      return WhatsAppMessageFormatter.formatFinalItinerary(state)

    default:
      return `Je comprends votre envie de découvrir le Sénégal ! Parlez-moi un peu plus de ce que vous recherchez pour ce voyage. 🇸🇳`
  }
}

function getPersonalizedInsight(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('culture')) {
    return "La culture sénégalaise est d'une richesse incroyable ! Entre la musique, l'artisanat et les traditions, vous allez être émerveillé(e)."
  }
  if (msg.includes('plage')) {
    return "Les plages du Sénégal sont parmi les plus belles d'Afrique de l'Ouest ! Eau chaude toute l'année et couchers de soleil magiques."
  }
  return "Le Sénégal va vous surprendre par sa diversité !"
}

function getOptionsForQuestion(state: Record<string, unknown>): string {
  const collectedInfo = state.collectedInfo as Record<string, unknown> || {}
  
  if (!collectedInfo.duration) {
    return "Exemples : 'une semaine', '10 jours', '2 semaines'"
  }
  if (!collectedInfo.interests?.length) {
    return "Par exemple : culture locale, plages paradisiaques, nature sauvage, aventure..."
  }
  return "Donnez-moi tous les détails qui vous passent par la tête !"
}