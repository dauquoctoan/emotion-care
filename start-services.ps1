<#
.SYNOPSIS
  Khởi động toàn bộ Database, Backend Java và Go Workers cho Emotion Care Platform
#>

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  EMOTION CARE PLATFORM - START ALL SERVICES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Kiểm tra Docker
Write-Host "[1/4] Kiểm tra Docker engine..." -ForegroundColor Yellow
$dockerReady = $false
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerReady = $true }
} catch {}

if (-not $dockerReady) {
    Write-Host "[!] Docker Desktop chưa chạy hoặc chưa sẵn sàng." -ForegroundColor Red
    Write-Host "    Vui lòng mở Docker Desktop trên màn hình máy tính của bạn và chạy lại script này." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker đã sẵn sàng." -ForegroundColor Green

# 2. Khởi động PostgreSQL, Redis, Kafka
Write-Host "`n[2/4] Khởi động Database & Message Broker (PostgreSQL, Redis, Kafka)..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml up -d postgres redis kafka

Write-Host "Chờ PostgreSQL sẵn sàng kết nối..." -ForegroundColor Cyan
$retries = 20
$dbUp = $false
for ($i = 0; $i -lt $retries; $i++) {
    Start-Sleep -Seconds 2
    $check = docker exec emotion-postgres-local pg_isready -U postgres -d emotion_care 2>&1
    if ($check -match "accepting connections") {
        $dbUp = $true
        break
    }
    Write-Host "    Đang đợi Database... ($i)" -ForegroundColor DarkGray
}

if (-not $dbUp) {
    Write-Host "[!] Database chưa phản hồi kịp thời. Vui lòng kiểm tra docker logs emotion-postgres-local." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] PostgreSQL, Redis và Kafka đã sẵn sàng hoạt động!" -ForegroundColor Green

# 3. Khởi động Backend API (Java Spring Boot)
Write-Host "`n[3/4] Khởi động Backend Java API (Port 8080)..." -ForegroundColor Yellow
$jarPath = ".\backend-java\emotion-api-svc\target\emotion-api-svc-1.0.0-SNAPSHOT.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "Đang build Backend JAR..." -ForegroundColor Cyan
    Push-Location .\backend-java
    .\mvnw.cmd clean package -DskipTests
    Pop-Location
}

$backendProc = Start-Process java -ArgumentList "-jar", $jarPath -PassThru
Write-Host "[OK] Backend Java đã chạy với Process ID: $($backendProc.Id)" -ForegroundColor Green

# 4. Khởi động 2 Go Workers
Write-Host "`n[4/4] Khởi động các Go Workers..." -ForegroundColor Yellow

$relayExe = ".\workers-go\emotion-outbox-relay\emotion-outbox-relay.exe"
if (-not (Test-Path $relayExe)) {
    Push-Location .\workers-go\emotion-outbox-relay
    go build -o emotion-outbox-relay.exe
    Pop-Location
}
$relayProc = Start-Process $relayExe -PassThru
Write-Host "[OK] Outbox Relay Worker đã chạy với Process ID: $($relayProc.Id)" -ForegroundColor Green

$workerExe = ".\workers-go\emotion-notification-worker\emotion-notification-worker.exe"
if (-not (Test-Path $workerExe)) {
    Push-Location .\workers-go\emotion-notification-worker
    go build -o emotion-notification-worker.exe
    Pop-Location
}
$workerProc = Start-Process $workerExe -PassThru
Write-Host "[OK] Notification Worker đã chạy với Process ID: $($workerProc.Id)" -ForegroundColor Green

Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host "  TẤT CẢ DỊCH VỤ ĐÃ ĐƯỢC KHỞI ĐỘNG THÀNH CÔNG!" -ForegroundColor Green
Write-Host "  - Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "  - Actuator Health: http://localhost:8080/actuator/health" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Green
