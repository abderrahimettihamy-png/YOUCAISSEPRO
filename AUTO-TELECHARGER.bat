@echo off
title Telechargement Automatique Pilote Empreintes
color 0A
echo ========================================
echo   TELECHARGEMENT AUTOMATIQUE
echo   Pilote Empreintes HP EliteBook 840 G6
echo ========================================
echo.
echo Tentative sur plusieurs sources...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& {$urls = @('https://ftp.hp.com/pub/softpaq/sp115001-115500/sp115123.exe', 'https://ftp.hp.com/pub/softpaq/sp114001-114500/sp114301.exe', 'https://ftp.hp.com/pub/softpaq/sp113501-114000/sp113815.exe'); $downloaded = $false; foreach ($url in $urls) { $fileName = Split-Path $url -Leaf; $output = Join-Path $env:USERPROFILE\Downloads $fileName; Write-Host \"Essai: $url\" -ForegroundColor Cyan; try { $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri $url -OutFile $output -TimeoutSec 60 -ErrorAction Stop; $size = [math]::Round((Get-Item $output).Length/1MB, 2); Write-Host \"SUCCES! Fichier telecharge: $fileName ($size MB)\" -ForegroundColor Green; $downloaded = $true; break; } catch { Write-Host \"Echec, essai suivant...\" -ForegroundColor Yellow; } } if ($downloaded) { Write-Host \"`nVoulez-vous installer maintenant? (O/N): \" -ForegroundColor Yellow -NoNewline; $install = Read-Host; if ($install -eq 'O' -or $install -eq 'o') { Start-Process -FilePath $output -Wait; Write-Host \"`nInstallation terminee!\" -ForegroundColor Green; Write-Host \"Redemarrez votre PC puis configurez Windows Hello\" -ForegroundColor Cyan; } else { Write-Host \"`nFichier sauvegarde dans: $output\" -ForegroundColor Cyan; explorer /select,$output; } } else { Write-Host \"`nEchec sur toutes les sources automatiques\" -ForegroundColor Red; Write-Host \"Ouverture du site HP officiel...\" -ForegroundColor Yellow; Start-Process 'https://support.hp.com/us-en/drivers/hp-elitebook-840-g6-notebook-pc/model/25278720'; } }"

pause
