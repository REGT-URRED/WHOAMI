param(
  [string]$ProjectPath = "."
)

$ProjectDir = Resolve-Path -LiteralPath $ProjectPath
$OpenCodeDir = Join-Path -Path $ProjectDir -ChildPath ".opencode"

if (-not (Test-Path -LiteralPath $OpenCodeDir)) {
  Write-Warning "No hay .opencode en este proyecto. WHOAMI no está activo."
  exit 0
}

Write-Host "Desactivando WHOAMI en: $ProjectDir" -ForegroundColor Yellow

Remove-Item -Path $OpenCodeDir -Recurse -Force

Write-Host "WHOAMI desactivado. .opencode eliminado." -ForegroundColor Green
