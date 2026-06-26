param(
  [string]$ProjectPath = "."
)

$WHOAMI_ROOT = "D:\ARCHIVO\whoami"
$ProjectDir = Resolve-Path -LiteralPath $ProjectPath
$OpenCodeDir = Join-Path -Path $ProjectDir -ChildPath ".opencode"

if (Test-Path -LiteralPath $OpenCodeDir) {
  Write-Warning "WHOAMI ya está activo en este proyecto (.opencode existe)."
  Write-Warning "Ejecuta 'whoami-off.ps1' primero o elimina .opencode manualmente."
  exit 1
}

Write-Host "Activando WHOAMI en: $ProjectDir" -ForegroundColor Green

New-Item -ItemType Directory -Path $OpenCodeDir -Force | Out-Null

Copy-Item -Path "$WHOAMI_ROOT\opencode.json" -Destination "$OpenCodeDir\opencode.json" -Force

if (Test-Path -LiteralPath "$WHOAMI_ROOT\AGENTS.md") {
  Copy-Item -Path "$WHOAMI_ROOT\AGENTS.md" -Destination "$OpenCodeDir\AGENTS.md" -Force
}

if (Test-Path -LiteralPath "$WHOAMI_ROOT\whoami-state.md") {
  Copy-Item -Path "$WHOAMI_ROOT\whoami-state.md" -Destination "$OpenCodeDir\whoami-state.md" -Force
}

$SkillsDir = Join-Path -Path $OpenCodeDir -ChildPath "skills"
if (Test-Path -LiteralPath $SkillsDir) {
  Remove-Item -Path $SkillsDir -Recurse -Force
}
New-Item -ItemType Junction -Path $SkillsDir -Target "$WHOAMI_ROOT\skills" -Force | Out-Null

Write-Host "WHOAMI activado exitosamente." -ForegroundColor Green
Write-Host "Abre opencode desde esta carpeta para usar WHOAMI." -ForegroundColor Yellow
Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  /whoami      Meta-orquestador multi-agente"
Write-Host "  /plan        Modo planificación (sin ejecución)"
Write-Host "  /build       Build rápido T2-T3"
Write-Host "  /review      Auditoría de optimalidad"
Write-Host "  /audit-open  Auditoría completa del repositorio"
