# Balance bot: runs tools/balance.html headless and prints the table.
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\balance.ps1 [-Runs 4] [-Skill good|avg|poor] [-Only q2_stag,q3_boar]
param([int]$Port = 8125, [int]$Runs = 4, [string]$Skill = 'good', [string]$Only = '', [switch]$God, [int]$BudgetMs = 900000)
$ErrorActionPreference = 'Stop'
$browsers = @('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', 'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
              'C:\Program Files\Google\Chrome\Application\chrome.exe', 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe')
$exe = $null; foreach ($b in $browsers) { if (Test-Path -LiteralPath $b) { $exe = $b; break } }
if (-not $exe) { throw 'No Edge/Chrome found' }
$srv = Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $PSScriptRoot 'serve.ps1') + '" -Port ' + $Port)
try {
  for ($i = 0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 300; try { [void](Invoke-WebRequest -Uri "http://localhost:$Port/index.html" -UseBasicParsing -TimeoutSec 2); break } catch {} }
  $prof = Join-Path $env:TEMP ('bh-bal-' + [guid]::NewGuid().ToString('N'))
  $out = Join-Path $env:TEMP ('bh-bal-' + [guid]::NewGuid().ToString('N') + '.html')
  $url = 'http://localhost:' + $Port + '/tools/balance.html?runs=' + $Runs + '&skill=' + $Skill + $(if ($Only) { '&only=' + $Only } else { '' }) + $(if ($God) { '&god=1' } else { '' })
  $args = @('--headless=new', '--disable-gpu', '--no-first-run', ('--user-data-dir="' + $prof + '"'), ('--virtual-time-budget=' + $BudgetMs), '--dump-dom', $url)
  [void](Start-Process -FilePath $exe -ArgumentList $args -PassThru -Wait -WindowStyle Hidden -RedirectStandardOutput $out)
  $html = [System.IO.File]::ReadAllText($out, [System.Text.Encoding]::UTF8)
  $m = [regex]::Match($html, '<pre id="log">([\s\S]*?)</pre>')
  if (-not $m.Success) { throw 'no log produced' }
  [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
} finally { if ($srv -and -not $srv.HasExited) { Stop-Process -Id $srv.Id -Force } }
