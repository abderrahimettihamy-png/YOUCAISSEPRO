# Test du Rapport Z - YOU CAISSE PRO

## ✅ Modifications effectuées

### Backend
1. **Database Schema** (`backend/src/config/database.ts`)
   - Ajout de 4 colonnes à la table `orders`:
     - `paymentMethod` (espece, carte, cheque)
     - `discount` (montant de la remise)
     - `discountType` (percentage ou amount)
     - `paidAmount` (montant payé)

2. **Controller** (`backend/src/controllers/orderController.ts`)
   - Modification de `update()`: accepte les données de paiement
   - Ajout de `getZReport()`: génère le rapport Z avec:
     - Liste des articles vendus (nom, quantité, total)
     - Résumé par mode de paiement
     - Totaux (ventes brutes, remises, net)

3. **Routes** (`backend/src/routes/orders.ts`)
   - Nouvelle route: `GET /api/orders/stats/z-report?date=YYYY-MM-DD`
   - Autorisé pour: CAISSIER et ADMIN

### Frontend
1. **API Service** (`frontend/src/services/api.ts`)
   - `orderService.update()`: signature étendue pour accepter les données de paiement
   - `orderService.getZReport(date)`: nouvelle méthode

2. **Caissier Dashboard** (`frontend/src/components/CaissierDashboard.tsx`)
   - Ajout du bouton "📊 Rapport Z" dans l'en-tête
   - Modification de `handlePayment()`: envoie les données de paiement au backend
   - Nouvelle fonction `loadZReport()`: charge le rapport
   - Nouvelle fonction `printZReport()`: imprime le rapport formaté
   - Nouvelle modal affichant:
     - Articles vendus avec quantités
     - Modes de paiement avec totaux
     - Statistiques générales (nombre de commandes, ventes brutes, remises, total net)

## 🧪 Procédure de test

### 1. Connexion et création de commandes (Serveur)
- Connectez-vous avec: `serveur1` / `serveur123`
- Créez plusieurs commandes avec différents articles
- Testez différentes chambres/passages

### 2. Traitement des paiements (Caissier)
- Connectez-vous avec: `caissier1` / `caissier123`
- Pour chaque commande en attente:
  - Sélectionnez la commande
  - Cliquez sur "💳 Payer"
  - **Testez différents modes de paiement:**
    - 💵 Espèce
    - 💳 Carte
    - 📝 Chèque
  - **Testez les remises:**
    - % (pourcentage)
    - MAD (montant fixe)
  - **Testez les paiements partiels** (montant < total)
  - Validez le paiement

### 3. Génération du Rapport Z
- Restez connecté en tant que caissier
- Cliquez sur le bouton "📊 Rapport Z" (en haut à droite)
- Le rapport s'affiche avec:
  - Date du jour
  - **Articles vendus**: liste complète avec quantités et totaux
  - **Modes de paiement**: 
    - Espèce: X MAD (Y commandes)
    - Carte: X MAD (Y commandes)
    - Chèque: X MAD (Y commandes)
  - **Totaux**:
    - Nombre de commandes
    - Ventes brutes
    - Remises accordées
    - TOTAL NET

### 4. Impression du Rapport Z
- Dans la modal du Rapport Z
- Cliquez sur "🖨️ Imprimer le Rapport Z"
- Une fenêtre d'impression s'ouvre avec un format adapté
- Le reçu est formaté pour imprimante thermique 80mm

## 📋 Points à vérifier

✅ Les paiements sont bien enregistrés avec le mode de paiement correct
✅ Les remises sont correctement calculées et enregistrées
✅ Les paiements partiels sont gérés (reste à payer affiché)
✅ Le Rapport Z affiche toutes les commandes payées du jour
✅ Les articles sont bien regroupés par nom avec les bonnes quantités
✅ Les totaux par mode de paiement sont corrects
✅ Le total général = ventes brutes - remises
✅ L'impression est bien formatée

## 🔧 Identifiants de test

- **Admin**: `admin` / `admin123`
- **Caissier**: `caissier1` / `caissier123`
- **Serveur**: `serveur1` / `serveur123`

## 🌐 URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Endpoint Rapport Z: http://localhost:3001/api/orders/stats/z-report

## 🐛 Dépannage

Si le Rapport Z ne fonctionne pas:
1. Vérifiez que la base de données a été recréée (colonnes de paiement présentes)
2. Vérifiez que le backend redémarre sans erreur
3. Ouvrez la console du navigateur pour voir les erreurs
4. Testez l'endpoint directement: `GET http://localhost:3001/api/orders/stats/z-report`

## 📝 Notes

- Le Rapport Z affiche par défaut les commandes du jour
- Les commandes doivent avoir le statut "payee" pour apparaître
- Les données de paiement sont enregistrées lors du paiement
- La base de données a été réinitialisée, toutes les anciennes commandes ont été supprimées
