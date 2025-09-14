import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateGeminiResponse, SENEGAL_GEOGRAPHY_PROMPT } from '@/lib/gemini'

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

    // Vérifier si l'API Gemini est disponible
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === '' || geminiKey === 'your_new_gemini_api_key_here' || geminiKey.trim() === '') {
      console.log('Mode démo activé - Gemini API non configuré')
      return NextResponse.json({ 
        response: getDemoResponse(message, conversationHistory), 
        isDemo: true,
        provider: 'demo'
      })
    }

    // Construire l'historique de conversation
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONTEXTE DE LA CONVERSATION PRÉCÉDENTE:\n${conversationHistory.map(msg => 
          `${msg.role === 'user' ? 'Voyageur' : 'Assistant'}: ${msg.content}`
        ).join('\n')}\n\nNOUVELLE QUESTION DU VOYAGEUR:`
      : '\n\nPREMIÈRE INTERACTION - Aide le voyageur à sélectionner les villes/régions pour son voyage au Sénégal:'

    const fullPrompt = `${SENEGAL_GEOGRAPHY_PROMPT}

${conversationContext}
"${message}"

IMPORTANT : Réponds UNIQUEMENT avec du texte conversationnel. JAMAIS de JSON, code, ou structure technique. Focus sur la sélection géographique.`

    // Générer la réponse avec Gemini
    const aiResponse = await generateGeminiResponse(fullPrompt)
    
    return NextResponse.json({ 
      response: aiResponse, 
      isDemo: false,
      provider: 'gemini-2.0-flash-exp'
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

// Réponses de démonstration focalisées sur la sélection géographique
// Note: Les réponses détaillées sont maintenant gérées dans ai-providers.ts
function getDemoResponse(message: string, history: unknown[]): string {
  const msg = message.toLowerCase()
  
  // Réponse simple focalisée sur la géographie
  if (history.length === 0 || msg.includes('bonjour') || msg.includes('salut')) {
    return `🗺️ Bonjour ! Je vous aide à choisir les villes et régions pour votre voyage au Sénégal.

**Principales destinations :**
- **Dakar & environs** (Gorée, Lac Rose)
- **Saint-Louis** (patrimoine UNESCO)
- **Saly/Somone** (côte atlantique)
- **Casamance** (Cap Skirring au sud)
- **Sine-Saloum** (deltas et mangroves)

Combien de jours restez-vous au Sénégal ? 🇸🇳`
  }
  
  return `🗺️ Pour vous aider à choisir les meilleures villes, dites-moi :

- 🗓️ **Durée de votre séjour** ?
- 🎯 **Ce qui vous intéresse** : plages, culture, nature ?

Je vous proposerai les villes les mieux adaptées ! 😊`
}