@echo off
title Push NOVA to GitHub
echo ======================================================
echo       Pushing NOVA AI Assistant to GitHub...
echo ======================================================
cd /d "%~dp0"
set "PATH=C:\Users\Niharika\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%"
git push -u origin main
echo.
echo ======================================================
echo If push succeeded, your repo is now live on GitHub!
echo ======================================================
pause
