@echo off
REM Fast startup script for YOU CAISSE PRO
REM This batch file provides quick startup of the application

setlocal enabledelayedexpansion

REM Set environment variables for faster startup
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=512

REM Kill existing node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

REM Start backend
echo Starting backend server...
start "YOU CAISSE PRO - Backend" cmd /k "cd /d c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend && npm run dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start "YOU CAISSE PRO - Frontend" cmd /k "cd /d c:\Users\mrtih\Desktop\YOU CAISSE PRO\frontend && npm run dev"

echo.
echo ✓ Both servers are starting...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Network: http://192.168.47.102:5173
