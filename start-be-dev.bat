@echo off
title Emotion Care - Spring Boot (Maven Dev Mode)
cd /d "%~dp0backend-java"

echo ====================================================
echo   EMOTION CARE - START BACKEND VIA MAVEN (DEV MODE)
echo   Module: emotion-api-svc
echo ====================================================
echo.

call mvnw.cmd spring-boot:run -pl emotion-api-svc
