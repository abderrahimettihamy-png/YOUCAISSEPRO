# YOU CAISSE PRO - Application de Caisse Professionnelle

## Architecture
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Base de données: SQLite (développement) / PostgreSQL (production)
- Authentification: JWT

## Rôles Utilisateurs
1. **Administrateur**: Gestion des comptes utilisateurs
2. **Caissier**: Modification/suppression commandes, paiement, visualisation CA journalier
3. **Serveur**: Saisie et envoi des commandes

## Structure du Projet
- `/backend` - API REST Node.js
- `/frontend` - Interface React
- `/shared` - Types TypeScript partagés
