/**
 * Simplified End-to-End Conversation Flow Test
 * Testing core functionality without complex string escaping
 */

import { 
  ConversationState, 
  TripPlanningPromptEngine, 
  ConversationStateManager,
  WhatsAppMessageFormatter 
} from '../lib/conversation-flow'

describe('End-to-End Conversation Flow Tests', () => {
  beforeEach(() => {
    ConversationStateManager['states'].clear()
  })

  describe('Complete 7-day Culture Trip Scenario', () => {
    it('should complete conversation flow correctly', () => {
      const sessionId = 'test-culture-trip'
      let state = ConversationStateManager.initializeState(sessionId)

      console.log('=== STARTING CULTURE TRIP SCENARIO ===')

      // Step 1: Initial message
      const message1 = 'Bonjour, je souhaite découvrir le Sénégal'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message1, state)
      
      console.log('Step 1 - Phase:', state.phase)
      expect(state.phase).toBe('discovery')

      // Step 2: Duration provided
      const message2 = 'Nous voulons rester 7 jours'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message2, state)
      
      console.log('Step 2 - Duration extracted:', state.collectedInfo.duration)
      expect(state.collectedInfo.duration).toBe('7 jours')

      // Step 3: Travelers provided
      const message3 = 'Nous sommes 2 personnes, en couple'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message3, state)
      
      console.log('Step 3 - Travelers extracted:', state.collectedInfo.travelers)
      expect(state.collectedInfo.travelers).toBe('2 personnes')

      // Step 4: Interests provided
      const message4 = 'Nous aimons la culture et l histoire'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message4, state)
      
      console.log('Step 4 - Phase after interests:', state.phase)
      console.log('Step 4 - Interests extracted:', state.collectedInfo.interests)
      expect(state.collectedInfo.interests).toContain('culture')
      expect(state.phase).toBe('planning')

      // Step 5: Validate itinerary
      const message5 = 'Parfait, cet itinéraire me convient parfaitement'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message5, state)
      
      console.log('Step 5 - Phase after validation:', state.phase)
      expect(state.phase).toBe('refinement')

      // Step 6: Request final summary
      const message6 = 'Validé ! Créez maintenant le récapitulatif WhatsApp'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message6, state)
      
      console.log('Step 6 - Final phase:', state.phase)
      expect(state.phase).toBe('summary')

      // Generate WhatsApp summary
      const whatsappSummary = WhatsAppMessageFormatter.formatFinalItinerary(state)
      console.log('WhatsApp Summary Generated (first 200 chars):', whatsappSummary.substring(0, 200) + '...')
      
      expect(whatsappSummary).toContain('🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours')
      expect(whatsappSummary).toContain('Jour 1:')
      expect(whatsappSummary).toContain('RÉCAPITULATIF PERSONNALISÉ')

      console.log('=== CULTURE TRIP SCENARIO COMPLETED SUCCESSFULLY ===')
    })
  })

  describe('Comprehensive Message Scenario', () => {
    it('should extract all info from single comprehensive message', () => {
      const sessionId = 'test-comprehensive'
      let state = ConversationStateManager.initializeState(sessionId)

      console.log('=== STARTING COMPREHENSIVE MESSAGE SCENARIO ===')

      // Single comprehensive message with all info
      const comprehensiveMessage = 'Salut ! Nous sommes 4 amis et nous rêvons de 10 jours de plages paradisiaques et de nature authentique au Sénégal'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(comprehensiveMessage, state)
      
      console.log('Extracted duration:', state.collectedInfo.duration)
      console.log('Extracted travelers:', state.collectedInfo.travelers)
      console.log('Extracted interests:', state.collectedInfo.interests)
      console.log('Phase after comprehensive message:', state.phase)

      expect(state.collectedInfo.duration).toBe('10 jours')
      expect(state.collectedInfo.travelers).toBe('4 personnes')
      expect(state.collectedInfo.interests).toEqual(expect.arrayContaining(['plages', 'nature']))
      expect(state.phase).toBe('planning')

      console.log('=== COMPREHENSIVE MESSAGE SCENARIO COMPLETED SUCCESSFULLY ===')
    })
  })

  describe('Question Priority Validation', () => {
    it('should ask questions in correct order', () => {
      const sessionId = 'test-question-order'
      const state = ConversationStateManager.initializeState(sessionId)
      state.phase = 'discovery'

      // Question 1: Duration should be first priority
      let question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Combien de jours')
      console.log('Question 1 (Duration):', question)

      // Add duration
      state.collectedInfo.duration = '7 jours'

      // Question 2: Travelers should be second priority 
      question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Combien êtes-vous')
      console.log('Question 2 (Travelers):', question)

      // Add travelers
      state.collectedInfo.travelers = '2 personnes'

      // Question 3: Interests should be third priority
      question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Qu')
      expect(question).toContain('attire')
      console.log('Question 3 (Interests):', question)

      // Add interests
      state.collectedInfo.interests = ['culture']

      // Should indicate readiness for planning
      question = TripPlanningPromptEngine.getNextStrategicQuestion(state)
      expect(question).toContain('Parfait')
      expect(question).toContain('informations')
      console.log('Ready for planning:', question)

      console.log('Question sequence validated successfully')
    })
  })

  describe('WhatsApp Format Validation', () => {
    it('should generate properly formatted WhatsApp message', () => {
      const testState: ConversationState = {
        phase: 'summary',
        collectedInfo: {
          duration: '7 jours',
          travelers: '2 personnes',
          interests: ['culture', 'plages', 'nature'],
          specificDestinations: ['Dakar', 'Saint-Louis', 'Lac Rose']
        },
        questionsAsked: [],
        isComplete: false,
        nextQuestionPriority: 5
      }

      const whatsappMessage = WhatsAppMessageFormatter.formatFinalItinerary(testState)
      
      console.log('Generated WhatsApp Message (first 300 chars):')
      console.log(whatsappMessage.substring(0, 300) + '...')
      
      // Validate format requirements
      expect(whatsappMessage).toMatch(/🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours/)
      expect(whatsappMessage).toMatch(/Jour \d+:.*/)
      expect(whatsappMessage).toContain('💡 Points forts de votre voyage:')
      expect(whatsappMessage).toContain('📱 Prochaines étapes:')
      expect(whatsappMessage).toContain('Contactez-nous pour organiser')
      expect(whatsappMessage).toContain('Itinéraire créé par Maxime')
      expect(whatsappMessage).toContain('RÉCAPITULATIF PERSONNALISÉ')

      // Check for day-by-day structure
      const dayMatches = whatsappMessage.match(/Jour \d+:/g)
      expect(dayMatches).toBeTruthy()
      expect(dayMatches!.length).toBeGreaterThanOrEqual(3)

      // Check for interest-based highlights
      expect(whatsappMessage).toContain('culture sénégalaise')
      expect(whatsappMessage).toContain('plus belles plages')
      expect(whatsappMessage).toContain('paysages naturels')

      console.log('WhatsApp format validation passed - all requirements met')
    })
  })

  describe('Edge Cases', () => {
    it('should handle information updates gracefully', () => {
      const sessionId = 'test-updates'
      let state = ConversationStateManager.initializeState(sessionId)

      console.log('=== TESTING INFORMATION UPDATES ===')

      // Initial info
      const message1 = 'Je veux 7 jours de culture'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message1, state)
      
      expect(state.collectedInfo.duration).toBe('7 jours')
      expect(state.collectedInfo.interests).toContain('culture')
      console.log('Initial info:', state.collectedInfo)

      // Update duration
      const message2 = 'En fait, plutôt 10 jours ce serait mieux'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message2, state)
      
      expect(state.collectedInfo.duration).toBe('10 jours')
      console.log('Updated duration:', state.collectedInfo.duration)

      // Add more interests
      const message3 = 'Aussi les plages et la nature'
      state = TripPlanningPromptEngine.extractAndUpdateInfo(message3, state)
      
      expect(state.collectedInfo.interests).toEqual(expect.arrayContaining(['culture', 'plages', 'nature']))
      console.log('Final interests:', state.collectedInfo.interests)

      console.log('=== INFORMATION UPDATES HANDLED SUCCESSFULLY ===')
    })

    it('should handle multiple concurrent sessions', () => {
      const sessions = ['session1', 'session2', 'session3']
      
      sessions.forEach((sessionId, index) => {
        let state = ConversationStateManager.initializeState(sessionId)
        
        // Each session has different duration
        const message = `${7 + index} jours de culture pour ${2 + index} personnes`
        state = TripPlanningPromptEngine.extractAndUpdateInfo(message, state)
        ConversationStateManager.updateState(sessionId, state)
        
        // Verify each session maintains its own state
        const retrievedState = ConversationStateManager.getState(sessionId)
        expect(retrievedState.collectedInfo.duration).toBe(`${7 + index} jours`)
        expect(retrievedState.collectedInfo.travelers).toBe(`${2 + index} personnes`)
      })

      console.log('Multi-session state management validated successfully')
    })
  })

  describe('Performance Tests', () => {
    it('should handle rapid message processing', () => {
      const sessionId = 'test-performance'
      let state = ConversationStateManager.initializeState(sessionId)

      const messages = [
        'Bonjour',
        '7 jours',
        '2 personnes',
        'culture',
        'parfait',
        'validé récapitulatif'
      ]

      messages.forEach((message, index) => {
        const startTime = Date.now()
        state = TripPlanningPromptEngine.extractAndUpdateInfo(message, state)
        const processingTime = Date.now() - startTime
        
        console.log(`Message ${index + 1} processed in ${processingTime}ms`)
        expect(processingTime).toBeLessThan(50) // Should be very fast
      })

      expect(state.phase).toBe('summary')
      console.log('Rapid processing test completed successfully')
    })
  })
})