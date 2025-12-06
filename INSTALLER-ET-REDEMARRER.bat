@echo off
echo ========================================
echo   INSTALLATION AUTOMATIQUE DU PILOTE
echo ========================================
echo.

set "driver=%USERPROFILE%\Downloads\ValidityFingerprint.exe"

if not exist "%driver%" (
    echo ERREUR: Pilote non trouve!
    pause
    exit /b 1
)

echo Installation du pilote d'empreintes digitales...
echo.

REM Installation silencieuse avec redemarrage automatique
"%driver%" /s /f2"%TEMP%\validity_install.log"

timeout /t 5 /nobreak

echo.
echo Installation terminee!
echo Le PC va redemarrer dans 10 secondes...
echo Appuyez sur une touche pour redemarrer immediatement.
echo.

timeout /t 10

shutdown /r /t 0 /c "Redemarrage pour finaliser l'installation du pilote d'empreintes digitales"
