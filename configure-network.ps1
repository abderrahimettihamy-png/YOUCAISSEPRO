# Script de configuration réseau pour tablettes
# YOU CAISSE PRO

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  YOU CAISSE PRO - Configuration Réseau" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir l'adresse IP du PC
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*'
} | Select-Object -First 1).IPAddress

if (!$localIP) {
    Write-Host "❌ Impossible de trouver l'adresse IP locale" -ForegroundColor Red
    Write-Host "Assurez-vous d'être connecté à un réseau WiFi" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Adresse IP détectée: $localIP" -ForegroundColor Green
Write-Host ""

# Configurer le fichier .env
$envFile = Join-Path $PSScriptRoot "frontend\.env"
$apiUrl = "VITE_API_URL=http://${localIP}:3001/api"

Write-Host "📝 Configuration de l'API..." -ForegroundColor Cyan
Set-Content -Path $envFile -Value $apiUrl -Force

Write-Host "✅ Fichier .env mis à jour" -ForegroundColor Green
Write-Host ""

# Configurer le pare-feu
Write-Host "🛡️  Configuration du pare-feu Windows..." -ForegroundColor Cyan
Write-Host "(Cela peut demander des permissions administrateur)" -ForegroundColor Yellow
Write-Host ""

try {
    # Supprimer les anciennes règles si elles existent
    Remove-NetFirewallRule -DisplayName "YOU CAISSE Backend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "YOU CAISSE Frontend" -ErrorAction SilentlyContinue
    
    # Créer les nouvelles règles
    New-NetFirewallRule -DisplayName "YOU CAISSE Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "YOU CAISSE Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow | Out-Null
    
    Write-Host "✅ Pare-feu configuré" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Impossible de configurer le pare-feu" -ForegroundColor Yellow
    Write-Host "Exécutez ce script en tant qu'administrateur pour configurer le pare-feu" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION TERMINÉE !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Utilisez ces adresses sur vos tablettes:" -ForegroundColor White
Write-Host "   http://${localIP}:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "💻 Sur ce PC, utilisez:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Redémarrez les serveurs!" -ForegroundColor Red
Write-Host "   Double-cliquez sur DEMARRER.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
