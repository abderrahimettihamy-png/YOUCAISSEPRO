# 🔐 GUIDE DE GESTION DES LICENCES

## 📋 PROCESSUS COMPLET

### ÉTAPE 1 : Le client reçoit l'application (15 jours d'essai gratuit)
```
✅ L'application fonctionne automatiquement pendant 15 jours
✅ Aucune configuration nécessaire au départ
```

### ÉTAPE 2 : Avant expiration, le client demande une licence

**Le client exécute :**
```bash
cd backend
npm run show-machine-id
```

**Le client reçoit :**
```
═══════════════════════════════════════════════════════
    IDENTIFIANT MACHINE (MACHINE ID)
═══════════════════════════════════════════════════════

🖥️  MACHINE ID de cet ordinateur:
─────────────────────────────────────────────────────
a1b2c3d4e5f6g7h8i9j0...
─────────────────────────────────────────────────────
```

**Le client vous envoie ce MACHINE ID par email.**

---

### ÉTAPE 3 : Vous générez la licence pour le client

**Vous exécutez :**
```bash
cd backend
npm run create-client-license
```

**Le système vous demande :**
```
🔑 Entrez le MACHINE ID du client: [Vous collez le Machine ID reçu]
📅 Durée de la licence (jours) [365 par défaut]: [Appuyez sur Entrée pour 1 an]
```

**Vous recevez la licence :**
```
═══════════════════════════════════════════════════════
✅ LICENCE GÉNÉRÉE AVEC SUCCÈS!
═══════════════════════════════════════════════════════

📦 LICENCE À ENVOYER AU CLIENT:
─────────────────────────────────────────────────────
eyJtYWNoaW5lSWQiOiJhMWIyYzNkNGU1ZjZnN2g4aTlqMCIsImV4cGly...
─────────────────────────────────────────────────────
```

**Vous envoyez cette licence au client par email.**

---

### ÉTAPE 4 : Le client active sa licence

**Le client :**
1. Crée le dossier `backend\.license\` s'il n'existe pas
2. Crée le fichier `backend\.license\license.key`
3. Colle la licence reçue dans ce fichier
4. Sauvegarde et relance l'application avec `DEMARRER.bat`

**Résultat :**
```
✅ Licence valide (expire dans 365 jours)
🚀 Serveur démarré sur le port 3001
```

---

## 🛠️ COMMANDES DISPONIBLES

### Pour le CLIENT :
```bash
# Afficher son Machine ID pour demander une licence
npm run show-machine-id
```

### Pour VOUS (Administrateur) :
```bash
# Créer une licence pour un client (avec son Machine ID)
npm run create-client-license

# Générer votre propre licence (pour votre machine)
npm run generate-license
```

---

## 📊 DURÉES DE LICENCE

- **15 jours** : Essai gratuit automatique
- **365 jours** : Licence standard (1 an)
- **730 jours** : Licence 2 ans
- **Personnalisé** : Vous choisissez la durée

---

## ⚠️ IMPORTANT

1. ✅ Chaque licence est **liée à une seule machine** (anti-clonage)
2. ✅ Si le client change d'ordinateur, il doit redemander une licence
3. ✅ Les licences ne peuvent **pas être copiées** sur un autre PC
4. ✅ Le Machine ID est **unique** pour chaque ordinateur

---

## 📧 TEMPLATE EMAIL POUR LE CLIENT

**Objet : Votre licence YOU CAISSE PRO**

```
Bonjour,

Voici votre licence d'activation YOU CAISSE PRO :

─────────────────────────────────────────────────────
[COLLEZ LA LICENCE ICI]
─────────────────────────────────────────────────────

📝 Instructions d'activation :
1. Ouvrez le dossier de l'application YOU CAISSE PRO
2. Allez dans : backend\.license\
3. Créez le fichier : license.key
4. Copiez la licence ci-dessus dans ce fichier
5. Sauvegardez et relancez avec DEMARRER.bat

✅ Validité : 1 an
📞 Support : support@youcaisse.pro

Cordialement,
L'équipe YOU CAISSE PRO
```

---

## 🔍 DÉPANNAGE

### Le client dit "Licence invalide"
- ❌ Vérifier qu'il a bien copié toute la licence (aucun espace manquant)
- ❌ Vérifier que le fichier s'appelle exactement `license.key`
- ❌ Vérifier que le fichier est dans `backend\.license\license.key`

### Le client dit "Machine ID ne correspond pas"
- ❌ Il a changé d'ordinateur → Générer une nouvelle licence
- ❌ Il a copié l'application sur un autre PC → Générer une nouvelle licence

### Comment prolonger une licence ?
- ✅ Demandez au client son Machine ID actuel
- ✅ Générez une nouvelle licence avec une durée plus longue
- ✅ Le client remplace l'ancienne licence par la nouvelle
