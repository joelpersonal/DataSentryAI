@echo off
title DataSentry AI - Analyze Your Data
color 0A

echo ========================================
echo    DataSentry AI - Custom Data Analysis
echo ========================================
echo.

REM Check if servers are running
echo Checking if DataSentry AI is running...
netstat -an | findstr :3001 >nul
if %errorlevel% neq 0 (
    echo Backend server not running. Starting servers...
    call start-clean.bat
    timeout /t 10 /nobreak >nul
)

echo.
echo ========================================
echo    Ready to Analyze Your Data!
echo ========================================
echo.
echo Instructions:
echo.
echo 1. Place your CSV files in the 'my-datasets' folder
echo 2. Open the website that will launch automatically
echo 3. Click 'Upload Data' in the sidebar
echo 4. Drag and drop your CSV files
echo 5. View detailed analysis results
echo.
echo Supported data types:
echo ✓ Employee records
echo ✓ Customer databases  
echo ✓ Sales data
echo ✓ Survey responses
echo ✓ Any CSV with headers
echo.
echo Features you'll get:
echo ✓ Data quality scoring
echo ✓ Missing value detection
echo ✓ Duplicate identification
echo ✓ Email/phone validation
echo ✓ AI-powered suggestions
echo ✓ Export cleaned data
echo.

timeout /t 3 /nobreak >nul

echo Opening DataSentry AI...
start http://localhost:5173

echo.
echo ========================================
echo    DataSentry AI is ready for your data!
echo ========================================
echo.
echo Website: http://localhost:5173
echo.
echo Place your CSV files in: my-datasets\
echo Then upload them through the web interface
echo.
pause