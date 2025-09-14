#!/bin/bash

# Setup script for AI providers
echo "🤖 Setting up AI providers for Senegal Driver MVP..."

# Install required packages
echo "📦 Installing AI provider packages..."

# Gemini (Google)
npm install @google/generative-ai

# HuggingFace
npm install @huggingface/inference

# OpenAI (if needed)
npm install openai

# Update environment configuration
echo "⚙️  Updating environment configuration..."

# Add new environment variables to .env.example
cat >> .env.example << 'EOF'

# AI Provider Configuration
# Choose your preferred AI provider (priority order):
# 1. GEMINI_API_KEY (Recommended - Free 1500 requests/day)
# 2. HUGGINGFACE_API_KEY (Free 30k chars/month)  
# 3. OPENAI_API_KEY (Free $5 credits for new accounts)
# 4. GROQ_API_KEY (Existing configuration)

# Google Gemini Configuration (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# HuggingFace Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# OpenAI Configuration (optional)
# OPENAI_API_KEY=your_openai_api_key_here
EOF

echo "✅ AI providers setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Get a free Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Add GEMINI_API_KEY to your .env.local file"
echo "3. Test the implementation with: npm run dev"
echo ""
echo "📊 API Limits Summary:"
echo "• Gemini: 1,500 requests/day (FREE forever)"
echo "• HuggingFace: 30,000 chars/month (FREE)"  
echo "• OpenAI: $5 credits for new accounts"
echo ""
echo "🎯 Gemini is recommended for the best geographical knowledge of Senegal!"