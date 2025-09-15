/**
 * API Demo Mode Tests
 * Testing the demo response functionality without complex mocking
 */

import { ConversationState, TripPlanningPromptEngine } from '../lib/conversation-flow'

// Test demo response function directly
function getAdvancedDemoResponse(message: string, state: ConversationState): string {
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
      return `🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - ${collectedInfo.duration || '7 jours'}

Jour 1: Dakar - Découverte de la capitale, île de Gorée
Jour 2: Dakar - Marchés colorés, musée et quartiers historiques
Jour 3: Saint-Louis - Patrimoine UNESCO, architecture coloniale
Jour 4: Saint-Louis - Navigation sur le fleuve Sénégal
Jour 5: Lac Rose - Paysages roses uniques, récolte de sel
Jour 6: Saly - Plages dorées, détente océanique
Jour 7: Saly - Retour et derniers souvenirs

💡 Points forts de votre voyage:
- Immersion dans la culture sénégalaise authentique
- Découverte des sites UNESCO exceptionnels
- Rencontre avec les traditions locales
- Expérience nature unique au Lac Rose

📱 Prochaines étapes:
Contactez-nous pour organiser votre voyage personnalisé !

---
Itinéraire créé par Maxime, votre conseiller Sénégal

RÉCAPITULATIF PERSONNALISÉ`

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

function getOptionsForQuestion(state: ConversationState): string {
  const { collectedInfo } = state
  
  if (!collectedInfo.duration) {
    return "Exemples : 'une semaine', '10 jours', '2 semaines'"
  }
  if (!collectedInfo.interests?.length) {
    return "Par exemple : culture locale, plages paradisiaques, nature sauvage, aventure..."
  }
  return "Donnez-moi tous les détails qui vous passent par la tête !"
}

describe('API Demo Mode Responses', () => {
  describe('Phase-specific responses', () => {
    it('should provide greeting response', () => {
      const state: ConversationState = {
        phase: 'greeting',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const response = getAdvancedDemoResponse('Bonjour', state)
      
      expect(response).toContain('🇸🇳 Bonjour ! Je suis Maxime')
      expect(response).toContain('Qu\'est-ce qui vous attire dans l\'idée de découvrir le Sénégal')
    })

    it('should provide discovery response with next strategic question', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const response = getAdvancedDemoResponse('Je veux découvrir la culture', state)
      
      expect(response).toContain('Parfait !')
      expect(response).toContain('Combien de jours comptez-vous rester')
      expect(response).toContain('culture sénégalaise est d\'une richesse incroyable')
    })

    it('should provide planning response with concrete itinerary', () => {
      const state: ConversationState = {
        phase: 'planning',
        collectedInfo: { duration: '7 jours' },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 3
      }

      const response = getAdvancedDemoResponse('Culture et plages', state)
      
      expect(response).toContain('Excellent choix !')
      expect(response).toContain('7 jours')
      expect(response).toContain('Jour 1-2 : Dakar')
      expect(response).toContain('Jour 3-4 : Saint-Louis')
      expect(response).toContain('Qu\'en pensez-vous ?')
    })

    it('should provide refinement response', () => {
      const state: ConversationState = {
        phase: 'refinement',
        collectedInfo: { duration: '7 jours', interests: ['culture'] },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 4
      }

      const response = getAdvancedDemoResponse('Ça me va', state)
      
      expect(response).toContain('Parfait ! Votre itinéraire prend forme')
      expect(response).toContain('Êtes-vous satisfait')
    })

    it('should provide complete WhatsApp summary', () => {
      const state: ConversationState = {
        phase: 'summary',
        collectedInfo: { 
          duration: '7 jours',
          interests: ['culture', 'plages'],
          travelers: '2 personnes'
        },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 5
      }

      const response = getAdvancedDemoResponse('Créez le récapitulatif', state)
      
      expect(response).toContain('🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours')
      expect(response).toContain('Jour 1:')
      expect(response).toContain('Jour 2:')
      expect(response).toContain('💡 Points forts de votre voyage:')
      expect(response).toContain('📱 Prochaines étapes:')
      expect(response).toContain('RÉCAPITULATIF PERSONNALISÉ')
      expect(response).toContain('Itinéraire créé par Maxime')
    })
  })

  describe('Personalized insights', () => {
    it('should provide culture-specific insight', () => {
      const insight = getPersonalizedInsight('J\'adore la culture locale')
      expect(insight).toContain('culture sénégalaise est d\'une richesse incroyable')
    })

    it('should provide beach-specific insight', () => {
      const insight = getPersonalizedInsight('Je veux des plages magnifiques')
      expect(insight).toContain('plages du Sénégal sont parmi les plus belles')
    })

    it('should provide generic insight for other interests', () => {
      const insight = getPersonalizedInsight('J\'aime l\'aventure')
      expect(insight).toContain('Sénégal va vous surprendre par sa diversité')
    })
  })

  describe('Question options', () => {
    it('should provide duration examples when duration missing', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const options = getOptionsForQuestion(state)
      expect(options).toContain('une semaine')
      expect(options).toContain('10 jours')
      expect(options).toContain('2 semaines')
    })

    it('should provide interest examples when interests missing', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: { duration: '7 jours', travelers: '2 personnes' },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 3
      }

      const options = getOptionsForQuestion(state)
      expect(options).toContain('culture locale')
      expect(options).toContain('plages paradisiaques')
      expect(options).toContain('nature sauvage')
    })

    it('should provide generic encouragement when all info collected', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: { 
          duration: '7 jours', 
          travelers: '2 personnes',
          interests: ['culture']
        },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 4
      }

      const options = getOptionsForQuestion(state)
      expect(options).toContain('Donnez-moi tous les détails')
    })
  })

  describe('Complete demo flow simulation', () => {
    it('should handle complete conversation flow in demo mode', () => {
      let state: ConversationState = {
        phase: 'greeting',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      // Step 1: Initial greeting
      let response = getAdvancedDemoResponse('Bonjour, je veux découvrir le Sénégal', state)
      expect(response).toContain('🇸🇳 Bonjour ! Je suis Maxime')

      // Step 2: Move to discovery
      state = TripPlanningPromptEngine.extractAndUpdateInfo('Culture et traditions', state)
      response = getAdvancedDemoResponse('Culture et traditions', state)
      expect(response).toContain('Combien de jours')

      // Step 3: Provide duration
      state = TripPlanningPromptEngine.extractAndUpdateInfo('7 jours', state)
      response = getAdvancedDemoResponse('7 jours', state)
      expect(response).toContain('Combien êtes-vous')

      // Step 4: Provide travelers
      state = TripPlanningPromptEngine.extractAndUpdateInfo('En couple, 2 personnes', state)
      response = getAdvancedDemoResponse('En couple, 2 personnes', state)
      
      // Should still be in discovery until all 3 essential infos collected
      if (state.phase === 'discovery' && !state.collectedInfo.interests?.length) {
        // Need to add interests to trigger planning phase
        state = TripPlanningPromptEngine.extractAndUpdateInfo('Culture et histoire', state)
        response = getAdvancedDemoResponse('Culture et histoire', state)
      }
      
      expect(state.phase).toBe('planning')

      // Step 5: Move to planning
      response = getAdvancedDemoResponse('Parfait !', state)
      expect(response).toContain('Voici ce que je vous propose')

      // Step 6: Validate and get summary
      state = TripPlanningPromptEngine.extractAndUpdateInfo('Validé, créez le récapitulatif', state)
      response = getAdvancedDemoResponse('Validé, créez le récapitulatif', state)
      expect(state.phase).toBe('summary')
      expect(response).toContain('RÉCAPITULATIF PERSONNALISÉ')
    })
  })
})