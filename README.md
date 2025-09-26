# 🚗 Sénégal Driver MVP

MVP d'un site Next.js pour un chauffeur au Sénégal : configuration de trips, génération d'itinéraires par IA, devis estimatif, contact WhatsApp + Email.

## 🎯 Fonctionnalités

### 🚗 **Mode Transport Direct**
- ✅ **Formulaire de demande de transport** avec validation Zod + React Hook Form
- ✅ **Génération d'itinéraires par IA** (données simulées réalistes)
- ✅ **Calcul de devis automatique** selon le type de véhicule
- ✅ **Intégration WhatsApp** pour la réservation
- ✅ **Envoi d'emails** avec devis détaillé (Resend)

### 🤖 **Mode Conseiller Voyage IA** ⭐ NOUVEAU
- ✅ **Chat conversationnel avec Groq** (ou mode démo)
- ✅ **Assistant expert Sénégal** - recommandations personnalisées
- ✅ **Planification voyage sur-mesure** selon budget/goûts/durée
- ✅ **Suggestions destinations** : Dakar, Saint-Louis, Casamance, etc.
- ✅ **Export WhatsApp du programme complet** après validation "GO"

### 🛠️ **Fonctionnalités communes**
- ✅ **Base de données Supabase** pour stocker les demandes
- ✅ **Interface responsive** avec Tailwind CSS
- ✅ **Mode démo** sans frais (pas d'API payante requise)

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (Llama 3.1) avec JSON structuré + Zod
- **Forms**: React Hook Form + Zod validation
- **Email**: Resend (optionnel)
- **Styling**: Tailwind CSS avec design system personnalisé

## ⚡ Installation

1. **Cloner le projet**
```bash
cd senegal-driver-mvp
npm install
```

2. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env.local` et remplir les valeurs:

```bash
cp .env.example .env.local
```

Variables requises:
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `GROQ_API_KEY` - Clé API Groq (pour chat IA) ⭐ 
- `WHATSAPP_PHONE_NUMBER` - Numéro WhatsApp du chauffeur
- `RESEND_API_KEY` - Clé API Resend (optionnel)

3. **Configurer Supabase**

Exécuter le schéma SQL dans votre tableau de bord Supabase:

```bash
# Le fichier supabase-schema.sql contient tous les CREATE TABLE nécessaires
```

4. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🗂️ Structure du Projet

```
src/
├── app/
│   ├── api/trips/          # API routes
│   │   ├── quote/          # Génération de devis + IA
│   │   └── email-quote/    # Envoi d'emails
│   ├── globals.css         # Styles Tailwind + variables CSS
│   └── page.tsx           # Page principale
├── components/
│   ├── forms/             # Formulaires
│   │   ├── trip-request-form.tsx
│   │   └── trip-quote-display.tsx
│   └── ui/                # Composants UI réutilisables
├── lib/
│   ├── supabase.ts        # Client Supabase
│   ├── openai.ts          # Client OpenAI
│   └── utils.ts           # Utilitaires (WhatsApp, CSS)
├── schemas/
│   └── trip.ts            # Schémas Zod pour validation
└── types/
    └── index.ts           # Types TypeScript
```

## 📋 Workflow de Déploiement

### 🔄 Workflow Git Recommandé

#### 1. **Développement avec branches**
```bash
# Créer une branche pour chaque feature/fix
git checkout -b feature/nom-de-la-feature
git checkout -b fix/correction-bug
```

#### 2. **Tests localhost obligatoires**
```bash
npm run build    # Vérifier la compilation
npm run lint     # Vérifier le code
npm run dev      # Tester en local sur localhost:3000
```

#### 3. **Déploiement progressif**
```bash
# 1. Push de la branche feature
git push origin feature/nom-de-la-feature

# 2. Créer une Pull Request vers main (pas de merge direct)
# 3. Review du code + tests

# 4. Merge uniquement après validation
git checkout main
git merge feature/nom-de-la-feature
git push origin main  # Déploiement auto sur Vercel
```

#### 4. **Environnements**
- **Local**: `npm run dev` - Tests et développement
- **Staging**: Preview Vercel depuis PR
- **Production**: Branche `main` - Déploiement manuel déclenché

### ✅ Checklist Pré-Déploiement

#### **Configuration initiale**
- [ ] **Variables d'environnement configurées**
  - [ ] Supabase URL + clé anonyme
  - [ ] Groq API key
  - [ ] Numéro WhatsApp
  - [ ] Resend API key (si emails activés)

- [ ] **Base de données Supabase**
  - [ ] Projet créé
  - [ ] Schéma SQL exécuté (`supabase-schema.sql`)
  - [ ] Tables `trip_requests` et `trip_quotes` créées

#### **Tests fonctionnels localhost**
- [ ] `npm run build` - Compilation réussie
- [ ] `npm run lint` - Aucune erreur de linting
- [ ] `npm run test` - Tests passent (si disponibles)
- [ ] Formulaire de demande fonctionne
- [ ] Génération de devis par IA
- [ ] Bouton WhatsApp redirige correctement
- [ ] Envoi d'email (si activé)
- [ ] Stockage en base de données

### 🚀 Déploiement Production

#### **Setup Vercel initial**
1. **Connecter à Vercel**
   - Importer le projet GitHub
   - Ajouter les variables d'environnement
   - Configurer la protection de branche `main`

2. **Protection GitHub**
   - Activer protection branche `main`
   - Requérir Pull Request
   - Pas de push direct sur `main`

#### **Process de mise en production**
1. **Validation finale**
   - [ ] Pull Request reviewée et approuvée
   - [ ] Tous les checks passent
   - [ ] Tests fonctionnels validés

2. **Déploiement**
   - [ ] Merge PR vers `main`
   - [ ] Vérifier le déploiement Vercel
   - [ ] Tester toutes les fonctionnalités en prod
   - [ ] Vérifier les logs pour les erreurs

## 🔧 Configuration des Services Externes

### Supabase Setup:
1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Exécuter le contenu de `supabase-schema.sql` dans l'éditeur SQL
3. Récupérer URL + anon key dans Settings > API

### OpenAI Setup:
1. Créer un compte sur [platform.openai.com](https://platform.openai.com)
2. Générer une API key dans API keys
3. Créditer le compte (minimum $5)

### Resend Setup (optionnel):
1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier un domaine ou utiliser le domaine de test
3. Générer une API key

## 🚀 Optimisations Futures (post-MVP)

- **Authentification** utilisateur chauffeur
- **Dashboard admin** pour gérer les demandes
- **Notifications SMS** via Twilio
- **Paiement en ligne** (Stripe/Wave)
- **Géolocalisation** temps réel
- **PWA** pour installation mobile
- **Multi-chauffeurs** et dispatch
- **Analytics** avec Vercel Analytics

## 📱 Contact & Support

Pour des questions techniques ou des améliorations, contactez l'équipe de développement.

---

**Made with ❤️ for Sénégal** 🇸🇳