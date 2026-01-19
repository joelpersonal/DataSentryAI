@echo off
title DataSentry AI - Quick Start (No API Key Required)
color 0A

echo ========================================
echo    DataSentry AI - Quick Demo Mode
echo ========================================
echo.
echo Starting servers without OpenAI API key...
echo (AI features will be disabled, but you can see the UI)
echo.

REM Start backend server
echo Starting backend server...
start "DataSentry Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

REM Start frontend server  
echo Starting frontend server...
start "DataSentry Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    DataSentry AI is Starting Up!
echo ========================================
echo.
echo Backend Server: http://localhost:3001
echo Frontend Website: http://localhost:5173
echo.
echo Opening website in 5 seconds...
echo.

timeout /t 5 /nobreak >nul

REM Open the website
start http://localhost:5173

echo.
echo ========================================
echo    SUCCESS! Website is now running!
echo ========================================
echo.
echo Your DataSentry AI website is now open in your browser!
echo.
echo What you can do:
echo - Explore the professional UI design
echo - Upload CSV files (try the sample data)
echo - See data quality analysis
echo - View duplicate detection
echo - Test the responsive design
echo.
echo Note: AI features require OpenAI API key
echo To enable AI features, add your API key to backend\.env
echo.
echo To stop the servers, close both command windows
echo.
pause