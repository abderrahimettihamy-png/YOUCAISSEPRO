# Script de Déploiement YOU CAISSE PRO sur Render
# Utilisation : .\deploy-render.ps1

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 DÉPLOIEMENT YOU CAISSE PRO SUR RENDER.COM          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Étape 1 : Vérifier Git
Write-Host "📍 Étape 1 : Vérification de Git..." -ForegroundColor Yellow
if (-not (git --version 2>&1)) {
    Write-Host "❌ Git n'est pas installé!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git est disponible`n" -ForegroundColor Green

# Étape 2 : Vérifier le dépôt Git
Write-Host "📍 Étape 2 : Vérification du dépôt GitHub..." -ForegroundColor Yellow
$remoteUrl = git config --get remote.origin.url 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Aucun dépôt Git trouvé!" -ForegroundColor Red
    Write-Host "   Veuillez d'abord initialiser Git avec : git init" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Dépôt trouvé : $remoteUrl`n" -ForegroundColor Green

# Étape 3 : Vérifier les changements
Write-Host "📍 Étape 3 : Vérification des changements..." -ForegroundColor Yellow
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "⚠️  Aucun changement à commiter!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Changements détectés :`n$status`n" -ForegroundColor Green
}

# Étape 4 : Ajouter les fichiers
Write-Host "📍 Étape 4 : Ajout des fichiers..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'ajout des fichiers!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichiers ajoutés`n" -ForegroundColor Green

# Étape 5 : Créer le commit
Write-Host "📍 Étape 5 : Création du commit..." -ForegroundColor Yellow
$commitMessage = "Deploy: Modifications heure input, affichage notes sur ticket"
git commit -m "$commitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Impossible de créer le commit (peut-être aucun changement nouveau)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit créé : $commitMessage`n" -ForegroundColor Green
}

# Étape 6 : Pousser vers GitHub
Write-Host "📍 Étape 6 : Envoi vers GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du push vers GitHub!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Code envoyé vers GitHub`n" -ForegroundColor Green

# Résumé
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ CODE PRÊT POUR RENDER.COM !                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🔗 Prochaines étapes :`n" -ForegroundColor Yellow
Write-Host "1. Allez sur https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Cliquez sur New + --> Blueprint" -ForegroundColor White
Write-Host "3. Connectez votre dépôt GitHub" -ForegroundColor White
Write-Host "4. Render détectera automatiquement render.yaml`n" -ForegroundColor White

Write-Host "📍 Render créera automatiquement :" -ForegroundColor Cyan
Write-Host "   ✅ Base de données PostgreSQL" -ForegroundColor Gray
Write-Host "   ✅ Backend API (Node.js)" -ForegroundColor Gray
Write-Host "   ✅ Frontend (React + Nginx)`n" -ForegroundColor Gray

Write-Host "⏱️  Temps de déploiement : 5-10 minutes`n" -ForegroundColor Yellow

Write-Host "📚 Documentation : GUIDE_DEPLOIEMENT_RENDER_FINAL.md`n" -ForegroundColor Cyan
