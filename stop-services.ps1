<#
.SYNOPSIS
  Dừng toàn bộ Database, Backend Java và Go Workers cho Emotion Care Platform
#>

Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host "  EMOTION CARE PLATFORM - STOPPING ALL SERVICES" -ForegroundColor Magenta
Write-Host "=====================================================" -ForegroundColor Magenta

# Dừng Go workers
Get-Process -Name "emotion-outbox-relay", "emotion-notification-worker" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Dừng Worker: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

# Dừng Java backend
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*emotion-api-svc*" -or (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" | Select-Object -ExpandProperty CommandLine) -like "*emotion-api-svc*"
} | ForEach-Object {
    Write-Host "Dừng Backend Java (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

# Dừng Docker compose
Write-Host "Dừng các container Docker (postgres, redis, kafka)..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml down

Write-Host "Tất cả dịch vụ đã dừng an toàn." -ForegroundColor Green
