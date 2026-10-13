# Bio-Hunter build: src/ (template + css + js parts) + art/ -> index.html
#   tools\build.ps1            -> index.html  (loads images from art/art.js and art/ui.js)
#   tools\build.ps1 -Single    -> dist\index.single.html  (everything inline in one file)
#   tools\build.ps1 -Out path  -> write to the given path
param([switch]$Single, [string]$Out = '')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
function ReadText([string]$p) { return [System.IO.File]::ReadAllText($p, $utf8) }

$tpl = ReadText (Join-Path $root 'src\index.template.html')
$sbc = New-Object System.Text.StringBuilder
foreach ($f in (Get-ChildItem (Join-Path $root 'src\css') -Filter *.css | Sort-Object Name)) { [void]$sbc.Append((ReadText $f.FullName)) }
$sbj = New-Object System.Text.StringBuilder; $names = @()
foreach ($f in (Get-ChildItem (Join-Path $root 'src\js') -Filter *.js | Sort-Object Name)) { [void]$sbj.Append((ReadText $f.FullName)); $names += $f.Name }

if ($Single) {
  $a = (ReadText (Join-Path $root 'art\art.js')).TrimEnd("`r", "`n"); $u = (ReadText (Join-Path $root 'art\ui.js')).TrimEnd("`r", "`n")
  $v = (ReadText (Join-Path $root 'art\visual.js')).TrimEnd("`r", "`n")
  $artBlock = '<script>' + $a + "</script>`n<script>" + $u + "</script>`n<script>" + $v + "</script>`n"
} else {
  $artBlock = "<script src=`"art/art.js`"></script>`n<script src=`"art/ui.js`"></script>`n<script src=`"art/visual.js`"></script>`n"
}
$jsBlock = "<script>`n(function () {`n'use strict';`n" + $sbj.ToString() + "})();`n</script>`n"

foreach ($m in '<!--@CSS@-->', '<!--@ART@-->', '<!--@JS@-->') { if (-not $tpl.Contains($m + "`n")) { throw "template marker missing: $m" } }
$html = $tpl.Replace("<!--@CSS@-->`n", $sbc.ToString()).Replace("<!--@ART@-->`n", $artBlock).Replace("<!--@JS@-->`n", $jsBlock)

if (-not $Out) { if ($Single) { $Out = Join-Path $root 'dist\index.single.html' } else { $Out = Join-Path $root 'index.html' } }
$dir = Split-Path -Parent $Out; if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
[System.IO.File]::WriteAllText($Out, $html, $utf8)
# list of js parts (used by tools\check.html to syntax-check each part)
[System.IO.File]::WriteAllText((Join-Path $root 'src\js\_parts.json'), ('[' + (($names | ForEach-Object { '"' + $_ + '"' }) -join ',') + ']'), $utf8)
'built {0}  ({1:N0} bytes, {2} js parts{3})' -f $Out, $html.Length, $names.Count, $(if ($Single) { ', single-file' } else { '' })
