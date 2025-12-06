Write-Host "Creation du package executable YOU CAISSE PRO..." -ForegroundColor Green

$distFolder = "YOU-CAISSE-PRO-EXECUTABLE"
Remove-Item -Recurse -Force $distFolder -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $distFolder | Out-Null

Write-Host "Dossier cree" -ForegroundColor Yellow

Write-Host "Copie du backend..." -ForegroundColor Yellow
Copy-Item -Recurse "backend" "$distFolder/backend"
Remove-Item -Recurse -Force "$distFolder/backend/node_modules/.cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$distFolder/backend/.license" -ErrorAction SilentlyContinue

Write-Host "Build du frontend..." -ForegroundColor Yellow
Push-Location "frontend"
npm run build
Pop-Location
Copy-Item -Recurse "frontend/dist" "$distFolder/frontend/dist"
Copy-Item "frontend/package.json" "$distFolder/frontend/"

# Creer un serveur simple pour le frontend
$frontendServer = @"
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend demarre sur http://localhost:' + PORT);
});
"@
$frontendServer | Out-File "$distFolder/frontend/server.js" -Encoding UTF8

# Creer package.json pour le serveur frontend
$frontendPackageJson = @"
{
  "name": "you-caisse-frontend-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
"@
$frontendPackageJson | Out-File "$distFolder/frontend/package.json" -Encoding UTF8 -Force

$frontendPackageJson | Out-File "$distFolder/frontend/package.json" -Encoding UTF8 -Force

Write-Host "Installation des dependances frontend..." -ForegroundColor Yellow
Push-Location "$distFolder/frontend"
npm install --production
Pop-Location

# Creer un nouveau DEMARRER.bat pour le package
$demarrerBat = @"
@echo off
title YOU CAISSE PRO - Demarrage
color 0A
echo.
echo ================================================
echo   YOU CAISSE PRO - Demarrage des serveurs
echo ================================================
echo.

REM Tuer tous les processus Node existants
echo [1/4] Nettoyage des processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Demarrer le backend dans une nouvelle fenetre
echo [2/4] Demarrage du Backend (API)...
start "YOU CAISSE - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 5 /nobreak >nul

REM Demarrer le frontend dans une nouvelle fenetre
echo [3/4] Demarrage du Frontend (Application)...
start "YOU CAISSE - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
timeout /t 3 /nobreak >nul

REM Ouvrir dans le navigateur
echo [4/4] Ouverture dans le navigateur...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo   SERVEURS DEMARRES AVEC SUCCES !
echo ================================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   IMPORTANT: Ne fermez pas les fenetres Backend et Frontend !
echo.
echo   Appuyez sur une touche pour fermer cette fenetre...
pause >nul
"@
$demarrerBat | Out-File "$distFolder/DEMARRER.bat" -Encoding ASCII

Copy-Item "GUIDE_LICENCES.md" "$distFolder/" -ErrorAction SilentlyContinue
Copy-Item "README.md" "$distFolder/" -ErrorAction SilentlyContinue

$arreterBat = @"
@echo off
title YOU CAISSE PRO - Arret
color 0C
echo.
echo ================================================
echo   Arret de YOU CAISSE PRO
echo ================================================
echo.
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq YOU CAISSE*" >nul 2>&1
echo   Serveurs arretes avec succes!
echo.
pause
"@
$arreterBat | Out-File "$distFolder/ARRETER.bat" -Encoding ASCII

$readme = @"
================================================================
    YOU CAISSE PRO - Application de Caisse Professionnelle
================================================================

INSTALLATION RAPIDE
===================

1. Decompressez ce dossier ou vous voulez
2. Double-cliquez sur DEMARRER.bat
3. L'application s'ouvre dans votre navigateur
4. Connectez-vous avec admin / admin123

UTILISATION
===========

DEMARRER.bat  : Lance l'application
ARRETER.bat   : Arrete les serveurs

IMPORTANT : Ne fermez pas les fenetres Backend et Frontend !

SUPPORT
=======

Email : support@youcaisse.pro

================================================================
"@
$readme | Out-File "$distFolder/README-INSTALLATION.txt" -Encoding UTF8

Write-Host "Package cree avec succes dans : $distFolder" -ForegroundColor Green

$zipFile = "YOU-CAISSE-PRO-v1.0.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }
Compress-Archive -Path $distFolder -DestinationPath $zipFile
Write-Host "Fichier ZIP cree : $zipFile" -ForegroundColor Green
$sizeInMB = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host "Taille : $sizeInMB MB" -ForegroundColor Yellow
