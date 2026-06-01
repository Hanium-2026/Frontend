param(
  [string]$BackendPath,
  [switch]$SkipInstall,
  [switch]$SkipDocker,
  [switch]$StartBackend,
  [switch]$StartAi,
  [switch]$SkipAi,
  [switch]$SkipAiInstall
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DevDir = Join-Path $Root ".dev"
$ShouldStartAi = ($StartBackend -or $StartAi) -and -not $SkipAi

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-PortListening($Port) {
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  return $null -ne $connection
}

function Get-LanIp {
  $defaultRoute = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

  if ($defaultRoute) {
    $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $defaultRoute.InterfaceIndex -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
      Select-Object -First 1 -ExpandProperty IPAddress
    if ($ip) { return $ip }
  }

  $fallback = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.InterfaceOperationalStatus -eq "Up" } |
    Select-Object -First 1 -ExpandProperty IPAddress
  if ($fallback) { return $fallback }

  throw "Could not find a LAN IP address. Check Wi-Fi or Ethernet."
}

function Resolve-BackendPath {
  if ($BackendPath) {
    return (Resolve-Path $BackendPath).Path
  }

  $candidates = @(
    (Join-Path $Root "..\Backend"),
    (Join-Path $Root "..\Hanium-2026\Backend"),
    (Join-Path ([Environment]::GetFolderPath("Desktop")) "Backend"),
    (Join-Path $env:USERPROFILE "Desktop\Backend")
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path (Join-Path $candidate "gradlew.bat"))) {
      return (Resolve-Path $candidate).Path
    }
  }

  return $null
}

Write-Step "Checking required tools"
foreach ($command in @("node", "npm")) {
  if (-not (Test-Command $command)) {
    throw "$command was not found. Install Node.js LTS, then retry."
  }
}

if (-not $SkipDocker -and -not (Test-Command "docker")) {
  throw "docker was not found. Install Docker Desktop, then retry."
}

if ($ShouldStartAi -and -not (Test-Command "python")) {
  throw "python was not found. Install Python, then retry."
}

if (-not $SkipInstall) {
  Write-Step "Installing frontend dependencies"
  Push-Location $Root
  npm install
  Pop-Location
}

$lanIp = Get-LanIp
$envPath = Join-Path $Root ".env.local"
$envContent = @"
EXPO_PUBLIC_BACKEND_BASE=http://$lanIp`:8080
EXPO_PUBLIC_AI_BASE=http://$lanIp`:8000
"@
Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Step "Generated .env.local"
Write-Host "EXPO_PUBLIC_BACKEND_BASE=http://$lanIp`:8080"
Write-Host "EXPO_PUBLIC_AI_BASE=http://$lanIp`:8000"

if (-not $SkipDocker) {
  Write-Step "Preparing Docker containers"
  docker info | Out-Null

  $dbExists = docker ps -a --format "{{.Names}}" | Select-String -SimpleMatch "nevo-db"
  if ($dbExists) {
    docker start nevo-db | Out-Null
  } else {
    docker run -d --name nevo-db -p 5433:5432 `
      -e POSTGRES_DB=nevo -e POSTGRES_USER=nevo -e POSTGRES_PASSWORD=nevo_backend postgres:15 | Out-Null
  }

  $redisExists = docker ps -a --format "{{.Names}}" | Select-String -SimpleMatch "nevo-redis"
  if ($redisExists) {
    docker start nevo-redis | Out-Null
  } else {
    docker run -d --name nevo-redis -p 6379:6379 redis:7 | Out-Null
  }
}

if ($StartBackend) {
  Write-Step "Starting backend server"
  $resolvedBackend = Resolve-BackendPath
  if (-not $resolvedBackend) {
    throw "Backend path was not found. Pass -BackendPath `"C:\path\to\Backend`"."
  }

  New-Item -ItemType Directory -Force -Path $DevDir | Out-Null
  $backendLog = Join-Path $DevDir "backend.log"
  if (Test-PortListening 8080) {
    Write-Host "Backend already appears to be listening on port 8080."
  } else {
    $backendCommand = "`$env:DB_PORT='5433'; .\gradlew.bat bootRun *> `"$backendLog`""
    Start-Process powershell -WindowStyle Hidden -WorkingDirectory $resolvedBackend -ArgumentList @(
      "-ExecutionPolicy", "Bypass",
      "-Command", $backendCommand
    )
  }
  Write-Host "Backend: http://$lanIp`:8080"
  Write-Host "Log: $backendLog"
}

if ($ShouldStartAi) {
  Write-Step "Starting AI score server"

  if (-not $SkipAiInstall) {
    Write-Step "Installing AI Python dependencies"
    Push-Location $Root
    python -m pip install -r requirements-ai.txt
    Pop-Location
  }

  New-Item -ItemType Directory -Force -Path $DevDir | Out-Null
  $aiLog = Join-Path $DevDir "ai.log"
  if (Test-PortListening 8000) {
    Write-Host "AI score server already appears to be listening on port 8000."
  } else {
    $aiCommand = "`$env:PYTHONUNBUFFERED='1'; python scripts\nevo_score_server.py *> `"$aiLog`""
    Start-Process powershell -WindowStyle Hidden -WorkingDirectory $Root -ArgumentList @(
      "-ExecutionPolicy", "Bypass",
      "-Command", $aiCommand
    )
  }
  Write-Host "AI: http://$lanIp`:8000"
  Write-Host "Log: $aiLog"
}

Write-Step "Next steps"
Write-Host "1. Check backend: http://$lanIp`:8080/swagger-ui/index.html"
Write-Host "2. Check AI score server: http://$lanIp`:8000"
Write-Host "3. Start Expo: npx expo start"
Write-Host "4. Scan the QR code with Expo Go. Phone and PC must be on the same Wi-Fi."
