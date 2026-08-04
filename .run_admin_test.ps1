$ProjectDir = "D:\Alparai"
$env:IS_PLAYWRIGHT_TEST = "true"

Write-Host "Starting dev server with IS_PLAYWRIGHT_TEST=true..."

# Start dev server in background
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "pnpm"
$psi.Arguments = "dev"
$psi.WorkingDirectory = $ProjectDir
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.EnvironmentVariables["IS_PLAYWRIGHT_TEST"] = "true"

$proc = [System.Diagnostics.Process]::Start($psi)
Write-Host "Dev server PID: $($proc.Id)"

# Wait for server to start
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $r = [System.Net.WebRequest]::Create("http://localhost:3000/en/admin")
        $r.Timeout = 3000
        $resp = $r.GetResponse()
        $resp.Close()
        if ($resp.StatusCode -eq 200) {
            $ready = $true
            Write-Host "Dev server ready!"
            break
        }
    } catch {
        Write-Host "Waiting... ($($i+1)/30)"
    }
}

if (-not $ready) {
    Write-Host "Dev server failed to start!"
    $proc.Kill()
    exit 1
}

# Run the admin test
Write-Host "`nRunning admin test..."
node D:\Alparai\.admin_test.cjs 2>&1

# Cleanup
Write-Host "`nStopping dev server..."
$proc.Kill()
Write-Host "Done."
