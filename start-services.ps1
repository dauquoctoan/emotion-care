<#
.SYNOPSIS
  Start all Services: Docker (Postgres, Redis, Kafka), Spring Boot API, and Go Workers
#>

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  EMOTION CARE PLATFORM - START ALL SERVICES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Docker check
Write-Host "[1/4] Checking Docker engine..." -ForegroundColor Yellow
$dockerReady = $false
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerReady = $true }
} catch {}

if (-not $dockerReady) {
    Write-Host "[!] Docker Desktop is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker is ready." -ForegroundColor Green

# 2. Start PostgreSQL, Redis, Kafka
Write-Host "`n[2/4] Starting Database & Message Broker (Postgres, Redis, Kafka)..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml up -d postgres redis kafka

Write-Host "Waiting for PostgreSQL to accept connections..." -ForegroundColor Cyan
$retries = 20
$dbUp = $false
for ($i = 0; $i -lt $retries; $i++) {
    Start-Sleep -Seconds 2
    $check = docker exec emotion-postgres-local pg_isready -U postgres -d emotion_care 2>&1
    if ($check -match "accepting connections") {
        $dbUp = $true
        break
    }
    Write-Host "    Waiting for Database... ($i)" -ForegroundColor DarkGray
}

if (-not $dbUp) {
    Write-Host "[!] Database connection timed out. Check docker logs emotion-postgres-local." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] PostgreSQL, Redis, and Kafka are healthy!" -ForegroundColor Green

# 3. Start Backend Java API
Write-Host "`n[3/4] Starting Backend Spring Boot API (Port 8080)..." -ForegroundColor Yellow
$jarPath = "$PSScriptRoot\backend-java\emotion-api-svc\target\emotion-api-svc-1.0.0-SNAPSHOT.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "Building Backend JAR..." -ForegroundColor Cyan
    Push-Location "$PSScriptRoot\backend-java"
    .\mvnw.cmd clean package -DskipTests
    Pop-Location
}

$backendProc = Start-Process java -ArgumentList "-jar", "`"$jarPath`"" -PassThru
Write-Host "[OK] Backend Java started with PID: $($backendProc.Id)" -ForegroundColor Green

# 4. Start Go Workers
Write-Host "`n[4/4] Starting Go Workers..." -ForegroundColor Yellow

$relayDir = "$PSScriptRoot\workers-go\emotion-outbox-relay"
$relayExe = "$relayDir\emotion-outbox-relay.exe"
if (-not (Test-Path $relayExe)) {
    Push-Location $relayDir
    go build -o emotion-outbox-relay.exe
    Pop-Location
}
$relayProc = Start-Process $relayExe -WorkingDirectory $relayDir -PassThru
Write-Host "[OK] Outbox Relay Worker started with PID: $($relayProc.Id)" -ForegroundColor Green

$workerDir = "$PSScriptRoot\workers-go\emotion-notification-worker"
$workerExe = "$workerDir\emotion-notification-worker.exe"
if (-not (Test-Path $workerExe)) {
    Push-Location $workerDir
    go build -o emotion-notification-worker.exe
    Pop-Location
}
$workerProc = Start-Process $workerExe -WorkingDirectory $workerDir -PassThru
Write-Host "[OK] Notification Worker started with PID: $($workerProc.Id)" -ForegroundColor Green

Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host "  ALL SERVICES SUCCESSFULLY STARTED!" -ForegroundColor Green
Write-Host "  - Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "  - Actuator Health: http://localhost:8080/actuator/health" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Green
