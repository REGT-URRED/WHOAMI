---
name: zero-integration
description: >
  Integracion con Zero terminal coding agent — sistema de permisos, sesiones,
  streaming y diagnostico. Cargar via skill("zero") cuando se trabaja con
  el patron zero de agente terminal.
origin: WHOAMI
---

# Zero Integration Skill

WHOAMI + Zero = sistema de permisos granular + sesiones persistidas + streaming JSON.

## Paquetes

Zero se compone de 4 paquetes dentro del monorepo:

| Paquete | Proposito |
|---------|-----------|
| @whoami/sandbox | PermissionGate, SandboxPolicyBuilder, SubprocessSandbox |
| @whoami/session | SessionStore, CheckpointManager, SessionFork |
| @whoami/stream | StreamJSONParser, ProgressTracker, TurnTracker |
| @whoami/tooling | Doctor, HealthChecker, MacroTool |

## Patron de permisos (zero)

```
PermissionLevel: read-only < write < execute < network

SandboxPolicyBuilder fluent API:
  .setWorkspaceRoot() .allowReadPath() .allowCommand()
  .allowDomain() .allowElevated() .setEnvPassthrough()

PermissionGate con 5 gates:
  fileRead | fileWrite | shellExecute | networkAccess | elevatedAction

SubprocessSandbox:
  env_clear() — entero limpio
  passthrough("PATH", "HOME") — vars selectivas
```

## Patron de sesiones (zero)

```
SessionStore (append-only, ~/.whoami/sessions/):
  create() -> get() -> appendMessage() -> list() -> search()

CheckpointManager:
  create(sessionId, label) -> restore(checkpointId)

SessionFork:
  fork(sourceId, label) -> session paralela
```

## Patron de streaming (zero)

```
StreamJSONParser:
  feed(chunk) -> { token, done } — parsea JSON por streaming

ProgressTracker:
  advance() / done() / error() / toProgressLine()

TurnTracker:
  beginTurn() -> recordToolCall() -> endTurn() -> toStreamEvent()
```

## Patron de diagnostico (zero)

```
HealthChecker:
  checks pre-registrados: crwl, openfang, python, pip, node, etc.
  runAll() -> SystemHealth { checks, passed, failed }

Doctor:
  diagnose() / doctorCommand() -> reporte markdown
```

## Comandos disponibles

- `/zero:doctor` — diagnostico del sistema
- `/zero:sandbox` — gestion de permisos
- `/zero:session` — gestion de sesiones

## Agentes disponibles

- `zero/sandbox-agent` — configuracion de permisos
- `zero/session-agent` — ciclo de vida de sesiones
