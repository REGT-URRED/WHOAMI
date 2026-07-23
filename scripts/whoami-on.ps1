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
Write-Host "Harness inicializado en: $ProjectDir" -ForegroundColor Cyan
$HarnessDir = Join-Path -Path $ProjectDir -ChildPath ".harness"
$EvalsDir = Join-Path -Path $ProjectDir -ChildPath ".claude\evals"
$ClaudeDir = Join-Path -Path $ProjectDir -ChildPath ".claude"
if (-not (Test-Path -LiteralPath $ClaudeDir)) { New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null }
if (-not (Test-Path -LiteralPath $EvalsDir)) { New-Item -ItemType Directory -Path $EvalsDir -Force | Out-Null }
if (-not (Test-Path -LiteralPath $HarnessDir)) { New-Item -ItemType Directory -Path $HarnessDir -Force | Out-Null }
Write-Host "  .claude/evals/   — Eval-Driven Development artifacts" -ForegroundColor DarkGray
Write-Host "  .harness/        — Harness state and logs" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  /whoami      Meta-orquestador multi-agente"
Write-Host "  /plan        Modo planificacion (sin ejecucion)"
Write-Host "  /build       Build rapido T2-T3"
Write-Host "  /review      Auditoria de optimalidad"
Write-Host "  /audit-open  Auditoria completa del repositorio"
Write-Host "  /harness     Harness Engineering (crear y validar harness)"
Write-Host "  /eval        Eval-Driven Development (definir, ejecutar, promover)"
Write-Host "  /team        Team Factory (generar equipo multi-agente)"
