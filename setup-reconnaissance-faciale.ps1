# Configuration de la Reconnaissance Faciale Windows Hello
# HP EliteBook 840 G6
# Exécuter en tant qu'Administrateur

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION RECONNAISSANCE FACIALE" -ForegroundColor Cyan
Write-Host "  Windows Hello - HP EliteBook 840 G6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les privilèges admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠ Ce script nécessite les privilèges Administrateur!" -ForegroundColor Red
    Write-Host "Redémarrage avec privilèges admin..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $MyInvocation.MyCommand.Path
    exit
}

Write-Host "✓ Exécution avec privilèges Administrateur" -ForegroundColor Green
Write-Host ""

# Étape 1: Vérifier la caméra
Write-Host "[1/8] Vérification de la caméra..." -ForegroundColor Yellow
$cameras = Get-PnpDevice | Where-Object {
    $_.Class -eq 'Camera' -or 
    $_.Class -eq 'Image' -or
    $_.FriendlyName -like "*camera*" -or
    $_.FriendlyName -like "*webcam*" -or
    $_.FriendlyName -like "*IR*"
}

if ($cameras) {
    Write-Host "  ✓ Caméra(s) détectée(s):" -ForegroundColor Green
    $cameras | ForEach-Object {
        $color = if($_.Status -eq 'OK'){'Green'}else{'Yellow'}
        Write-Host "    - $($_.FriendlyName) [$($_.Status)]" -ForegroundColor $color
    }
    
    # Activer les caméras désactivées
    foreach ($cam in $cameras) {
        if ($cam.Status -ne 'OK') {
            try {
                Enable-PnpDevice -InstanceId $cam.InstanceId -Confirm:$false
                Write-Host "    ✓ Caméra activée: $($cam.FriendlyName)" -ForegroundColor Green
            } catch {
                Write-Host "    ✗ Échec activation: $($cam.FriendlyName)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "  ✗ Aucune caméra détectée!" -ForegroundColor Red
    Write-Host "    → Vérifiez le Gestionnaire de périphériques" -ForegroundColor Yellow
}
Start-Sleep 2

# Étape 2: Vérifier caméra IR (infrarouge pour reconnaissance faciale)
Write-Host "`n[2/8] Recherche de caméra infrarouge (IR)..." -ForegroundColor Yellow
$irCameras = $cameras | Where-Object { $_.FriendlyName -like "*IR*" -or $_.FriendlyName -like "*infrared*" }

if ($irCameras) {
    Write-Host "  ✓ Caméra IR détectée - Compatible Windows Hello Face!" -ForegroundColor Green
    $irCameras | ForEach-Object {
        Write-Host "    - $($_.FriendlyName)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ⚠ Pas de caméra IR détectée" -ForegroundColor Yellow
    Write-Host "    → La reconnaissance faciale nécessite une caméra IR" -ForegroundColor Yellow
    Write-Host "    → Votre HP EliteBook 840 G6 peut avoir une caméra IR intégrée" -ForegroundColor Cyan
}
Start-Sleep 2

# Étape 3: Démarrer le service Windows Hello
Write-Host "`n[3/8] Configuration du service Windows Hello..." -ForegroundColor Yellow
$services = @("WbioSrvc", "FrameServer")
foreach ($svc in $services) {
    try {
        $service = Get-Service -Name $svc -ErrorAction SilentlyContinue
        if ($service) {
            Set-Service -Name $svc -StartupType Automatic
            Start-Service -Name $svc -ErrorAction SilentlyContinue
            Write-Host "  ✓ Service $svc démarré" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠ Service $svc: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Start-Sleep 2

# Étape 4: Vérifier les pilotes de caméra
Write-Host "`n[4/8] Vérification des pilotes de caméra..." -ForegroundColor Yellow
$cameraDrivers = Get-WmiObject Win32_PnPSignedDriver | Where-Object {
    $_.DeviceClass -eq 'Camera' -or $_.DeviceClass -eq 'Image'
}

if ($cameraDrivers) {
    Write-Host "  ✓ Pilotes installés:" -ForegroundColor Green
    $cameraDrivers | Select-Object -First 3 | ForEach-Object {
        Write-Host "    - $($_.DeviceName)" -ForegroundColor Cyan
        Write-Host "      Version: $($_.DriverVersion) | Date: $($_.DriverDate)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠ Aucun pilote de caméra trouvé" -ForegroundColor Yellow
}
Start-Sleep 2

# Étape 5: Vérifier la confidentialité de la caméra
Write-Host "`n[5/8] Vérification des paramètres de confidentialité..." -ForegroundColor Yellow
$privacyKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam"
if (Test-Path $privacyKey) {
    $value = Get-ItemProperty -Path $privacyKey -Name "Value" -ErrorAction SilentlyContinue
    if ($value.Value -eq "Allow") {
        Write-Host "  ✓ Accès caméra autorisé" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Accès caméra peut être limité" -ForegroundColor Yellow
        Write-Host "    → Vérifiez Paramètres > Confidentialité > Caméra" -ForegroundColor Cyan
    }
}

# Étape 6: Activer Windows Hello
Write-Host "`n[6/8] Activation de Windows Hello..." -ForegroundColor Yellow
$helloKeys = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\LogonUI\BiometricProvider",
    "HKLM:\SOFTWARE\Policies\Microsoft\Biometrics"
)

foreach ($key in $helloKeys) {
    if (Test-Path $key) {
        Write-Host "  ✓ Clé de registre Windows Hello présente" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Clé manquante: $key" -ForegroundColor Yellow
    }
}

# Étape 7: Tester l'accès à la caméra
Write-Host "`n[7/8] Test d'accès à la caméra..." -ForegroundColor Yellow
try {
    $cameraTest = Get-PnpDevice -Class Camera | Where-Object {$_.Status -eq 'OK'}
    if ($cameraTest) {
        Write-Host "  ✓ Caméra accessible et fonctionnelle" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Aucune caméra fonctionnelle" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Erreur test caméra" -ForegroundColor Red
}

# Étape 8: Résultats et instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RÉSULTATS DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$hasCamera = $cameras -and ($cameras | Where-Object {$_.Status -eq 'OK'})
$hasIR = $irCameras -ne $null
$servicesOK = (Get-Service WbioSrvc).Status -eq 'Running'

Write-Host "Caméra détectée: $(if($hasCamera){'✓ OUI'}else{'✗ NON'})" -ForegroundColor $(if($hasCamera){'Green'}else{'Red'})
Write-Host "Caméra IR (pour Face): $(if($hasIR){'✓ OUI'}else{'⚠ INCERTAIN'})" -ForegroundColor $(if($hasIR){'Green'}else{'Yellow'})
Write-Host "Services actifs: $(if($servicesOK){'✓ OUI'}else{'✗ NON'})" -ForegroundColor $(if($servicesOK){'Green'}else{'Red'})

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($hasCamera) {
    Write-Host "`n✓ Votre caméra est détectée!" -ForegroundColor Green
    Write-Host "`nÉtapes pour configurer la reconnaissance faciale:" -ForegroundColor Cyan
    Write-Host "1. Ouvrir Paramètres > Comptes > Options de connexion" -ForegroundColor Yellow
    Write-Host "2. D'abord configurer un CODE PIN (obligatoire)" -ForegroundColor Yellow
    Write-Host "3. Ensuite chercher 'Reconnaissance faciale Windows Hello'" -ForegroundColor Yellow
    Write-Host "4. Cliquer sur 'Configurer' et suivre les instructions" -ForegroundColor Yellow
    
    if (-not $hasIR) {
        Write-Host "`n⚠ ATTENTION:" -ForegroundColor Yellow
        Write-Host "La reconnaissance faciale fonctionne mieux avec une caméra IR" -ForegroundColor Yellow
        Write-Host "Si l'option n'apparaît pas, votre caméra peut ne pas être compatible" -ForegroundColor Yellow
    }
    
    Write-Host "`nOuverture des Options de connexion..." -ForegroundColor Cyan
    Start-Sleep 2
    Start-Process ms-settings:signinoptions
    
} else {
    Write-Host "`n✗ Caméra non détectée ou non fonctionnelle" -ForegroundColor Red
    Write-Host "`nSolutions:" -ForegroundColor Yellow
    Write-Host "1. Vérifier le Gestionnaire de périphériques" -ForegroundColor Cyan
    Write-Host "2. Mettre à jour les pilotes de caméra depuis HP" -ForegroundColor Cyan
    Write-Host "3. Vérifier si la caméra est activée dans le BIOS (F10 au démarrage)" -ForegroundColor Cyan
    Write-Host "4. Télécharger les pilotes depuis:" -ForegroundColor Cyan
    Write-Host "   https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720" -ForegroundColor Gray
    
    Write-Host "`nOuverture du Gestionnaire de périphériques..." -ForegroundColor Cyan
    Start-Sleep 2
    Start-Process devmgmt.msc
}

# Informations supplémentaires
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INFORMATIONS SUPPLÉMENTAIRES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📷 HP EliteBook 840 G6 peut avoir:" -ForegroundColor Cyan
Write-Host "   - Caméra HD 720p standard" -ForegroundColor Gray
Write-Host "   - Caméra IR pour Windows Hello (selon config)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Si reconnaissance faciale non disponible:" -ForegroundColor Yellow
Write-Host "   → Utilisez le lecteur d'empreintes digitales à la place" -ForegroundColor Gray
Write-Host "   → Ou configurez un code PIN pour une connexion rapide" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
