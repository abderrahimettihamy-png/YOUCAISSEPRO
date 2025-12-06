# 📱 YOU CAISSE PRO - Guide Installation PC + Tablettes Android

## 🎯 Architecture du Système

```
┌─────────────────┐
│   PC PRINCIPAL  │  ← Serveur Backend (Node.js)
│   (Caissier)    │  ← Application Web
└────────┬────────┘
         │
    [Réseau WiFi Local]
         │
    ┌────┴─────┬──────────┬──────────┐
    │          │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐
│Tablet │  │Tablet│  │Tablet│  │  PC  │
│Serveur│  │Serveu│  │Serveu│  │Caisse│
└───────┘  └──────┘  └──────┘  └──────┘
```

---

## 🖥️ **ÉTAPE 1 : Configuration du PC Principal**

### A. Installation du Backend

1. **Vérifier Node.js** :
```powershell
node --version  # Doit afficher v18 ou supérieur
```

2. **Démarrer le serveur** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
npm run dev
```

3. **Noter l'adresse IP** affichée :
```
📍 API disponible sur:
   - Local:  http://localhost:3001
   - Réseau: http://192.168.1.100:3001  ← NOTER CETTE ADRESSE !
```

### B. Obtenir l'Adresse IP du PC

```powershell
ipconfig
```

Cherchez "Adresse IPv4" dans la section "Carte réseau sans fil Wi-Fi" :
```
Adresse IPv4. . . . . . . . . . . . . .: 192.168.1.100
```

**⚠️ IMPORTANT** : Notez cette adresse IP !

---

## 📱 **ÉTAPE 2 : Installation sur Tablettes Android**

### Option A : Application Web Progressive (PWA) - RECOMMANDÉ ✅

#### Sur chaque tablette :

1. **Ouvrir Chrome** sur la tablette

2. **Accéder à l'application** :
   - Taper l'adresse : `http://192.168.1.100:5173`
   - (Remplacer `192.168.1.100` par l'IP de votre PC)

3. **Installer l'application** :
   - Appuyer sur le menu Chrome (⋮)
   - Sélectionner "Ajouter à l'écran d'accueil"
   - L'application apparaîtra comme une vraie app Android !

4. **Se connecter** :
   - Utilisateur : `bennacer`, `mourad`, ou `abderrazak`
   - Mot de passe : `serveur123`

---

### Option B : Configuration du Navigateur pour Mode Kiosque

Pour éviter que les serveurs quittent l'app :

1. **Installer "Fully Kiosk Browser"** depuis Google Play Store

2. **Configurer** :
   - URL de démarrage : `http://192.168.1.100:5173`
   - Activer "Mode Kiosque"
   - Désactiver les boutons de navigation

---

## 🔧 **ÉTAPE 3 : Configuration Réseau**

### A. Configurer le WiFi

1. **Créer un réseau WiFi dédié** (recommandé) :
   - Nom : `YOU_CAISSE_PRO`
   - Mot de passe : (votre choix)
   - Bande : 5 GHz (plus rapide)

2. **Connecter TOUS les appareils** au même WiFi :
   - PC principal
   - Toutes les tablettes
   - PC caissier supplémentaire (si applicable)

### B. Configurer l'IP Statique du PC Principal (Important !)

Pour éviter que l'adresse IP change :

#### Windows :
1. Panneau de configuration → Réseau et Internet
2. Centre Réseau et partage
3. Modifier les paramètres de la carte
4. Clic droit sur votre WiFi → Propriétés
5. IPv4 → Propriétés
6. Choisir "Utiliser l'adresse IP suivante" :
   - Adresse IP : `192.168.1.100`
   - Masque : `255.255.255.0`
   - Passerelle : `192.168.1.1`
   - DNS : `8.8.8.8`

---

## 🔥 **ÉTAPE 4 : Configurer le Pare-feu Windows**

Pour permettre l'accès depuis les tablettes :

```powershell
# Exécuter en tant qu'administrateur
New-NetFirewallRule -DisplayName "YOU CAISSE Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "YOU CAISSE Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## 🚀 **ÉTAPE 5 : Démarrage Quotidien**

### Sur le PC Principal :

1. **Terminal 1 - Backend** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
npm run dev
```

2. **Terminal 2 - Frontend** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\frontend"
npm run dev
```

3. **Vérifier l'accès** :
   - Local : `http://localhost:5173`
   - Réseau : `http://192.168.1.100:5173`

---

## 📊 **ÉTAPE 6 : Test de Connexion**

### Sur une tablette :

1. **Ouvrir Chrome**
2. **Aller à** : `http://192.168.1.100:5173`
3. **Se connecter** en tant que serveur
4. **Créer une commande test**
5. **Sur le PC caissier**, vérifier que la commande apparaît

✅ Si ça fonctionne : Le système est opérationnel !

---

## 🛠️ **Dépannage**

### Problème : "Impossible de se connecter"

1. **Vérifier le WiFi** :
```powershell
ping 192.168.1.100
```

2. **Vérifier le pare-feu** :
   - Désactiver temporairement pour tester
   - Si ça fonctionne, ajouter les règles ci-dessus

3. **Vérifier que les serveurs tournent** :
```powershell
Get-Process node
```

### Problème : "L'adresse IP a changé"

→ Configurer une IP statique (voir Étape 3B)

### Problème : "Application lente"

1. **Vérifier la connexion WiFi** (signal fort ?)
2. **Utiliser WiFi 5 GHz** au lieu de 2.4 GHz
3. **Réduire la distance** entre tablettes et routeur

---

## 💡 **Optimisations Avancées**

### A. Auto-démarrage du serveur au boot Windows

Créer un fichier `start-you-caisse.bat` :
```batch
@echo off
start cmd /k "cd /d c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend && npm run dev"
timeout /t 5
start cmd /k "cd /d c:\Users\mrtih\Desktop\YOU CAISSE PRO\frontend && npm run dev"
```

Ajouter au démarrage Windows :
- Win + R → `shell:startup`
- Copier le fichier .bat dedans

### B. Mode Offline (Cache PWA)

L'application PWA fonctionne même si la connexion Internet est coupée.
Seul le WiFi local est nécessaire.

### C. Sauvegarde automatique sur plusieurs PC

Configurer le backup automatique sur un NAS ou serveur de fichiers partagé.

---

## 📞 **Support**

Pour toute question :
- Téléphone : 06 16 73 41 71
- Email : you.voyage.company@gmail.com

---

## ✅ **Checklist de Mise en Production**

- [ ] PC principal avec IP statique configurée
- [ ] Pare-feu Windows configuré
- [ ] Serveurs backend et frontend démarrés
- [ ] WiFi dédié créé
- [ ] Toutes les tablettes connectées au WiFi
- [ ] PWA installée sur toutes les tablettes
- [ ] Test de commande réussi
- [ ] Backup automatique configuré
- [ ] Utilisateurs créés (serveurs + caissiers)
- [ ] Imprimantes configurées
- [ ] Formation du personnel effectuée

---

**🎉 Votre système est maintenant prêt pour la production !**
