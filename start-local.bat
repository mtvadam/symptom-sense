@echo off
REM Startup script for SymptomSense WITHOUT Docker (Windows)
REM This runs Angular directly on your machine

echo.
echo 🚀 Starting SymptomSense locally (without Docker)...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

echo 🔥 Starting Angular development server...
echo 📱 Application will be available at http://localhost:4200
echo.

call ng serve

