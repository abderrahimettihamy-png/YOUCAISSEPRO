# Script pour creer un installateur .exe avec Inno Setup
Write-Host "Creation de l'installateur .exe..." -ForegroundColor Green

# Verifier si Inno Setup est installe
$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $innoSetupPath)) {
    Write-Host "Inno Setup n'est pas installe !" -ForegroundColor Red
    Write-Host "Telechargez et installez depuis : https://jrsoftware.org/isdl.php" -ForegroundColor Yellow
    
    # Proposer de telecharger
    $download = Read-Host "Voulez-vous telecharger Inno Setup maintenant? (o/n)"
    if ($download -eq "o") {
        Start-Process "https://jrsoftware.org/isdl.php"
    }
    pause
    exit
}

# Créer le fichier LICENSE.txt
$licenseContent = @'
MIT License

Copyright (c) 2024 YOU CAISSE PRO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
'@

$licenseContent | Out-File "LICENSE.txt" -Encoding UTF8
Write-Host "✓ LICENSE.txt créé" -ForegroundColor Yellow

# Créer le script Inno Setup
$innoScriptContent = @'
#define MyAppName "YOU CAISSE PRO"
#define MyAppVersion "1.0"
#define MyAppPublisher "YOU CAISSE"
#define MyAppURL "https://github.com/mrtihamy-crypto/YOUCAISSEPRO"
#define MyAppExeName "DEMARRER.bat"

[Setup]
AppId={{YC74E8F9-6A42-4D1B-B9C3-F8E2D5A7C3B1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE.txt
OutputDir=.
OutputBaseFilename=YOU-CAISSE-PRO-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "YOU-CAISSE-PRO-EXECUTABLE\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Arrêter {#MyAppName}"; Filename: "{app}\ARRETER.bat"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
'@

$innoScriptContent | Out-File "installer-script.iss" -Encoding UTF8
Write-Host "✓ Script Inno Setup créé : installer-script.iss" -ForegroundColor Yellow

# Compiler l'installateur
Write-Host "Compilation de l'installateur..." -ForegroundColor Yellow
& $innoSetupPath "installer-script.iss"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nInstallateur cree avec succes !" -ForegroundColor Green
    Write-Host "`nFichier : YOU-CAISSE-PRO-Setup.exe" -ForegroundColor Cyan
    
    if (Test-Path "YOU-CAISSE-PRO-Setup.exe") {
        $size = [math]::Round((Get-Item "YOU-CAISSE-PRO-Setup.exe").Length / 1MB, 2)
        Write-Host "Taille : $size MB" -ForegroundColor Yellow
        Write-Host "`nL'installateur peut maintenant etre distribue !" -ForegroundColor Green
    }
} else {
    Write-Host "`nErreur lors de la creation de l'installateur" -ForegroundColor Red
}

pause
