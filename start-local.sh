#!/bin/bash

# Startup script for SymptomSense WITHOUT Docker
# This runs Angular directly on your machine

echo "🚀 Starting SymptomSense locally (without Docker)..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

echo "🔥 Starting Angular development server..."
echo "📱 Application will be available at http://localhost:4200"
echo ""

ng serve

