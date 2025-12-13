# ========================================
# SCRIPT DE REDEPLOIEMENT COMPLET
# ========================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔥 REDEPLOIEMENT COMPLET GITHUB 🔥    ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# 1. SUPPRIMER L'ANCIEN REMOTE
Write-Host "📌 Étape 1/6 : Suppression de l'ancien remote..." -ForegroundColor Yellow
git remote remove origin 2>$null

# 2. RE-AJOUTER LE REMOTE
Write-Host "📌 Étape 2/6 : Ajout du nouveau remote..." -ForegroundColor Yellow
git remote add origin https://github.com/mrtihamy-crypto/YOUCAISSEPRO.git

# 3. VERIFIER LA BRANCHE MAIN
Write-Host "📌 Étape 3/6 : Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "⚠️  Vous êtes sur la branche '$currentBranch', passage sur 'main'..." -ForegroundColor Yellow
    git checkout -b main 2>$null
}

# 4. AJOUTER TOUS LES FICHIERS
Write-Host "📌 Étape 4/6 : Ajout de tous les fichiers..." -ForegroundColor Yellow
git add -A

# 5. COMMIT FINAL
Write-Host "📌 Étape 5/6 : Création du commit final..." -ForegroundColor Yellow
$commitMsg = "DEPLOY: Application complète avec URL hardcodée - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m "$commitMsg" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✓ Aucun changement à commiter (déjà fait)" -ForegroundColor Green
}

# 6. PUSH FORCE
Write-Host "📌 Étape 6/6 : Push FORCE vers GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  ATTENTION: Cela va ÉCRASER tout sur GitHub !" -ForegroundColor Red
$confirm = Read-Host "Taper 'OUI' pour continuer"

if ($confirm -eq "OUI") {
    Write-Host "`n🚀 PUSH EN COURS..." -ForegroundColor Cyan
    git push -f origin main
    
    Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  ✅ PUSH TERMINÉ AVEC SUCCÈS ! ✅        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
    Write-Host "`n1. Attendre 30 secondes que GitHub se synchronise" -ForegroundColor White
    Write-Host "2. Aller sur Render" -ForegroundColor White
    Write-Host "3. Manual Deploy > Clear build cache & deploy" -ForegroundColor White
    Write-Host "4. Attendre 3-5 minutes" -ForegroundColor White
    Write-Host "5. Tester l'application`n" -ForegroundColor White
    
    Write-Host "⏰ Ouverture de GitHub et Render dans 5 secondes..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    Start-Process "https://github.com/mrtihamy-crypto/YOUCAISSEPRO/commits/main"
    Start-Sleep -Seconds 2
    Start-Process "https://dashboard.render.com/web/srv-d4quvere5dus73evtve0"
    
} else {
    Write-Host "`n❌ Opération annulée." -ForegroundColor Red
}
