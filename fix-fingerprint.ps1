# Script to diagnose and fix fingerprint reader issues
Write-Host "=== FINGERPRINT READER FIX ===" -ForegroundColor Cyan
Write-Host ""

# 1. Start Windows Biometric Service
Write-Host "Starting Windows Biometric Service..." -ForegroundColor Yellow
try {
    Set-Service -Name "WbioSrvc" -StartupType Automatic
    Start-Service -Name "WbioSrvc" -ErrorAction Stop
    Write-Host "✓ Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to start service: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 2. Check for biometric devices again
Write-Host "`nSearching for biometric devices..." -ForegroundColor Yellow
$devices = Get-PnpDevice | Where-Object {
    $_.Class -eq 'Biometric' -or 
    $_.FriendlyName -like "*finger*" -or 
    $_.FriendlyName -like "*biometric*" -or
    $_.FriendlyName -like "*validity*" -or
    $_.FriendlyName -like "*synaptics*"
}

if ($devices) {
    Write-Host "✓ Found biometric device(s):" -ForegroundColor Green
    $devices | Select-Object FriendlyName, Status | Format-Table
    
    # Try to enable disabled devices
    foreach ($device in $devices) {
        if ($device.Status -ne 'OK') {
            Write-Host "Attempting to enable: $($device.FriendlyName)..." -ForegroundColor Yellow
            try {
                Enable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false -ErrorAction Stop
                Write-Host "✓ Device enabled" -ForegroundColor Green
            } catch {
                Write-Host "✗ Failed to enable: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✗ No biometric devices found" -ForegroundColor Red
    Write-Host "`nPossible solutions:" -ForegroundColor Yellow
    Write-Host "1. Update fingerprint reader driver from Device Manager"
    Write-Host "2. Check BIOS settings - ensure fingerprint reader is enabled"
    Write-Host "3. Download driver from laptop manufacturer's website"
    Write-Host "4. Run Windows Update to get latest drivers"
}

# 3. Check Windows Hello configuration
Write-Host "`nChecking Windows Hello..." -ForegroundColor Yellow
$helloPath = "HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceLock"
if (Test-Path $helloPath) {
    Write-Host "✓ Windows Hello policy exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Windows Hello may need configuration" -ForegroundColor Yellow
}

Write-Host "`n=== RECOMMENDATIONS ===" -ForegroundColor Cyan
Write-Host "1. Go to Settings > Accounts > Sign-in options"
Write-Host "2. Look for 'Fingerprint recognition (Windows Hello)'"
Write-Host "3. If not available, update your fingerprint driver"
Write-Host "4. Check Device Manager for any devices with yellow warning icons"
Write-Host ""
Write-Host "Press any key to open Device Manager..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process devmgmt.msc
