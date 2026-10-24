@echo off
title AI Terms & Conditions Analyzer - Launcher
echo ========================================================
echo Launching AI Terms & Conditions Analyzer Full-Stack System
echo ========================================================
start "TOS Analyzer - Backend" run_backend.bat
timeout /t 3 /nobreak >nul
start "TOS Analyzer - Frontend" run_frontend.bat
echo Both services launched! 
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:5000
