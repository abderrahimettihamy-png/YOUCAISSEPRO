# Deep Fingerprint Reader Fix for HP EliteBook 840 G6
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEEP FINGERPRINT READER FIX TOOL" -ForegroundColor Cyan
Write-Host "  HP EliteBook 840 G6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠ This script must run as Administrator!" -ForegroundColor Red
    Write-Host "Restarting with admin privileges..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-File", $MyInvocation.MyCommand.Path
    exit
}

Write-Host "✓ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Step 1: Enable and start biometric service
Write-Host "[1/10] Starting Windows Biometric Service..." -ForegroundColor Yellow
try {
    Stop-Service -Name "WbioSrvc" -Force -ErrorAction SilentlyContinue
    Set-Service -Name "WbioSrvc" -StartupType Automatic
    Start-Service -Name "WbioSrvc"
    Write-Host "  ✓ Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep 2

# Step 2: Check for biometric devices
Write-Host "`n[2/10] Scanning for biometric devices..." -ForegroundColor Yellow
$bioDevices = Get-PnpDevice | Where-Object {
    $_.Class -eq 'Biometric' -or 
    $_.FriendlyName -like "*Validity*" -or 
    $_.FriendlyName -like "*Synaptics*" -or
    $_.FriendlyName -like "*fingerprint*" -or
    $_.FriendlyName -like "*Sensor*"
}

if ($bioDevices) {
    Write-Host "  ✓ Found device(s):" -ForegroundColor Green
    $bioDevices | ForEach-Object {
        Write-Host "    - $($_.FriendlyName) [$($_.Status)]" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ✗ No biometric devices detected" -ForegroundColor Red
}

# Step 3: Enable all disabled biometric devices
Write-Host "`n[3/10] Enabling disabled biometric devices..." -ForegroundColor Yellow
if ($bioDevices) {
    foreach ($device in $bioDevices) {
        if ($device.Status -ne 'OK') {
            try {
                Enable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
                Write-Host "  ✓ Enabled: $($device.FriendlyName)" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Failed to enable: $($device.FriendlyName)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "  ⚠ No devices to enable" -ForegroundColor Yellow
}
Start-Sleep 2

# Step 4: Scan for unknown devices (might be fingerprint reader)
Write-Host "`n[4/10] Checking for unknown devices..." -ForegroundColor Yellow
$unknownDevices = Get-PnpDevice | Where-Object { $_.Status -eq 'Unknown' -or $_.Problem -ne 0 }
if ($unknownDevices) {
    Write-Host "  ⚠ Found $($unknownDevices.Count) device(s) with issues:" -ForegroundColor Yellow
    $unknownDevices | Select-Object -First 5 | ForEach-Object {
        Write-Host "    - $($_.FriendlyName) [Problem: $($_.Problem)]" -ForegroundColor Yellow
    }
    Write-Host "  → These may need driver updates" -ForegroundColor Cyan
} else {
    Write-Host "  ✓ No unknown devices" -ForegroundColor Green
}

# Step 5: Clear Windows Hello cache
Write-Host "`n[5/10] Clearing Windows Hello cache..." -ForegroundColor Yellow
$bioPath = "$env:WINDIR\System32\WinBioDatabase"
if (Test-Path $bioPath) {
    try {
        Stop-Service -Name "WbioSrvc" -Force
        Remove-Item -Path "$bioPath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name "WbioSrvc"
        Write-Host "  ✓ Cache cleared" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to clear cache" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠ Cache directory not found" -ForegroundColor Yellow
}
Start-Sleep 2

# Step 6: Check registry settings
Write-Host "`n[6/10] Checking registry settings..." -ForegroundColor Yellow
$regPaths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\LogonUI\BiometricProvider",
    "HKLM:\SYSTEM\CurrentControlSet\Services\WbioSrvc"
)
foreach ($path in $regPaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ Registry key exists: $path" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing registry key: $path" -ForegroundColor Red
    }
}

# Step 7: Scan for driver updates via Windows Update
Write-Host "`n[7/10] Triggering Windows Update scan..." -ForegroundColor Yellow
try {
    $updateSession = New-Object -ComObject Microsoft.Update.Session
    $updateSearcher = $updateSession.CreateUpdateSearcher()
    Write-Host "  ⏳ Searching for driver updates (this may take a minute)..." -ForegroundColor Cyan
    $searchResult = $updateSearcher.Search("IsInstalled=0 and Type='Driver'")
    
    if ($searchResult.Updates.Count -gt 0) {
        Write-Host "  ✓ Found $($searchResult.Updates.Count) driver update(s) available" -ForegroundColor Green
        $fingerprintUpdates = $searchResult.Updates | Where-Object { 
            $_.Title -like "*Validity*" -or 
            $_.Title -like "*Synaptics*" -or 
            $_.Title -like "*fingerprint*" 
        }
        if ($fingerprintUpdates) {
            Write-Host "  🎯 Fingerprint-related updates found!" -ForegroundColor Green
            $fingerprintUpdates | ForEach-Object {
                Write-Host "    - $($_.Title)" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "  ⚠ No driver updates available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ Could not check Windows Update: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 8: Reset device drivers
Write-Host "`n[8/10] Resetting biometric device drivers..." -ForegroundColor Yellow
if ($bioDevices) {
    foreach ($device in $bioDevices) {
        try {
            Write-Host "  ⏳ Resetting: $($device.FriendlyName)..." -ForegroundColor Cyan
            Disable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false -ErrorAction SilentlyContinue
            Start-Sleep 2
            Enable-PnpDevice -InstanceId $device.InstanceId -Confirm:$false -ErrorAction SilentlyContinue
            Write-Host "  ✓ Reset complete" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Reset failed" -ForegroundColor Red
        }
    }
}

# Step 9: Check BIOS/UEFI settings hint
Write-Host "`n[9/10] Checking system information..." -ForegroundColor Yellow
$biosInfo = Get-WmiObject -Class Win32_BIOS
Write-Host "  BIOS Version: $($biosInfo.SMBIOSBIOSVersion)" -ForegroundColor Cyan
Write-Host "  Manufacturer: $($biosInfo.Manufacturer)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  💡 Reminder: Check BIOS settings (Press F10 during boot)" -ForegroundColor Yellow
Write-Host "     → Security > Fingerprint Device > Enable" -ForegroundColor Yellow

# Step 10: Final verification
Write-Host "`n[10/10] Final verification..." -ForegroundColor Yellow
$bioDevicesAfter = Get-PnpDevice -Class Biometric -ErrorAction SilentlyContinue
$serviceStatus = Get-Service -Name "WbioSrvc"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Biometric Service: $($serviceStatus.Status) [$($serviceStatus.StartType)]" -ForegroundColor $(if($serviceStatus.Status -eq 'Running'){'Green'}else{'Red'})
Write-Host "Devices Found: $(@($bioDevicesAfter).Count)" -ForegroundColor $(if($bioDevicesAfter){'Green'}else{'Red'})

if ($bioDevicesAfter) {
    Write-Host "`n✓ Device Status:" -ForegroundColor Green
    $bioDevicesAfter | ForEach-Object {
        $color = if($_.Status -eq 'OK'){'Green'}else{'Yellow'}
        Write-Host "  - $($_.FriendlyName): $($_.Status)" -ForegroundColor $color
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($bioDevicesAfter -and ($bioDevicesAfter | Where-Object {$_.Status -eq 'OK'})) {
    Write-Host "✓ Fingerprint reader detected and working!" -ForegroundColor Green
    Write-Host "`n1. Go to Settings > Accounts > Sign-in options" -ForegroundColor Cyan
    Write-Host "2. Set up Windows Hello PIN first (required)" -ForegroundColor Cyan
    Write-Host "3. Then set up Fingerprint recognition" -ForegroundColor Cyan
    Write-Host "`nOpening Sign-in options..." -ForegroundColor Yellow
    Start-Sleep 2
    Start-Process ms-settings:signinoptions
} else {
    Write-Host "⚠ Fingerprint reader not detected or not working" -ForegroundColor Yellow
    Write-Host "`nManual steps required:" -ForegroundColor Cyan
    Write-Host "1. Download driver from HP:" -ForegroundColor Yellow
    Write-Host "   https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720" -ForegroundColor Cyan
    Write-Host "`n2. Or check BIOS settings (F10 during boot):" -ForegroundColor Yellow
    Write-Host "   Security > Fingerprint Device > Enable" -ForegroundColor Cyan
    Write-Host "`n3. Or contact HP Support for hardware check" -ForegroundColor Yellow
    Write-Host "`nOpening HP Drivers page..." -ForegroundColor Yellow
    Start-Sleep 2
    Start-Process "https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
