/**
 * Comprehensive tests for conversation flow engine
 * Testing all 5 phases and question precision
 */

import {
  ConversationState,
  TripPlanningPromptEngine,
  ConversationStateManager,
  WhatsAppMessageFormatter
} from '../conversation-flow'

describe('TripPlanningPromptEngine', () => {
  describe('buildMasterPrompt', () => {
    it('should generate proper greeting phase prompt', () => {
      const state: ConversationState = {
        phase: 'greeting',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const prompt = TripPlanningPromptEngine.buildMasterPrompt('Bonjour, je veux visiter le Sénégal', state)
      
      expect(prompt).toContain('TU ES MAXIME')
      expect(prompt).toContain('PHASE 1 - ACCUEIL CHALEUREUX')
      expect(prompt).toContain('Qu\'est-ce qui vous attire dans l\'idée de découvrir le Sénégal')
    })

    it('should generate proper discovery phase prompt', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: ['initial greeting'],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const prompt = TripPlanningPromptEngine.buildMasterPrompt('Je veux découvrir la culture', state)
      
      expect(prompt).toContain('PHASE 2 - QUESTIONS PRÉCISES ET STRUCTURÉES')
      expect(prompt).toContain('Combien de jours comptez-vous rester')
    })

    it('should track progress correctly', () => {
      const state: ConversationState = {
        phase: 'planning',
        collectedInfo: {
          duration: '7 jours',
          interests: ['culture', 'plages']
        },
        questionsAsked: ['greeting', 'duration question'],
        isComplete: false,
        nextQuestionPriority: 2
      }

      const prompt = TripPlanningPromptEngine.buildMasterPrompt('Oui parfait', state)
      
      expect(prompt).toContain('duration: 7 jours')
      expect(prompt).toContain('interests: culture,plages')
      expect(prompt).toContain('PROGRESSION: Phase planning - 60%')
    })
  })

  describe('determineNextPhase', () => {
    it('should progress from greeting to discovery on user input', () => {
      const state: ConversationState = {
        phase: 'greeting',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const nextPhase = TripPlanningPromptEngine.determineNextPhase(state, 'Je veux découvrir la culture sénégalaise')
      expect(nextPhase).toBe('discovery')
    })

    it('should progress from discovery to planning with 3 essential infos', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {
          duration: '7 jours',
          travelers: '2 personnes',
          interests: ['culture']
        },
        questionsAsked: ['greeting'],
        isComplete: false,
        nextQuestionPriority: 2
      }

      const nextPhase = TripPlanningPromptEngine.determineNextPhase(state, 'Culture et traditions')
      expect(nextPhase).toBe('planning')
    })

    it('should progress from planning to refinement on agreement', () => {
      const state: ConversationState = {
        phase: 'planning',
        collectedInfo: {
          duration: '7 jours',
          travelers: '2 personnes', 
          interests: ['culture']
        },
        questionsAsked: ['greeting', 'duration', 'travelers'],
        isComplete: false,
        nextQuestionPriority: 3
      }

      const nextPhase = TripPlanningPromptEngine.determineNextPhase(state, 'Parfait, cet itinéraire me convient')
      expect(nextPhase).toBe('refinement')
    })

    it('should progress from refinement to summary on validation', () => {
      const state: ConversationState = {
        phase: 'refinement',
        collectedInfo: {
          duration: '7 jours',
          travelers: '2 personnes',
          interests: ['culture', 'plages']
        },
        questionsAsked: ['greeting', 'duration', 'travelers', 'interests'],
        isComplete: false,
        nextQuestionPriority: 4
      }

      const nextPhase = TripPlanningPromptEngine.determineNextPhase(state, 'Validé ! Créez le récapitulatif final')
      expect(nextPhase).toBe('summary')
    })
  })

  describe('extractAndUpdateInfo', () => {
    it('should extract duration correctly', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const updatedState = TripPlanningPromptEngine.extractAndUpdateInfo('Je veux rester 10 jours', state)
      expect(updatedState.collectedInfo.duration).toBe('10 jours')
    })

    it('should extract interests correctly', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const updatedState = TripPlanningPromptEngine.extractAndUpdateInfo('J\'aime la culture et les plages', state)
      expect(updatedState.collectedInfo.interests).toEqual(['culture', 'plages'])
    })

    it('should extract specific destinations', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const updatedState = TripPlanningPromptEngine.extractAndUpdateInfo('Je veux visiter Dakar et Saint-Louis', state)
      expect(updatedState.collectedInfo.specificDestinations).toEqual(['Dakar', 'Saint-Louis'])
    })

    it('should extract number of travelers', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const updatedState = TripPlanningPromptEngine.extractAndUpdateInfo('Nous sommes 4 personnes', state)
      expect(updatedState.collectedInfo.travelers).toBe('4 personnes')
    })
  })

  describe('getNextStrategicQuestion', () => {
    it('should ask duration first if missing', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: {},
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 1
      }

      const question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Combien de jours comptez-vous rester')
    })

    it('should ask travelers second if missing', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: { duration: '7 jours' },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 2
      }

      const question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Combien êtes-vous à voyager')
    })

    it('should ask interests third if missing', () => {
      const state: ConversationState = {
        phase: 'discovery',
        collectedInfo: { 
          duration: '7 jours',
          travelers: '2 personnes'
        },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 3
      }

      const question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Qu\'est-ce qui vous attire le plus')
    })

    it('should indicate readiness for planning when all essential info collected', () => {
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

      const question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Parfait ! J\'ai maintenant assez d\'informations')
    })
  })
})

describe('ConversationStateManager', () => {
  beforeEach(() => {
    // Clear the states map for each test
    ConversationStateManager['states'].clear()
  })

  it('should initialize state correctly', () => {
    const state = ConversationStateManager.initializeState('test-session')
    
    expect(state.phase).toBe('greeting')
    expect(state.collectedInfo).toEqual({})
    expect(state.questionsAsked).toEqual([])
    expect(state.isComplete).toBe(false)
    expect(state.nextQuestionPriority).toBe(1)
  })

  it('should retrieve existing state', () => {
    const initialState = ConversationStateManager.initializeState('test-session')
    const retrievedState = ConversationStateManager.getState('test-session')
    
    expect(retrievedState).toEqual(initialState)
  })

  it('should update state correctly', () => {
    ConversationStateManager.initializeState('test-session')
    
    const updatedState: ConversationState = {
      phase: 'discovery',
      collectedInfo: { duration: '7 jours' },
      questionsAsked: ['greeting'],
      isComplete: false,
      nextQuestionPriority: 2
    }
    
    ConversationStateManager.updateState('test-session', updatedState)
    const retrievedState = ConversationStateManager.getState('test-session')
    
    expect(retrievedState).toEqual(updatedState)
  })

  it('should correctly identify readiness for summary', () => {
    const readyState: ConversationState = {
      phase: 'refinement',
      collectedInfo: {
        duration: '7 jours',
        interests: ['culture', 'plages'],
        specificDestinations: ['Dakar', 'Saint-Louis']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 4
    }

    const notReadyState: ConversationState = {
      phase: 'discovery',
      collectedInfo: {
        duration: '7 jours'
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 2
    }

    expect(ConversationStateManager.isReadyForSummary(readyState)).toBe(true)
    expect(ConversationStateManager.isReadyForSummary(notReadyState)).toBe(false)
  })
})

describe('WhatsAppMessageFormatter', () => {
  it('should format final itinerary correctly', () => {
    const state: ConversationState = {
      phase: 'summary',
      collectedInfo: {
        duration: '7 jours',
        interests: ['culture', 'plages'],
        specificDestinations: ['Dakar', 'Saint-Louis']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 5
    }

    const formatted = WhatsAppMessageFormatter.formatFinalItinerary(state)
    
    expect(formatted).toContain('🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours')
    expect(formatted).toContain('Jour 1:')
    expect(formatted).toContain('💡 Points forts de votre voyage:')
    expect(formatted).toContain('📱 Prochaines étapes:')
    expect(formatted).toContain('Itinéraire créé par Maxime')
    expect(formatted).toContain('RÉCAPITULATIF PERSONNALISÉ')
  })

  it('should include culture highlights when interests include culture', () => {
    const state: ConversationState = {
      phase: 'summary',
      collectedInfo: {
        duration: '7 jours',
        interests: ['culture']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 5
    }

    const formatted = WhatsAppMessageFormatter.formatFinalItinerary(state)
    expect(formatted).toContain('Immersion dans la culture sénégalaise')
  })

  it('should include beach highlights when interests include plages', () => {
    const state: ConversationState = {
      phase: 'summary',
      collectedInfo: {
        duration: '7 jours',
        interests: ['plages']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 5
    }

    const formatted = WhatsAppMessageFormatter.formatFinalItinerary(state)
    expect(formatted).toContain('Détente sur les plus belles plages')
  })

  it('should include nature highlights when interests include nature', () => {
    const state: ConversationState = {
      phase: 'summary',
      collectedInfo: {
        duration: '7 jours',
        interests: ['nature']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 5
    }

    const formatted = WhatsAppMessageFormatter.formatFinalItinerary(state)
    expect(formatted).toContain('Découverte des paysages naturels')
  })

  it('should handle missing duration gracefully', () => {
    const state: ConversationState = {
      phase: 'summary',
      collectedInfo: {
        interests: ['culture']
      },
      questionsAsked: [],
      isComplete: false,
      nextQuestionPriority: 5
    }

    const formatted = WhatsAppMessageFormatter.formatFinalItinerary(state)
    expect(formatted).toContain('VOTRE VOYAGE AU SÉNÉGAL - plusieurs jours')
  })
})