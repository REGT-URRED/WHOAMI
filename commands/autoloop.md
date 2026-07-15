---
description: >
  Autoloop command — manage autonomous loop presets: run, list, status, stop,
  inspect, and preset discovery. Integrates with pi-autoloop pattern.
agent: whoami
subtask: true
---

# /loop — Autonomous Loop Manager

$ARGUMENTS

## Comandos

### /loop:run <preset> "<goal>"
Inicia un autoloop con el preset especificado.

```
/loop:run autocode "Implement OAuth2 login flow"
/loop:run autofix "Fix memory leak in WebSocket handler"
/loop:run autospec "RFC for rate limiting middleware"
```

**Parametros:**
- `preset`: uno de `autocode`, `autoqa`, `autotest`, `autofix`, `autoreview`, `autosec`, `autospec`, `build`, `fix`, `refactor`, `reverse`, `review`
- `goal`: descripcion del objetivo en lenguaje natural
- `--budget $X`: limite de costo (opcional, default del preset)
- `--iterations N`: maximo de iteraciones (opcional, default del preset)

**Comportamiento:**
1. Clasifica la task segun el preset
2. Selecciona el pipeline de agentes
3. Despliega agentes secuencial o paralelamente segun topologia
4. Verifica gates (build, lint, tests, optimalidad) tras cada fase
5. Detecta stalls (output repetido > N iteraciones)
6. Rastrea costo y aborta si excede budget
7. Emite eventos en cada transicion de estado

### /loop:list
Lista todos los loops activos con su estado:

```
Run ID          Preset      Iteration   Status     Cost
loop-1234-abc   autocode    3/15        running    $1.20
loop-5678-def   autofix     0/8         stalled    $0.50
```

### /loop:status <runId>
Muestra estado detallado de un loop especifico.

### /loop:stop <runId>
Detiene un loop en ejecucion.

### /loop:inspect <preset>
Muestra configuracion detallada de un preset: roles, iteraciones maximas, budget, stall threshold.

### /loop:presets
Lista todos los presets disponibles con descripcion.

```
autocode   — Autonomous code: implement features, refactor, TDD pipeline
autoqa     — Quality audit: lint, types, dead code, test gaps
autotest   — Test suite: coverage, edge cases, property-based
autofix    — Bug fix: reproduce, isolate, fix, verify
autoreview — Code review: optimality, security, style
autosec    — Security audit: OWASP, secrets, deps, auth
autospec   — RFC/spec generation: research, draft, review
```

## Pipeline de ejecucion

Cada autoloop sigue:
1. **Classify** — clasifica la task (kind + tier)
2. **Select Pipeline** — elige agentes + topologia
3. **Deploy Agents** — ejecuta agentes en orden secuencial o paralelo
4. **Verify Gates** — build + lint + tests + optimalidad
5. **Track** — stall detection + cost budget + events
6. **Finish** — completed / failed / aborted / stalled
