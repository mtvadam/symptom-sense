@echo off
REM Startup script for SymptomSense with Docker (Windows)
REM This script automatically starts Docker containers when you run npm start

echo.
echo 🚀 Starting SymptomSense with Docker...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed!
    echo Please install Docker Desktop from https://docs.docker.com/desktop/install/windows-install/
    echo.
    echo Or run without Docker using: ng serve
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker daemon is not running!
    echo Please start Docker Desktop and try again.
    echo.
    echo Or run without Docker using: ng serve
    pause
    exit /b 1
)

REM Check if containers are already running
docker-compose ps 2>nul | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Containers are already running!
    echo.
    set /p restart="Do you want to restart them? (y/n): "
    if /i "%restart%"=="y" (
        echo 🔄 Restarting containers...
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up
    ) else (
        echo ✅ Keeping existing containers running
        echo 📱 Application is available at http://localhost:4200
        docker-compose -f docker-compose.dev.yml logs -f
    )
) else (
    echo 🐳 Starting Docker containers...
    echo.
    docker-compose -f docker-compose.dev.yml up
)

