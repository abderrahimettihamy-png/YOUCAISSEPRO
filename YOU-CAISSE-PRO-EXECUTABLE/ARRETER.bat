@echo off
title YOU CAISSE PRO - Arret
color 0C
echo.
echo ================================================
echo   Arret de YOU CAISSE PRO
echo ================================================
echo.
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq YOU CAISSE*" >nul 2>&1
echo   Serveurs arretes avec succes!
echo.
pause
