# Simple test script
Write-Host "=== Port Manager Test ===" -ForegroundColor Cyan
Write-Host "Testing basic functionality..." -ForegroundColor Yellow

# Test netstat
Write-Host "Testing netstat..." -ForegroundColor Yellow
$netstat = netstat -ano 2>&1
Write-Host "Netstat lines: $($netstat.Count)" -ForegroundColor Green

# Test filtering
Write-Host "Testing filtering..." -ForegroundColor Yellow
$filtered = $netstat | Select-String "LISTENING"
Write-Host "Filtered lines: $($filtered.Count)" -ForegroundColor Green

# Show first few results
Write-Host "First 5 results:" -ForegroundColor Yellow
$filtered | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Line)" -ForegroundColor White }

Write-Host "Test completed." -ForegroundColor Green
