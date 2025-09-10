#!/bin/bash

echo "🚀 Configuration des variables d'environnement Vercel..."

# Lire les variables depuis .env.local
source .env.local

# Ajouter chaque variable d'environnement
echo "📝 Ajout des variables d'environnement..."

echo "$NEXT_PUBLIC_SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development  
echo "$GROQ_API_KEY" | npx vercel env add GROQ_API_KEY production preview development
echo "$OPENAI_API_KEY" | npx vercel env add OPENAI_API_KEY production preview development
echo "$GEMINI_API_KEY" | npx vercel env add GEMINI_API_KEY production preview development
echo "$WHATSAPP_PHONE_NUMBER" | npx vercel env add WHATSAPP_PHONE_NUMBER production preview development
echo "https://senegal-driver-mbaye.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production preview development

echo "✅ Variables d'environnement configurées !"
echo "🚀 Redéploiement..."

npx vercel --prod

echo "🎉 Déploiement terminé !"