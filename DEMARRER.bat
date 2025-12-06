@echo off
title YOU CAISSE PRO - Demarrage
color 0A
echo.
echo ================================================
echo   YOU CAISSE PRO - Demarrage des serveurs
echo ================================================
echo.

REM Tuer tous les processus Node existants
echo [1/4] Nettoyage des processus Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Demarrer le backend dans une nouvelle fenetre
echo [2/4] Demarrage du Backend (API)...
start "YOU CAISSE - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 5 /nobreak >nul

REM Demarrer le frontend dans une nouvelle fenetre
echo [3/4] Demarrage du Frontend (Application)...
start "YOU CAISSE - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

REM Ouvrir dans le navigateur
echo [4/4] Ouverture dans le navigateur...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo   SERVEURS DEMARRES AVEC SUCCES !
echo ================================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   IMPORTANT: Ne fermez pas les fenetres Backend et Frontend !
echo.
echo   Appuyez sur une touche pour fermer cette fenetre...
pause >nul
