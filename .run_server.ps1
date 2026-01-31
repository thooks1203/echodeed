$logPath = Join-Path $PSScriptRoot '.server_run.log'
if (Test-Path $logPath) { Remove-Item $logPath -Force -ErrorAction SilentlyContinue }

# Load environment variables from a local .env file if present
$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $parts = $line -split('=',2)
    if ($parts.Count -ge 2) {
      $key = $parts[0].Trim()
      $val = $parts[1].Trim()
      if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
        $val = $val.Substring(1,$val.Length-2)
      }
      [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
  }
} else {
  Write-Output "No .env file found; ensure env vars are set in your environment."
}

Set-Location $PSScriptRoot
# Spawn the server as a detached process so it stays running and logs to .server_run.log
$cmd = "npm run start >> `"$logPath`" 2>>&1"
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmd -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
