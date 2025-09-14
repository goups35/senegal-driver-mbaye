import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateAIResponse, getAIProviderConfig } from '@/lib/ai-provider'
import { TRAVEL_ADVISOR_PROMPT } from '@/lib/groq-simple'

const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = chatRequestSchema.parse(body)

    // Get optimal AI provider configuration
    const providerConfig = getAIProviderConfig()
    
    // Extract cities for distance context (if needed)
    const { extractCitiesFromPrompt, generateDistanceContext } = await import('@/lib/distances')
    const citiesInMessage = extractCitiesFromPrompt(message)
    const distanceContext = await generateDistanceContext(citiesInMessage)

    // Build conversation context
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONTEXTE DE LA CONVERSATION PRÉCÉDENTE:\n${conversationHistory.map(msg => 
          `${msg.role === 'user' ? 'Voyageur' : 'Conseiller'}: ${msg.content}`
        ).join('\n')}\n\nNOUVELLE QUESTION DU VOYAGEUR:`
      : '\n\nPREMIÈRE INTERACTION - Accueille chaleureusement le prospect et pose des questions pour comprendre ses envies de voyage au Sénégal:'

    // Build full prompt
    const fullPrompt = `${TRAVEL_ADVISOR_PROMPT}${distanceContext}

${conversationContext}
"${message}"

IMPORTANT : Réponds UNIQUEMENT avec du texte conversationnel. JAMAIS de JSON, code, ou structure technique. Comme si tu parlais à un ami au téléphone.`

    // Generate AI response with automatic provider selection and fallback
    const result = await generateAIResponse(fullPrompt, providerConfig)
    
    return NextResponse.json({
      response: result.response,
      isDemo: result.isDemo,
      provider: result.provider,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur chat API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    // Last resort fallback to demo response
    const fallbackResponse = `🌍 Bonjour ! Je rencontre un petit problème technique, mais je peux quand même vous aider !

Pour planifier votre voyage au Sénégal, dites-moi :
🗓️ **Combien de jours** voulez-vous rester ?
🎯 **Qu'est-ce qui vous attire** : plages, culture, nature ?

Je vais vous créer un bel itinéraire ! ✨`

    return NextResponse.json({
      response: fallbackResponse,
      isDemo: true,
      provider: 'demo',
      error: 'Fallback response due to technical issue'
    })
  }
}