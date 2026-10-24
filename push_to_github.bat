@echo off
title Push to GitHub - AI Terms & Conditions Analyzer
echo ======================================================================
echo Push AI Terms & Conditions Analyzer to GitHub
echo Author: Manish (PRN: 124B1C122)
echo ======================================================================
echo.
echo Step 1: Create a new repository on GitHub:
echo         Go to: https://github.com/new
echo         Repository name: ai-terms-analyzer (or any name you like)
echo         Set to Public or Private. Do NOT initialize with README.
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/manishdabade45/ai-terms-analyzer.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL entered. Aborting.
    pause
    exit /b 1
)

echo.
echo Connecting repository to: %REPO_URL%
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing project files to GitHub main branch...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] If git requested a sign-in or token, complete that in your browser.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo [SUCCESS] Pushed to GitHub!
echo Now go to https://vercel.com/new, select this repository, and click Deploy!
echo ======================================================================
pause
