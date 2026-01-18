@echo off
title Initialisation Git Automatique - SmartUnityIA
color 0A

echo ========================================================
echo   AUTOMATISATION GIT - SMARTUNITYIA
echo ========================================================
echo.

:: 1. Vérification de sécurité pour Unity (gitignore)
if not exist .gitignore (
    color 0E
    echo [ATTENTION] Aucun fichier .gitignore trouve !
    echo Si c'est un projet Unity, tu risques d'envoyer les dossiers Library/Temp.
    echo.
    set /p choix="Veux-tu continuer quand meme ? (O/N) : "
    if /i "%choix%" neq "O" goto :eof
    color 0A
)

:: 2. Demande de l'URL du repo
echo.
set /p repo_url="Colle l'URL de ton depot GitHub (ex: https://github.com/...) : "

if "%repo_url%"=="" (
    echo Erreur : L'URL ne peut pas etre vide.
    pause
    goto :eof
)

echo.
echo --- Initialisation en cours... ---

:: 3. Exécution des commandes
echo [1/6] git init
git init

echo [2/6] git add .
git add .

echo [3/6] git commit
git commit -m "Premier commit : initialisation du projet"

echo [4/6] Renommage branche main
git branch -M main

echo [5/6] Ajout remote origin
git remote remove origin 2>nul
git remote add origin %repo_url%

echo [6/6] Push vers GitHub
git push -u origin main

echo.
echo ========================================================
if %errorlevel% equ 0 (
    echo   SUCCES ! Ton code est en ligne.
) else (
    color 0C
    echo   ERREUR : Quelque chose s'est mal passe (verifie l'URL ou tes droits).
)
echo ========================================================
pause