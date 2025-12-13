Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  REDEPLOIEMENT COMPLET GITHUB" -ForegroundColor Red
Write-Host "======================================`n" -ForegroundColor Cyan

# Étape 1
Write-Host "1/5 Suppression remote..." -ForegroundColor Yellow
git remote remove origin

# Étape 2
Write-Host "2/5 Ajout nouveau remote..." -ForegroundColor Yellow
git remote add origin https://github.com/mrtihamy-crypto/YOUCAISSEPRO.git

# Étape 3
Write-Host "3/5 Ajout fichiers..." -ForegroundColor Yellow
git add -A

# Étape 4
Write-Host "4/5 Commit..." -ForegroundColor Yellow
git commit -m "DEPLOY COMPLET - Application avec URL hardcodee"

# Étape 5
Write-Host "5/5 Push FORCE..." -ForegroundColor Yellow
Write-Host "`n ATTENTION: Push FORCE vers GitHub !" -ForegroundColor Red
$confirm = Read-Host "Taper OUI pour continuer"

if ($confirm -eq "OUI") {
    git push -f origin main
    Write-Host "`n SUCCES ! Push terminé !" -ForegroundColor Green
    Write-Host "`nAttendre 30 secondes puis:" -ForegroundColor Yellow
    Write-Host "1. Aller sur Render" -ForegroundColor White
    Write-Host "2. Manual Deploy > Clear build cache" -ForegroundColor White
    Start-Sleep -Seconds 5
    Start-Process "https://github.com/mrtihamy-crypto/YOUCAISSEPRO/commits/main"
    Start-Process "https://dashboard.render.com/web/srv-d4quvere5dus73evtve0"
} else {
    Write-Host "`nAnnule" -ForegroundColor Red
}
