@echo off
title Minetrack - Démarrage
color 0A
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       MINETRACK - Gestion Minière        ║
echo  ║         Démarrage de l'application       ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Tuer les éventuels processus sur les ports 4000 et 8001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1

:: Démarrer le backend
echo [1/2] Démarrage du Backend (port 8001)...
start "Minetrack Backend" cmd /k "cd /d %~dp0backend && python server.py"
timeout /t 4 /nobreak >nul

:: Démarrer le frontend
echo [2/2] Démarrage du Frontend (port 4000)...
start "Minetrack Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  ✅ Démarrage en cours... Attente de Vite (10 secondes)...
echo.
echo  🌐 Application : http://localhost:4000
echo  🔧 Backend API : http://localhost:8001
echo  📚 API Docs    : http://localhost:8001/docs
echo.
echo  Comptes de connexion :
echo  👤 Superviseur: supervisor@minetrack.com / super123
echo  👷 Mineur:      miner@minetrack.com / miner123
echo  🔬 Géologue:    geo@minetrack.com / geo123
echo.
timeout /t 10 /nobreak >nul
echo  Ouverture du navigateur...
start http://localhost:4000
