<#
.SYNOPSIS
  Stop all Services: Go Workers, Backend Spring Boot, and Docker containers
#>

Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host "  EMOTION CARE PLATFORM - STOPPING ALL SERVICES" -ForegroundColor Magenta
Write-Host "=====================================================" -ForegroundColor Magenta

# Stop Go workers
Get-Process -Name "emotion-outbox-relay", "emotion-notification-worker" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping Worker: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

# Stop Java backend
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*emotion-api-svc*" -or (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" | Select-Object -ExpandProperty CommandLine) -like "*emotion-api-svc*"
} | ForEach-Object {
    Write-Host "Stopping Backend Java (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

# Stop Docker compose
Write-Host "Stopping Docker containers (postgres, redis, kafka)..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml down

Write-Host "All services stopped cleanly." -ForegroundColor Green
