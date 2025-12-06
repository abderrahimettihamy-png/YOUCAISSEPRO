@echo off
echo ========================================
echo   TELECHARGEMENT PILOTE EMPREINTES
echo   HP EliteBook 840 G6
echo ========================================
echo.
echo Telechargement en cours...
echo.

powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://ftp.hp.com/pub/softpaq/sp114001-114500/sp114301.exe' -OutFile '%USERPROFILE%\Downloads\sp114301.exe'; Write-Host 'Telechargement termine!' -ForegroundColor Green; Write-Host 'Fichier: %USERPROFILE%\Downloads\sp114301.exe' -ForegroundColor Cyan}"

echo.
echo Voulez-vous installer maintenant? (O/N)
set /p install=

if /i "%install%"=="O" (
    echo.
    echo Lancement de l'installation...
    start "" "%USERPROFILE%\Downloads\sp114301.exe"
) else (
    echo.
    echo Ouverture du dossier Telechargements...
    explorer "%USERPROFILE%\Downloads"
)

pause
