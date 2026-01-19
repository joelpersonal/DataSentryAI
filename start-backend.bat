@echo off
echo Starting DataSentry AI Backend Server...
echo.
echo Make sure to add your OpenAI API key to backend/.env file
echo.

cd backend

REM Check if .env file exists, if not copy from example
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend/.env and add your OPENAI_API_KEY
    echo Press any key to continue after adding your API key...
    pause
)

echo Starting backend server on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

call npm run dev