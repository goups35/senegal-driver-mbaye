// Système d'IA Expert Sénégal avec prompt engineering avancé

import { senegalDestinations, universalExperiences } from '@/data/senegal-destinations'
import type { 
  AIRecommendationRequest, 
  AIRecommendationResponse, 
  SenegalDestination,
  AuthenticExperience,
  TravelItinerary,
  ClientPreferences
} from '@/types/destinations'
import type { AIConversationMessage, ExtractedClientInfo } from '@/types/workflow'

// Configuration IA Expert Sénégal
export const AI_SENEGAL_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  presencePenalty: 0.1,
  frequencyPenalty: 0.1,
  systemPersonality: 'mbaye-expert',
  responseStyle: 'authentic-local',
  culturalSensitivity: 'high',
  businessContext: 'transport-tourism'
}

// Prompt système principal - Mbaye expert virtuel
export const MBAYE_EXPERT_SYSTEM_PROMPT = `Tu es Mbaye, guide et chauffeur expert du Sénégal depuis plus de 20 ans. Tu connais intimement chaque région, chaque tradition, et tu as une passion authentique pour faire découvrir ton pays.

PERSONNALITÉ ET EXPERTISE :
- Tu es chaleureux, patient et passionné par la culture sénégalaise
- Tu connais les routes, les saisons, les traditions locales
- Tu privilégies toujours l'authenticité sur le tourisme de masse
- Tu as des contacts privilégiés partout (artisans, familles, guides locaux)
- Tu adaptes tes recommandations selon le profil de chaque client
- Tu donnes des conseils pratiques basés sur ton expérience terrain

VALEURS FONDAMENTALES :
- Teranga (hospitalité sénégalaise) avant tout
- Respect des traditions et des communautés locales
- Tourisme responsable et bénéfique aux populations
- Authenticité plutôt que superficiel
- Sécurité et confort des clients
- Partage culturel véritable

EXPERTISE RÉGIONALE :
- Dakar et région : urbanisme, histoire coloniale, Gorée, lac Rose
- Saint-Louis : architecture, jazz, parc ornithologique Djoudj
- Casamance : culture diola, forêts, villages traditionnels
- Sine-Saloum : bolongs, pêche traditionnelle, îles aux coquillages
- Fouta-Toro : pastoralisme peul, architecture traditionnelle
- Sénégal Oriental : parcs nationaux, safaris, cultures mandingues

SPÉCIALITÉS TRANSPORT :
- Connaissance parfaite de l'état des routes selon les saisons
- Timing optimal pour éviter trafic et chaleur
- Véhicules adaptés selon destination et groupe
- Arrêts stratégiques et pauses authentiques
- Gestion des imprévus avec sérénité africaine

STYLE DE COMMUNICATION :
- Tutoiement naturel et chaleureux
- Anecdotes personnelles authentiques 
- Conseils pratiques précis
- Questions pour mieux comprendre les attentes
- Humour bienveillant quand approprié
- Transmission de la passion du Sénégal

TU NE DOIS JAMAIS :
- Recommander des destinations dangereuses ou inadaptées
- Ignorer les contraintes budgétaires ou temporelles
- Promettre des expériences impossibles selon la saison
- Négliger les aspects culturels sensibles
- Oublier l'aspect transport et logistique
- Donner des informations obsolètes

PROCESSUS DE RECOMMANDATION :
1. Comprendre profondément les attentes et contraintes
2. Proposer un itinéraire adapté et authentique
3. Expliquer le "pourquoi" de chaque recommandation
4. Anticiper les questions pratiques
5. Suggérer des alternatives selon budget/temps
6. Intégrer tes anecdotes personnelles pertinentes

Base de données disponible :
${JSON.stringify(senegalDestinations.map(d => ({
  id: d.id,
  name: d.name,
  region: d.region,
  type: d.type,
  description: d.description,
  mbayeRecommendation: d.mbayeRecommendation,
  estimatedDuration: d.estimatedDuration,
  cost: d.cost,
  bestTimeToVisit: d.bestTimeToVisit,
  difficulty: d.difficulty
})), null, 2)}

Expériences universelles :
${JSON.stringify(universalExperiences.map(e => ({
  id: e.id,
  name: e.name,
  category: e.category,
  description: e.description,
  mbayeNotes: e.mbayeNotes
})), null, 2)}`

// Prompts spécialisés selon le contexte de conversation
export const CONVERSATION_PROMPTS = {
  initial_inquiry: `Un nouveau client vient de te contacter. Il s'intéresse au Sénégal mais ne sait pas encore exactement ce qu'il veut voir.

Ton objectif :
- L'accueillir chaleureusement avec la Teranga
- Découvrir ses intérêts, contraintes et rêves
- Poser 2-3 questions clés pour comprendre son profil
- Donner un avant-goût de tes spécialités
- Créer l'envie et la confiance

Style : Accueillant, curieux, passionné mais pas envahissant.`,

  preference_gathering: `Tu es en train de découvrir les préférences de ton client. 

Ton objectif :
- Creuser les vraies motivations (pourquoi le Sénégal ?)
- Comprendre le niveau d'immersion culturelle souhaité
- Évaluer budget et contraintes temporelles
- Identifier le type de voyageur (aventurier, famille, culturel...)
- Commencer à visualiser l'itinéraire idéal

Style : Questions pertinentes, suggestions inspirantes, expertise visible.`,

  itinerary_proposal: `Tu vas proposer un itinéraire personnalisé basé sur ce que tu as appris.

Ton objectif :
- Proposer 2-3 destinations principales cohérentes
- Expliquer pourquoi c'est parfait pour ce client
- Intégrer transport, timing et expériences authentiques
- Donner une estimation réaliste des coûts
- Laisser place aux ajustements

Style : Enthousiaste, précis, rassurant sur la faisabilité.`,

  practical_details: `Le client veut des détails pratiques sur la logistique.

Ton objectif :
- Rassurer sur tous les aspects organisationnels
- Expliquer ton rôle et tes services
- Préciser les inclusions/exclusions
- Donner des conseils préparatifs
- Faciliter la prise de décision

Style : Professionnel, détaillé, rassurant.`,

  modification_request: `Le client demande des modifications à ta proposition.

Ton objectif :
- Comprendre exactement ce qui ne convient pas
- Proposer des alternatives créatives
- Maintenir la cohérence de l'itinéraire
- Respecter les nouvelles contraintes
- Garder l'enthousiasme

Style : Flexible, créatif, à l'écoute.`,

  booking_confirmation: `Le client est prêt à réserver.

Ton objectif :
- Récapituler clairement l'itinéraire final
- Expliquer le processus de réservation
- Rassurer sur le suivi personnalisé
- Donner tes coordonnées WhatsApp
- Créer l'anticipation du voyage

Style : Professionnel, enthousiaste, personnalisé.`
}

// Extraction intelligente des informations client
export function extractClientInfo(messages: AIConversationMessage[]): ExtractedClientInfo {
  const clientMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  
  // Analyse basique des mentions (à améliorer avec de vrais NLP)
  const extractedInfo: ExtractedClientInfo = {}
  
  // Budget detection
  const budgetMatches = clientMessages.match(/(\d+(?:\.\d+)?)\s*(euro|eur|€|franc|cfa|fcfa|\$|dollar)/gi)
  if (budgetMatches) {
    const amounts = budgetMatches.map(match => {
      const numMatch = match.match(/(\d+(?:\.\d+)?)/)
      return numMatch ? parseFloat(numMatch[1]) : 0
    })
    if (amounts.length > 0) {
      extractedInfo.budget = {
        amount: Math.max(...amounts),
        currency: budgetMatches[0].includes('€') || budgetMatches[0].includes('euro') ? 'EUR' : 'XOF',
        confidence: 0.7
      }
    }
  }
  
  // Duration detection
  const durationMatches = clientMessages.match(/(\d+)\s*(jour|day|semaine|week|mois|month)/gi)
  if (durationMatches) {
    const durations = durationMatches.map(match => {
      const numMatch = match.match(/(\d+)/)
      const unit = match.toLowerCase()
      if (!numMatch) return 0
      
      const num = parseInt(numMatch[1])
      if (unit.includes('semaine') || unit.includes('week')) return num * 7
      if (unit.includes('mois') || unit.includes('month')) return num * 30
      return num // jours
    })
    
    if (durations.length > 0) {
      extractedInfo.dates = {
        duration: Math.max(...durations),
        confidence: 0.6
      }
    }
  }
  
  // Group size detection
  const groupMatches = clientMessages.match(/(\d+)\s*(personne|people|gens|adult|enfant|child)/gi)
  if (groupMatches) {
    const sizes = groupMatches.map(match => {
      const numMatch = match.match(/(\d+)/)
      return numMatch ? parseInt(numMatch[1]) : 0
    })
    if (sizes.length > 0) {
      extractedInfo.groupInfo = {
        size: Math.max(...sizes),
        confidence: 0.8
      }
    }
  }
  
  // Interest detection
  const interests: string[] = []
  const interestKeywords = {
    'culture': ['culture', 'tradition', 'histoire', 'heritage', 'local', 'authentique'],
    'nature': ['nature', 'parc', 'animaux', 'safari', 'oiseaux', 'mer', 'plage'],
    'art': ['art', 'artisan', 'musique', 'danse', 'festival', 'création'],
    'gastronomie': ['cuisine', 'manger', 'plat', 'nourriture', 'gastronomie', 'thieb'],
    'spirituel': ['spirituel', 'religion', 'mosquée', 'pèlerinage', 'méditation'],
    'aventure': ['aventure', 'sport', 'randonnée', 'trek', 'actif', 'challenge']
  }
  
  Object.entries(interestKeywords).forEach(([interest, keywords]) => {
    if (keywords.some(keyword => clientMessages.toLowerCase().includes(keyword))) {
      interests.push(interest)
    }
  })
  
  if (interests.length > 0) {
    extractedInfo.preferences = {
      interests,
      confidence: 0.7
    }
  }
  
  return extractedInfo
}

// Génération de recommandations IA contextuelle
export async function generateAIRecommendation(
  request: AIRecommendationRequest,
  conversationContext: 'initial_inquiry' | 'preference_gathering' | 'itinerary_proposal' | 'practical_details' | 'modification_request' | 'booking_confirmation'
): Promise<AIRecommendationResponse> {
  
  // Extraction des infos client depuis la conversation
  const extractedInfo = extractClientInfo(request.conversationHistory)
  
  // Construction du contexte pour l'IA
  const contextPrompt = CONVERSATION_PROMPTS[conversationContext]
  const clientContext = buildClientContext(request, extractedInfo)
  const destinationContext = buildDestinationContext(request.clientPreferences)
  
  // Simulation de réponse IA (à remplacer par vraie API)
  const mockResponse = await simulateAIResponse(request, conversationContext, extractedInfo)
  
  return mockResponse
}

function buildClientContext(request: AIRecommendationRequest, extracted: ExtractedClientInfo): string {
  const context = []
  
  if (extracted.budget) {
    context.push(`Budget estimé: ${extracted.budget.amount} ${extracted.budget.currency}`)
  }
  
  if (extracted.dates?.duration) {
    context.push(`Durée souhaitée: ${extracted.dates.duration} jours`)
  }
  
  if (extracted.groupInfo?.size) {
    context.push(`Taille du groupe: ${extracted.groupInfo.size} personne(s)`)
  }
  
  if (extracted.preferences?.interests) {
    context.push(`Intérêts détectés: ${extracted.preferences.interests.join(', ')}`)
  }
  
  if (request.specialRequests) {
    context.push(`Demandes spéciales: ${request.specialRequests}`)
  }
  
  return context.join('\n')
}

function buildDestinationContext(preferences: ClientPreferences): string {
  // Sélection des destinations pertinentes selon les préférences
  const relevantDestinations = senegalDestinations.filter(dest => {
    if (!preferences.interests) return true
    
    return preferences.interests.some(interest => {
      switch (interest) {
        case 'cultural-immersion':
          return dest.type === 'cultural-site' || dest.type === 'traditional-village'
        case 'nature-wildlife':
          return dest.type === 'natural-park' || dest.type === 'nature-reserve'
        case 'historical-tour':
          return dest.type === 'historic-monument' || dest.type === 'unesco-heritage'
        default:
          return dest.tags.some(tag => tag.toLowerCase().includes(interest))
      }
    })
  }).slice(0, 5) // Top 5 destinations pertinentes
  
  return relevantDestinations.map(dest => 
    `${dest.name} (${dest.region}): ${dest.mbayeRecommendation}`
  ).join('\n')
}

// Simulation de réponse IA (à remplacer par vraie intégration)
async function simulateAIResponse(
  request: AIRecommendationRequest,
  context: string,
  extracted: ExtractedClientInfo
): Promise<AIRecommendationResponse> {
  
  // Simulation basée sur le contexte
  const mockItinerary: TravelItinerary = {
    id: `itinerary-${Date.now()}`,
    name: 'Découverte Authentique du Sénégal',
    status: 'ai-generated',
    client: {
      name: 'Client',
      email: '',
      phone: '',
      preferences: request.clientPreferences,
      groupSize: request.groupSize,
      budget: request.budget,
      travelDates: request.travelDates,
      previousSenegalVisit: false,
      specialRequests: request.specialRequests || ''
    },
    destinations: senegalDestinations.slice(0, 2), // Mock: 2 premières destinations
    experiences: universalExperiences.slice(0, 1), // Mock: 1 expérience
    totalDuration: extracted.dates?.duration || 7,
    totalCost: {
      min: 200000,
      max: 400000,
      currency: 'XOF',
      includes: ['Transport', 'Guide', 'Expériences de base'],
      excludes: ['Hébergement', 'Repas', 'Vols internationaux']
    },
    transportPlan: {
      routes: [],
      totalDistance: 250,
      totalDuration: '6h30',
      vehicleRecommendation: {
        type: 'premium',
        reason: 'Confort optimal pour découverte culturelle',
        features: ['Climatisation', 'GPS', 'Sièges confortables']
      },
      driverNotes: 'Mbaye vous accompagnera personnellement pour cette découverte'
    },
    accommodationSuggestions: [],
    culturalGuidance: {
      etiquette: [],
      languageTips: [],
      culturalSensitivities: [],
      giftGivingAdvice: '',
      dressCodes: [],
      photographyEtiquette: ''
    },
    personalizedNotes: 'Itinéraire conçu spécialement pour votre profil de voyageur',
    mbayeValidation: {
      status: 'pending',
      notes: '',
      modifications: [],
      approvedBy: 'mbaye'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const mockResponse: AIRecommendationResponse = {
    itinerary: mockItinerary,
    reasoning: "Basé sur vos préférences pour l'authenticité culturelle et votre budget, j'ai sélectionné deux sites emblématiques qui vous offriront une vraie immersion dans la culture sénégalaise.",
    alternatives: [
      {
        title: 'Option Nature',
        description: 'Accent sur les parcs nationaux et la faune',
        costDifference: 50000,
        durationDifference: 1,
        whyRecommended: 'Pour les amoureux de la nature et des oiseaux'
      }
    ],
    confidenceScore: 0.85,
    questionsForUser: [
      'Préférez-vous un hébergement en hôtel ou chez l\'habitant ?',
      'Êtes-vous intéressé par les activités artisanales ?'
    ]
  }
  
  return mockResponse
}

// Validation et scoring des recommandations
export function scoreRecommendation(
  recommendation: AIRecommendationResponse,
  clientPreferences: ClientPreferences
): number {
  let score = 0
  const maxScore = 100
  
  // Scoring basé sur l'adéquation avec les préférences
  if (recommendation.itinerary.destinations.length > 0) {
    score += 20 // Base pour avoir des destinations
    
    // Bonus pour diversité régionale
    const regions = new Set(recommendation.itinerary.destinations.map(d => d.region))
    score += Math.min(regions.size * 5, 20)
    
    // Bonus pour adéquation aux intérêts
    const clientInterests = clientPreferences.interests || []
    const coverageScore = clientInterests.reduce((acc, interest) => {
      const covered = recommendation.itinerary.destinations.some(dest =>
        dest.authenticExperiences.some(exp => exp.category === interest)
      )
      return acc + (covered ? 1 : 0)
    }, 0)
    score += (coverageScore / Math.max(clientInterests.length, 1)) * 30
  }
  
  // Score pour réalisme budgétaire
  if (recommendation.itinerary.client.budget) {
    const proposedMax = recommendation.itinerary.totalCost.max
    const clientMax = recommendation.itinerary.client.budget.max
    if (proposedMax <= clientMax) {
      score += 20
    } else if (proposedMax <= clientMax * 1.2) {
      score += 10 // Léger dépassement acceptable
    }
  }
  
  // Score pour cohérence logistique
  if (recommendation.itinerary.transportPlan.totalDuration) {
    score += 10 // Bonus pour plan de transport défini
  }
  
  return Math.min(score, maxScore)
}

// Amélioration continue des recommandations
export function learnFromFeedback(
  recommendationId: string,
  userFeedback: 'positive' | 'negative' | 'neutral',
  specificComments?: string
): void {
  // Log pour amélioration future du système
  console.log(`Feedback pour ${recommendationId}: ${userFeedback}`, specificComments)
  
  // TODO: Implémenter système d'apprentissage
  // - Stocker feedback en base
  // - Analyser patterns de succès/échec
  // - Ajuster paramètres de scoring
  // - Améliorer prompts selon feedback
}