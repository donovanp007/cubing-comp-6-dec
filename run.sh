#!/bin/bash

# ========================================
# Cubing Hub - Run Script (Unix/Mac)
# ========================================
# Starts the development server and provides access information

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        CUBING HUB - STARTING DEVELOPMENT SERVER               ║"
echo "║     Competition Management System for Cubing Competitions     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "❌ Error: Dependencies not installed!"
    echo "Please run './setup.sh' first to install dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local configuration not found!"
    echo "Please run './setup.sh' first and configure your Supabase credentials"
    exit 1
fi

echo "✓ All prerequisites met"
echo ""
echo "Starting development server..."
echo "This may take a moment on first run..."
echo ""

# Start the dev server
npm run dev

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Development server failed to start"
    exit 1
fi
