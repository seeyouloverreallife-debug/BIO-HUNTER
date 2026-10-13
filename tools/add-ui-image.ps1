# Add or replace one image in art\ui.js (window.BH_UI)
#   powershell -File tools\add-ui-image.ps1 -Key vil_new -File C:\path\image.webp -W 200 -H 150
# After that run tools\build.ps1 only if you also changed src/ (art/ui.js is loaded directly by index.html).
param(
  [Parameter(Mandatory = $true)][string]$Key,
  [Parameter(Mandatory = $true)][string]$File,
  [Parameter(Mandatory = $true)][int]$W,
  [Parameter(Mandatory = $true)][int]$H,
  [string]$Mime = 'image/webp'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$p = Join-Path $root 'art\ui.js'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$t = [System.IO.File]::ReadAllText($p, $utf8).TrimEnd("`r", "`n")
if (-not $t.StartsWith('window.BH_UI={') -or -not $t.EndsWith('};')) { throw 'unexpected shape of art/ui.js' }
$uri = 'data:' + $Mime + ';base64,' + [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($File))
$entry = '"' + $Key + '":{"src":"' + $uri + '","w":' + $W + ',"h":' + $H + '}'
$pat = '"' + [regex]::Escape($Key) + '":\{"src":"[^"]*","w":\d+,"h":\d+\}'
if ([regex]::IsMatch($t, $pat)) {
  $ev = [System.Text.RegularExpressions.MatchEvaluator] { param($m) $entry }
  $t = [regex]::Replace($t, $pat, $ev); $act = 'replaced'
} else {
  $t = $t.Substring(0, $t.Length - 2) + ',' + $entry + '};'; $act = 'added'
}
# validate: must still be a JSON object
Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer; $ser.MaxJsonLength = 2147483647
$obj = $ser.DeserializeObject($t.Substring('window.BH_UI='.Length, $t.Length - 'window.BH_UI='.Length - 1))
[System.IO.File]::WriteAllText($p, $t + "`n", $utf8)
'{0} "{1}" ({2}x{3}) - art/ui.js now has {4} images' -f $act, $Key, $W, $H, $obj.Keys.Count
