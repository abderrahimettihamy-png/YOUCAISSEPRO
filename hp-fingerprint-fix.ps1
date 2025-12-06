# HP EliteBook 840 G6 - Fingerprint Driver Fix

Write-Host "=== HP ELITEBOOK 840 G6 - FINGERPRINT FIX ===" -ForegroundColor Cyan
Write-Host ""

# Check for Synaptics WBF driver
Write-Host "Checking for Synaptics fingerprint driver..." -ForegroundColor Yellow
$wbfDriver = Get-PnpDevice | Where-Object {$_.FriendlyName -like "*WBF*" -or $_.FriendlyName -like "*Validity*"}

if ($wbfDriver) {
    Write-Host "Found: $($wbfDriver.FriendlyName) - Status: $($wbfDriver.Status)" -ForegroundColor Green
} else {
    Write-Host "Fingerprint driver not found!" -ForegroundColor Red
}

Write-Host "`n=== SOLUTION ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your HP EliteBook 840 G6 needs the Synaptics/Validity fingerprint driver." -ForegroundColor Yellow
Write-Host ""
Write-Host "Download options:" -ForegroundColor Green
Write-Host "1. HP Support Assistant (Recommended)"
Write-Host "2. HP Driver Download Page"
Write-Host "3. Windows Update"
Write-Host ""

$choice = Read-Host "Choose option (1/2/3) or press Enter to open HP Support"

switch ($choice) {
    "1" {
        Write-Host "Opening HP Support Assistant..." -ForegroundColor Green
        Start-Process "https://support.hp.com/us-en/help/hp-support-assistant"
    }
    "2" {
        Write-Host "Opening HP Driver page for EliteBook 840 G6..." -ForegroundColor Green
        Start-Process "https://support.hp.com/us-en/drivers/selfservice/hp-elitebook-840-g6-notebook-pc/24539378"
    }
    "3" {
        Write-Host "Opening Windows Update..." -ForegroundColor Green
        Start-Process "ms-settings:windowsupdate"
    }
    default {
        Write-Host "Opening HP Support..." -ForegroundColor Green
        Start-Process "https://support.hp.com/us-en/drivers/selfservice/hp-elitebook-840-g6-notebook-pc/24539378"
    }
}

Write-Host "`n=== MANUAL STEPS ===" -ForegroundColor Cyan
Write-Host "1. Download: 'Validity Fingerprint Sensor Driver' or 'Synaptics WBF Driver'"
Write-Host "2. Install the driver"
Write-Host "3. Restart your computer"
Write-Host "4. Go to Settings > Accounts > Sign-in options"
Write-Host "5. Set up Windows Hello Fingerprint"
Write-Host ""
