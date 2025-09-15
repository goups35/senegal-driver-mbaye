/**
 * EXEMPLE CONCRET DE CONVERSATION FLOW
 * Démonstration du parcours utilisateur complet avec le nouveau système
 */

export const EXAMPLE_CONVERSATION_FLOW = {
  title: "Conversation Flow Example - Senegal Driver MVP",
  description: "Parcours complet d'un utilisateur créant son itinéraire personnalisé",
  
  conversation: [
    {
      phase: "greeting",
      user: "",
      assistant: "🇸🇳 Bonjour ! Je suis Maxime, votre conseiller voyage spécialisé Sénégal.\n\nJe vais vous aider à créer un voyage personnalisé jour par jour, parfaitement adapté à vos envies !\n\nCommencez par me parler de votre projet : qu'est-ce qui vous attire dans l'idée de découvrir le Sénégal ? 😊",
      internal_state: {
        phase: "greeting",
        collectedInfo: {},
        questionsAsked: [],
        nextQuestionPriority: 1
      }
    },
    
    {
      phase: "greeting -> discovery",
      user: "J'aimerais découvrir la culture sénégalaise pendant une semaine",
      assistant: "Fantastique ! La culture sénégalaise est d'une richesse incroyable ! Entre la musique, l'artisanat et les traditions, vous allez être émerveillé(e).\n\nPour vous proposer les meilleures expériences culturelles, dites-moi : préférez-vous un voyage plutôt confortable avec de beaux hébergements, ou plus authentique au contact direct des locaux ?\n\nExemples : 'confort moderne', 'authentique local', 'mix des deux'",
      internal_state: {
        phase: "discovery",
        collectedInfo: {
          duration: "une semaine",
          interests: ["culture"]
        },
        questionsAsked: ["culture sénégalaise semaine"],
        nextQuestionPriority: 2
      }
    },
    
    {
      phase: "discovery",
      user: "J'aimerais un mix des deux, avec quelques expériences authentiques mais aussi un peu de confort",
      assistant: "Parfait ! Un équilibre entre authenticité et confort, c'est exactement ce que le Sénégal fait de mieux.\n\nVous voyagez seul(e), en couple, ou en groupe ? Cela m'aidera à adapter les activités et le rythme du voyage.\n\nExemples : 'seul', 'en couple', 'avec des amis', 'en famille'",
      internal_state: {
        phase: "discovery",
        collectedInfo: {
          duration: "une semaine",
          interests: ["culture"],
          travelStyle: "mixte"
        },
        questionsAsked: ["culture sénégalaise semaine", "mix confort authentique"],
        nextQuestionPriority: 3
      }
    },
    
    {
      phase: "discovery -> planning",
      user: "Nous sommes en couple",
      assistant: "Magnifique ! Un voyage culturel en couple au Sénégal, avec 7 jours pour découvrir les trésors du pays.\n\nVoici ce que je vous propose pour votre semaine :\n• Jour 1-2 : Dakar et île de Gorée (histoire, marchés, musique)\n• Jour 3-4 : Saint-Louis (patrimoine UNESCO, architecture coloniale)\n• Jour 5-6 : Lac Rose et village traditionnel (nature et rencontres)\n• Jour 7 : Retour Dakar avec temps libre\n\nQu'est-ce qui vous semble le plus excitant dans cette proposition ?",
      internal_state: {
        phase: "planning",
        collectedInfo: {
          duration: "une semaine",
          interests: ["culture"],
          travelStyle: "mixte",
          travelers: "couple"
        },
        questionsAsked: ["culture sénégalaise semaine", "mix confort authentique", "couple"],
        nextQuestionPriority: 4
      }
    },
    
    {
      phase: "planning -> refinement",
      user: "J'adore l'idée ! Mais est-ce qu'on pourrait avoir un peu plus de temps à Saint-Louis ? C'est ce qui m'attire le plus",
      assistant: "Excellente intuition ! Saint-Louis est un véritable joyau, parfait pour les amoureux de culture et d'histoire.\n\nAjustons l'itinéraire :\n• Jour 1-2 : Dakar et Gorée (essentiel)\n• Jour 3-5 : Saint-Louis prolongé (3 jours complets pour savourer)\n• Jour 6 : Lac Rose (nature et détente)\n• Jour 7 : Dakar, derniers achats\n\nAvec 3 jours à Saint-Louis, vous pourrez vraiment vous immerger dans l'atmosphère unique de cette ville historique. Cela vous convient-il mieux ?",
      internal_state: {
        phase: "refinement",
        collectedInfo: {
          duration: "une semaine",
          interests: ["culture"],
          travelStyle: "mixte",
          travelers: "couple",
          specificDestinations: ["Dakar", "Gorée", "Saint-Louis", "Lac Rose"],
          preferences: ["plus de temps Saint-Louis"]
        },
        questionsAsked: ["culture sénégalaise semaine", "mix confort authentique", "couple", "plus temps Saint-Louis"],
        nextQuestionPriority: 5
      }
    },
    
    {
      phase: "refinement -> summary",
      user: "Parfait, je valide cet itinéraire !",
      assistant: "🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours\n\nJour 1: Dakar - Arrivée, quartier Plateau, marché Kermel\nJour 2: Île de Gorée - Histoire, Maison des Esclaves, artisans locaux\nJour 3: Saint-Louis - Arrivée, centre historique UNESCO\nJour 4: Saint-Louis - Langue de Barbarie, pêcheurs Guet-Ndar\nJour 5: Saint-Louis - Marché, architecture coloniale, musique traditionnelle\nJour 6: Lac Rose - Paysages roses, villages traditionnels, rencontres locales\nJour 7: Dakar - Temps libre, achats souvenirs, départ\n\n💡 Points forts de votre voyage:\n- Immersion culture sénégalaise authentique\n- 3 jours complets à Saint-Louis (votre coup de cœur)\n- Équilibre parfait confort/authenticité\n- Expériences uniques en couple\n\n📱 Prochaines étapes:\nContactez-nous pour organiser votre voyage personnalisé !\n\n---\nItinéraire créé par Maxime, votre conseiller Sénégal\n\nRÉCAPITULATIF PERSONNALISÉ",
      internal_state: {
        phase: "summary",
        collectedInfo: {
          duration: "une semaine",
          interests: ["culture"],
          travelStyle: "mixte",
          travelers: "couple",
          specificDestinations: ["Dakar", "Gorée", "Saint-Louis", "Lac Rose"],
          preferences: ["plus de temps Saint-Louis"]
        },
        questionsAsked: ["culture sénégalaise semaine", "mix confort authentique", "couple", "plus temps Saint-Louis", "validation"],
        isComplete: true
      }
    }
  ],
  
  /**
   * ANALYSE DU PARCOURS
   */
  analysis: {
    total_exchanges: 6,
    time_to_completion: "3-5 minutes",
    user_engagement_points: [
      "Boutons de démarrage rapide",
      "Questions ouvertes mais guidées",
      "Proposition concrète d'itinéraire",
      "Personnalisation basée sur les préférences",
      "Validation interactive"
    ],
    
    information_collected: {
      duration: "une semaine",
      interests: ["culture"],
      travelStyle: "mixte (confort + authentique)",
      travelers: "couple",
      specificDestinations: ["Dakar", "Gorée", "Saint-Louis", "Lac Rose"],
      preferences: ["plus de temps à Saint-Louis"]
    },
    
    conversation_flow_success_factors: [
      "Une seule question par échange",
      "Réponses courtes et actionables",
      "Exemples concrets pour guider",
      "Personnalisation progressive",
      "Validation des préférences"
    ]
  },
  
  /**
   * WHATSAPP MESSAGE FINAL
   */
  final_whatsapp_message: `🇸🇳 MON VOYAGE AU SÉNÉGAL - Programme personnalisé

🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - 7 jours

Jour 1: Dakar - Arrivée, quartier Plateau, marché Kermel
Jour 2: Île de Gorée - Histoire, Maison des Esclaves, artisans locaux
Jour 3: Saint-Louis - Arrivée, centre historique UNESCO
Jour 4: Saint-Louis - Langue de Barbarie, pêcheurs Guet-Ndar
Jour 5: Saint-Louis - Marché, architecture coloniale, musique traditionnelle
Jour 6: Lac Rose - Paysages roses, villages traditionnels, rencontres locales
Jour 7: Dakar - Temps libre, achats souvenirs, départ

💡 Points forts de votre voyage:
- Immersion culture sénégalaise authentique
- 3 jours complets à Saint-Louis (votre coup de cœur)
- Équilibre parfait confort/authenticité
- Expériences uniques en couple

📱 Prochaines étapes:
Contactez-nous pour organiser votre voyage personnalisé !

---
Généré via Transport Sénégal - Votre conseiller voyage`
};

/**
 * AUTRES EXEMPLES DE PARCOURS
 */
export const ALTERNATIVE_CONVERSATION_FLOWS = [
  {
    scenario: "Famille avec enfants - 10 jours nature et plages",
    key_differences: [
      "Questions sur l'âge des enfants",
      "Adaptation des activités familiales",
      "Focus sécurité et praticité",
      "Rythme plus lent"
    ]
  },
  
  {
    scenario: "Voyageur solo aventurier - 2 semaines découverte complète",
    key_differences: [
      "Questions sur le niveau d'aventure souhaité",
      "Propositions d'activités individuelles",
      "Options de rencontres locales",
      "Itinéraire plus ambitieux"
    ]
  },
  
  {
    scenario: "Groupe d'amis - 5 jours fête et culture",
    key_differences: [
      "Questions sur la taille du groupe",
      "Focus sur les activités de groupe",
      "Propositions de soirées et animations",
      "Logistique adaptée aux groupes"
    ]
  }
];

/**
 * MÉTRICS DE PERFORMANCE ATTENDUES
 */
export const EXPECTED_PERFORMANCE_METRICS = {
  conversation_completion_rate: "85%",
  average_exchanges_to_completion: "4-6",
  user_satisfaction_with_final_itinerary: "90%+",
  whatsapp_conversion_rate: "70%",
  time_to_complete_conversation: "3-7 minutes",
  
  quality_indicators: [
    "Itinéraire logistiquement cohérent",
    "Activités adaptées au profil utilisateur",
    "Rythme de voyage réaliste",
    "Équilibre des types d'expériences",
    "Message WhatsApp actionnable"
  ]
};