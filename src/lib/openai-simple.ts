import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key'
})

export async function generateOpenAIResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Most cost-effective model
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    return completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'
  } catch (error) {
    console.error('Erreur OpenAI:', error)
    
    // Check if it's a rate limit or quota error
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        throw new Error('Quota OpenAI dépassé. Veuillez vérifier votre compte.')
      }
      if (error.message.includes('rate_limit')) {
        throw new Error('Limite de débit OpenAI atteinte. Veuillez réessayer dans quelques minutes.')
      }
    }
    
    throw error
  }
}

// Réutiliser le même prompt que Groq
export { TRAVEL_ADVISOR_PROMPT } from './groq-simple'

// Configuration spécifique pour OpenAI
export const OPENAI_CONFIG = {
  model: 'gpt-3.5-turbo',
  costPerToken: 0.0015, // $0.0015 per 1K tokens for gpt-3.5-turbo
  freeCredits: 5, // $5 free credits for new accounts
  rateLimit: {
    requestsPerMinute: 3,
    requestsPerDay: 200,
    tokensPerMinute: 40000
  }
}