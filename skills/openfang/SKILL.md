---
name: openfang-integration
description: >
  Integracion con OpenFang Agent OS — como usar Hands, canales, y
  capacidades de seguridad desde WHOAMI. Cargar via skill("openfang")
  cuando se trabaja con OpenFang backend.
origin: WHOAMI
---

# OpenFang Integration Skill

WHOAMI + OpenFang = orchestracion WHOAMI + ejecucion OpenFang.

## Backend

WHOAMI se conecta a OpenFang via HTTP REST en `http://127.0.0.1:4200`.

Config en `whoami.config.json`:
```json
{
  "backend": "openfang",
  "openfang": {
    "endpoint": "http://127.0.0.1:4200",
    "channels": ["telegram", "slack", "discord"],
    "defaultHands": ["researcher", "browser"]
  }
}
```

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| `whoami hands` | Listar Hands disponibles y estado |
| `whoami hand-activate <name> [--schedule]` | Activar Hand |
| `whoami hand-pause <name>` | Pausar Hand |
| `whoami hand-status <name>` | Estado detallado del Hand |
| `whoami channels` | Listar canales y estado |
| `whoami send <channel> <message>` | Enviar mensaje por canal |
| `whoami security` | Reporte de seguridad OpenFang |

## TUI

En modo interactivo (`whoami tui`), opciones Hands, Channels y Security
aparecen cuando el backend es OpenFang.

## Hands como agentes WHOAMI

Los 7 Hands de OpenFang estan registrados como subagentes en opencode.json:

- `/clip` — YouTube shorts pipeline
- `lead` — Lead generation diaria
- `collector` — Monitoreo OSINT
- `predictor` — Superforecasting
- `researcher` — Investigacion profunda
- `twitter` — Gestion autonomo de X/Twitter
- `browser` — Automatizacion web

## Pipeline research

```
WHOAMI clasifica -> researcher -> predictor
```
Para tareas de investigacion y analisis predictivo.

## Canales (40 disponibles)

Los mas usados: telegram, discord, slack, whatsapp, signal, email,
teams, mattermost, messenger, reddit, linkedin, webhook.

Cada canal soporta: rate limiting, DM/group policies, y formateo de salida.
