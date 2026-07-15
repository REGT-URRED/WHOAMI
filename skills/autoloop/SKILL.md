---
name: autoloop
description: >
  Presets, comandos, y procedimientos para usar el sistema de autoloops de
  WHOAMI — pi-autoloop pattern con 7 presets, EventEmitter loop manager,
  RunRegistry, stall detection, y cost budget tracking.
origin: WHOAMI + pi-autoloop
---

# Autoloop Skill — WHOAMI Autonomous Loop System

El sistema autoloop permite ejecutar pipelines multi-agente autonomas con deteccion de stalls, control de presupuesto, y registro persistente.

## Arquitectura

```
                          ┌──────────────────┐
                          │  AutoloopManager  │── EventEmitter
                          │  (packages/presets)│  started, completed,
                          │                   │  stalled, aborted
                          └────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
      ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
      │  RunRegistry  │   │ StallDetector│   │   CostBudget     │
      │ .autoloop/    │   │ repeated     │   │  maxUsd tracking │
      │ registry.jsonl│   │ output check │   │  exhaust check   │
      └──────────────┘   └──────────────┘   └──────────────────┘
```

## Presets

| Preset | Agentes | Topologia | Max Iter | Budget |
|--------|---------|-----------|----------|--------|
| autocode | architect → tdd-guide → code-reviewer → build-error-resolver → ramon | sequential | 15 | $8 |
| autoqa | code-reviewer + refactor-cleaner + ramon | parallel | 10 | $4 |
| autotest | tdd-guide → code-reviewer → build-error-resolver | sequential | 12 | $5 |
| autofix | build-error-resolver → tdd-guide → code-reviewer → ramon | sequential | 8 | $4 |
| autoreview | code-reviewer + security-reviewer | parallel | 5 | $2 |
| autosec | security-reviewer → code-reviewer | sequential | 10 | $5 |
| autospec | reverse-explorer → reverse-hypothesis → reverse-spec-writer → code-reviewer | sequential | 8 | $3 |

## RunRegistry (.autoloop/registry.jsonl)

Cada ejecucion se persiste como una linea JSON en `.autoloop/registry.jsonl` en el directorio del proyecto:

```jsonl
{"runId":"loop-1234","preset":"autocode","startedAt":"2026-07-15T10:00:00Z","status":"running","iteration":0,"costUsd":0}
{"runId":"loop-1234","preset":"autocode","startedAt":"2026-07-15T10:00:00Z","status":"completed","iteration":5,"costUsd":2.3}
```

## Uso desde /commands

Los comandos `/loop:run`, `/loop:list`, `/loop:status`, `/loop:stop`, `/loop:inspect`, `/loop:presets` estan definidos en `commands/autoloop.md`.

## Integracion con Orchestrator

El Orchestrator (packages/orchestrator) proporciona:

- `classifyTask()` — determina kind + tier de la task
- `selectPipeline()` — mapea kind a pipeline de agentes
- `deployAgents()` — ejecuta agentes con CircuitBreaker + HandoffGuardian
- `verifyGates()` — build + lint + tests + optimality ladder
- `OptimalityLadder.evaluate()` — 7-rung ponytail check sobre cualquier codigo

## Eventos de AutoloopManager

```typescript
manager.on('started', ({ runId, preset, goal }) => ...)
manager.on('stalled', (runId) => ...)
manager.on('completed', (runId) => ...)
manager.on('stopped', (runId) => ...)
manager.on('finished', (status) => ...)
```
