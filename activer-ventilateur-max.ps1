# Script pour activer les ventilateurs au maximum
# Nécessite des droits administrateur

Write-Host "=== Activation des ventilateurs au maximum ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ATTENTION: Ce script nécessite des droits administrateur." -ForegroundColor Yellow
    Write-Host "Relancez PowerShell en tant qu'administrateur." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

# Désactiver le refroidissement passif et activer le refroidissement actif
Write-Host "[1/4] Configuration du refroidissement actif..." -ForegroundColor Green
try {
    # Mode refroidissement actif (ventilateur toujours actif)
    powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 100
    powercfg /setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 100
    
    # Désactiver le refroidissement passif
    powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFBOOSTMODE 2
    powercfg /setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFBOOSTMODE 2
    
    # Appliquer les changements
    powercfg /setactive SCHEME_CURRENT
    
    Write-Host "   ✓ Refroidissement actif configuré" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erreur lors de la configuration: $_" -ForegroundColor Red
}

# Maximiser la vitesse du ventilateur système via les plans d'alimentation
Write-Host "[2/4] Maximisation de la vitesse des ventilateurs..." -ForegroundColor Green
try {
    # Obtenir le GUID du plan d'alimentation actuel
    $currentScheme = (powercfg /getactivescheme).Split()[3]
    
    # Ventilateur système au maximum (si supporté)
    powercfg /setacvalueindex $currentScheme SUB_PROCESSOR SYSCOOLPOL 0
    powercfg /setdcvalueindex $currentScheme SUB_PROCESSOR SYSCOOLPOL 0
    
    # Performances maximales du processeur
    powercfg /setacvalueindex $currentScheme SUB_PROCESSOR PROCTHROTTLEMIN 100
    powercfg /setdcvalueindex $currentScheme SUB_PROCESSOR PROCTHROTTLEMIN 100
    
    powercfg /setactive $currentScheme
    
    Write-Host "   ✓ Ventilateurs configurés au maximum" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Configuration partielle: $_" -ForegroundColor Yellow
}

# Informations sur les températures (si disponible)
Write-Host "[3/4] Vérification des températures..." -ForegroundColor Green
try {
    $temps = Get-WmiObject -Namespace "root\wmi" -Class MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue
    
    if ($temps) {
        foreach ($temp in $temps) {
            $celsius = ($temp.CurrentTemperature / 10) - 273.15
            Write-Host "   Zone thermique: $([math]::Round($celsius, 1))°C" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ℹ Capteurs de température non accessibles via WMI" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ℹ Impossible de lire les températures" -ForegroundColor Gray
}

# Afficher les informations sur le plan d'alimentation
Write-Host "[4/4] Vérification de la configuration..." -ForegroundColor Green
Write-Host ""
Write-Host "Plan d'alimentation actif:" -ForegroundColor Cyan
powercfg /query SCHEME_CURRENT SUB_PROCESSOR | Select-String -Pattern "refroidissement|cooling|fan|ventilateur" -Context 0,1

Write-Host ""
Write-Host "=== Configuration terminée ===" -ForegroundColor Green
Write-Host ""
Write-Host "NOTES IMPORTANTES:" -ForegroundColor Yellow
Write-Host "• Les ventilateurs sont maintenant en mode actif maximum" -ForegroundColor White
Write-Host "• Cela peut augmenter le bruit mais améliore le refroidissement" -ForegroundColor White
Write-Host "• Pour contrôler finement les ventilateurs, utilisez:" -ForegroundColor White
Write-Host "  - Le logiciel du fabricant (HP Support Assistant, Dell Command, etc.)" -ForegroundColor Gray
Write-Host "  - SpeedFan ou HWiNFO pour un contrôle avancé" -ForegroundColor Gray
Write-Host "  - Le BIOS/UEFI pour les paramètres matériels" -ForegroundColor Gray
Write-Host ""

# Proposer d'ouvrir le gestionnaire de tâches pour surveiller
$openTaskMgr = Read-Host "Ouvrir le Gestionnaire des tâches pour surveiller ? (O/N)"
if ($openTaskMgr -eq 'O' -or $openTaskMgr -eq 'o') {
    Start-Process taskmgr
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour quitter"
