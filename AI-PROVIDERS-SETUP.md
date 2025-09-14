# FREE AI Providers Setup Guide

This guide helps you configure FREE AI alternatives for your Senegal Driver MVP application. The system automatically detects and uses the best available provider with automatic fallbacks.

## 🎯 Quick Setup (Choose Your Preferred Option)

### Option 1: Hugging Face (RECOMMENDED) ⭐
**Best for:** Geographical queries, completely free, no credit card required

**Setup:**
1. Go to [https://huggingface.co/join](https://huggingface.co/join)
2. Create free account (no credit card needed)
3. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
4. Create new token with "Read" permissions
5. Add to `.env.local`:
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

**Limits:** 1000 requests/month (sufficient for MVP)

---

### Option 2: Google Gemini ⭐
**Best for:** Strong geographical knowledge, good free tier

**Setup:**
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create Google account if needed
3. Click "Create API Key"
4. Add to `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

**Limits:** 15 requests/minute, 1500 requests/day

---

### Option 3: Ollama (UNLIMITED) ⭐
**Best for:** Complete control, unlimited usage, no external dependencies

**Local Setup (Development):**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download recommended model
ollama pull llama3.1:8b

# Start server
ollama serve
```

**Production Setup:**
Deploy on Railway, Render, or your own VPS:
```dockerfile
FROM ollama/ollama:latest
RUN ollama pull llama3.1:8b
EXPOSE 11434
CMD ["ollama", "serve"]
```

Add to `.env.local`:
```env
OLLAMA_URL=http://your-ollama-server:11434
```

**Limits:** Unlimited (but hosting costs apply)

---

### Option 4: Cohere
**Setup:**
1. Go to [https://dashboard.cohere.ai/register](https://dashboard.cohere.ai/register)
2. Create free account
3. Get API key from dashboard
4. Add to `.env.local`:
```env
COHERE_API_KEY=your_api_key_here
```

**Limits:** 1000 requests/month

---

## 🔄 How the Auto-Fallback System Works

The system automatically prioritizes providers in this order:

1. **Hugging Face** (if API key configured)
2. **Gemini** (if API key configured)
3. **Ollama** (if server URL configured)
4. **Cohere** (if API key configured)
5. **Demo Mode** (always available as final fallback)

If one provider fails, it automatically tries the next available provider.

## 🚀 Deployment Configuration

### Vercel Environment Variables
In your Vercel dashboard, add environment variables:

```env
# Required: At least one AI provider
HUGGINGFACE_API_KEY=hf_xxxxx
GEMINI_API_KEY=xxxxx
OLLAMA_URL=https://your-ollama-server.com
COHERE_API_KEY=xxxxx

# Other required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Railway/Render Deployment
Same environment variables as Vercel.

## 📊 Provider Comparison for Senegal Geography Use Case

| Provider | Free Tier | Geography Knowledge | Setup Difficulty | Reliability |
|----------|-----------|-------------------|------------------|-------------|
| **Hugging Face** | 1000 req/month | ⭐⭐⭐⭐ | Easy | ⭐⭐⭐⭐ |
| **Gemini** | 1500 req/day | ⭐⭐⭐⭐⭐ | Easy | ⭐⭐⭐⭐ |
| **Ollama** | Unlimited | ⭐⭐⭐⭐ | Medium | ⭐⭐⭐⭐⭐ |
| **Cohere** | 1000 req/month | ⭐⭐⭐ | Easy | ⭐⭐⭐ |

## 🧪 Testing Your Setup

After configuring at least one provider, test the system:

```bash
# Start development server
npm run dev

# Test the chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles villes visiter au Sénégal en 7 jours?"}'
```

The response will include which provider was used:
```json
{
  "response": "...",
  "provider": "huggingface",
  "isDemo": false
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"All AI providers unavailable"**
   - Check that at least one API key is correctly set
   - Verify API keys are valid and not expired

2. **Rate limiting errors**
   - System will automatically fallback to next provider
   - Consider setting up multiple providers for redundancy

3. **Ollama connection errors**
   - Ensure Ollama server is running and accessible
   - Check firewall settings for port 11434

4. **Demo mode always active**
   - Verify environment variables are set correctly
   - Check for typos in variable names

### Debug Mode:
Check the console logs to see which provider is being used:
```
Utilisation du fournisseur IA: huggingface
```

## 💡 Recommendations

**For MVP/Development:**
- Start with **Hugging Face** (easiest setup, completely free)
- Add **Gemini** as backup (higher daily limits)

**For Production:**
- Use **Hugging Face + Gemini** combination for redundancy
- Consider **Ollama** for unlimited usage if you can manage server hosting

**For Scale:**
- Set up **Ollama** on dedicated server for unlimited requests
- Keep **Hugging Face** and **Gemini** as backups

## 🎯 Optimized for Your Use Case

All providers are configured with prompts specifically optimized for:
- ✅ Senegal geographical knowledge
- ✅ City/region selection assistance  
- ✅ Distance and travel time information
- ❌ NO pricing information
- ❌ NO weather/seasonal advice
- ❌ NO general travel recommendations

The system focuses purely on helping users select cities and regions for their Senegal journey.