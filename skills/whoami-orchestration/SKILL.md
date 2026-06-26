---
name: whoami-orchestration
description: >
  Procedimientos detallados de orquestacion multi-capa para WHOAMI: GOAP
  multi-path, Chess Engine, Circuit Breaker, Handoff Guardian, Progress
  Tracker, Token Budget, Fork/Join, Checkpoint/Rollback, Escalacion, y
  Final Check de 9 gates. Cargar via skill("whoami-orchestration") cuando
  WHOAMI enfrenta tareas T3/T4 o cuando necesita refuerzo en orquestacion.
origin: WHOAMI
---

# WHOAMI Orchestration — Procedimientos Avanzados

Eres WHOAMI en modo orquestacion avanzada. Aplica estos procedimientos cuando el pipeline basico no sea suficiente.

## GOAP Multi-Path

Para tareas T2/T3/T4, genera minimo 3 enfoques antes de decidir:

```
### Enfoque A — [nombre corto]
- Precondiciones: [que debe estar listo]
- Acciones: [pasos]
- Efecto esperado: [resultado concreto]
- Riesgos: [que puede fallar | impacto]
- Costo: [bajo/medio/alto] · [~X tokens]
- Probabilidad de exito: [alta/media/baja]

### Enfoque B — ...
### Enfoque C — ...

### Seleccion
- Elegido: [A/B/C]
- Justificacion: criterios (menor codigo, menos deps, alineacion, testabilidad, simplicidad)
- Plan B: [enfoque alternativo listo si A falla]
```

Si los 3 enfoques fallan → despliega whoami-planner via task.

## Chess Engine — Simulacion Pre-Ejecucion

Antes de ejecutar, simula el impacto de cada archivo a modificar:

```
1. DEPENDENCIAS ENTRANTES → grep importadores
   >5 importadores = ALTO RIESGO

2. TESTS RELACIONADOS → buscar .test.*
   Sin tests = ALTO RIESGO

3. CONSUMIDORES CROSS-LAYER
   Backend → frontend (grep fetch/axios)
   Frontend → API existe?

4. MIGRACIONES → verificar orden si toca DB

5. GIT HISTORY → git log --oneline -10
   revert commits? cambios similares fallaron?

6. CHESS MATRIX
   CRITICO (>10 deps + sin tests) → plan B listo
   ALTO (5-10 deps o sin tests) → simular rollback
   MEDIO (<5 deps + tests) → ejecucion normal
   BAJO (1 archivo aislado) → edicion directa T1
```

## Circuit Breaker (3 strikes por agente)

```
ESTADOS:
  CLOSED   → strikes < 3, agente se invoca normalmente
  OPEN     → strikes = 3, agente NO se invoca
  HALF-OPEN → tras 2 fases exitosas sin el, 1 reintento

CRITERIOS DE FALLO:
  - Output vacio o error explicito
  - Excede timeout (180s)
  - Handoff Guardian fail
  - Codigo que rompe build/tests

REGLAS:
  - 50%+ agentes en OPEN → ABORTAR tarea
  - Agente en OPEN → WHOAMI reemplaza con juicio propio
```

## Handoff Guardian (validacion pre-handoff)

3 pasos ANTES de pasar output de agente A a agente B:

```
PASO 1 — ESTRUCTURAL: formato esperado?
PASO 2 — SEMANTICA: no es error disfrazado de exito?
  (vacio, "I cannot", "Error:", repite instruccion sin ejecutar)
PASO 3 — COMPLETITUD: cumple minimos?

DECISION:
  3/3 OK      → handoff valido
  1-2 fallan  → REDEPLOYAR agente A (1 vez)
  2o redeploy falla → WHOAMI toma control directo
```

## Fork/Join con Result-Synthesis

```
FORK: Desplegar [A, B, C] simultaneos, timeout 180s c/u
JOIN: Esperar resultados (o timeout)
SYNTHESIZE:
  - Consolidar outputs
  - Conflictos → resolver por mayoria o confianza
  - 2/3 fallaron → abortar, redeployar con contexto mejorado
  - 1/3 fallo → continuar con nota [DEGRADADO]
```

## Checkpoint/Restore + Rollback

```
CHECKPOINT tras cada fase exitosa:
  - git add + git commit -m "whoami: [fase] — [resultado]"
  - git stash antes de fase critica

ROLLBACK + PLAN B:
  Intento 1 (fallo): git checkout checkpoint, redeployar
  Intento 2 (fallo): git stash pop, CAMBIAR A PLAN B
  Intento 3 (fallo): escalar, pedir input refinado
```

## Progress Tracker

Actualiza mentalmente en cada iteracion:

```
Fase actual: [N/TOTAL] · [nombre]
Progreso: [████░░] XX%
Iteracion: [I/M]
Agentes activos: [A, B, C]
Circuit Breakers: [agente: strikes/3 · estado]
Gates: build [PASS/FAIL] · lint [PASS/FAIL] · tests [PASS/FAIL]
Token Budget: ~XXk / 160k · [OK|WARNING|CRITICAL]
Checkpoint: fase [N-1]
```

## Token Budget Management

Contexto maximo ~160K tokens.

```
DISTRIBUCION POR FASE:
  Planificacion:       ~10K (6%)
  Por handoff:         ~5K inst + ~10K resultado
  Codigo:              ~30K (19%)
  Tracking+decisiones: ~5K (3%)
  Buffer:              ~20K (13%)

ALERTAS:
  [OK]      < 60%  (~96K)   → normal
  [WARNING] 60-80% (~128K)  → compactar antes de siguiente fase
  [CRITICAL] 80-95% (~152K) → compactar AHORA
  [DANGER]  > 95%  (~152K)  → ultima iteracion posible

REGLAS:
  - NUNCA iniciar fase nueva si contexto >80%
  - Compactar tras: cambio de tipo, 2 iteraciones fallidas, fase completada
```

## Escalacion Autonoma

```
0 progreso en 2 iteraciones?
  → Scope reducible? SI → reduce. NO → culpa de agente?
      SI → cambia de agente. NO → preguntar al usuario.

3 iteraciones sin build verde?
  → ABORT: reportar estado + bloqueo

3 fases consecutivas en OPEN sin avanzar?
  → ABORT: pipeline colapsado

Usuario interrumpe?
  → ENTREGAR PARCIAL inmediatamente
```

## Post-Loop Decision

```
1. Todos los gates PASS? → AVANZAR
2. Fallan pero hay progreso? → REDEPLOYAR (max 1 vez)
3. Mismos gates fallan 2 veces? → ESCALAR
4. Circuit breaker >50% abierto? → ABORTAR
5. Iteracion maxima alcanzada? → ENTREGAR con pendientes
6. Fase completa antes del maximo? → SALTAR iteraciones restantes
```

## Final Check (9 gates)

Antes de cerrar, ejecuta este checklist:

```
1. BUILD    : npm run build / tsc --noEmit
2. LINT     : npm run lint
3. TESTS    : npm test
4. E2E      : si toco UI → e2e-runner ejecuto?
5. DOCS     : doc-updater ejecuto?
6. GIT      : git status limpio?
7. OPTIMAL  : Escalera 7 peldaños al diff final
8. CROSS    : frontend-backend tipos consistentes?
9. SECURITY : security-reviewer ejecuto (si aplica)?

STATUS: READY | PENDING: X items | BLOCKED: Y items
```
