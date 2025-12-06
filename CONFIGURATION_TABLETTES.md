# 🔧 Configuration pour Tablettes - YOU CAISSE PRO

## ❌ Problème : "Erreur de connexion" sur tablette

### Cause :
L'application est configurée pour `localhost` qui ne fonctionne que sur le PC principal.

---

## ✅ Solution : Configuration de l'IP Réseau

### **Étape 1 : Trouver l'IP du PC**

Ouvrez PowerShell et tapez :
```powershell
ipconfig
```

Cherchez "Adresse IPv4" dans la section WiFi :
```
Adresse IPv4. . . . . . . . . . . . . .: 192.168.1.100
```
**Notez cette adresse !**

---

### **Étape 2 : Configurer l'API**

1. **Ouvrez le fichier** : `frontend\.env`

2. **Remplacez** :
   ```
   VITE_API_URL=http://localhost:3001/api
   ```
   
   **Par** (avec VOTRE IP) :
   ```
   VITE_API_URL=http://192.168.1.100:3001/api
   ```

3. **Sauvegardez** le fichier

4. **Redémarrez** l'application : Double-clic sur `DEMARRER.bat`

---

### **Étape 3 : Tester**

#### **Sur le PC** :
- Aller sur : `http://localhost:5173`
- Se connecter → ✅ Doit fonctionner

#### **Sur la tablette** :
- Connecter au même WiFi que le PC
- Aller sur : `http://192.168.1.100:5173` (votre IP)
- Se connecter → ✅ Doit fonctionner

---

## 🔥 Script Automatique

J'ai créé un script qui fait tout automatiquement :

```powershell
cd "c:\Users\mrtih\Desktop\YOU CAISSE PRO"
.\configure-network.ps1
```

---

## 📋 Checklist de Dépannage

- [ ] PC et tablette sur le même WiFi
- [ ] L'IP dans `.env` correspond à l'IP du PC
- [ ] Les serveurs sont démarrés (`DEMARRER.bat`)
- [ ] Le pare-feu Windows autorise les ports 3001 et 5173
- [ ] La tablette peut accéder à `http://IP_PC:5173`

---

## 🛡️ Configuration du Pare-feu

Si la tablette ne peut toujours pas se connecter :

**Ouvrez PowerShell en administrateur** et exécutez :

```powershell
New-NetFirewallRule -DisplayName "YOU CAISSE Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "YOU CAISSE Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## ✅ Configuration Finale

Après configuration, vous aurez :

**Sur PC** :
- Backend : ✅ http://localhost:3001
- Frontend : ✅ http://localhost:5173

**Sur Tablettes** :
- Frontend : ✅ http://192.168.1.100:5173
- API : ✅ http://192.168.1.100:3001

---

**Contactez le 06 16 73 41 71 si problème persiste**
