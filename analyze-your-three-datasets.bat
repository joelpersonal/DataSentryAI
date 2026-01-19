@echo off
title DataSentry AI - Your Three Datasets Analysis
color 0A

echo ========================================
echo    DataSentry AI - Three Dataset Analysis
echo ========================================
echo.
echo Your datasets:
echo 1. 📊 People Issues    - Employee problems and HR matters
echo 2. 🏢 Job Functions    - Employee roles and responsibilities  
echo 3. ⚠️  Company Issues   - Organizational problems and incidents
echo.

REM Check if DataSentry AI is running
echo Checking DataSentry AI status...
netstat -an | findstr :3001 >nul
if %errorlevel% neq 0 (
    echo Starting DataSentry AI servers...
    call start-clean.bat
    timeout /t 8 /nobreak >nul
) else (
    echo ✅ DataSentry AI is already running
)

echo.
echo ========================================
echo    Dataset Analysis Instructions
echo ========================================
echo.
echo Step 1: Prepare Your Data
echo ------------------------
echo 📁 Place your Word files in: your-datasets\raw-data\
echo    - people-issues.docx
echo    - job-functions.docx  
echo    - company-issues.docx
echo.
echo Step 2: Convert to CSV
echo ---------------------
echo 📄 Convert each Word file to CSV format:
echo    - Open Word file
echo    - Select all data (Ctrl+A)
echo    - Copy (Ctrl+C)
echo    - Paste into Excel
echo    - Save as CSV in: your-datasets\csv-files\
echo.
echo Step 3: Use Templates as Guide
echo -----------------------------
echo 📋 Check templates in: your-datasets\templates\
echo    - people-issues-template.csv
echo    - job-function-template.csv
echo    - company-issues-template.csv
echo.

echo Opening helpful folders...
start explorer "your-datasets\raw-data"
start explorer "your-datasets\csv-files"
start explorer "your-datasets\templates"

timeout /t 3 /nobreak >nul

echo Opening DataSentry AI...
start http://localhost:5173

echo.
echo ========================================
echo    What DataSentry AI Will Analyze
echo ========================================
echo.
echo 📊 People Issues Dataset:
echo    ✓ Employee contact validation (emails, phones)
echo    ✓ Duplicate employee records
echo    ✓ Issue severity distribution
echo    ✓ Resolution time analysis
echo    ✓ Department-wise issue patterns
echo.
echo 🏢 Job Functions Dataset:
echo    ✓ Job title standardization
echo    ✓ Salary range validation
echo    ✓ Skills gap analysis
echo    ✓ Organizational structure mapping
echo    ✓ Experience vs role alignment
echo.
echo ⚠️  Company Issues Dataset:
echo    ✓ Issue priority validation
echo    ✓ Cost impact analysis
echo    ✓ Resolution time tracking
echo    ✓ Department impact assessment
echo    ✓ Issue category patterns
echo.

echo ========================================
echo    Ready for Analysis!
echo ========================================
echo.
echo 🌐 Website: http://localhost:5173
echo 📁 Upload from: your-datasets\csv-files\
echo 📋 Templates: your-datasets\templates\
echo.
echo Instructions:
echo 1. Convert your Word files to CSV format
echo 2. Place CSV files in csv-files folder
echo 3. Upload through the web interface
echo 4. Get comprehensive analysis results
echo.
pause