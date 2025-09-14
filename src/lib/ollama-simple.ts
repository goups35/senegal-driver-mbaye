// Configuration pour Ollama - IA complètement gratuite et illimitée
// Nécessite un serveur avec Ollama installé

export async function generateOllamaResponse(prompt: string): Promise<string> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    
    if (!ollamaUrl || ollamaUrl === 'http://localhost:11434') {
      throw new Error('OLLAMA_URL not configured for production')
    }

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b', // Modèle recommandé pour les requêtes géographiques
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ollama API Error:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('Ollama Model Error:', data.error)
      throw new Error(data.error)
    }

    return data.response || 'Désolé, je n\'ai pas pu générer de réponse.'

  } catch (error) {
    console.error('Erreur Ollama:', error)
    throw error
  }
}

// Vérifier la disponibilité d'Ollama
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.ok
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return false
  }
}

// Liste des modèles recommandés pour les requêtes géographiques
export const RECOMMENDED_MODELS = {
  'llama3.1:8b': 'Excellent pour les requêtes géographiques générales',
  'llama3.1:70b': 'Plus précis mais nécessite plus de ressources',
  'mistral:7b': 'Bon équilibre performance/ressources',
  'gemma2:9b': 'Alternative rapide et efficace'
}

// Documentation pour le déploiement Ollama
export const OLLAMA_DEPLOYMENT_GUIDE = `
## Déploiement Ollama pour production

### Option 1: Serveur VPS dédié
1. Créer un VPS (2-4 GB RAM minimum)
2. Installer Ollama: curl -fsSL https://ollama.com/install.sh | sh
3. Télécharger le modèle: ollama pull llama3.1:8b
4. Exposer l'API: OLLAMA_HOST=0.0.0.0 ollama serve
5. Configurer OLLAMA_URL dans Vercel

### Option 2: Docker sur Railway/Render
1. Créer un Dockerfile avec Ollama
2. Déployer sur Railway/Render
3. Configurer l'URL dans les variables d'environnement

### Avantages Ollama:
- ✅ Complètement gratuit et illimité
- ✅ Aucune limite de requêtes
- ✅ Contrôle total des modèles
- ✅ Pas de dépendance externe
- ✅ Excellent pour les requêtes géographiques

### Inconvénients:
- ❌ Nécessite infrastructure serveur
- ❌ Coûts d'hébergement mensuels
- ❌ Maintenance technique requise
`