# 🖥️ AFFICHAGE DES COMMANDES - BAR & CUISINE

## 📋 PRINCIPE

Quand un **SERVEUR** envoie une commande depuis sa tablette, elle s'affiche automatiquement sur les écrans du **BAR** et de la **CUISINE**.

---

## 🔧 CONFIGURATION

### 1️⃣ **Sur le PC serveur**
- Démarrez l'application avec `DEMARRER.bat`
- Notez l'adresse IP affichée (ex: `192.168.47.102`)

### 2️⃣ **Pour l'écran BAR**
Sur un navigateur (PC, tablette, téléphone), ouvrez :
```
http://192.168.47.102:5173/bar
```

### 3️⃣ **Pour l'écran CUISINE**
Sur un autre navigateur, ouvrez :
```
http://192.168.47.102:5173/cuisine
```

---

## 💡 UTILISATION

### **SERVEUR (Tablette)**
1. Se connecter avec son compte SERVEUR
2. Sélectionner les articles (boissons, repas)
3. Cliquer sur **"📤 Envoyer la commande"**
4. ✅ La commande est automatiquement envoyée au BAR et/ou à la CUISINE

### **BAR / CUISINE (Écran fixe)**
1. L'écran affiche toutes les commandes en attente
2. Chaque commande montre :
   - **Numéro de ticket**
   - **Client (chambre ou passage)**
   - **Serveur qui a pris la commande**
   - **Liste des articles avec quantités**
3. Quand la commande est prête, cliquez sur **"✓ Marquer comme prêt"**
4. La commande disparaît après 2 secondes

---

## 🎯 AVANTAGES

✅ **Pas besoin d'imprimante** - tout est affiché à l'écran  
✅ **Mise à jour automatique** - rafraîchissement toutes les 5 secondes  
✅ **Couleurs distinctes** - Rose pour le BAR, Bleu pour la CUISINE  
✅ **Notification visuelle** - animation verte quand une commande est marquée prête  

---

## 🔄 SYNCHRONISATION

- **BAR** reçoit uniquement les commandes contenant des **BOISSONS**
- **CUISINE** reçoit uniquement les commandes contenant des **REPAS**
- Les écrans se mettent à jour toutes les **5 secondes**

---

## 📱 EXEMPLE DE CONFIGURATION

### Configuration typique d'un restaurant/hôtel :

```
┌─────────────────────┐
│   PC SERVEUR        │  ← Serveurs back-end/front-end
│  192.168.47.102     │
└──────────┬──────────┘
           │
    WiFi Local
           │
     ┌─────┴─────┬──────────┬──────────┐
     │           │          │          │
┌────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌──▼──────┐
│ Tablette│ │ Écran  │ │ Écran  │ │ Tablette│
│ SERVEUR │ │  BAR   │ │CUISINE │ │ SERVEUR │
│   #1    │ │        │ │        │ │   #2    │
└─────────┘ └────────┘ └────────┘ └─────────┘
```

### URLs à utiliser :
- **Serveurs** : `http://192.168.47.102:5173` (connexion normale)
- **Écran BAR** : `http://192.168.47.102:5173/bar` (pas de connexion nécessaire)
- **Écran CUISINE** : `http://192.168.47.102:5173/cuisine` (pas de connexion nécessaire)

---

## 🛠️ DÉPANNAGE

### ❌ Problème : "Aucune commande en attente" alors qu'il y en a

**Solution :**
1. Vérifiez que le serveur a bien envoyé la commande
2. Actualisez la page (F5)
3. Vérifiez que les articles sont bien de type "boissons" (BAR) ou "repas" (CUISINE)

### ❌ Problème : L'écran ne se met pas à jour

**Solution :**
1. Vérifiez la connexion réseau
2. Actualisez la page
3. Redémarrez le navigateur

### ❌ Problème : Impossible d'accéder aux URLs /bar ou /cuisine

**Solution :**
1. Vérifiez que le frontend est démarré
2. Vérifiez l'adresse IP du serveur (peut changer après redémarrage)
3. Vérifiez que vous êtes sur le même réseau WiFi

---

## 📞 SUPPORT

Pour toute assistance technique, contactez l'administrateur système.

**Version :** 1.0  
**Date :** Décembre 2025
