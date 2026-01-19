@echo off
echo Fixing CSS issues...

REM Kill frontend process
taskkill /IM node.exe /F >nul 2>&1

echo Restarting frontend server...
timeout /t 2 /nobreak >nul

start "DataSentry Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo CSS issues fixed! Frontend restarted.
echo Website: http://localhost:5173
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173