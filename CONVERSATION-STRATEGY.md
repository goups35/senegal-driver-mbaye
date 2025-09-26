# 🇸🇳 Stratégie de Conversation Flow - Senegal Driver MVP

## 📋 Vue d'ensemble

Cette stratégie transforme votre système de chat Gemini 2.0 Flash actuel en un parcours conversationnel structuré qui guide naturellement les prospects vers la création d'un itinéraire jour par jour personnalisé, prêt à être envoyé via WhatsApp.

## 🎯 Objectifs Stratégiques

### Objectif Principal
Transformer chaque conversation en un itinéraire personnalisé formaté pour WhatsApp, en 4-6 échanges maximum.

### Objectifs Secondaires
- Augmenter l'engagement utilisateur avec un parcours guidé
- Collecter les informations essentielles de manière naturelle
- Créer une expérience premium avec Maxime, le conseiller expert
- Générer des leads qualifiés via WhatsApp

## 🔄 Flux de Conversation en 5 Phases

### Phase 1: Accueil Chaleureux (30 secondes)
**Objectif**: Créer une connexion et identifier le profil de base

**Stratégie Maxime**:
- Accueil enthousiaste avec son expertise
- Une question ouverte sur la motivation
- Création d'envie avec destinations emblématiques

**Question Clé**: "Qu'est-ce qui vous attire dans l'idée de découvrir le Sénégal ?"

### Phase 2: Découverte des Préférences (2-3 échanges)
**Objectif**: Collecter les informations essentielles

**Informations à Collecter**:
1. **Durée du séjour** (priorité 1)
2. **Type d'expériences** recherchées (culture/nature/plages/aventure)
3. **Style de voyage** (confort/authentique/mixte)
4. **Nombre de voyageurs** et profil

**Technique**: Une question par message avec 2-3 exemples concrets

### Phase 3: Co-création de l'Itinéraire (2-4 échanges)
**Objectif**: Construire ensemble l'itinéraire jour par jour

**Méthode**:
- Proposer une structure basée sur les préférences
- Expliquer le POURQUOI de chaque destination
- Demander validation et ajustements
- Optimiser la logistique (distances, temps)

### Phase 4: Affinement et Validation (1-2 échanges)
**Objectif**: Finaliser et confirmer

**Actions**:
- Présenter l'itinéraire complet
- Derniers ajustements
- Validation logistique
- Préparation du résumé final

### Phase 5: Récapitulatif WhatsApp
**Objectif**: Message final prêt à envoyer

**Format Obligatoire**:
```
🇸🇳 VOTRE VOYAGE AU SÉNÉGAL - [Durée] jours

Jour 1: [Ville] - [Activités principales]
Jour 2: [Ville] - [Activités principales]
[etc.]

💡 Points forts de votre voyage:
- [3-4 highlights personnalisés]

📱 Prochaines étapes:
Contactez-nous pour organiser votre voyage personnalisé !

---
Itinéraire créé par Maxime, votre conseiller Sénégal
```

## 🧠 Architecture Technique

### 1. TripPlanningPromptEngine
**Responsabilités**:
- Construction des prompts contextuels
- Gestion des phases de conversation
- Instructions spécifiques par phase
- Tracking du progrès

**Méthodes Clés**:
- `buildMasterPrompt()`: Prompt principal avec contexte
- `determineNextPhase()`: Logic de transition
- `extractAndUpdateInfo()`: Extraction d'informations
- `getNextStrategicQuestion()`: Questions personnalisées

### 2. ConversationStateManager
**Responsabilités**:
- Gestion d'état par session utilisateur
- Persistence des informations collectées
- Tracking des questions posées
- Détermination de la complétude

### 3. WhatsAppMessageFormatter
**Responsabilités**:
- Formatage final de l'itinéraire
- Génération des highlights personnalisés
- Structure optimisée pour WhatsApp
- Message actionnable

## 📊 État de Conversation

```typescript
interface ConversationState {
  phase: 'greeting' | 'discovery' | 'planning' | 'refinement' | 'summary'
  collectedInfo: {
    duration?: string
    travelers?: string
    interests?: string[]
    budget?: string
    accommodation?: string
    mobility?: string
    previousExperience?: string
    specificDestinations?: string[]
    travelStyle?: string
  }
  questionsAsked: string[]
  isComplete: boolean
  nextQuestionPriority: number
}
```

## 🎨 Personnalité de Maxime

### Identité
- **Nom**: Maxime, conseiller voyage spécialisé Sénégal
- **Expérience**: 20 ans d'expertise
- **Personnalité**: Chaleureux, professionnel, enthousiaste
- **Mission**: Créer des voyages personnalisés jour par jour

### Style de Communication
- Conversationnel et naturel (pas robotique)
- Une question stratégique par réponse
- Optimiste sur les possibilités du Sénégal
- Émojis avec parcimonie mais efficacité
- Expressions françaises authentiques

## 🔧 Intégration avec Gemini 2.0 Flash

### Prompt Structure
```
[CONTEXTE SYSTÈME - Identité Maxime]
[INSTRUCTIONS PHASE - Objectifs spécifiques]
[TRACKING PROGRÈS - Informations collectées]
[MESSAGE UTILISATEUR]
[FORMAT RÉPONSE - Structure attendue]
```

### Optimisations Gemini
- Temperature: 0.7 (créativité contrôlée)
- Max tokens: 1000 (réponses concises)
- Top P: 0.8 (cohérence)
- Instructions anti-hallucination

## 📱 Interface Utilisateur Améliorée

### Indicateurs Visuels
- **Phase Badge**: Affichage de la phase actuelle
- **Barre de Progrès**: 1/5 à 5/5
- **Boutons Contextuels**: Adaptés à chaque phase

### Boutons Intelligents
- **Phase Greeting**: Types de voyage (Culture, Plages, Complet)
- **Phase Planning**: Ajustements et validations
- **Phase Summary**: Bouton WhatsApp prominant

## 📈 Métriques de Performance

### Objectifs KPI
- **Taux de completion**: 85%+
- **Échanges moyens**: 4-6
- **Temps moyen**: 3-7 minutes
- **Satisfaction finale**: 90%+
- **Conversion WhatsApp**: 70%+

### Indicateurs Qualité
- Itinéraire logistiquement cohérent
- Activités adaptées au profil
- Rythme de voyage réaliste
- Message WhatsApp actionnable

## 🔄 Exemples de Parcours

### Parcours Type: Couple Culture (7 jours)
1. **Greeting**: "Culture sénégalaise une semaine"
2. **Discovery**: Style mixte + couple
3. **Planning**: Proposition Dakar-Saint-Louis-Lac Rose
4. **Refinement**: Plus de temps à Saint-Louis
5. **Summary**: Itinéraire final 7 jours

### Autres Scénarios
- Famille avec enfants (nature + plages)
- Solo aventurier (2 semaines complètes)
- Groupe d'amis (fête + culture)

## 🚀 Déploiement et Tests

### Phase de Test
1. **Tests Unitaires**: Logique de transitions
2. **Tests d'Intégration**: API Gemini + État
3. **Tests Utilisateur**: Parcours complets
4. **A/B Testing**: Variations de prompts

### Monitoring
- Logs de conversation par phase
- Analytics des abandons
- Feedback utilisateur
- Performance Gemini

## 🔧 Configuration

### Variables d'Environnement
```env
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=+221775762203
```

### Activation
Le système est déjà intégré dans:
- `/src/app/api/chat/route.ts` (API mise à jour)
- `/src/components/chat/travel-chat.tsx` (UI améliorée)
- `/src/lib/conversation-flow.ts` (Engine principal)

## 📞 Prochaines Étapes

1. **Tester** le nouveau flow avec quelques utilisateurs
2. **Ajuster** les prompts selon les retours
3. **Optimiser** les transitions de phase
4. **Mesurer** les performances vs ancien système
5. **Itérer** sur les points d'amélioration

---

Cette stratégie transforme votre chat en un véritable conseiller voyage qui guide naturellement vers un itinéraire personnalisé, maximisant l'engagement et la conversion WhatsApp. 🇸🇳✈️