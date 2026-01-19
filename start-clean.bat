@echo off
title DataSentry AI - Clean Start
color 0A

echo ========================================
echo    DataSentry AI - Clean Startup
echo ========================================
echo.

REM Kill any existing Node.js processes
echo Cleaning up existing processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM nodemon.exe /F >nul 2>&1

timeout /t 2 /nobreak >nul

echo Starting backend server on port 3001...
start "DataSentry Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend server on port 5173...
start "DataSentry Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo    DataSentry AI Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend Web: http://localhost:5173
echo.
echo Opening website in 8 seconds...
echo.

timeout /t 8 /nobreak >nul

start http://localhost:5173

echo.
echo SUCCESS! Your DataSentry AI website is now running!
echo.
echo What you can do now:
echo ✓ Upload CSV files from the sample-data folder
echo ✓ See real-time data quality analysis  
echo ✓ Test duplicate detection
echo ✓ Explore the professional UI
echo.
echo Note: For AI features, add OpenAI API key to backend\.env
echo.
pause