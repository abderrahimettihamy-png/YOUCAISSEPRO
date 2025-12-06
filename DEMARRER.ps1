# YOU CAISSE PRO - Script de démarrage PowerShell
# Ce script démarre les serveurs backend et frontend dans des fenêtres séparées

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  YOU CAISSE PRO - Démarrage des serveurs" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Tuer tous les processus Node existants
Write-Host "[1/4] Nettoyage des processus Node..." -ForegroundColor Green
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Démarrer le backend dans une nouvelle fenêtre PowerShell
Write-Host "[2/4] Démarrage du Backend (API)..." -ForegroundColor Green
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Démarrer le frontend dans une nouvelle fenêtre PowerShell
Write-Host "[3/4] Démarrage du Frontend (Application)..." -ForegroundColor Green
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# Ouvrir dans le navigateur
Write-Host "[4/4] Ouverture dans le navigateur..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SERVEURS DÉMARRÉS AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Réseau:   http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*'} | Select-Object -First 1 -ExpandProperty IPAddress):5173" -ForegroundColor White
Write-Host ""
Write-Host "  IMPORTANT: Ne fermez pas les fenêtres Backend et Frontend !" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
