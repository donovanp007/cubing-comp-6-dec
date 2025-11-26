#!/bin/bash

# ========================================
# Cubing Hub - Setup Script (Unix/Mac)
# ========================================
# This script sets up the Cubing Hub app for development/testing

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           CUBING HUB - SETUP SCRIPT (UNIX/MAC)                ║"
echo "║     Competition Management System for Cubing Competitions     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js is installed:"
node -v
echo ""

# Check if npm is installed
echo "[2/5] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed!"
    echo "Please install npm along with Node.js"
    exit 1
fi
echo "✓ npm is installed:"
npm -v
echo ""

# Install dependencies
echo "[3/5] Installing project dependencies..."
echo "This may take a few minutes on first run..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed"
    exit 1
fi
echo "✓ Dependencies installed successfully"
echo ""

# Check and setup environment variables
echo "[4/5] Checking environment configuration..."
if [ -f .env.local ]; then
    echo "✓ .env.local already exists"
else
    echo "⚠ .env.local not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✓ Created .env.local"
        echo ""
        echo "⚠️  IMPORTANT: You need to configure your Supabase credentials in .env.local"
        echo "   Edit the following values:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo ""
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
fi
echo ""

# Build the project
echo "[5/5] Building the project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi
echo "✓ Build completed successfully"
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETED SUCCESSFULLY! ✓               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run './run.sh' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
