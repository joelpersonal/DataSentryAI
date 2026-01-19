@echo off
echo Starting DataSentry AI Frontend Server...
echo.

cd frontend

REM Check if .env file exists, if not create it
if not exist .env (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:3001/api > .env
    echo VITE_APP_NAME=DataSentry AI >> .env
    echo VITE_ENABLE_AI_COPILOT=true >> .env
)

echo Starting frontend server on http://localhost:5173
echo Your website will open automatically in the browser
echo Press Ctrl+C to stop the server
echo.

call npm run dev