Write-Host "Test script starting..." -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Test netstat
Write-Host "Testing netstat..." -ForegroundColor Cyan
$netstatOutput = netstat -ano | Select-String "LISTENING" | Select-Object -First 5
Write-Host "Netstat results:" -ForegroundColor White
$netstatOutput

Write-Host "Test script completed." -ForegroundColor Green
