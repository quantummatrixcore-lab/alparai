$proc = Start-Process -PassThru -FilePath "npx.cmd" -ArgumentList "next start"
Write-Host "Waiting for server to start on port 3000..."
while (!(Test-NetConnection localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded) { Start-Sleep -Seconds 2 }
Write-Host "Server is up! Running find right edge..."
node scratch/find-right-edge.mjs
Write-Host "Completed. Stopping server."
Stop-Process -Id $proc.Id -Force
