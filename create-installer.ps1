# Script pour créer un installateur .exe avec Inno Setup
# Prérequis : Installer Inno Setup depuis https://jrsoftware.org/isdl.php

Write-Host "🔧 Création de l'installateur .exe..." -ForegroundColor Green

# Vérifier si Inno Setup est installé
$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $innoSetupPath)) {
    Write-Host "❌ Inno Setup n'est pas installé !" -ForegroundColor Red
    Write-Host "Téléchargez et installez depuis : https://jrsoftware.org/isdl.php" -ForegroundColor Yellow
    Write-Host "Puis relancez ce script." -ForegroundColor Yellow
    pause
    exit
}

# Créer le script Inno Setup
$innoScript = @"
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
Name: "{group}\Lire le README"; Filename: "{app}\README-INSTALLATION.txt"
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
"@

# Créer LICENSE.txt si n'existe pas
if (-not (Test-Path "LICENSE.txt")) {
    @"
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
"@ | Out-File "LICENSE.txt" -Encoding UTF8
}

# Sauvegarder le script Inno Setup
$innoScript | Out-File "installer-script.iss" -Encoding UTF8

Write-Host "✓ Script Inno Setup créé : installer-script.iss" -ForegroundColor Yellow

# Compiler l'installateur
Write-Host "Compilation de l'installateur..." -ForegroundColor Yellow
& $innoSetupPath "installer-script.iss"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Installateur créé avec succès !" -ForegroundColor Green
    Write-Host "`nFichier : YOU-CAISSE-PRO-Setup.exe" -ForegroundColor Cyan
    
    if (Test-Path "YOU-CAISSE-PRO-Setup.exe") {
        $size = [math]::Round((Get-Item "YOU-CAISSE-PRO-Setup.exe").Length / 1MB, 2)
        Write-Host "Taille : $size MB" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Erreur lors de la création de l'installateur" -ForegroundColor Red
}
