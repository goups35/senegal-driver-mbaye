// Système de fournisseurs IA GRATUITS avec fallback automatique
// Priorise les options les plus fiables et GRATUITES pour les requêtes géographiques

import { z } from 'zod'

// Types pour la réponse IA
export interface AIResponse {
  text: string
  provider: string
  isDemo: boolean
  error?: string
}

// Configuration des fournisseurs par ordre de priorité
export const AI_PROVIDERS = {
  HUGGINGFACE: 'huggingface',
  GEMINI: 'gemini', 
  OLLAMA: 'ollama',
  COHERE: 'cohere',
  DEMO: 'demo'
} as const

export type AIProviderType = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS]

// Détection automatique du meilleur fournisseur disponible
export function detectAvailableProvider(): AIProviderType {
  // Hugging Face - Premier choix (gratuit, 1000 req/mois)
  if (process.env.HUGGINGFACE_API_KEY && 
      process.env.HUGGINGFACE_API_KEY !== 'placeholder-key' && 
      process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here') {
    return AI_PROVIDERS.HUGGINGFACE
  }

  // Gemini - Deuxième choix (gratuit, 1500 req/jour)
  if (process.env.GEMINI_API_KEY && 
      process.env.GEMINI_API_KEY !== 'placeholder-key' && 
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return AI_PROVIDERS.GEMINI
  }

  // Ollama - Troisième choix (illimité mais nécessite serveur)
  if (process.env.OLLAMA_URL && 
      process.env.OLLAMA_URL !== 'http://localhost:11434') {
    return AI_PROVIDERS.OLLAMA
  }

  // Cohere - Quatrième choix (gratuit, 1000 req/mois)
  if (process.env.COHERE_API_KEY && 
      process.env.COHERE_API_KEY !== 'placeholder-key' && 
      process.env.COHERE_API_KEY !== 'your_cohere_api_key_here') {
    return AI_PROVIDERS.COHERE
  }

  // Mode démo par défaut
  return AI_PROVIDERS.DEMO
}

// Fonction principale pour générer une réponse IA
export async function generateAIResponse(prompt: string, preferredProvider?: AIProviderType): Promise<AIResponse> {
  const provider = preferredProvider || detectAvailableProvider()
  
  try {
    switch (provider) {
      case AI_PROVIDERS.HUGGINGFACE:
        return await generateHuggingFaceResponse(prompt)
      
      case AI_PROVIDERS.GEMINI:
        return await generateGeminiResponse(prompt)
      
      case AI_PROVIDERS.OLLAMA:
        return await generateOllamaResponse(prompt)
      
      case AI_PROVIDERS.COHERE:
        return await generateCohereResponse(prompt)
      
      default:
        return {
          text: getDemoResponse(prompt),
          provider: AI_PROVIDERS.DEMO,
          isDemo: true
        }
    }
  } catch (error) {
    console.error(`Erreur avec ${provider}:`, error)
    
    // Fallback automatique vers le prochain fournisseur disponible
    const availableProviders = getAvailableProviders().filter(p => p !== provider)
    
    if (availableProviders.length > 0) {
      console.log(`Fallback vers ${availableProviders[0]}`)
      return await generateAIResponse(prompt, availableProviders[0])
    }
    
    // Fallback final vers le mode démo
    return {
      text: getDemoResponse(prompt),
      provider: AI_PROVIDERS.DEMO,
      isDemo: true,
      error: `Tous les fournisseurs IA sont indisponibles`
    }
  }
}

// Hugging Face Implementation
async function generateHuggingFaceResponse(prompt: string): Promise<AIResponse> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct",
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Hugging Face API Error: ${response.status}`)
  }

  const data = await response.json()
  const result = Array.isArray(data) ? data[0] : data
  
  if (result.error) {
    throw new Error(result.error)
  }

  return {
    text: result.generated_text || 'Réponse non générée',
    provider: AI_PROVIDERS.HUGGINGFACE,
    isDemo: false
  }
}

// Gemini Implementation  
async function generateGeminiResponse(prompt: string): Promise<AIResponse> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  return {
    text: text || 'Réponse non générée',
    provider: AI_PROVIDERS.GEMINI,
    isDemo: false
  }
}

// Ollama Implementation
async function generateOllamaResponse(prompt: string): Promise<AIResponse> {
  const ollamaUrl = process.env.OLLAMA_URL!
  
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API Error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error)
  }

  return {
    text: data.response || 'Réponse non générée',
    provider: AI_PROVIDERS.OLLAMA,
    isDemo: false
  }
}

// Cohere Implementation
async function generateCohereResponse(prompt: string): Promise<AIResponse> {
  const { CohereClient } = await import('cohere-ai')
  
  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY!,
  })

  const response = await cohere.chat({
    message: prompt,
    model: 'command',
    temperature: 0.7,
    max_tokens: 1000
  })

  return {
    text: response.text || 'Réponse non générée',
    provider: AI_PROVIDERS.COHERE,
    isDemo: false
  }
}

// Obtenir la liste des fournisseurs disponibles
export function getAvailableProviders(): AIProviderType[] {
  const providers: AIProviderType[] = []
  
  if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'placeholder-key') {
    providers.push(AI_PROVIDERS.HUGGINGFACE)
  }
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder-key') {
    providers.push(AI_PROVIDERS.GEMINI)
  }
  
  if (process.env.OLLAMA_URL && process.env.OLLAMA_URL !== 'http://localhost:11434') {
    providers.push(AI_PROVIDERS.OLLAMA)
  }
  
  if (process.env.COHERE_API_KEY && process.env.COHERE_API_KEY !== 'placeholder-key') {
    providers.push(AI_PROVIDERS.COHERE)
  }
  
  // Toujours inclure le mode démo comme fallback
  providers.push(AI_PROVIDERS.DEMO)
  
  return providers
}

// Mode démo simplifié pour les requêtes géographiques
function getDemoResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('dakar')) {
    return `🏙️ Dakar est la capitale du Sénégal, point d'arrivée principal. 

**Villes proches de Dakar :**
- Île de Gorée (20 min en bateau)
- Lac Rose (1h de route)
- Thiès (1h de route)
- Saly (1h30 de route)

Combien de temps restez-vous au Sénégal ? Cela m'aidera à vous suggérer d'autres villes à visiter ! 🗺️`
  }
  
  if (lowerPrompt.includes('saint-louis') || lowerPrompt.includes('saint louis')) {
    return `🏛️ Saint-Louis est une ville historique classée UNESCO au nord du Sénégal.

**Distances depuis Saint-Louis :**
- Dakar : 270 km (4h de route)
- Parc national Djoudj : 60 km (1h)
- Désert de Lompoul : 150 km (2h30)

Souhaitez-vous combiner Saint-Louis avec d'autres régions ? 🌍`
  }
  
  if (lowerPrompt.includes('casamance') || lowerPrompt.includes('cap skirring')) {
    return `🌴 La Casamance est la région sud du Sénégal, connue pour ses plages.

**Principales villes de Casamance :**
- Cap Skirring (plages paradisiaques)
- Oussouye (culture diola)
- Ziguinchor (ville principale)

**Distance depuis Dakar :** 550 km (8h+)
Il est recommandé de prendre un vol Dakar-Ziguinchor (1h).

Combien de jours souhaitez-vous passer en Casamance ? ✈️`
  }
  
  return `🗺️ Je vous aide à choisir les villes pour votre voyage au Sénégal !

**Principales régions :**
- **Dakar & environs** (Gorée, Lac Rose)
- **Saint-Louis** (patrimoine UNESCO)
- **Saly/Somone** (plages et détente)
- **Casamance** (Cap Skirring au sud)
- **Sine-Saloum** (deltas et mangroves)

Dites-moi combien de temps vous restez et ce qui vous intéresse le plus ! 😊`
}

// Prompt optimisé pour la sélection géographique (SANS prix/météo/conseils)
export const SENEGAL_GEOGRAPHY_PROMPT = `Tu es **SenegalCities**, un assistant spécialisé dans la sélection géographique au Sénégal. Tu aides UNIQUEMENT à choisir les villes et régions, SANS prix, météo, ou conseils saisonniers.

## RÔLE PRÉCIS
- Aide à sélectionner villes/régions du Sénégal selon durée et préférences
- Fournis distances et temps de trajet entre villes
- Propose des combinaisons logiques selon la géographie
- INTERDICTIONS : prix, budget, météo, recommandations saisonnières

## VILLES PRINCIPALES
**Nord :** Dakar, Saint-Louis, Thiès, Louga
**Centre :** Kaolack, Fatick, Sine-Saloum (Toubacouta)
**Côte :** Saly, Somone, Popenguine, Joal-Fadiouth
**Sud (Casamance) :** Ziguinchor, Cap Skirring, Oussouye

## DISTANCES DEPUIS DAKAR
- Saint-Louis : 270 km (4h)
- Saly : 80 km (1h30)
- Kaolack : 190 km (3h)
- Toubacouta : 180 km (3h)
- Ziguinchor : 550 km (8h+) *vol recommandé*
- Cap Skirring : depuis Ziguinchor 70 km (1h30)

## STYLE
- Conversationnel et concis
- 1-2 questions max pour comprendre leurs besoins géographiques
- Propose combinaisons selon durée de séjour
- Émojis simples, pas de structure technique

Langue : français par défaut, adapte-toi à l'utilisateur.`