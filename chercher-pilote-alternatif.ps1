# Sources alternatives pour télécharger le pilote d'empreintes
# HP EliteBook 840 G6 - Validity/Synaptics Fingerprint

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SOURCES ALTERNATIVES PILOTE" -ForegroundColor Cyan
Write-Host "  HP EliteBook 840 G6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sources = @(
    @{
        Nom = "Site officiel HP (Recommandé)"
        URL = "https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720"
        Description = "Drivers officiels HP - Source la plus sûre"
    },
    @{
        Nom = "HP FTP Direct Download 1"
        URL = "https://ftp.hp.com/pub/softpaq/sp114001-114500/sp114301.exe"
        Description = "Validity Fingerprint Sensor Driver - Windows 10/11"
    },
    @{
        Nom = "HP FTP Direct Download 2"
        URL = "https://ftp.hp.com/pub/softpaq/sp113501-114000/sp113815.exe"
        Description = "Alternative Synaptics Driver"
    },
    @{
        Nom = "HP FTP Direct Download 3"
        URL = "https://ftp.hp.com/pub/softpaq/sp115001-115500/sp115123.exe"
        Description = "Version plus récente (2024)"
    },
    @{
        Nom = "DriverPack Solution"
        URL = "https://driverpack.io/en/devices/biometric"
        Description = "Base de données de drivers (gratuit)"
    },
    @{
        Nom = "Validity Sensors Site"
        URL = "https://www.validitysensors.com/drivers"
        Description = "Site officiel Validity (fabricant du lecteur)"
    },
    @{
        Nom = "Synaptics Site"
        URL = "https://www.synaptics.com/products/fingerprint-sensors"
        Description = "Site officiel Synaptics"
    }
)

Write-Host "SOURCES DISPONIBLES:" -ForegroundColor Yellow
Write-Host ""

for ($i = 0; $i -lt $sources.Count; $i++) {
    Write-Host "[$($i+1)] $($sources[$i].Nom)" -ForegroundColor Cyan
    Write-Host "    URL: $($sources[$i].URL)" -ForegroundColor Gray
    Write-Host "    Info: $($sources[$i].Description)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Sélectionnez une source (1-$($sources.Count)) ou 0 pour tout essayer: " -ForegroundColor Green -NoNewline
$choix = Read-Host

if ($choix -eq "0") {
    Write-Host "`nTentative de téléchargement sur toutes les sources..." -ForegroundColor Yellow
    Write-Host ""
    
    $downloadPath = "$env:USERPROFILE\Downloads"
    $success = $false
    
    foreach ($source in $sources) {
        if ($source.URL -like "*.exe") {
            Write-Host "Essai: $($source.Nom)..." -ForegroundColor Cyan
            try {
                $fileName = Split-Path $source.URL -Leaf
                $output = Join-Path $downloadPath $fileName
                
                $ProgressPreference = 'SilentlyContinue'
                Invoke-WebRequest -Uri $source.URL -OutFile $output -TimeoutSec 30 -ErrorAction Stop
                $ProgressPreference = 'Continue'
                
                $size = [math]::Round((Get-Item $output).Length/1MB, 2)
                Write-Host "  ✓ Téléchargement réussi! ($size MB)" -ForegroundColor Green
                Write-Host "  Fichier: $output" -ForegroundColor Cyan
                $success = $true
                break
            } catch {
                Write-Host "  ✗ Échec: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    if ($success) {
        Write-Host "`n✓ Pilote téléchargé avec succès!" -ForegroundColor Green
        Write-Host "`nVoulez-vous installer maintenant? (O/N): " -ForegroundColor Yellow -NoNewline
        $install = Read-Host
        if ($install -eq "O" -or $install -eq "o") {
            Start-Process -FilePath $output
        } else {
            Start-Process explorer -ArgumentList "/select,`"$output`""
        }
    } else {
        Write-Host "`n⚠ Échec sur toutes les sources automatiques" -ForegroundColor Yellow
        Write-Host "Ouverture du site officiel HP..." -ForegroundColor Cyan
        Start-Process $sources[0].URL
    }
    
} elseif ([int]$choix -ge 1 -and [int]$choix -le $sources.Count) {
    $selected = $sources[[int]$choix - 1]
    Write-Host "`nSource sélectionnée: $($selected.Nom)" -ForegroundColor Green
    
    if ($selected.URL -like "*.exe") {
        Write-Host "Téléchargement en cours..." -ForegroundColor Yellow
        try {
            $fileName = Split-Path $selected.URL -Leaf
            $output = Join-Path "$env:USERPROFILE\Downloads" $fileName
            
            $ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri $selected.URL -OutFile $output -ErrorAction Stop
            $ProgressPreference = 'Continue'
            
            $size = [math]::Round((Get-Item $output).Length/1MB, 2)
            Write-Host "`n✓ Téléchargement réussi! ($size MB)" -ForegroundColor Green
            Write-Host "Fichier: $output" -ForegroundColor Cyan
            
            Write-Host "`nVoulez-vous installer maintenant? (O/N): " -ForegroundColor Yellow -NoNewline
            $install = Read-Host
            if ($install -eq "O" -or $install -eq "o") {
                Start-Process -FilePath $output
            } else {
                Start-Process explorer -ArgumentList "/select,`"$output`""
            }
        } catch {
            Write-Host "`n✗ Erreur de téléchargement: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Ouverture de la page web..." -ForegroundColor Yellow
            Start-Process $selected.URL
        }
    } else {
        Write-Host "`nOuverture du site web..." -ForegroundColor Cyan
        Start-Process $selected.URL
    }
} else {
    Write-Host "`n✗ Choix invalide" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
