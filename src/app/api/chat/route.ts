import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    // Vérifier si GROQ est configuré, sinon utiliser mode démo
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'placeholder-key' || process.env.GROQ_API_KEY === 'your_new_groq_api_key_here') {
      const demoResponse = getDemoResponse(message, conversationHistory)
      return NextResponse.json({ response: demoResponse, isDemo: true })
    }

    // Mode production avec GROQ (IA gratuite ultra-rapide)
    const { generateGroqResponse, TRAVEL_ADVISOR_PROMPT } = await import('@/lib/groq-simple')
    const { extractCitiesFromPrompt, generateDistanceContext } = await import('@/lib/distances')

    // Extraire les villes mentionnées pour récupérer les distances réelles
    const citiesInMessage = extractCitiesFromPrompt(message)
    const distanceContext = await generateDistanceContext(citiesInMessage)

    // Construire l'historique de conversation pour GROQ
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONTEXTE DE LA CONVERSATION PRÉCÉDENTE:\n${conversationHistory.map(msg => 
          `${msg.role === 'user' ? 'Voyageur' : 'Conseiller'}: ${msg.content}`
        ).join('\n')}\n\nNOUVELLE QUESTION DU VOYAGEUR:`
      : '\n\nPREMIÈRE INTERACTION - Accueille chaleureusement le prospect et pose des questions pour comprendre ses envies de voyage au Sénégal:'

    const fullPrompt = `${TRAVEL_ADVISOR_PROMPT}${distanceContext}

${conversationContext}
"${message}"

IMPORTANT : Réponds UNIQUEMENT avec du texte conversationnel. JAMAIS de JSON, code, ou structure technique. Comme si tu parlais à un ami au téléphone.`

    const response = await generateGroqResponse(fullPrompt)
    
    return NextResponse.json({ response, isDemo: false })

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

// Réponses de démonstration réalistes
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