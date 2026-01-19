@echo off
title DataSentry AI - API Key Setup
color 0A

echo ========================================
echo    DataSentry AI - API Key Setup
echo ========================================
echo.

echo This script will help you configure your OpenAI API key
echo for AI-powered CSV analysis features.
echo.

echo Step 1: Get your OpenAI API key
echo ----------------------------------------
echo 1. Visit: https://platform.openai.com/api-keys
echo 2. Sign in to your OpenAI account
echo 3. Click "Create new secret key"
echo 4. Copy the key (starts with sk-...)
echo.

set /p api_key="Enter your OpenAI API key: "

if "%api_key%"=="" (
    echo ERROR: No API key provided
    pause
    exit /b 1
)

if not "%api_key:~0,3%"=="sk-" (
    echo WARNING: API key should start with 'sk-'
    echo Are you sure this is correct?
    pause
)

echo.
echo Updating backend/.env file...

REM Create backup
copy "backend\.env" "backend\.env.backup" >nul 2>&1

REM Update the API key
powershell -Command "(Get-Content 'backend\.env') -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=%api_key%' | Set-Content 'backend\.env'"

echo.
echo ========================================
echo    API Key Configuration Complete!
echo ========================================
echo.
echo Your OpenAI API key has been configured.
echo You can now run the full application with AI features:
echo.
echo   1. Run: run-datasentry.bat
echo   2. Upload a CSV file
echo   3. Click "Analyze Data Quality" 
echo   4. Try the AI Copilot chat
echo.
echo Note: API usage will be charged to your OpenAI account
echo.
pause