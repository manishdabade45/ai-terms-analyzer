@echo off
title Deploy to Vercel - AI Terms & Conditions Analyzer
echo ======================================================================
echo Deploying AI Terms & Conditions Analyzer to Vercel...
echo ======================================================================
echo.
echo Running pre-deployment build check...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please fix any errors above.
    pause
    exit /b %errorlevel%
)
echo.
echo [OK] Build passed! Starting Vercel deployment...
echo Log in or press Enter to accept defaults when prompted.
echo.
call npx vercel
echo.
echo Deployment command finished!
pause
