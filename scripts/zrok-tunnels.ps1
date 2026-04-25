# Uruchamia zrok tunele dla front (4002) i BFF (3001).
#
# Wymagania:
#   - zrok.exe zainstalowany i zalogowany (zrok enable <token>)
#   - docker compose up już uruchomione (porty 127.0.0.1:3001 i 127.0.0.1:4002 nasłuchują)
#
# Użycie (z PowerShell w katalogu repo):
#   .\scripts\zrok-tunnels.ps1                 # ephemeral shares (losowe URL-e)
#   .\scripts\zrok-tunnels.ps1 -Reserved       # stałe URL-e (zalecane)
#   .\scripts\zrok-tunnels.ps1 -Reserved -SyncEnv  # + nadpisuje NEXT_PUBLIC_API_HOST_URL i restart front-service

param(
  [string]$ZrokExe   = "C:\Users\gajda\zrok.exe",
  [int]   $BffPort   = 3001,
  [int]   $FrontPort = 4002,
  [switch]$Reserved,
  [switch]$SyncEnv,
  [string]$BffName   = "opengate-bff",
  [string]$FrontName = "opengate-front"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ZrokExe)) {
  Write-Error "Nie znaleziono zrok.exe pod: $ZrokExe (przekaż -ZrokExe <sciezka>)"
  exit 1
}

function Test-LocalPort([int]$port) {
  try {
    $client = New-Object Net.Sockets.TcpClient
    $iar = $client.BeginConnect("127.0.0.1", $port, $null, $null)
    $ok  = $iar.AsyncWaitHandle.WaitOne(750)
    if ($ok) { $client.EndConnect($iar); $client.Close(); return $true }
    $client.Close(); return $false
  } catch { return $false }
}

if (-not (Test-LocalPort $BffPort))   { Write-Warning "BFF (127.0.0.1:$BffPort) nie odpowiada — odpal najpierw: docker compose up bff-service" }
if (-not (Test-LocalPort $FrontPort)) { Write-Warning "Front (127.0.0.1:$FrontPort) nie odpowiada — odpal najpierw: docker compose up front-service" }

function Ensure-Reserved([string]$name, [int]$port) {
  $existing = & $ZrokExe overview 2>$null | Out-String
  if ($existing -match [regex]::Escape($name)) {
    Write-Host "[reserved] $name już istnieje — pomijam tworzenie"
  } else {
    Write-Host "[reserved] tworzę share: $name -> http://127.0.0.1:$port"
    & $ZrokExe reserve public --unique-name $name "http://127.0.0.1:$port" | Write-Host
  }
}

function Get-ReservedUrl([string]$name) {
  # zrok overview drukuje JSON-podobny output; chwytamy frontend_endpoint dla danego nazwa
  $raw = & $ZrokExe overview 2>$null | Out-String
  $m = [regex]::Matches($raw, '"token"\s*:\s*"' + [regex]::Escape($name) + '".*?"frontend_endpoints"\s*:\s*"([^"]+)"', 'Singleline')
  if ($m.Count -gt 0) { return $m[0].Groups[1].Value.Split(",")[0].Trim() }
  return $null
}

if ($Reserved) {
  Ensure-Reserved $BffName   $BffPort
  Ensure-Reserved $FrontName $FrontPort

  if ($SyncEnv) {
    $bffUrl = Get-ReservedUrl $BffName
    if (-not $bffUrl) { Write-Error "Nie udało się odczytać URL dla $BffName — uruchom 'zrok overview' ręcznie"; exit 1 }

    $repoRoot = Split-Path -Parent $PSScriptRoot
    $envPath  = Join-Path $repoRoot ".env"
    if (-not (Test-Path $envPath)) { Write-Error "Brak .env w $repoRoot"; exit 1 }

    Write-Host "[env] ustawiam NEXT_PUBLIC_API_HOST_URL=$bffUrl w .env"
    $lines = Get-Content $envPath
    if ($lines -match '^NEXT_PUBLIC_API_HOST_URL=') {
      $lines = $lines -replace '^NEXT_PUBLIC_API_HOST_URL=.*', "NEXT_PUBLIC_API_HOST_URL=$bffUrl"
    } else {
      $lines += "NEXT_PUBLIC_API_HOST_URL=$bffUrl"
    }
    Set-Content -Path $envPath -Value $lines -Encoding UTF8

    Write-Host "[docker] restart front-service żeby Next podchwycił nowy NEXT_PUBLIC_API_HOST_URL"
    Push-Location $repoRoot
    try { docker compose restart front-service | Out-Host } finally { Pop-Location }
  }

  Write-Host ""
  Write-Host "Startuje share'y w nowych oknach..."
  Start-Process -FilePath $ZrokExe -ArgumentList @("share","reserved",$BffName)   -WindowStyle Normal
  Start-Process -FilePath $ZrokExe -ArgumentList @("share","reserved",$FrontName) -WindowStyle Normal
}
else {
  Write-Host "Tryb ephemeral — URL-e będą losowe (każde uruchomienie = nowy)."
  Write-Host "Jeśli front ma rozmawiać z BFF przez tunel, użyj -Reserved -SyncEnv."
  Write-Host ""
  Start-Process -FilePath $ZrokExe -ArgumentList @("share","public","http://127.0.0.1:$BffPort")   -WindowStyle Normal
  Start-Process -FilePath $ZrokExe -ArgumentList @("share","public","http://127.0.0.1:$FrontPort") -WindowStyle Normal
}

Write-Host ""
Write-Host "Tunele uruchomione w osobnych oknach. Zamknij okna aby zatrzymać share'y."
if ($Reserved) {
  Write-Host "Sprawdź URL-e: & '$ZrokExe' overview"
}
