# Téléchargement automatique du pilote Validity/Synaptics
# HP EliteBook 840 G6

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TÉLÉCHARGEMENT PILOTE EMPREINTES" -ForegroundColor Cyan
Write-Host "  HP EliteBook 840 G6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer dossier de téléchargement
$downloadPath = "$env:USERPROFILE\Downloads\HP_Fingerprint_Driver"
if (!(Test-Path $downloadPath)) {
    New-Item -ItemType Directory -Path $downloadPath -Force | Out-Null
    Write-Host "✓ Dossier créé: $downloadPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Recherche du pilote pour HP EliteBook 840 G6..." -ForegroundColor Yellow
Write-Host ""

# URLs des pilotes Validity/Synaptics pour HP EliteBook 840 G6
$drivers = @(
    @{
        Name = "Validity Fingerprint Sensor Driver (Windows 10/11)"
        Url = "https://ftp.hp.com/pub/softpaq/sp114001-114500/sp114301.exe"
        FileName = "sp114301.exe"
        Description = "Pilote officiel HP Validity pour Windows 10/11"
    },
    @{
        Name = "Synaptics Fingerprint Driver (Alternative)"
        Url = "https://ftp.hp.com/pub/softpaq/sp113501-114000/sp113815.exe"
        FileName = "sp113815.exe"
        Description = "Pilote Synaptics alternatif"
    }
)

Write-Host "Pilotes disponibles:" -ForegroundColor Cyan
for ($i = 0; $i -lt $drivers.Count; $i++) {
    Write-Host "  [$($i+1)] $($drivers[$i].Name)" -ForegroundColor Yellow
    Write-Host "      $($drivers[$i].Description)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Sélectionnez le pilote à télécharger (1 ou 2), ou appuyez sur Entrée pour le pilote 1: " -ForegroundColor Cyan -NoNewline
$choice = Read-Host

if ([string]::IsNullOrWhiteSpace($choice)) {
    $choice = "1"
}

$selectedDriver = $drivers[[int]$choice - 1]

if (!$selectedDriver) {
    Write-Host "✗ Choix invalide!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📥 Téléchargement: $($selectedDriver.Name)" -ForegroundColor Yellow
Write-Host ""

$destinationFile = Join-Path $downloadPath $selectedDriver.FileName

try {
    # Téléchargement avec barre de progression
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $selectedDriver.Url -OutFile $destinationFile -ErrorAction Stop
    $ProgressPreference = 'Continue'
    
    Write-Host "✓ Téléchargement réussi!" -ForegroundColor Green
    Write-Host "  Fichier: $destinationFile" -ForegroundColor Cyan
    
    # Vérifier la taille du fichier
    $fileSize = (Get-Item $destinationFile).Length / 1MB
    Write-Host "  Taille: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Erreur de téléchargement: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📌 Solution alternative:" -ForegroundColor Yellow
    Write-Host "1. Allez sur: https://support.hp.com/us-en/drivers" -ForegroundColor Cyan
    Write-Host "2. Tapez: HP EliteBook 840 G6" -ForegroundColor Cyan
    Write-Host "3. Téléchargez: 'Validity Fingerprint Sensor Driver'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ouverture de la page HP..." -ForegroundColor Yellow
    Start-Sleep 2
    Start-Process "https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720"
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Voulez-vous installer le pilote maintenant? (O/N): " -ForegroundColor Yellow -NoNewline
$install = Read-Host

if ($install -eq "O" -or $install -eq "o" -or $install -eq "Y" -or $install -eq "y") {
    Write-Host ""
    Write-Host "🚀 Lancement de l'installation..." -ForegroundColor Green
    Write-Host ""
    Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Suivez l'assistant d'installation" -ForegroundColor Yellow
    Write-Host "2. Acceptez les conditions" -ForegroundColor Yellow
    Write-Host "3. Redémarrez votre ordinateur si demandé" -ForegroundColor Yellow
    Write-Host "4. Après redémarrage, configurez Windows Hello" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep 3
    
    try {
        Start-Process -FilePath $destinationFile -Wait
        
        Write-Host ""
        Write-Host "✓ Installation terminée!" -ForegroundColor Green
        Write-Host ""
        Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Cyan
        Write-Host "1. Redémarrez votre PC" -ForegroundColor Yellow
        Write-Host "2. Ouvrez Paramètres > Comptes > Options de connexion" -ForegroundColor Yellow
        Write-Host "3. Configurez 'Empreinte digitale Windows Hello'" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "Voulez-vous redémarrer maintenant? (O/N): " -ForegroundColor Yellow -NoNewline
        $restart = Read-Host
        
        if ($restart -eq "O" -or $restart -eq "o" -or $restart -eq "Y" -or $restart -eq "y") {
            Write-Host ""
            Write-Host "🔄 Redémarrage dans 10 secondes..." -ForegroundColor Yellow
            Write-Host "   (Appuyez sur Ctrl+C pour annuler)" -ForegroundColor Gray
            Start-Sleep 10
            Restart-Computer -Force
        } else {
            Write-Host ""
            Write-Host "⚠ N'oubliez pas de redémarrer plus tard!" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "✗ Erreur installation: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Installation manuelle:" -ForegroundColor Yellow
        Write-Host "Double-cliquez sur: $destinationFile" -ForegroundColor Cyan
        Start-Process explorer -ArgumentList "/select,`"$destinationFile`""
    }
} else {
    Write-Host ""
    Write-Host "📁 Fichier sauvegardé dans: $downloadPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour installer plus tard:" -ForegroundColor Yellow
    Write-Host "Double-cliquez sur: $($selectedDriver.FileName)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ouverture du dossier..." -ForegroundColor Green
    Start-Sleep 2
    Start-Process explorer -ArgumentList $downloadPath
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
