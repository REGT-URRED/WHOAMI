---
name: silent-verify
description: >
  Verificación silenciosa post-edit — después de cada archivo modificado,
  ejecuta tsc --noEmit y lint automáticamente, auto-fixea errores triviales
  sin desplegar agentes, y solo escala a sub-agentes para errores complejos.
origin: WHOAMI v2
---

# Silent Verify — Verificación Silenciosa

Después de CADA archivo modificado (sea por edición directa o por sub-agente),
ejecuta este pipeline SILENCIOSO (sin preguntar al usuario):

## Pipeline Post-Edit

### Paso 1: TypeScript Check
```bash
npx tsc --noEmit 2>&1 | Select-String "error TS"
```

Si hay errores:
- 1 error trivial (type mismatch, missing import) → auto-fix directo
- 2-3 errores en el mismo archivo → intentar fix, re-check
- 4+ errores o errores cross-file → marcar para build-error-resolver

### Paso 2: Lint
```bash
npm run lint 2>&1 | Select-String "error|warning"
```

Si hay warnings:
- auto-fix si `--fix` disponible → `npx eslint . --fix --quiet`
- Si queda algún error lint → marcar para code-reviewer

### Paso 3: Diff Tracker
```bash
git diff --name-only
git diff --stat
```

Registrar:
- Archivos modificados en esta fase
- Líneas agregadas/eliminadas
- No preguntar, solo registrar mentalmente

### Paso 4: Decisión

| Resultado | Acción |
|-----------|--------|
| tsc OK + lint OK | ✅ Avanzar a siguiente archivo/fase |
| tsc OK + lint warnings | ⚠️ Anotar, avanzar (fix al final si sobra tiempo) |
| tsc errors ≤ 3 + mismo archivo | 🔧 Auto-fix directo (no desplegar agente) |
| tsc errors > 3 o cross-file | 🚨 Marcar para build-error-resolver |
| lint errors | 🚨 Marcar para code-reviewer |

## Reglas

- NO preguntar al usuario durante silent verify
- NO desplegar agentes para errores triviales (≤3, mismo archivo)
- Solo desplegar build-error-resolver si: errores cross-file, >3 errores, o auto-fix falló
- Si auto-fix rompe algo más → revertir cambio, marcar para agente

## Output (solo si hay errores no triviales)

```
[Silent Verify] src/api/users.ts → ❌ tsc: 2 errors (auto-fixed) ✅
[Silent Verify] src/api/users.ts → ❌ lint: 1 error (requires agent)
  → Desplegando code-reviewer...

[Silent Verify] src/components/Login.tsx → ✅ tsc: clean
[Silent Verify] src/components/Login.tsx → ✅ lint: clean
```
