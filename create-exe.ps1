Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CREATION EXECUTABLE YOU CAISSE PRO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$distFolder = "YOU-CAISSE-PRO-EXE"

# Nettoyer le dossier de distribution
Write-Host "[1/6] Nettoyage..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $distFolder -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $distFolder | Out-Null

# Créer le backend executable
Write-Host "[2/6] Creation de l'executable Backend..." -ForegroundColor Yellow
Push-Location "backend"
npm run build
npx pkg dist/index.js --targets node18-win-x64 --output "../$distFolder/YOU-CAISSE-Backend.exe"
Pop-Location

# Copier la base de données et config
Write-Host "[3/6] Copie de la base de donnees..." -ForegroundColor Yellow
Copy-Item "backend/database.sqlite" "$distFolder/" -ErrorAction SilentlyContinue

# Build du frontend
Write-Host "[4/6] Build du frontend..." -ForegroundColor Yellow
Push-Location "frontend"
npm run build
Pop-Location

# Créer le serveur frontend standalone
Write-Host "[5/6] Creation du serveur frontend..." -ForegroundColor Yellow
Copy-Item -Recurse "frontend/dist" "$distFolder/frontend-dist"

# Créer un serveur Express standalone pour le frontend
$frontendServerCode = @"
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'frontend-dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

app.get('*', (req, res) => {
  if (req.path.includes('.')) {
    return res.status(404).send('File not found');
  }
  res.sendFile(path.join(__dirname, 'frontend-dist', 'index.html'));
});

const PORT = 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log('YOU CAISSE PRO Frontend: http://localhost:' + PORT);
});
"@
$frontendServerCode | Out-File "$distFolder/frontend-server.js" -Encoding UTF8

# Créer package.json pour le serveur frontend
$frontendPackageJson = @"
{
  "name": "you-caisse-frontend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
"@
$frontendPackageJson | Out-File "$distFolder/package.json" -Encoding UTF8

# Installer express et créer l'exe frontend
Push-Location $distFolder
npm install --production
npx pkg frontend-server.js --targets node18-win-x64 --output "YOU-CAISSE-Frontend.exe"
Remove-Item "package.json"
Remove-Item "package-lock.json"
Remove-Item -Recurse "node_modules"
Remove-Item "frontend-server.js"
Pop-Location

# Créer le lanceur principal
Write-Host "[6/6] Creation du lanceur..." -ForegroundColor Yellow

$launcherBat = @"
@echo off
title YOU CAISSE PRO
color 0A
cls
echo.
echo ================================================
echo          YOU CAISSE PRO - LANCEMENT
echo ================================================
echo.

REM Tuer les processus existants
taskkill /F /IM YOU-CAISSE-Backend.exe 2>nul
taskkill /F /IM YOU-CAISSE-Frontend.exe 2>nul
timeout /t 2 /nobreak >nul

REM Demarrer le Backend
echo [1/3] Demarrage du Backend...
start "" "%~dp0YOU-CAISSE-Backend.exe"
timeout /t 4 /nobreak >nul

REM Demarrer le Frontend
echo [2/3] Demarrage du Frontend...
start "" "%~dp0YOU-CAISSE-Frontend.exe"
timeout /t 3 /nobreak >nul

REM Ouvrir dans le navigateur
echo [3/3] Ouverture de l'application...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo      APPLICATION DEMARREE AVEC SUCCES !
echo ================================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   Pour arreter: Lancez ARRETER.bat
echo.
pause
"@
$launcherBat | Out-File "$distFolder/DEMARRER.bat" -Encoding ASCII

$stopperBat = @"
@echo off
title Arreter YOU CAISSE PRO
color 0C
echo.
echo ================================================
echo        ARRET DE YOU CAISSE PRO
echo ================================================
echo.
taskkill /F /IM YOU-CAISSE-Backend.exe 2>nul
taskkill /F /IM YOU-CAISSE-Frontend.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo   Application arretee avec succes !
echo.
pause
"@
$stopperBat | Out-File "$distFolder/ARRETER.bat" -Encoding ASCII

# Créer README
$readmeContent = @"
================================================================
    YOU CAISSE PRO - Application Executable Windows
================================================================

INSTALLATION
============

1. Decompressez ce dossier ou vous voulez
2. Double-cliquez sur DEMARRER.bat
3. L'application demarre automatiquement

FICHIERS
========

YOU-CAISSE-Backend.exe  : Serveur API (port 3001)
YOU-CAISSE-Frontend.exe : Interface Web (port 5173)
DEMARRER.bat           : Lance l'application
ARRETER.bat            : Arrete l'application
database.sqlite        : Base de donnees
frontend-dist/         : Fichiers de l'interface

CONNEXION
=========

Admin     : admin / admin123
Caissier  : caissier / caissier123
Serveur   : serveur / serveur123
Reception : reception / reception123

RESEAU (pour tablettes)
=======================

Sur les tablettes, ouvrez: http://[IP_DU_PC]:5173
Exemple: http://192.168.1.100:5173

NOTES
=====

- Aucune installation de Node.js requise
- Les .exe contiennent tout le necessaire
- Fonctionne sur Windows 7, 8, 10, 11
- Taille totale: ~100 MB

================================================================
"@
$readmeContent | Out-File "$distFolder/README.txt" -Encoding UTF8

# Compresser en ZIP
Write-Host ""
Write-Host "Creation du fichier ZIP..." -ForegroundColor Yellow
$zipFile = "YOU-CAISSE-PRO-EXECUTABLE-v1.0.zip"
Remove-Item $zipFile -ErrorAction SilentlyContinue
Compress-Archive -Path $distFolder -DestinationPath $zipFile -Force

$zipSize = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CREATION TERMINEE AVEC SUCCES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fichier ZIP: $zipFile" -ForegroundColor Cyan
Write-Host "Taille: $zipSize MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contenu:" -ForegroundColor Yellow
Write-Host "  - YOU-CAISSE-Backend.exe" -ForegroundColor White
Write-Host "  - YOU-CAISSE-Frontend.exe" -ForegroundColor White
Write-Host "  - DEMARRER.bat" -ForegroundColor White
Write-Host "  - ARRETER.bat" -ForegroundColor White
Write-Host "  - Base de donnees SQLite" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester:" -ForegroundColor Yellow
Write-Host "  1. Allez dans le dossier $distFolder" -ForegroundColor White
Write-Host "  2. Double-cliquez sur DEMARRER.bat" -ForegroundColor White
Write-Host ""
