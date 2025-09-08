# Minimal Port Manager Test
Write-Host "=== Minimal Port Manager ===" -ForegroundColor Cyan

Write-Host "Getting network connections..." -ForegroundColor Yellow
try {
    $netstat = netstat -ano 2>&1
    Write-Host "Found $($netstat.Count) lines from netstat" -ForegroundColor Green

    $listening = $netstat | Select-String "LISTENING"
    Write-Host "Found $($listening.Count) listening connections" -ForegroundColor Green

    Write-Host "Top 10 listening ports:" -ForegroundColor Yellow
    $listening | Select-Object -First 10 | ForEach-Object {
        $line = $_.Line -split '\s+'
        $protocol = $line[1]
        $local = $line[2]
        $foreign = $line[3]
        $state = $line[4]
        $processId = $line[5]
        Write-Host "  $protocol $local <- $foreign ($state, PID: $processId)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Done." -ForegroundColor Green
