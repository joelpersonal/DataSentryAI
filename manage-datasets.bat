@echo off
title DataSentry AI - Dataset Manager
color 0A

echo ========================================
echo    DataSentry AI - Dataset Manager
echo ========================================
echo.

echo Your dataset folders:
echo.
echo 📁 your-datasets\raw-data\     - Place your Word/Excel files here
echo 📁 your-datasets\csv-files\   - Converted CSV files ready for analysis
echo 📁 your-datasets\processed\   - Analysis results and cleaned data
echo 📁 your-datasets\templates\   - Example CSV formats
echo.

echo What would you like to do?
echo.
echo 1. Open dataset folders in Explorer
echo 2. View CSV templates
echo 3. Start DataSentry AI for analysis
echo 4. Check current datasets
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Opening dataset folders...
    start explorer "your-datasets"
    start explorer "your-datasets\raw-data"
    start explorer "your-datasets\csv-files"
    echo Folders opened in Windows Explorer
)

if "%choice%"=="2" (
    echo Available CSV templates:
    echo.
    dir "your-datasets\templates\*.csv" /b
    echo.
    echo These templates show the proper CSV format for different data types.
    echo Copy the format that matches your data.
)

if "%choice%"=="3" (
    echo Starting DataSentry AI...
    call analyze-my-data.bat
)

if "%choice%"=="4" (
    echo Current datasets:
    echo.
    echo Raw data files:
    dir "your-datasets\raw-data" /b 2>nul || echo No files found
    echo.
    echo CSV files ready for analysis:
    dir "your-datasets\csv-files\*.csv" /b 2>nul || echo No CSV files found
    echo.
    echo Processed results:
    dir "your-datasets\processed" /b 2>nul || echo No processed files found
)

if "%choice%"=="5" (
    echo Goodbye!
    exit /b 0
)

echo.
pause