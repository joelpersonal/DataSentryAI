@echo off
title DataSentry AI - Issue Fixer
color 0A

echo ========================================
echo    DataSentry AI - Issue Fixer
echo ========================================
echo.

echo Checking for common issues...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed: 
node --version

REM Check if ports are available
echo.
echo Checking if ports 3001 and 5173 are available...

netstat -an | find "3001" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is in use
    echo Attempting to free port 3001...
    
    REM Kill processes using port 3001
    for /f "tokens=5" %%a in ('netstat -ano ^| find "3001" ^| find "LISTENING"') do (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    
    timeout /t 2 /nobreak >nul
    echo ✓ Port 3001 should now be available
) else (
    echo ✓ Port 3001 is available
)

netstat -an | find "5173" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 5173 is in use
    echo Attempting to free port 5173...
    
    REM Kill processes using port 5173
    for /f "tokens=5" %%a in ('netstat -ano ^| find "5173" ^| find "LISTENING"') do (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    
    timeout /t 2 /nobreak >nul
    echo ✓ Port 5173 should now be available
) else (
    echo ✓ Port 5173 is available
)

REM Check if dependencies are installed
echo.
echo Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend dependencies exist
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend dependencies exist
)

REM Check API key configuration
echo.
echo Checking API key configuration...

findstr /C:"OPENAI_API_KEY=your_openai_api_key_here" "backend\.env" >nul
if %errorlevel% equ 0 (
    echo WARNING: OpenAI API key is not configured
    echo.
    echo To enable AI features, you need to:
    echo 1. Run: setup-api-key.bat
    echo 2. Or manually edit backend\.env
    echo.
    echo The app will work without AI, but analysis will be limited.
) else (
    echo ✓ OpenAI API key appears to be configured
)

REM Clear any error logs
echo.
echo Clearing old error logs...
if exist "backend\error.log" del "backend\error.log"
if exist "backend\server_error.log" del "backend\server_error.log"
echo ✓ Error logs cleared

echo.
echo ========================================
echo    Issue Check Complete!
echo ========================================
echo.
echo All common issues have been checked and fixed.
echo You can now run: run-datasentry.bat
echo.
pause