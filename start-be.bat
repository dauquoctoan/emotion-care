@echo off
setlocal enabledelayedexpansion
title Emotion Care - Spring Boot Backend
cd /d "%~dp0"

echo ====================================================
echo   EMOTION CARE PLATFORM - START BACKEND JAVA API
echo ====================================================

:: 1. Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not found in PATH!
    echo Please install JDK 17+ and add java to PATH.
    pause
    exit /b 1
)

:: 2. Check Database port 5432
netstat -ano | findstr ":5432 " | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
    echo [INFO] PostgreSQL on port 5432 is not listening.
    echo [INFO] Attempting to start PostgreSQL and Redis via Docker...
    docker compose -f docker-compose.local.yml up -d postgres redis
)

:: 3. Check JAR or build
set "JAR_PATH=%~dp0backend-java\emotion-api-svc\target\emotion-api-svc-1.0.0-SNAPSHOT.jar"

if not exist "%JAR_PATH%" (
    echo.
    echo [BUILD] JAR file not found. Packaging Backend with Maven...
    cd /d "%~dp0backend-java"
    call mvnw.cmd clean package -DskipTests
    cd /d "%~dp0"
)

echo.
echo ====================================================
echo   Starting Spring Boot API on http://localhost:8080
echo   Swagger UI:   http://localhost:8080/swagger-ui.html
echo   Actuator:     http://localhost:8080/actuator/health
echo   (Press Ctrl+C to stop)
echo ====================================================
echo.

java -jar "%JAR_PATH%"
