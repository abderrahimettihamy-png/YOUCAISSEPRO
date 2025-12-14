Write-Host "=== CREATION PACKAGE FINAL YOU CAISSE PRO ===" -ForegroundColor Cyan
Write-Host ""

$packageDir = "YOU-CAISSE-PRO-FINAL"

# Nettoyer
Write-Host "[1/5] Nettoyage..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $packageDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $packageDir | Out-Null

# Copier backend + shared
Write-Host "[2/5] Copie backend et shared..." -ForegroundColor Yellow
Copy-Item -Recurse "backend" "$packageDir/backend"
Copy-Item -Recurse "shared" "$packageDir/shared"

# Build frontend
Write-Host "[3/5] Build frontend..." -ForegroundColor Yellow
Push-Location "frontend"
npm run build 2>&1 | Out-Null
Pop-Location
Copy-Item -Recurse "frontend/dist" "$packageDir/frontend-dist"

# Creer serveur frontend
Write-Host "[4/5] Creation serveur frontend..." -ForegroundColor Yellow
$frontendServer = @'
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'frontend-dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-dist', 'index.html'));
});

const PORT = 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend: http://localhost:' + PORT);
});
'@

$frontendServer | Out-File "$packageDir\frontend-server.js" -Encoding UTF8

# Package.json pour le frontend
$frontendPackage = @'
{
  "name": "you-caisse-frontend-server",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
'@

$frontendPackage | Out-File "$packageDir\package.json" -Encoding UTF8

# Installer express
Write-Host "[5/5] Installation Express..." -ForegroundColor Yellow
Push-Location $packageDir
npm install --production 2>&1 | Out-Null
Pop-Location

# Scripts
$demarrerBat = @'
@echo off
title YOU CAISSE PRO
color 0A
cls
echo.
echo ================================================
echo          YOU CAISSE PRO - DEMARRAGE
echo ================================================
echo.

cd /d "%~dp0"

REM Arreter processus existants
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

REM Backend (necessite Node.js installe)
echo [1/2] Demarrage Backend...
start /B "" node backend\src\index.ts 2>&1 | npm --prefix backend run dev > backend.log 2>&1
timeout /t 5 /nobreak >nul

REM Frontend  
echo [2/2] Demarrage Frontend...
start /B "" node frontend-server.js > frontend.log 2>&1
timeout /t 3 /nobreak >nul

echo.
echo Ouverture...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo      APPLICATION DEMARREE !
echo ================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:10000
echo.
echo   Pour arreter: ARRETER.bat
echo.
pause
'@

$arreterBat = @'
@echo off
echo Arret YOU CAISSE PRO...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Arrete.
pause
'@

$readme = @'
================================================================
    YOU CAISSE PRO - PACKAGE FINAL
================================================================

PREREQUIS
=========

Node.js doit etre installe sur le PC
Telechargement: https://nodejs.org

INSTALLATION
============

1. Decompressez ce dossier
2. Double-cliquez DEMARRER.bat
3. Attendez 10 secondes
4. L'application s'ouvre

CONTENU
=======

- Backend complet avec node_modules
- Frontend build
- Base de donnees SQLite
- Dossier shared (types)

CONNEXION
=========

Admin:     admin / admin123
Caissier:  caissier / caissier123
Serveur:   serveur / serveur123
Reception: reception / reception123

TABLETTES
=========

Sur PC: ipconfig pour trouver IP
Sur tablette: http://IP:5173

================================================================
'@

$demarrerBat | Out-File "$packageDir\DEMARRER.bat" -Encoding ASCII
$arreterBat | Out-File "$packageDir\ARRETER.bat" -Encoding ASCII
$readme | Out-File "$packageDir\README.txt" -Encoding UTF8

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  PACKAGE CREE !" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dossier: $packageDir" -ForegroundColor Cyan

if (Test-Path $packageDir) {
    $size = [math]::Round((Get-ChildItem $packageDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    Write-Host "Taille: $size MB" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "NOTE: Node.js doit etre installe sur le PC cible" -ForegroundColor Yellow
Write-Host ""

$createZip = Read-Host "Creer ZIP? (o/n)"
if ($createZip -eq "o") {
    $zipName = "YOU-CAISSE-PRO-FINAL.zip"
    Remove-Item $zipName -ErrorAction SilentlyContinue
    Compress-Archive -Path "$packageDir\*" -DestinationPath $zipName -CompressionLevel Optimal
    
    if (Test-Path $zipName) {
        $zipSize = [math]::Round((Get-Item $zipName).Length / 1MB, 2)
        Write-Host "ZIP: $zipName ($zipSize MB)" -ForegroundColor Green
        Start-Process explorer.exe -ArgumentList "/select,`"$PWD\$zipName`""
    }
}

pause
