// Flexible AI Provider System
// Allows easy switching between different AI providers

export type AIProvider = 'gemini' | 'huggingface' | 'openai' | 'groq' | 'demo'

export interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  fallbackProvider?: AIProvider
}

export async function generateAIResponse(
  prompt: string, 
  config: AIProviderConfig
): Promise<{ response: string; provider: AIProvider; isDemo: boolean }> {
  
  const { provider, apiKey, fallbackProvider } = config
  
  try {
    switch (provider) {
      case 'gemini':
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-key') {
          throw new Error('Gemini API key not configured')
        }
        const { generateGeminiResponse } = await import('./gemini-simple')
        const geminiResponse = await generateGeminiResponse(prompt)
        return { response: geminiResponse, provider: 'gemini', isDemo: false }
        
      case 'huggingface':
        if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'placeholder-key') {
          throw new Error('HuggingFace API key not configured')
        }
        const { generateHuggingFaceResponse } = await import('./huggingface-simple')
        const hfResponse = await generateHuggingFaceResponse(prompt)
        return { response: hfResponse, provider: 'huggingface', isDemo: false }
        
      case 'openai':
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key') {
          throw new Error('OpenAI API key not configured')
        }
        const { generateOpenAIResponse } = await import('./openai-simple')
        const openaiResponse = await generateOpenAIResponse(prompt)
        return { response: openaiResponse, provider: 'openai', isDemo: false }
        
      case 'groq':
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'placeholder-key') {
          throw new Error('Groq API key not configured')
        }
        const { generateGroqResponse } = await import('./groq-simple')
        const groqResponse = await generateGroqResponse(prompt)
        return { response: groqResponse, provider: 'groq', isDemo: false }
        
      case 'demo':
      default:
        // Import demo responses from the route file
        const demoResponse = getDemoResponse(prompt)
        return { response: demoResponse, provider: 'demo', isDemo: true }
    }
  } catch (error) {
    console.error(`Erreur avec le provider ${provider}:`, error)
    
    // Try fallback provider if configured
    if (fallbackProvider && fallbackProvider !== provider) {
      console.log(`Utilisation du provider de secours: ${fallbackProvider}`)
      return generateAIResponse(prompt, { 
        provider: fallbackProvider, 
        apiKey,
        fallbackProvider: 'demo' // Ultimate fallback is always demo
      })
    }
    
    // Ultimate fallback to demo mode
    console.log('Utilisation du mode démo comme dernier recours')
    const demoResponse = getDemoResponse(prompt)
    return { response: demoResponse, provider: 'demo', isDemo: true }
  }
}

// Simple demo response generator
function getDemoResponse(message: string): string {
  const msg = message.toLowerCase()
  
  if (msg.includes('bonjour') || msg.includes('salut')) {
    return `🌍 Bonjour ! Je suis votre conseiller voyage pour le Sénégal 🇸🇳

Dites-moi ce qui vous intéresse :
🗓️ **Durée** de votre séjour
🎯 **Activités** préférées (plages, culture, nature...)
👥 **Nombre de voyageurs**

Je vais créer un itinéraire personnalisé pour vous ! ✨`
  }
  
  return `Je comprends ! 😊 

Pour vous conseiller au mieux sur votre voyage au Sénégal :
- 🗓️ **Durée souhaitée** du séjour  
- 💰 **Budget approximatif** 
- 🎯 **Ce qui vous attire** (plages, culture, nature...)

Plus j'en sais, plus mes recommandations seront précises ! 🚀`
}

// Configuration helper
export function getAIProviderConfig(): AIProviderConfig {
  // Priority order: Gemini > HuggingFace > OpenAI > Groq > Demo
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder-key') {
    return {
      provider: 'gemini',
      fallbackProvider: 'demo'
    }
  }
  
  if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'placeholder-key') {
    return {
      provider: 'huggingface',
      fallbackProvider: 'demo'
    }
  }
  
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder-key') {
    return {
      provider: 'openai',
      fallbackProvider: 'demo'
    }
  }
  
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder-key') {
    return {
      provider: 'groq',
      fallbackProvider: 'demo'
    }
  }
  
  return {
    provider: 'demo'
  }
}