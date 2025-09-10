# 🚀 Workflow de Déploiement - Transport Sénégal

## 📋 Nouveau workflow Git + Vercel

### **Branches configurées :**

```
🌳 main (production)     → https://senegal-driver-xxx.vercel.app
🌿 dev (staging)         → https://senegal-driver-dev-xxx.vercel.app  
🌱 feature/* (preview)   → https://senegal-driver-pr-xxx.vercel.app
```

## 🔄 Workflow de développement

### **1. Développement de nouvelles fonctionnalités**

```bash
# Partir de dev (toujours à jour)
git checkout dev
git pull origin dev

# Créer feature branch
git checkout -b feature/nom-fonctionnalite

# Développer + commits
git add . && git commit -m "Nouvelle fonctionnalité"
git push origin feature/nom-fonctionnalite
```

### **2. Preview automatique**
- ✅ **URL preview automatique** créée pour chaque feature branch
- ✅ **Tests** sur environnement identique à production
- ✅ **Partage** facile avec client/équipe

### **3. Merge vers dev (staging)**

```bash
# Créer PR feature → dev sur GitHub
# Ou merge direct si développement solo :
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev
```

**Résultat :** Déploiement automatique sur URL staging

### **4. Tests sur staging**
- ✅ **Validation** fonctionnelle complète
- ✅ **Tests** intégration et performance  
- ✅ **Review** client si nécessaire

### **5. Mise en production**

```bash
# Créer PR dev → main sur GitHub (recommandé)
# Ou merge direct :
git checkout main
git merge dev
git push origin main
```

**Résultat :** Déploiement automatique en production

## 🛡️ Protections recommandées (GitHub)

### **Protection branche main :**
```
Settings → Branches → Add rule "main" :
☑️ Require pull request reviews before merging
☑️ Dismiss stale PR reviews when new commits are pushed  
☑️ Require status checks to pass before merging
☑️ Require branches to be up to date before merging
☑️ Restrict pushes to matching branches (admins only)
```

### **Avantages sécurité :**
- 🚫 **Pas de push direct** sur main
- 👥 **Review obligatoire** avant production
- ✅ **Tests automatiques** via PR
- 📝 **Traçabilité** complète des changements

## 🔧 Configuration Vercel

### **Branches settings dans dashboard Vercel :**
```
Production Branch: main
Development Branch: dev
Preview: All branches (feature/*)
```

### **Environment Variables :**
- **Production :** Variables de prod (main branch)
- **Preview :** Variables de dev (dev + feature branches)

## 📊 Monitoring & Rollback

### **URLs permanentes :**
- 🟢 **Production :** URL principale clients
- 🟡 **Staging :** URL tests interne équipe  
- 🔵 **Preview :** URLs temporaires par fonctionnalité

### **Rollback en cas de problème :**
```bash
# Option 1: Rollback Vercel (1 clic dashboard)
# Option 2: Git revert
git checkout main
git revert HEAD
git push origin main  # Auto-redeploy version précédente
```

## ⚡ Workflow quotidien simplifié

```bash
# 1. Nouvelle fonctionnalité
git checkout dev && git pull
git checkout -b feature/ma-fonctionnalite

# 2. Développement local  
# ... code ...
git add . && git commit -m "Ma fonctionnalité"
git push origin feature/ma-fonctionnalité

# 3. Test preview automatique
# ✅ URL preview générée automatiquement

# 4. Merge vers staging
git checkout dev
git merge feature/ma-fonctionnalite
git push origin dev
# ✅ Auto-deploy staging

# 5. Validation staging → Production
git checkout main  
git merge dev
git push origin main
# ✅ Auto-deploy production
```

## 🎯 Résumé avantages

- ⚡ **Déploiements automatiques** sur chaque push
- 🛡️ **Environnement staging** identique à production
- 🔄 **Preview URLs** pour chaque fonctionnalité
- 📊 **Dashboard Vercel** unifié avec métriques
- 🚀 **Rollback** en 1 clic si problème
- 👥 **Workflow équipe** avec PR et reviews
- 📝 **Traçabilité** complète des changements

**Configuration terminée ! 🎉**