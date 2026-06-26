---
description: Fast build mode — WHOAMI executes BUILD pipeline directly (T2-T3)
agent: whoami
subtask: true
---

# /build — Modo Build Rápido

$ARGUMENTS

## Modo operativo

Estás en **modo build rápido**. Saltas ETAPA 2 (planificación detallada) y ejecutas directamente el pipeline BUILD:

```
BUILD: WHOAMI → architect → tdd-guide → code-reviewer → build-error-resolver → ramon
```

**Pipeline abreviado:**
1. Clasifica scope (T2 o T3) — sin planificación extensa
2. Despliega agentes según tier
3. Verifica gates (build + lint + tests)
4. Entrega resultado

## Modo de ejecución específico

- **NO planifiques.** Clasifica y ejecuta.
- **NO preguntes confirmación.** Build rápido = ejecución directa.
- **SIEMPRE verifica gates** después de cada fase.
- **Si scope es T4 (large)** → detente, reporta: "T4 detected. Use /plan first."

## Verificación final obligatoria

Antes de entregar:
1. `tsc --noEmit` — 0 errores (o equivalente según stack)
2. `lint` — clean
3. `npm test` — todos verdes (o equivalente)

## Formato de entrega

```
## Build: [resultado]

- Tier: [T2|T3]
- Agentes usados: [lista]
- Iteraciones: [X]
- Gates: build [PASS/FAIL] · lint [PASS/FAIL] · tests [PASS/FAIL]
- Optimalidad: [PASS/FAIL]

## Archivos modificados
- [lista]

## Notas
- [decisiones tomadas, issues encontrados, pendientes]
```

---

**CRITICAL**: Build rápido, sin planificación. Si scope > T3, abortar y pedir /plan.
