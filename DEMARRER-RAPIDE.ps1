#!/usr/bin/env powershell

# Fast startup script for YOU CAISSE PRO
# This script starts both frontend and backend with optimized settings

Write-Host "🚀 Starting YOU CAISSE PRO with optimized settings..." -ForegroundColor Cyan
Write-Host ""

# Set environment variables for faster startup
$env:NODE_ENV = "development"
$env:NODE_OPTIONS = "--max-old-space-size=512"
$env:VITE_MAXSIZE = "4000"

# Kill existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\mrtih\Desktop\YOU CAISSE PRO\backend'; npm run dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend in a new window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\mrtih\Desktop\YOU CAISSE PRO\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network access:" -ForegroundColor Yellow
Write-Host "http://192.168.47.102:5173" -ForegroundColor White
