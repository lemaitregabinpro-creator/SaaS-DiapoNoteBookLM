@echo off
title Quick Push - SmartUnityIA
color 0B

echo ========================================================
echo   QUICK PUSH - SMARTUNITYIA
echo ========================================================
echo.

:: 1. Vérification que git est présent
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERREUR] Ce dossier n'est pas un depot Git !
    echo Lance d'abord 'init_git.bat' pour initialiser le projet.
    pause
    exit
)

:: 2. Demande du message de commit
:ask_msg
set "commit_msg="
set /p commit_msg="📝 Message du commit : "

:: Si l'utilisateur appuie juste sur Entrée sans texte, on met un message par défaut
if "%commit_msg%"=="" set commit_msg="Update (Auto-Commit)"

echo.
echo --- Envoi en cours... ---

:: 3. Exécution des commandes
echo [1/3] git add .
git add .

echo [2/3] git commit
git commit -m "%commit_msg%"

echo [3/3] git push
git push

echo.
echo ========================================================
if %errorlevel% equ 0 (
    color 0A
    echo   ✅ SUCCES ! Modifications envoyees sur GitHub.
) else (
    color 0C
    echo   ❌ ERREUR : Le push a echoue.
    echo   (Verifie ta connexion internet ou s'il y a des conflits)
)
echo ========================================================
pause