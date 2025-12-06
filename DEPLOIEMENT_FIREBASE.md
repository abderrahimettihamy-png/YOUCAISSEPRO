# 🚀 Guide de Déploiement Firebase - YOU CAISSE PRO

## ⚠️ Important
Firebase Hosting est adapté uniquement pour le **frontend** (application React).
Pour le **backend** (Node.js + SQLite), vous aurez besoin d'un autre service comme :
- **Render.com** (gratuit)
- **Railway.app** (gratuit)
- **Google Cloud Run**
- **Heroku**

## 📋 Étapes de déploiement

### 1. Installer Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Se connecter à Firebase
```bash
firebase login
```

### 3. Initialiser Firebase dans le projet
```bash
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO"
firebase init
```

**Sélectionnez :**
- ✅ Hosting
- Créer un nouveau projet ou sélectionner un projet existant
- Public directory: `frontend/dist`
- Single-page app: `Yes`
- Automatic builds with GitHub: `No`

### 4. Builder le frontend
```bash
cd frontend
npm run build
```

### 5. Déployer sur Firebase
```bash
firebase deploy
```

## 🔧 Configuration requise

### Fichier `firebase.json` (à créer à la racine)
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Mettre à jour l'URL du backend
Dans `frontend/.env.production` (à créer) :
```
VITE_API_URL=https://votre-backend-url.com/api
```

## 🌐 Déploiement du Backend

### Option 1: Render.com (Recommandé - Gratuit)

1. Aller sur https://render.com
2. Connecter votre compte GitHub
3. Créer un nouveau "Web Service"
4. Pointer vers le dossier `backend`
5. Configuration :
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

6. Ajouter les variables d'environnement :
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=votre_secret_jwt_super_securise
   ```

7. Déployer

### Option 2: Railway.app (Gratuit)

1. Aller sur https://railway.app
2. Nouveau projet → Deploy from GitHub
3. Sélectionner le dossier backend
4. Ajouter les variables d'environnement
5. Déployer automatiquement

## 📝 Checklist avant déploiement

- [ ] Build du frontend réussit (`npm run build`)
- [ ] Backend fonctionne localement
- [ ] Variables d'environnement configurées
- [ ] URL du backend mise à jour dans le frontend
- [ ] Base de données seed si nécessaire
- [ ] Tester l'authentification
- [ ] Tester les uploads d'images

## 🔐 Sécurité

1. Changer le JWT_SECRET en production
2. Configurer CORS pour autoriser uniquement votre domaine Firebase
3. Activer HTTPS
4. Sauvegarder régulièrement la base de données

## 📱 URLs finales

- **Frontend**: `https://votre-projet.web.app`
- **Backend**: `https://votre-backend.onrender.com` (ou autre)

## 🆘 Support

En cas de problème :
1. Vérifier les logs Firebase : `firebase functions:log`
2. Vérifier les logs du backend sur votre plateforme
3. Tester les endpoints API avec Postman
