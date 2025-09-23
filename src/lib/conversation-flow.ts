/**
 * Advanced Conversation Flow Management for Senegal Driver MVP
 * Comprehensive prompt engineering strategy for structured trip planning
 */

export interface ConversationState {
  phase: 'greeting' | 'discovery' | 'planning' | 'refinement' | 'summary'
  collectedInfo: {
    duration?: string
    travelers?: string
    interests?: string[]
    budget?: string
    mobility?: string
    previousExperience?: string
    specificDestinations?: string[]
    travelStyle?: string
  }
  questionsAsked: string[]
  isComplete: boolean
  nextQuestionPriority: number
  [key: string]: unknown
}

export class TripPlanningPromptEngine {
  
  /**
   * Master prompt structure with conversation flow management
   */
  static buildMasterPrompt(userMessage: string, conversationState: ConversationState): string {
    const systemContext = this.getSystemContext()
    const phaseInstructions = this.getPhaseInstructions(conversationState.phase)
    const progressTracking = this.getProgressTracking(conversationState)
    const responseFormat = this.getResponseFormat(conversationState.phase)
    
    return `${systemContext}

${phaseInstructions}

${progressTracking}

MESSAGE UTILISATEUR: "${userMessage}"

${responseFormat}`
  }

  /**
   * Core system context and personality
   */
  private static getSystemContext(): string {
    return `🇸🇳 TU ES MAXIME - EXPERT VOYAGE SÉNÉGAL

IDENTITÉ:
- Conseiller voyage spécialisé Sénégal depuis 10 ans
- Personnalité chaleureuse, professionnelle, enthousiaste
- Tu connais parfaitement chaque région, ville, et expérience unique
- Tu guides naturellement la conversation vers un itinéraire complet

MISSION PRINCIPALE:
Créer un voyage personnalisé au Sénégal jour par jour, prêt à être envoyé via WhatsApp.

⚠️ INTERDICTION ABSOLUE:
Tu ne dois JAMAIS demander l'hébergement, le logement, où dormir, quel type d'hôtel, etc.
Tu ne gères QUE les destinations et les activités. L'hébergement n'est PAS ton domaine.

STYLE DE COMMUNICATION:
- Conversationnel et naturel (pas robotique)
- Une question stratégique par réponse
- Toujours optimiste sur les possibilités du Sénégal
- Utilise des émojis avec parcimonie mais efficacité
- Expressions françaises authentiques`
  }

  /**
   * Phase-specific instructions for conversation flow
   */
  private static getPhaseInstructions(phase: ConversationState['phase']): string {
    const instructions = {
      greeting: `PHASE 1 - ACCUEIL CHALEUREUX (30 secondes)
OBJECTIF: Créer une connexion et identifier le profil voyageur de base

STRATÉGIE:
- Accueillir avec enthousiasme le projet Sénégal
- Poser UNE question ouverte sur la motivation du voyage
- Identifier: première fois? retour? durée approximative?
- Créer l'envie avec 1-2 destinations emblématiques

QUESTION PRIORITAIRE: "Qu'est-ce qui vous attire dans l'idée de découvrir le Sénégal ?"`,

      discovery: `PHASE 2 - QUESTIONS PRÉCISES ET STRUCTURÉES (2-3 échanges MAX)
OBJECTIF: Collecter les informations essentielles rapidement et efficacement

QUESTIONS OBLIGATOIRES DANS L'ORDRE (UNE SEULE par message):

QUESTION 1 - SI DURÉE MANQUE:
"Combien de jours comptez-vous rester au Sénégal ? (exemple: 7 jours, 10 jours, 2 semaines)"

QUESTION 2 - SI NOMBRE DE PERSONNES MANQUE:
"Combien êtes-vous à voyager ? En couple, en famille, entre amis ?"

QUESTION 3 - SI ENVIES/PRÉFÉRENCES MANQUENT:
"Qu'est-ce qui vous attire le plus : l'histoire et la culture (Dakar, Saint-Louis), les plages paradisiaques (Saly, Casamance), ou la nature authentique (Sine-Saloum, brousse) ?"

RÈGLES STRICTES:
- JAMAIS utiliser "aux petits oignons", "concocter", expressions fleuries
- Une question PRÉCISE, pas 3 questions en une
- Éviter absolument les répétitions
- INTERDICTION TOTALE de demander l'hébergement ou le logement
- Passer directement à la planification après 3 infos obtenues`,

      planning: `PHASE 3 - PROPOSITION CONCRÈTE D'ITINÉRAIRE (1-2 échanges MAX)
OBJECTIF: Proposer un itinéraire concret et obtenir la validation

MÉTHODE DIRECTE:
- Proposer un itinéraire jour par jour basé sur leurs infos (durée + envies + nombre)
- Format: "Voici ce que je propose: Jour 1-2: [destination], Jour 3-4: [destination]..."
- Demander une validation simple: "Cet itinéraire vous convient-il ou préférez-vous modifier quelque chose ?"

RÈGLES ABSOLUES:
- INTERDICTION TOTALE de demander le type d'hébergement, logement, ou où dormir
- INTERDICTION de demander les préférences d'hébergement (hôtel, auberge, etc.)
- PROPOSER directement l'itinéraire, ne pas demander plus d'infos
- Aller à l'essentiel pour validation rapide
- Tu ne gères QUE les destinations, pas l'hébergement`,

      refinement: `PHASE 4 - AFFINEMENT ET VALIDATION (1-2 échanges)
OBJECTIF: Finaliser les détails et confirmer l'ensemble

ACTIONS:
- Présenter l'itinéraire complet
- Demander les derniers ajustements
- Valider la logistique finale
- Préparer la transition vers le résumé final`,

      summary: `PHASE 5 - RÉCAPITULATIF FINAL WHATSAPP
OBJECTIF: Produire le message final prêt à envoyer

FORMAT OBLIGATOIRE:
🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - [Durée] jours

Jour 1: [Ville] - [Activités principales]
Jour 2: [Ville] - [Activités principales]
[etc.]

💡 Points forts de votre voyage:
- [3-4 highlights personnalisés]

📱 Prochaines étapes:
Contactez-nous pour organiser votre voyage personnalisé !

---
Itinéraire créé par Maxime, votre conseiller Sénégal`
    }

    return instructions[phase]
  }

  /**
   * Progress tracking for conversation state
   */
  private static getProgressTracking(state: ConversationState): string {
    const { collectedInfo, questionsAsked } = state
    
    return `INFORMATIONS DÉJÀ COLLECTÉES:
${Object.entries(collectedInfo)
  .filter(([, value]) => value)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') || '- Aucune information collectée'}

QUESTIONS DÉJÀ POSÉES: [${questionsAsked.join(', ')}]

PROGRESSION: Phase ${state.phase} - ${this.getPhaseProgress(state)}%`
  }

  /**
   * Response format based on conversation phase
   */
  private static getResponseFormat(phase: ConversationState['phase']): string {
    if (phase === 'summary') {
      return `GÉNÈRE LE RÉCAPITULATIF FINAL:
- Format WhatsApp exactement comme spécifié
- Itinéraire jour par jour complet
- Message prêt à copier-coller
- Utilise UNIQUEMENT les informations collectées
- Termine par "RÉCAPITULATIF PERSONNALISÉ" pour déclencher le bouton WhatsApp`
    }

    return `STRUCTURE DE TA RÉPONSE:
1. [Réaction positive aux infos données - 1 ligne]
2. [Conseil ou insight sur le Sénégal - 2-3 lignes]
3. [UNE question stratégique pour la suite - 1 ligne]
4. [2-3 options/exemples pour guider la réponse]

CONTRAINTES:
- Maximum 100 mots
- Une seule question par réponse
- Pas de liste à puces longue
- Ton naturel et enjoué
- JAMAIS demander l'hébergement, logement, ou où dormir`
  }

  /**
   * Calculate phase progress percentage
   */
  private static getPhaseProgress(state: ConversationState): number {
    const phases = ['greeting', 'discovery', 'planning', 'refinement', 'summary']
    const currentIndex = phases.indexOf(state.phase)
    return Math.round(((currentIndex + 1) / phases.length) * 100)
  }

  /**
   * Determine next conversation phase based on collected information
   */
  static determineNextPhase(state: ConversationState, userMessage: string): ConversationState['phase'] {
    const { collectedInfo, questionsAsked } = state
    const essentialInfoCount = Object.values(collectedInfo).filter(Boolean).length
    const message = userMessage.toLowerCase()

    // Phase progression logic with improved triggers
    if (state.phase === 'greeting' && userMessage.length > 10) {
      return 'discovery'
    }
    
    if (state.phase === 'discovery' && essentialInfoCount >= 3) {
      return 'planning'
    }
    
    // More flexible planning → refinement transition
    if (state.phase === 'planning') {
      // Trigger refinement if user shows agreement or mentions destinations
      if (message.includes('parfait') || message.includes('convient') || 
          message.includes('dakar') || message.includes('saint-louis') ||
          message.includes('sine saloum') || message.includes('oui') ||
          questionsAsked.length >= 5) {
        return 'refinement'
      }
    }
    
    // More flexible refinement → summary triggers
    if (state.phase === 'refinement') {
      if (message.includes('validé') || message.includes('parfait') ||
          message.includes('résumé') || message.includes('whatsapp') ||
          message.includes('final') || message.includes('créez') ||
          message.includes('maintenant') || questionsAsked.length >= 6) {
        return 'summary'
      }
    }

    return state.phase
  }

  /**
   * Extract information from user message and update conversation state
   */
  static extractAndUpdateInfo(userMessage: string, state: ConversationState): ConversationState {
    const message = userMessage.toLowerCase()
    const updatedInfo = { ...state.collectedInfo }

    // Duration extraction
    if (message.match(/\d+\s*(jours?|semaines?|mois)/)) {
      const duration = message.match(/\d+\s*(jours?|semaines?|mois)/)?.[0]
      if (duration) updatedInfo.duration = duration
    }

    // Interests extraction
    const interests = []
    if (message.includes('culture') || message.includes('culturel')) interests.push('culture')
    if (message.includes('plage') || message.includes('mer')) interests.push('plages')
    if (message.includes('nature') || message.includes('naturel')) interests.push('nature')
    if (message.includes('aventure') || message.includes('activité')) interests.push('aventure')
    if (interests.length > 0) updatedInfo.interests = interests

    // Travel style
    if (message.includes('luxe') || message.includes('confort')) {
      updatedInfo.travelStyle = 'confort'
    } else if (message.includes('authentique') || message.includes('local')) {
      updatedInfo.travelStyle = 'authentique'
    }

    // Number of travelers
    const travelers = message.match(/\d+\s*(personnes?|voyageurs?|gens)/)?.[0]
    if (travelers) updatedInfo.travelers = travelers

    // Specific destinations extraction
    const destinations = []
    if (message.includes('dakar')) destinations.push('Dakar')
    if (message.includes('saint-louis')) destinations.push('Saint-Louis')
    if (message.includes('sine saloum') || message.includes('saloum')) destinations.push('Sine-Saloum')
    if (message.includes('gorée')) destinations.push('Île de Gorée')
    if (message.includes('lac rose')) destinations.push('Lac Rose')
    if (message.includes('saly')) destinations.push('Saly')
    if (message.includes('casamance')) destinations.push('Casamance')
    if (destinations.length > 0) updatedInfo.specificDestinations = destinations

    // Update phase
    const nextPhase = this.determineNextPhase(state, userMessage)

    return {
      ...state,
      collectedInfo: updatedInfo,
      phase: nextPhase,
      questionsAsked: [...state.questionsAsked, userMessage.substring(0, 50)]
    }
  }

  /**
   * Generate precise sequential questions - NO REPETITIONS
   */
  static getNextStrategicQuestion(state: ConversationState): string {
    const { collectedInfo } = state

    // QUESTION 1 PRIORITAIRE: Durée (si manque)
    if (!collectedInfo.duration) {
      return "Combien de jours comptez-vous rester au Sénégal ? (exemple: 7 jours, 10 jours, 2 semaines)"
    }

    // QUESTION 2 PRIORITAIRE: Nombre de personnes (si manque)
    if (!collectedInfo.travelers) {
      return "Combien êtes-vous à voyager ? En couple, en famille, entre amis ?"
    }

    // QUESTION 3 PRIORITAIRE: Envies principales (si manque)  
    if (!collectedInfo.interests?.length) {
      return "Qu'est-ce qui vous attire le plus : l'histoire et la culture (Dakar, Saint-Louis), les plages paradisiaques (Saly, Casamance), ou la nature authentique (Sine-Saloum, brousse) ?"
    }

    // Si toutes les infos essentielles sont collectées, passer à la planification
    return "Parfait ! J'ai maintenant assez d'informations pour vous proposer un itinéraire."
  }
}

/**
 * Enhanced conversation state management
 */
export class ConversationStateManager {
  private static states = new Map<string, ConversationState>()

  static initializeState(sessionId: string): ConversationState {
    const initialState: ConversationState = {
      phase: 'greeting',
      collectedInfo: {},
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 1
    }
    
    this.states.set(sessionId, initialState)
    return initialState
  }

  static getState(sessionId: string): ConversationState {
    return this.states.get(sessionId) || this.initializeState(sessionId)
  }

  static updateState(sessionId: string, newState: ConversationState): void {
    this.states.set(sessionId, newState)
  }

  static isReadyForSummary(state: ConversationState): boolean {
    const { collectedInfo } = state
    return !!(
      collectedInfo.duration &&
      collectedInfo.interests?.length &&
      (collectedInfo.specificDestinations?.length || collectedInfo.travelStyle)
    )
  }
}

/**
 * WhatsApp message formatter
 */
export class WhatsAppMessageFormatter {
  static formatFinalItinerary(state: ConversationState): string {
    const { collectedInfo } = state
    const duration = collectedInfo.duration || "plusieurs jours"
    
    // Generate day-by-day itinerary based on collected preferences
    const itinerary = this.generateItinerary(collectedInfo)
    const highlights = this.generateHighlights(collectedInfo)

    return `🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - ${duration}

${itinerary}

💡 Points forts de votre voyage:
${highlights}

📱 Prochaines étapes:
Contactez-nous pour organiser votre voyage personnalisé !

---
Itinéraire créé par Maxime, votre conseiller Sénégal

RÉCAPITULATIF PERSONNALISÉ`
  }

  private static generateItinerary(info: Record<string, unknown>): string {
    // Logic to create day-by-day based on preferences
    this.calculateDays(info.duration as string)
    const destinations = this.selectDestinations(info)
    
    return destinations.map((dest, index) => 
      `Jour ${index + 1}: ${dest.city} - ${dest.activities}`
    ).join('\n')
  }

  private static generateHighlights(info: ConversationState['collectedInfo']): string {
    const highlights = []
    if (info.interests?.includes('culture')) {
      highlights.push("- Immersion dans la culture sénégalaise authentique")
    }
    if (info.interests?.includes('plages')) {
      highlights.push("- Détente sur les plus belles plages atlantiques")
    }
    if (info.interests?.includes('nature')) {
      highlights.push("- Découverte des paysages naturels uniques")
    }
    
    return highlights.join('\n') || "- Voyage personnalisé selon vos préférences"
  }

  private static calculateDays(duration?: string): number {
    if (!duration) return 7
    const match = duration.match(/\d+/)
    if (!match) return 7
    
    const num = parseInt(match[0])
    if (duration.includes('semaine')) return num * 7
    return num
  }

  private static selectDestinations(info: ConversationState['collectedInfo']) {
    // Destination selection logic based on preferences
    const baseDestinations = [
      { city: "Dakar", activities: "Découverte de la capitale, île de Gorée" },
      { city: "Saint-Louis", activities: "Patrimoine UNESCO, architecture coloniale" },
      { city: "Lac Rose", activities: "Paysages roses uniques, sel et traditions" }
    ]

    if (info.interests?.includes('plages')) {
      baseDestinations.push({ city: "Saly", activities: "Plages dorées, détente océanique" })
    }

    if (info.interests?.includes('nature')) {
      baseDestinations.push({ city: "Sine-Saloum", activities: "Deltas, mangroves, observation oiseaux" })
    }

    return baseDestinations
  }
}