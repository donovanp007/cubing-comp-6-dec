@echo off
REM ========================================
REM Cubing Hub - Run Script (Windows)
REM ========================================
REM Starts the development server and provides access information

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        CUBING HUB - STARTING DEVELOPMENT SERVER               ║
echo ║     Competition Management System for Cubing Competitions     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo ❌ Error: Dependencies not installed!
    echo Please run 'setup.bat' first to install dependencies
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ Error: .env.local configuration not found!
    echo Please run 'setup.bat' first and configure your Supabase credentials
    pause
    exit /b 1
)

echo ✓ All prerequisites met
echo.
echo Starting development server...
echo This may take a moment on first run...
echo.

REM Start the dev server
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error: Development server failed to start
    pause
    exit /b 1
)
