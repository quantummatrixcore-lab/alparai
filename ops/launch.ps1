$dir = "D:\Alparai"

Write-Host "ALPAR AI - Dashboard baslatiliyor..." -ForegroundColor Cyan

# wt.exe yolunu bul
$wtCmd = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wtCmd) {
    $wtPath = $wtCmd.Source
} else {
    $wtPath = "$env:LOCALAPPDATA\Microsoft\WindowsApps\wt.exe"
}

if (-not (Test-Path $wtPath)) {
    Write-Host "Windows Terminal bulunamadi. Fallback: pnpm dev:all" -ForegroundColor Yellow
    Set-Location $dir
    pnpm dev:all
    exit
}

$devCmd      = "powershell -NoExit -NoProfile -Command `"Set-Location '$dir'; Write-Host '  DEV SERVER' -ForegroundColor Cyan; pnpm dev`""
$openCodeCmd = "powershell -NoExit -NoProfile -Command `"Set-Location '$dir'; Write-Host '  OPENCODE AI' -ForegroundColor Green; opencode`""
$testCmd     = "powershell -NoExit -NoProfile -Command `"Set-Location '$dir'; Write-Host '  TEST SUITE' -ForegroundColor Magenta; pnpm test:watch`""
$gitCmd      = "powershell -NoExit -NoProfile -Command `"Set-Location '$dir'; while(`$true) { Clear-Host; Write-Host '  GIT LOG' -ForegroundColor Yellow; Write-Host ''; git log --oneline -20 --color; Start-Sleep 15 }`""

& $wtPath new-tab --title "DEV SERVER" -- $devCmd `; split-pane -V --title "OPENCODE AI" -- $openCodeCmd `; split-pane -H --title "GIT LOG" -- $gitCmd `; move-focus left `; split-pane -H --title "TEST SUITE" -- $testCmd
