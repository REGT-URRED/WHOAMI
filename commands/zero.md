---
description: Zero terminal coding agent — sandbox, session, doctor commands
agent: zero
subtask: true
---

# /zero — Zero Terminal Coding Agent

$ARGUMENTS

## Subcomandos

### /zero:doctor [dependency...]
Diagnostica la salud del sistema. Sin argumentos revisa todas las dependencias.
```
/zero:doctor
/zero:doctor node python git
```

### /zero:sandbox <action> [args]
Gestiona el sandbox de permisos.
- `policy` — muestra la politica actual
- `audit` — muestra el log de auditoria
- `gate <gateKind> <target>` — verifica si un gate permite acceso
- `build <workspaceRoot>` — construye un SandboxPolicy con valores por defecto

### /zero:session <action> [args]
Gestiona sesiones del agente.
- `list` — lista sesiones recientes
- `create <label>` — crea nueva sesion
- `get <id>` — muestra detalle de sesion
- `search <query>` — busca en sesiones
- `fork <id> <label>` — fork de sesion
- `checkpoint <id> <label>` — crear checkpoint
- `restore <checkpointId>` — restaurar checkpoint

## Modo operativo

1. Parsear el subcomando y argumentos
2. Cargar skill zero si es necesario
3. Ejecutar la accion correspondiente
4. Devolver resultado formateado

## Pipeline por tipo

```
/zero:doctor:   parse args -> HealthChecker.runAll() o Doctor.diagnose(nombres)
/zero:sandbox:  parse args -> SandboxPolicyBuilder / PermissionGate / auditLog()
/zero:session:  parse args -> SessionStore / CheckpointManager / SessionFork
```

## Formato de entrega

```
## /zero:[subcomando] result

[resultado formateado segun accion]

- Duracion: [tiempo]
- Estado: [OK/ERROR]
```
