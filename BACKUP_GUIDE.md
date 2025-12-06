# YOU CAISSE PRO - Guide de Backup et Restauration

## 📦 Système de Backup Automatique

Ce projet inclut un système complet de sauvegarde et restauration de la base de données.

---

## 🚀 Installation Rapide

### 1. **Configurer le Backup Automatique** (Recommandé)

Exécutez PowerShell **en tant qu'administrateur** :

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
.\setup-auto-backup.ps1
```

✅ **Résultat** : Backup automatique tous les jours à 2h00 du matin + à chaque démarrage

---

## 📋 Utilisation Manuelle

### 2. **Créer un Backup Manuel**

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
.\backup-database.ps1
```

📁 **Emplacement** : `c:\Users\mrtih\Desktop\YOU CAISSE PRO\backups\`

---

### 3. **Restaurer un Backup**

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
.\restore-database.ps1
```

Le script affichera la liste des backups disponibles. Choisissez celui à restaurer.

⚠️ **Important** : Redémarrez le serveur backend après la restauration !

---

## 🔄 Backup du Code Source avec Git

### Installation de Git

1. Téléchargez Git : https://git-scm.com/download/win
2. Installez avec les options par défaut

### Initialiser Git dans le projet

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO"
git init
git add .
git commit -m "Premier commit - YOU CAISSE PRO"
```

### Créer un repository GitHub

1. Créez un compte sur https://github.com (gratuit)
2. Créez un nouveau repository "you-caisse-pro"
3. Liez votre projet :

```powershell
git remote add origin https://github.com/VOTRE_USERNAME/you-caisse-pro.git
git branch -M main
git push -u origin main
```

### Sauvegarder régulièrement

```powershell
git add .
git commit -m "Description des modifications"
git push
```

---

## 📊 Gestion des Backups

### Voir les backups disponibles

```powershell
Get-ChildItem "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backups" | Sort-Object LastWriteTime -Descending
```

### Supprimer les anciens backups (>30 jours)

Les backups de plus de 30 jours sont automatiquement supprimés lors de chaque nouveau backup.

---

## 💾 Backup sur Cloud (Optionnel)

### **Google Drive / OneDrive / Dropbox**

1. Installez l'application de synchronisation cloud
2. Déplacez le dossier `backups` dans votre dossier synchronisé
3. Créez un lien symbolique :

```powershell
# Exemple pour OneDrive
$source = "C:\Users\mrtih\OneDrive\YOU_CAISSE_BACKUPS"
$link = "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backups"
New-Item -ItemType SymbolicLink -Path $link -Target $source
```

---

## 🛡️ Recommandations de Sécurité

1. ✅ **Backup automatique quotidien** (base de données)
2. ✅ **Git + GitHub** (code source)
3. ✅ **Backup cloud** (double sécurité)
4. ✅ **Tester la restauration** régulièrement
5. ✅ **Garder au moins 7 jours de backups**

---

## 🚨 En cas de Perte de Données

### Restaurer la base de données :

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
.\restore-database.ps1
```

### Restaurer le code source (si Git configuré) :

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO"
git pull origin main
```

---

## ❓ Aide

Pour toute question sur les backups :
- Vérifiez les backups : `dir backups`
- Testez un backup : `.\backup-database.ps1`
- Restaurez : `.\restore-database.ps1`

**Contact** : 06 16 73 41 71
