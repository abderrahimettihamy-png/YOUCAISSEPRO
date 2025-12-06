# HP EliteBook 840 G6 - Fingerprint Reader Fix Guide

## Quick Solutions (Try in order)

### Solution 1: Enable Biometric Service
```powershell
# Run as Administrator
Set-Service -Name "WbioSrvc" -StartupType Automatic
Start-Service -Name "WbioSrvc"
```

### Solution 2: Update Driver via Windows Update
```powershell
# Run Windows Update
Start-Process ms-settings:windowsupdate
```

### Solution 3: Reinstall Driver from Device Manager
1. Press Win + X → Device Manager
2. Look for "Biometric devices" or "Unknown devices"
3. Right-click → Uninstall device (check "Delete driver")
4. Restart computer
5. Windows will reinstall driver automatically

### Solution 4: Download HP Driver
**For HP EliteBook 840 G6:**
- Go to: https://support.hp.com/drivers
- Enter: HP EliteBook 840 G6
- Download: "Validity Fingerprint Sensor Driver" or "Synaptics Fingerprint Driver"
- Install and restart

### Solution 5: Check BIOS Settings
1. Restart laptop
2. Press F10 during boot (HP BIOS)
3. Go to: Security → Fingerprint Device
4. Ensure it's set to "Available" or "Enabled"
5. Save & Exit

### Solution 6: Reset Windows Hello
```powershell
# Run as Administrator
# Clear Windows Hello data
Remove-Item -Path "$env:WINDIR\System32\WinBioDatabase" -Recurse -Force -ErrorAction SilentlyContinue
Restart-Service WbioSrvc
```

### Solution 7: HP Support Assistant
```powershell
# Install HP Support Assistant if not already installed
Start-Process "https://support.hp.com/us-en/help/hp-support-assistant"
```

## Verification Steps

After trying solutions, verify with:
```powershell
# Check if fingerprint reader is detected
Get-PnpDevice -Class Biometric

# Check service status
Get-Service WbioSrvc

# Try Windows Hello setup
Start-Process ms-settings:signinoptions
```

## Common Issues & Fixes

### Issue: "No biometric devices found"
**Fix:** Driver missing - Download from HP website

### Issue: Device shows with yellow warning in Device Manager
**Fix:** Right-click → Update driver → Search automatically

### Issue: Windows Hello option greyed out
**Fix:** 
1. Ensure you have a PIN set up first
2. Go to Settings → Accounts → Sign-in options
3. Set up PIN, then fingerprint will appear

### Issue: Fingerprint works in BIOS but not Windows
**Fix:** Reinstall Validity/Synaptics driver for Windows

## Manual Driver Installation

If automatic installation fails:

1. Download driver from HP
2. Extract to folder
3. Device Manager → Biometric → Update Driver
4. Browse to extracted folder
5. Select .inf file
6. Restart

## Contact HP Support
If nothing works:
- HP Support: https://support.hp.com/contact
- Phone: Varies by region
- Include: Serial number from laptop bottom

## Check Warranty
EliteBook 840 G6 may still be under warranty - HP can replace faulty hardware for free.
