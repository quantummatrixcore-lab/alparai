$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\ALPAR AI Dev.lnk")
$Shortcut.TargetPath = "D:\Alparai\ops\launch.bat"
$Shortcut.WorkingDirectory = "D:\Alparai"
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.Save()
Write-Host "Masaustu kisayolu .bat dosyasina yonlendirildi." -ForegroundColor Green
