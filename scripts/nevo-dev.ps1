param(
  [string]$BackendPath,
  [switch]$SkipInstall,
  [switch]$SkipDocker,
  [switch]$StartBackend
)

# 로컬 백엔드 개발 환경 기동: Wi-Fi IP 감지 → Docker(Postgres/Redis) → Backend(Spring).
# 앱은 백엔드 주소를 src/store/serverConfig.js 기본값(또는 앱 내 서버설정 화면)에서 읽는다.
# 실기기 테스트 시 아래 출력되는 IP를 serverConfig.js DEFAULT_BACKEND_BASE에 반영하거나
# 앱 서버설정 화면에서 입력할 것. (AI 추론은 on-device로 전환되어 별도 AI 서버 없음)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DevDir = Join-Path $Root ".dev"

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

if (-not $SkipInstall) {
  Write-Step "Installing frontend dependencies"
  Push-Location $Root
  npm install
  Pop-Location
}

$lanIp = Get-LanIp

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

Write-Step "Next steps"
Write-Host "1. This PC LAN IP: $lanIp"
Write-Host "   -> Set src/store/serverConfig.js DEFAULT_BACKEND_BASE to http://$lanIp`:8080"
Write-Host "      (or change it in the app's server-settings screen)."
Write-Host "2. Check backend: http://$lanIp`:8080/swagger-ui/index.html"
Write-Host "3. Dev build app on the phone, then: npx expo start --dev-client"
Write-Host "   (Phone and PC must be on the same Wi-Fi.)"
