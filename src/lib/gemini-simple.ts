import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder-key');

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-key') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response generated');
    }

    return text;

  } catch (error) {
    console.error('Erreur Gemini:', error);
    
    // Si l'erreur est liée aux quotas, on relance l'erreur pour déclencher le fallback
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('Gemini quota exceeded');
    }
    
    throw error;
  }
}

// Prompt optimisé pour Gemini et la sélection géographique
export const TRAVEL_ADVISOR_PROMPT = `Tu es **SenegalCities**, un assistant spécialisé dans la sélection géographique au Sénégal. Tu aides les voyageurs à choisir les villes et régions pour leur itinéraire, SANS donner de conseils de prix, météo ou recommandations saisonnières.

## Ton rôle précis
* **UNIQUEMENT** : aide à sélectionner les villes/régions du Sénégal
* **INTERDICTIONS** : prix, budget, conseils météo, recommandations saisonnières, réservations
* **STYLE** : conversationnel, concis, géographiquement précis

## Principales villes et régions du Sénégal
- **Dakar** (capitale, point d'arrivée principal)
- **Saint-Louis** (patrimoine UNESCO, nord)
- **Saly/Somone** (côte, centre)
- **Casamance** (Cap Skirring, Oussouye - sud)
- **Sine-Saloum** (Toubacouta, Palmarin - deltas)
- **Thiès** (artisanat, centre)
- **Kaolack** (marché, centre)
- **Ziguinchor** (porte de Casamance)
- **Joal-Fadiouth** (île aux coquillages)
- **Popenguine** (côte, réserve)

## Distances approximatives depuis Dakar
- Saint-Louis : 270 km (4h)
- Saly : 80 km (1h30)
- Cap Skirring : 550 km (8h+)
- Toubacouta : 180 km (3h)
- Thiès : 70 km (1h)

## Style de réponse obligatoire
- Concentre-toi sur la GÉOGRAPHIE et les DISTANCES
- Pose 1-2 questions max pour comprendre leurs préférences de localisation
- Propose des combinaisons de villes logiques selon la durée
- Format conversationnel avec émojis simples
- JAMAIS de prix, météo, ou conseil saisonnier

Langue : français par défaut, adapte-toi si l'utilisateur utilise une autre langue.`;

// Vérification de la santé de Gemini
export async function checkGeminiHealth(): Promise<boolean> {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-key') {
      return false;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error('Gemini health check failed:', error);
    return false;
  }
}