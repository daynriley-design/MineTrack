@echo off
setlocal enabledelayedexpansion
title Minetrack - Demarrage
color 0A
cd /d "%~dp0"

echo.
echo  ================================================
echo         MINETRACK - Gestion Miniere
echo           Demarrage de l'application
echo  ================================================
echo  Dossier : %~dp0
echo  (si ce n'est pas le bon dossier, ferme cette fenetre et relance
echo   START_MINETRACK.bat depuis le bon projet)
echo.

REM --- Verification Node.js ---
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else (
        echo  [ERREUR] Node.js introuvable. Installez-le depuis https://nodejs.org
        pause
        exit /b 1
    )
)

REM --- Verification Python ---
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERREUR] Python introuvable. Installez-le depuis https://python.org
    pause
    exit /b 1
)

REM --- Liberation des ports 4000 et 8001 ---
REM Important : ne cible QUE les sockets en LISTENING sur ces ports (notre propre
REM serveur local), jamais une connexion d'un autre programme vers un serveur
REM distant sur ce meme port. Sans ce filtre, netstat remonte aussi les lignes
REM "adresse distante :4000/:8001" et on tuerait un processus sans rapport.
echo  Nettoyage des ports 4000 et 8001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:"TCP.*:4000 .*LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:"TCP.*:8001 .*LISTENING"') do taskkill /PID %%a /F >nul 2>&1

REM --- Dependances Backend ---
if not exist "backend\.deps_installed" (
    echo  [1/4] Installation des dependances Backend, patientez...
    pushd backend
    python -m pip install -r requirements.txt --quiet
    if !ERRORLEVEL! neq 0 (
        echo  [ERREUR] Echec de l'installation des dependances Python.
        popd
        pause
        exit /b 1
    )
    echo ok > .deps_installed
    popd
) else (
    echo  [1/4] Dependances Backend OK.
)

REM --- Dependances Frontend ---
if not exist "frontend\node_modules\vite" (
    echo  [2/4] Installation des dependances Frontend, patientez 1 a 3 minutes...
    pushd frontend
    call npm install --no-audit --no-fund
    if !ERRORLEVEL! neq 0 (
        echo  [ERREUR] Echec de npm install.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo  [2/4] Dependances Frontend OK.
)

REM --- Demarrage Backend ---
echo  [3/4] Demarrage du Backend (port 8001)...
start "Minetrack Backend" /D "%~dp0backend" cmd /k "python server.py"

set BACKEND_READY=0
for /l %%i in (1,1,40) do (
    curl -s -o nul -w "%%{http_code}" http://localhost:8001/docs 2>nul | findstr "200" >nul
    if !ERRORLEVEL! equ 0 (
        set BACKEND_READY=1
        goto backend_ok
    )
    timeout /t 1 /nobreak >nul
)
:backend_ok
if "!BACKEND_READY!"=="1" (
    echo       Backend pret.
) else (
    echo       [ATTENTION] Backend lent a demarrer, verifiez sa fenetre.
)

REM --- Comptes de connexion ---
echo  Verification des comptes...
pushd backend
python create_accounts.py
popd

REM --- Demarrage Frontend ---
echo  [4/4] Demarrage du Frontend (port 4000)...
start "Minetrack Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

set FRONTEND_READY=0
for /l %%i in (1,1,40) do (
    curl -s -o nul -w "%%{http_code}" http://localhost:4000 2>nul | findstr "200" >nul
    if !ERRORLEVEL! equ 0 (
        set FRONTEND_READY=1
        goto frontend_ok
    )
    timeout /t 1 /nobreak >nul
)
:frontend_ok

echo.
if "!FRONTEND_READY!"=="1" (
    echo  Application prete.
) else (
    echo  [ATTENTION] Frontend lent a repondre. Verifiez sa fenetre :
    echo  si elle affiche "Port 4000 is in use", fermez le processus en
    echo  conflit puis relancez START_MINETRACK.bat.
)
echo.
echo  Application : http://localhost:4000
echo  Backend API : http://localhost:8001
echo  API Docs    : http://localhost:8001/docs
echo.
echo  Page de connexion : clique sur ton role, pas besoin de saisir
echo  email/mot de passe, chaque bouton se connecte directement.
echo.
echo  Comptes (si besoin de connexion manuelle via l'API) :
echo    Administrateur    : admin@minetrack.com         / admin123
echo    Management        : management@minetrack.com    / mgmt123
echo    Supervision       : supervision@minetrack.com   / super123
echo    Logistique        : logistique@minetrack.com    / logi123
echo    Support technique : support@minetrack.com       / support123
echo    Geologue          : geologue@minetrack.com      / geo123
echo    Operateur         : operateur@minetrack.com     / oper123
echo.

start http://localhost:4000

echo  Gardez les fenetres Backend et Frontend ouvertes.
pause >nul
