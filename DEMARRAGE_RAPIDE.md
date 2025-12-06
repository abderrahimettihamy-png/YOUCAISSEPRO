# 🚀 YOU CAISSE PRO - Guide de Démarrage Rapide

## ⚡ Démarrage en 1 clic

### **Méthode 1 : Double-clic sur DEMARRER.bat** ✅ RECOMMANDÉ

1. Aller dans le dossier : `C:\Users\mrtih\Desktop\YOU CAISSE PRO\`
2. Double-cliquer sur **`DEMARRER.bat`**
3. Attendre 10 secondes
4. L'application s'ouvre automatiquement dans votre navigateur !

---

### **Méthode 2 : PowerShell**

Clic droit sur **`DEMARRER.ps1`** → **Exécuter avec PowerShell**

---

## 🔧 Démarrage Manuel (si besoin)

### **Terminal 1 - Backend** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
npm run dev
```
**Attendez** de voir : `🚀 Serveur démarré sur le port 3001`

### **Terminal 2 - Frontend** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\frontend"
npm run dev
```
**Attendez** de voir : `VITE ready`

### **Ouvrir l'application** :
```
http://localhost:5173
```

---

## 👤 Connexions

### **Caissiers** :
- `lhoucine` / `caissier123`
- `mustapha` / `caissier123`

### **Serveurs** :
- `bennacer` / `serveur123`
- `mourad` / `serveur123`
- `abderrazak` / `serveur123`

### **Administrateur** :
- `admin` / `admin123`

---

## 📱 Connexion depuis Tablettes

1. **Vérifier l'IP du PC** (affichée au démarrage) :
   ```
   Réseau: http://10.212.0.205:5173
   ```

2. **Sur la tablette** :
   - Connecter au même WiFi que le PC
   - Ouvrir Chrome
   - Aller sur l'adresse réseau affichée
   - Menu (⋮) → "Ajouter à l'écran d'accueil"

---

## ❌ Arrêter l'Application

**Option 1** : Fermer les fenêtres Backend et Frontend

**Option 2** : PowerShell
```powershell
Get-Process -Name node | Stop-Process -Force
```

---

## 🆘 Problèmes Courants

### **"Impossible de se connecter"**

✅ **Solution** : Redémarrer avec `DEMARRER.bat`

### **"Les commandes ne s'affichent pas"**

✅ **Solution** : 
1. Vérifier que les 2 serveurs sont démarrés
2. Rafraîchir la page (F5)

### **"Page blanche"**

✅ **Solution** : Vider le cache (Ctrl + Shift + R)

---

## 💾 Backup Quotidien

Le backup se fait automatiquement tous les jours à 2h du matin.

**Backup manuel** :
```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend"
.\backup-database.ps1
```

**Restaurer** :
```powershell
.\restore-database.ps1
```

---

## 📞 Support

**Téléphone** : 06 16 73 41 71

---

## ✅ Workflow Quotidien

1. **Matin** : Double-clic sur `DEMARRER.bat`
2. **Serveurs** : Se connectent sur tablettes et créent des commandes
3. **Caissiers** : Reçoivent et encaissent les commandes
4. **Soir** : Fermer les fenêtres Backend et Frontend
5. **Backup** : Automatique à 2h du matin

---

**Bon travail ! 🎉**
