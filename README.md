# 🏪 YOU CAISSE PRO

Application de caisse professionnelle complète avec gestion intelligente des rôles utilisateurs.

## 📋 Fonctionnalités

### 👤 Compte Administrateur
- Création et gestion des comptes utilisateurs
- Attribution des rôles (Admin, Caissier, Serveur)
- Modification et suppression des utilisateurs

### 💰 Compte Caissier
- Visualisation de toutes les commandes
- Modification et suppression des commandes
- Marquage des commandes comme payées
- **Visualisation du chiffre d'affaires journalier**
- Statistiques en temps réel

### 🍽️ Compte Serveur
- Saisie rapide des commandes
- Ajout d'articles avec nom, quantité et prix
- Raccourcis pour produits courants
- Envoi instantané au caissier

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed  # Initialiser la base de données avec des utilisateurs de test
npm run dev   # Démarrer le serveur (port 3001)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # Démarrer l'application (port 5173)
```

## 🔐 Comptes de test

Après avoir exécuté `npm run seed` dans le backend:

| Username | Mot de passe | Rôle | Permissions |
|----------|--------------|------|-------------|
| **admin** | admin123 | ADMIN | Gestion complète des utilisateurs |
| **caissier1** | caissier123 | CAISSIER | Gestion commandes + CA journalier |
| **serveur1** | serveur123 | SERVEUR | Création de commandes |

## 📱 Accès à l'application

1. **Backend API**: http://localhost:3001
2. **Frontend**: http://localhost:5173

### Connexion
1. Ouvrir http://localhost:5173
2. Se connecter avec un des comptes de test
3. Accéder au tableau de bord selon le rôle

## 🏗️ Architecture

```
YOU CAISSE PRO/
├── backend/                # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/        # Configuration base de données
│   │   ├── controllers/   # Logique métier
│   │   ├── middleware/    # Authentification JWT
│   │   ├── routes/        # Routes API
│   │   └── index.ts       # Point d'entrée
│   └── database.sqlite    # Base de données SQLite
│
├── frontend/              # Application React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Dashboards par rôle
│   │   ├── context/       # Gestion authentification
│   │   ├── pages/         # Login & Dashboard
│   │   └── services/      # Appels API
│   └── .env               # Configuration
│
└── shared/                # Types TypeScript partagés
    └── types.ts
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (Admin uniquement)

### Utilisateurs (Admin)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails utilisateur
- `PUT /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

### Commandes
- `POST /api/orders` - Créer commande (Serveur)
- `GET /api/orders` - Liste commandes (Caissier/Admin)
- `GET /api/orders/:id` - Détails commande
- `PUT /api/orders/:id` - Modifier commande (Caissier/Admin)
- `DELETE /api/orders/:id` - Supprimer commande (Caissier/Admin)
- `GET /api/orders/stats/daily-sales` - CA journalier (Caissier/Admin)

## 🛠️ Technologies

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- JWT pour l'authentification
- bcryptjs pour le hashage des mots de passe

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Axios
- Context API

## 📝 Utilisation

### Serveur
1. Se connecter avec `serveur1`
2. Ajouter des articles à la commande
3. Cliquer sur "Envoyer la commande"

### Caissier
1. Se connecter avec `caissier1`
2. Voir le CA journalier en haut de page
3. Cliquer sur "Voir" pour les détails d'une commande
4. "Marquer comme payée" pour encaisser
5. "Supprimer" pour annuler une commande

### Administrateur
1. Se connecter avec `admin`
2. Créer de nouveaux utilisateurs
3. Gérer les comptes existants

## 🔧 Personnalisation

### Ajouter des produits pré-définis
Modifier `frontend/src/components/ServeurDashboard.tsx` ligne 84:
```typescript
{ name: 'Votre produit', price: 25 }
```

### Changer le port du backend
Modifier `backend/.env`:
```
PORT=3001
```

### Changer l'URL de l'API
Modifier `frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## 📊 Base de données

SQLite avec 3 tables:
- **users**: Utilisateurs et leurs rôles
- **orders**: Commandes avec serveur et total
- **order_items**: Articles de chaque commande

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification par JWT
- Routes protégées par middleware
- Validation des rôles côté serveur

## 🚧 Développement futur

- [ ] Rapports de vente détaillés
- [ ] Gestion des catégories de produits
- [ ] Inventaire
- [ ] Impression de tickets
- [ ] Mode hors-ligne
- [ ] Application mobile

## 📄 Licence

MIT

## 👥 Support

Pour toute question ou problème, créer une issue sur le dépôt GitHub.

---

Développé avec ❤️ pour la gestion de caisse professionnelle
