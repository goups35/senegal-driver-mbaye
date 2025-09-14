# 🔄 AI Provider Migration Guide

## Overview

This guide helps you migrate from Groq to free AI alternatives for your Senegal Driver MVP application.

## 🎯 Recommended Migration Path

### Option 1: Google Gemini (RECOMMENDED)
**Best for production with excellent geographical knowledge**

```bash
# 1. Install Gemini SDK
npm install @google/generative-ai

# 2. Get free API key
# Visit: https://makersuite.google.com/app/apikey

# 3. Update environment
echo "GEMINI_API_KEY=your_actual_key_here" >> .env.local

# 4. Update API route
# Replace import in src/app/api/chat/route.ts:
# FROM: import { generateGroqResponse } from '@/lib/groq-simple'
# TO:   import { generateGeminiResponse } from '@/lib/gemini-simple'
```

**Benefits:**
- ✅ 1,500 free requests per day
- ✅ Excellent Senegal geographical knowledge
- ✅ No credit card required
- ✅ Enterprise-grade reliability
- ✅ Minimal code changes

### Option 2: HuggingFace Inference API
**Best for open-source enthusiasts**

```bash
# 1. Install HuggingFace SDK
npm install @huggingface/inference

# 2. Get free API key
# Visit: https://huggingface.co/settings/tokens

# 3. Update environment
echo "HUGGINGFACE_API_KEY=your_actual_key_here" >> .env.local

# 4. Update API route to use HuggingFace
```

**Benefits:**
- ✅ 30,000 characters per month free
- ✅ 100+ free models available
- ✅ Open-source community
- ⚠️ Limited geographical knowledge
- ⚠️ Potential response quality variation

## 🚀 Quick Migration Steps

### Step 1: Choose Your Provider
Run the setup script to install all options:
```bash
./scripts/setup-ai-providers.sh
```

### Step 2: Get API Keys

**Gemini (Recommended):**
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy the key

**HuggingFace:**
1. Visit https://huggingface.co/settings/tokens
2. Create new token with "Read" permissions
3. Copy the token

**OpenAI (if you have credits):**
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key

### Step 3: Update Environment Variables

Add to your `.env.local`:
```env
# Primary provider (choose one)
GEMINI_API_KEY=your_gemini_key_here
# OR
HUGGINGFACE_API_KEY=your_huggingface_token_here
# OR  
OPENAI_API_KEY=your_openai_key_here

# Keep Groq as backup (optional)
GROQ_API_KEY=your_groq_key_here
```

### Step 4: Update API Route

**Option A: Simple replacement (Gemini)**
```typescript
// In src/app/api/chat/route.ts
// Replace line 24:
const { generateGeminiResponse, TRAVEL_ADVISOR_PROMPT } = await import('@/lib/gemini-simple')

// Replace line 45:
const response = await generateGeminiResponse(fullPrompt)
```

**Option B: Use flexible provider system**
```typescript
// Replace the entire route file with:
import { generateAIResponse, getAIProviderConfig } from '@/lib/ai-provider'

// In the POST function:
const providerConfig = getAIProviderConfig()
const result = await generateAIResponse(fullPrompt, providerConfig)
```

### Step 5: Test Your Migration

```bash
# Start development server
npm run dev

# Test the chat functionality
# Visit http://localhost:3000 and test the chat
```

## 📊 Provider Comparison

| Provider | Free Limit | Setup | Geo Knowledge | Migration Effort |
|----------|------------|-------|---------------|------------------|
| **Gemini** | 1,500 req/day | Easy | ⭐⭐⭐⭐⭐ | Minimal |
| **HuggingFace** | 30k chars/month | Medium | ⭐⭐⭐ | Low |
| **OpenAI** | $5 credits | Easy | ⭐⭐⭐⭐⭐ | Minimal |
| **Groq** | Limited free | Easy | ⭐⭐⭐⭐ | Already done |

## 🛠️ Technical Implementation Details

### Rate Limiting Handling

Each provider includes automatic rate limit handling:

```typescript
// Example: Gemini with error handling
try {
  const response = await generateGeminiResponse(prompt)
  return response
} catch (error) {
  if (error.message.includes('quota')) {
    // Fall back to demo mode
    return getDemoResponse(prompt)
  }
  throw error
}
```

### Deployment on Vercel

All free providers work seamlessly on Vercel:

1. **Environment Variables:** Add API keys in Vercel dashboard
2. **Build Process:** No changes needed
3. **Edge Functions:** All providers support edge runtime
4. **Cold Starts:** Minimal impact

### Performance Optimization

```typescript
// Implement response caching for repeated queries
const cache = new Map()

export async function generateCachedResponse(prompt: string) {
  const cacheKey = prompt.slice(0, 100) // Simple cache key
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const response = await generateAIResponse(prompt)
  cache.set(cacheKey, response)
  
  return response
}
```

## 🔧 Troubleshooting

### Common Issues

**"API key not working"**
```bash
# Check your environment variables
echo $GEMINI_API_KEY
# Restart your development server
npm run dev
```

**"Rate limit exceeded"**
- Gemini: Wait for daily reset or implement caching
- HuggingFace: Reduce request frequency
- OpenAI: Check remaining credits

**"Poor response quality"**
- Try different models in HuggingFace
- Adjust temperature parameters
- Use Gemini for best geographical accuracy

### Fallback Strategy

The flexible provider system automatically falls back:
1. Primary provider (Gemini/HuggingFace/OpenAI)
2. Secondary provider (if configured)
3. Demo mode (always works)

## 📈 Monitoring & Analytics

Add usage tracking:

```typescript
// Track provider usage
export function logProviderUsage(provider: string, success: boolean) {
  console.log(`Provider: ${provider}, Success: ${success}, Time: ${new Date()}`)
  
  // Send to analytics service if needed
  // analytics.track('ai_provider_usage', { provider, success })
}
```

## 🎯 Production Recommendations

1. **Primary:** Use Gemini for best geographical knowledge
2. **Backup:** Keep Groq as fallback if you have credits
3. **Monitoring:** Implement usage tracking
4. **Caching:** Cache responses for common queries
5. **Error Handling:** Always fall back to demo mode

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify API key configuration
3. Test with demo mode first
4. Refer to provider documentation:
   - [Gemini Docs](https://ai.google.dev/docs)
   - [HuggingFace Docs](https://huggingface.co/docs/inference)
   - [OpenAI Docs](https://platform.openai.com/docs)