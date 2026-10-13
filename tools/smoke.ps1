# Headless smoke tests: serves the project, runs tools/smoke.html (desktop) and tools/smoke-touch.html (phone, touch events)
# in Edge/Chrome (headless) and prints the result. Exit code 0 = everything passed.
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\smoke.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\smoke.ps1 -Only touch     (or: desktop)
param([int]$Port = 8124, [int]$BudgetMs = 90000, [ValidateSet('all', 'desktop', 'touch')][string]$Only = 'all')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$browsers = @('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', 'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
              'C:\Program Files\Google\Chrome\Application\chrome.exe', 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe')
$exe = $null; foreach ($b in $browsers) { if (Test-Path -LiteralPath $b) { $exe = $b; break } }
if (-not $exe) { throw 'No Edge/Chrome found. Open http://localhost:8123/tools/smoke.html manually (after tools\serve.ps1).' }

$suites = @()
if ($Only -ne 'touch') { $suites += , @('desktop', 'smoke.html', @()) }
if ($Only -ne 'desktop') { $suites += , @('touch', 'smoke-touch.html', @('--touch-events=enabled')) }

$code = 0
$srv = Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $PSScriptRoot 'serve.ps1') + '" -Port ' + $Port)
try {
  for ($i = 0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 300; try { [void](Invoke-WebRequest -Uri "http://localhost:$Port/index.html" -UseBasicParsing -TimeoutSec 2); break } catch {} }
  foreach ($s in $suites) {
    $prof = Join-Path $env:TEMP ('bh-smoke-' + [guid]::NewGuid().ToString('N'))
    $out = Join-Path $env:TEMP ('bh-smoke-' + [guid]::NewGuid().ToString('N') + '.html')
    $args = @('--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', ('--user-data-dir="' + $prof + '"'),
              ('--virtual-time-budget=' + $BudgetMs)) + $s[2] + @('--dump-dom', ('http://localhost:' + $Port + '/tools/' + $s[1]))
    [void](Start-Process -FilePath $exe -ArgumentList $args -PassThru -Wait -WindowStyle Hidden -RedirectStandardOutput $out)
    $html = [System.IO.File]::ReadAllText($out, [System.Text.Encoding]::UTF8)
    $m = [regex]::Match($html, '<pre id="log">([\s\S]*?)</pre>')
    if (-not $m.Success) { Write-Host ("[{0}] smoke page produced no log" -f $s[0]) -ForegroundColor Red; $code = 1; continue }
    $text = [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
    $lines = $text -split "`n"
    $fail = $lines | Where-Object { $_ -match '^FAIL' }
    $pass = ($lines | Where-Object { $_ -match '^PASS' }).Count
    if ($fail) { $fail | ForEach-Object { Write-Host ("[{0}] {1}" -f $s[0], $_) -ForegroundColor Red } }
    if ($text -match 'RESULT: ALL PASSED') { Write-Host ("SMOKE OK [{0}] - {1} checks passed" -f $s[0], $pass) -ForegroundColor Green }
    else { Write-Host ("SMOKE FAILED [{0}] - {1} passed, {2} failed (or did not finish)" -f $s[0], $pass, @($fail).Count) -ForegroundColor Red; $code = 1 }
  }
} finally {
  if ($srv -and -not $srv.HasExited) { Stop-Process -Id $srv.Id -Force }
}
exit $code
