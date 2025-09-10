# Debug netstat parsing
Write-Host "=== Debug Netstat Parsing ===" -ForegroundColor Cyan

$netstat = netstat -ano | Select-String "LISTENING" | Select-Object -First 3

foreach ($line in $netstat) {
    Write-Host "Full line: $($line.Line)" -ForegroundColor Yellow
    $parts = $line.Line -split '\s+'
    Write-Host "Number of parts: $($parts.Count)" -ForegroundColor Green

    for ($i = 0; $i -lt $parts.Count; $i++) {
        Write-Host "  Part[$i]: '$($parts[$i])'" -ForegroundColor White
    }
    Write-Host ""
}
