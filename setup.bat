@echo off
REM ========================================
REM Cubing Hub - Setup Script (Windows)
REM ========================================
REM This script sets up the Cubing Hub app for development/testing

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           CUBING HUB - SETUP SCRIPT (WINDOWS)                 ║
echo ║     Competition Management System for Cubing Competitions     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed:
node -v
echo.

REM Check if npm is installed
echo [2/5] Checking npm installation...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed!
    echo Please install npm along with Node.js
    pause
    exit /b 1
)
echo ✓ npm is installed:
npm -v
echo.

REM Install dependencies
echo [3/5] Installing project dependencies...
echo This may take a few minutes on first run...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

REM Check and setup environment variables
echo [4/5] Checking environment configuration...
if exist .env.local (
    echo ✓ .env.local already exists
) else (
    echo ⚠ .env.local not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env.local
        echo ✓ Created .env.local
        echo.
        echo ⚠️  IMPORTANT: You need to configure your Supabase credentials in .env.local
        echo   Edit the following values:
        echo   - NEXT_PUBLIC_SUPABASE_URL
        echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
        echo   - SUPABASE_SERVICE_ROLE_KEY
        echo.
    ) else (
        echo ❌ Error: .env.example not found
        pause
        exit /b 1
    )
)
echo.

REM Build the project
echo [5/5] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  SETUP COMPLETED SUCCESSFULLY! ✓               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Edit .env.local with your Supabase credentials
echo 2. Run 'run.bat' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
pause
