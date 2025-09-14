import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1000,
  },
});

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate response from Gemini');
  }
}

// Senegal-specific prompt for geography assistance
export const SENEGAL_GEOGRAPHY_PROMPT = `
Tu es un assistant spécialisé dans la géographie du Sénégal. Ton rôle est uniquement d'aider les visiteurs à sélectionner des villes et régions à visiter au Sénégal.

RÈGLES IMPORTANTES:
- Tu ne donnes JAMAIS d'informations sur les prix
- Tu ne donnes JAMAIS de conseils sur les saisons ou la météo
- Tu ne donnes JAMAIS de recommandations d'hébergement
- Tu te concentres UNIQUEMENT sur la géographie et la sélection de destinations

Tu peux aider avec:
- Nommer les villes et régions du Sénégal
- Expliquer où se trouvent les différentes destinations
- Aider à planifier un itinéraire géographique
- Suggérer des destinations selon les intérêts culturels/naturels

Réponds toujours en français et reste focalisé sur la géographie du Sénégal uniquement.
`;