@echo off
echo ============================================
echo    GENERATEUR APK - YOU CAISSE PRO
echo ============================================
echo.

REM Vérifier Java
echo Verification de Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Java non installe!
    echo.
    echo Telechargez Java 17 depuis:
    echo https://adoptium.net/temurin/releases/?version=17
    echo.
    echo Installez-le puis relancez ce script.
    pause
    exit /b 1
)

echo [OK] Java detecte
echo.

REM Aller dans le dossier Android
cd /d "%~dp0frontend\android"

echo Compilation de l'APK...
echo Cela peut prendre 3-5 minutes...
echo.

REM Compiler l'APK
gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo [ERREUR] La compilation a echoue!
    echo Verifiez que Java 11+ est installe.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    APK CREE AVEC SUCCES!
echo ============================================
echo.
echo Emplacement:
echo %~dp0frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Copiez ce fichier sur votre telephone Android
echo et installez-le!
echo.

REM Copier l'APK sur le Bureau
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy "app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\YouCaissePro.apk"
    echo APK copie sur le Bureau: YouCaissePro.apk
    echo.
)

pause
