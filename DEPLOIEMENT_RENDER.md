# 🚀 Guide de Déploiement - YOU CAISSE PRO sur Render.com

## Vue d'ensemble
Ce guide vous aidera à déployer l'application complète (Frontend + Backend + Base de données) sur **Render.com** en quelques étapes simples.

---

## ✅ Prérequis

1. **Compte GitHub** (gratuit)
2. **Compte Render.com** (gratuit) - Créez un compte sur [render.com](https://render.com)
3. **Git installé** sur votre PC

---

## 📋 Étape 1 : Préparer le Dépôt GitHub

### 1.1 Créer un dépôt GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New repository"** (bouton vert)
3. Nommez-le : `you-caisse-pro`
4. Choisissez **Private** (recommandé)
5. Cliquez sur **"Create repository"**

### 1.2 Pousser le code vers GitHub

Ouvrez PowerShell dans le dossier de votre projet :

```powershell
# Initialiser Git (si ce n'est pas déjà fait)
git init

# Créer un fichier .gitignore
@"
node_modules/
dist/
build/
*.sqlite
.env
.DS_Store
*.log
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - YOU CAISSE PRO"

# Lier au dépôt GitHub (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/you-caisse-pro.git

# Pousser le code
git branch -M main
git push -u origin main
```

---

## 🌐 Étape 2 : Déployer sur Render.com

### 2.1 Connecter GitHub à Render

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"Blueprint"**
3. Cliquez sur **"Connect GitHub"**
4. Autorisez Render à accéder à vos dépôts
5. Sélectionnez le dépôt `you-caisse-pro`

### 2.2 Configuration Automatique

Render détectera automatiquement le fichier `render.yaml` et créera :

✅ **1 Base de données PostgreSQL** (gratuite)  
✅ **1 Service Backend** (API Node.js)  
✅ **1 Service Frontend** (Interface React)

**⚠️ Temps de déploiement : 5-10 minutes**

### 2.3 Variables d'environnement (déjà configurées)

Les variables sont automatiquement définies via `render.yaml` :

- `DATABASE_URL` → Connexion PostgreSQL
- `JWT_SECRET` → Clé secrète générée automatiquement
- `NODE_ENV` → `production`
- `VITE_API_URL` → URL du backend

---

## 🔧 Étape 3 : Accéder à l'Application

### Après le déploiement :

1. Allez dans **Dashboard Render**
2. Cliquez sur **you-caisse-frontend**
3. Copiez l'URL (ex: `https://you-caisse-frontend.onrender.com`)
4. Ouvrez cette URL dans votre navigateur

### 🎉 Connexion par défaut :

**Administrateur :**
- Username: `admin`
- Password: `admin123`

**Caissier :**
- Username: `lhoucine`
- Password: `caissier123`

**Réception :**
- Username: `reception`
- Password: `reception123`

---

## 📊 Étape 4 : Initialiser la Base de Données

La base de données PostgreSQL est vide au démarrage. Pour créer les tables et les données initiales :

### Option A : Via l'interface Render (Recommandé)

1. Allez dans **Dashboard Render** → **you-caisse-backend**
2. Cliquez sur **"Shell"** (en haut à droite)
3. Exécutez :
```bash
npm run seed
```

### Option B : Via API (automatique au premier démarrage)

Le backend créera automatiquement les tables au premier démarrage.  
Les utilisateurs seront créés via le script `seed.ts`.

---

## 🔄 Étape 5 : Mettre à Jour l'Application

Pour déployer des modifications :

```powershell
# Après avoir fait des modifications dans le code
git add .
git commit -m "Description de vos modifications"
git push origin main
```

**Render redéploiera automatiquement l'application** (2-5 minutes).

---

## ⚙️ Configuration Avancée

### Modifier les variables d'environnement

1. Allez sur **Dashboard Render**
2. Sélectionnez le service (backend ou frontend)
3. Allez dans **"Environment"**
4. Ajoutez/modifiez les variables
5. Cliquez sur **"Save Changes"**

### Activer les logs

```bash
# Backend logs
Dashboard → you-caisse-backend → Logs

# Frontend logs
Dashboard → you-caisse-frontend → Logs
```

---

## 🐛 Dépannage

### Problème 1 : "Service Unavailable"
**Solution :** Attendez 30 secondes. Render met les services gratuits en veille après 15 minutes d'inactivité.

### Problème 2 : "Database connection failed"
**Solution :** 
1. Vérifiez que la base de données est active (Dashboard → you-caisse-db)
2. Vérifiez la variable `DATABASE_URL` dans le backend

### Problème 3 : Frontend ne se connecte pas au backend
**Solution :** 
1. Vérifiez la variable `VITE_API_URL` dans le frontend
2. Assurez-vous que le backend est déployé et actif

### Problème 4 : "Build failed"
**Solution :** 
1. Consultez les logs de build
2. Vérifiez que `package.json` contient toutes les dépendances
3. Assurez-vous que les Dockerfiles sont corrects

---

## 💰 Coûts

### Plan Gratuit Render (Suffisant pour débuter) :
- ✅ **PostgreSQL** : 256 MB RAM, 1 GB stockage
- ✅ **Backend** : 512 MB RAM
- ✅ **Frontend** : 512 MB RAM
- ⚠️ **Limitation** : Services mis en veille après 15 min d'inactivité
- ⚠️ **Temps de réveil** : 30 secondes

### Plan Payant (Recommandé pour production) :
- 💵 **7$/mois par service** (Backend + Frontend = 14$/mois)
- ✅ Toujours actif (pas de veille)
- ✅ Plus de RAM et CPU
- ✅ Support SSL/HTTPS automatique

---

## 🔒 Sécurité

### Recommandations :

1. **Changez les mots de passe par défaut** après le premier déploiement
2. **Activez HTTPS** (automatique sur Render)
3. **Limitez les CORS** dans le backend (déjà configuré)
4. **Utilisez des secrets forts** pour `JWT_SECRET`

### Variables à sécuriser :

```env
# Backend (.env - NE PAS COMMITTER)
JWT_SECRET=VotreClé$ecrète!2024
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 📱 Accès depuis Tablettes/Téléphones

Une fois déployé, l'application est accessible depuis n'importe quel appareil :

1. Ouvrez le navigateur sur la tablette
2. Allez sur `https://you-caisse-frontend.onrender.com`
3. Ajoutez à l'écran d'accueil (PWA)

### Pour installer comme application :

**Sur Android :**
- Chrome → Menu (⋮) → "Ajouter à l'écran d'accueil"

**Sur iOS :**
- Safari → Partager → "Sur l'écran d'accueil"

---

## 📞 Support

### Ressources :
- **Documentation Render :** [render.com/docs](https://render.com/docs)
- **Logs Backend :** Dashboard → you-caisse-backend → Logs
- **Logs Frontend :** Dashboard → you-caisse-frontend → Logs
- **Base de données :** Dashboard → you-caisse-db → Info

### En cas de problème :
1. Consultez les logs
2. Vérifiez les variables d'environnement
3. Redémarrez le service (Dashboard → Restart)

---

## ✅ Checklist Finale

Avant de mettre en production :

- [ ] Code poussé sur GitHub
- [ ] Services déployés sur Render (3/3)
- [ ] Base de données initialisée (`npm run seed`)
- [ ] Application accessible via URL
- [ ] Connexion admin testée
- [ ] Mots de passe changés
- [ ] Tablettes configurées avec l'URL de production
- [ ] Sauvegarde manuelle de la base (optionnel)

---

🎉 **Félicitations !** Votre application YOU CAISSE PRO est maintenant hébergée en ligne !
