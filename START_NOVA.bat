@echo off
title NOVA AI Assistant
echo ======================================================
echo           Starting NOVA AI Assistant...
echo ======================================================
cd /d "%~dp0"

netstat -ano | findstr :8080 >nul
if %errorlevel% neq 0 (
    echo Starting background server on port 8080...
    start /b node server.js
    timeout /t 1 /nobreak >nul
)

echo Opening NOVA in your default browser...
start http://localhost:8080
exit
