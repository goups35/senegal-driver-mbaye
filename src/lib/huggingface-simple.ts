import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'placeholder-key')

export async function generateHuggingFaceResponse(prompt: string): Promise<string> {
  try {
    // Using a conversational model optimized for dialogue
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium', // Alternative: 'HuggingFaceH4/zephyr-7b-beta'
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
        repetition_penalty: 1.1,
        do_sample: true
      }
    })
    
    return response.generated_text?.trim() || 'Désolé, je n\'ai pas pu générer de réponse.'
  } catch (error) {
    console.error('Erreur HuggingFace:', error)
    
    // Fallback to a different model if the primary fails
    try {
      const fallbackResponse = await hf.textGeneration({
        model: 'gpt2',
        inputs: prompt.slice(0, 500), // Limit input for GPT-2
        parameters: {
          max_new_tokens: 500,
          temperature: 0.8,
          return_full_text: false
        }
      })
      return fallbackResponse.generated_text?.trim() || 'Réponse de secours générée.'
    } catch (fallbackError) {
      console.error('Erreur modèle de secours:', fallbackError)
      throw error
    }
  }
}

// Réutiliser le même prompt que Groq
export { TRAVEL_ADVISOR_PROMPT } from './groq-simple'

// Configuration spécifique pour HuggingFace
export const HUGGINGFACE_CONFIG = {
  primaryModel: 'microsoft/DialoGPT-medium',
  fallbackModel: 'gpt2',
  maxInputLength: 2000, // HuggingFace has input limitations
  rateLimit: {
    requestsPerHour: 1000,
    charactersPerMonth: 30000
  }
}