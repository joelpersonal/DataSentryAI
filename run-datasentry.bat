@echo off
title DataSentry AI - Setup and Run
color 0A

echo ========================================
echo    DataSentry AI - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install dependencies if node_modules don't exist
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo ========================================
    echo    IMPORTANT: API KEY REQUIRED
    echo ========================================
    echo.
    echo Please add your OpenAI API key to backend\.env file
    echo.
    echo 1. Get your API key from: https://platform.openai.com/api-keys
    echo 2. Open backend\.env in a text editor
    echo 3. Replace "your_openai_api_key_here" with your actual API key
    echo.
    echo Press any key after adding your API key...
    pause
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:3001/api > "frontend\.env"
    echo VITE_APP_NAME=DataSentry AI >> "frontend\.env"
    echo VITE_ENABLE_AI_COPILOT=true >> "frontend\.env"
)

echo.
echo ========================================
echo    Starting DataSentry AI Servers
echo ========================================
echo.

echo Starting backend server...
start "DataSentry Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

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
echo The website will open automatically in a few seconds...
echo.
echo To stop the servers, close both command windows
echo or press Ctrl+C in each window
echo.

timeout /t 5 /nobreak >nul

REM Open the website in default browser
start http://localhost:5173

echo Website opened in browser!
echo.
pause