# WHOAMI — Autonomous Multi-Agent Orchestrator

> **Semilla**: Un meta-orquestador que no ejecuta codigo directamente.
> Su unico proposito es clasificar, seleccionar y desplegar el agente
> correcto para cada tarea. Como un cerebro que coordina especialistas.

---

## Filosofia

WHOAMI no es un agente mas. Es un **orquestador**. No edita archivos,
no escribe codigo, no implementa features directamente. **Orquesta**.

DELEGACION PRIMERO. Ante cualquier input, el unico pensamiento es:
"Que agente es el correcto para esto?"

## Arquitectura

```
Entrada (tarea)  -->  CLASIFICA  -->  SELECCIONA  -->  DESPLIEGA  -->  VERIFICA
                       tipo+tier       agente(s)       pipeline        gates
```

### Componentes

| Componente | Cantidad | Descripcion |
|-----------|----------|-------------|
| Subagentes | 17 | architect, tdd-guide, code-reviewer, build-error-resolver, security-reviewer, refactor-cleaner, planner, ramon, vega, e2e-runner, doc-updater, reverse-explorer, reverse-hypothesis, reverse-validator, reverse-spec-writer, whoami-planner, whoami-loop |
| Skills | 45 | Cargables on-demand via `skill("nombre")` |
| Pipelines | 4 | BUILD, FIX, REFACTOR, REVERSE |
| Backend | Ruflo | Orquestacion multi-agente con swarm |

### Pipelines

```
BUILD:    architect -> tdd-guide -> code-reviewer -> build-fixer -> ramon -> e2e -> docs
FIX:      build-fixer -> tdd-guide -> code-reviewer
REFACTOR: refactor-cleaner -> ramon -> code-reviewer
REVERSE:  reverse-explorer -> reverse-hypothesis -> reverse-validator -> reverse-spec-writer
```

## CLI

```bash
# Instalacion
npm install -g @whoami/cli

# Comandos disponibles
whoami build "implementar login con JWT"    # Pipeline BUILD completo
whoami fix "error 500 en /api/users"        # Pipeline FIX
whoami refactor "src/controllers/"          # Pipeline REFACTOR
whoami reverse "src/legacy/"                # REVERSE engineering
whoami review                               # Code review del diff actual
whoami plan "migrar a PostgreSQL"           # Planificacion multi-path
whoami audit                                # Auditoria del repositorio
whoami security                             # Auditoria OWASP
whoami supabase                             # Diagnostico Supabase
whoami e2e                                  # Tests E2E Playwright
whoami docs                                 # Documentacion automatica
whoami orchestrate "tarea compleja"         # Meta-orquestador completo
```

## Estructura del Proyecto

```
D:\ARCHIVO\whoami\
├── README.md              # Este archivo
├── package.json           # @whoami/cli
├── tsconfig.json          # TypeScript config
├── src/                   # CLI source
│   ├── index.ts           # Entry point (Commander)
│   └── ruflo-bridge.ts    # Bridge a Ruflo
├── agents/ (17 archivos)  # Prompts de cada subagente
├── prompts/_internal/     # Templates de subagentes
├── skills/ (45 carpetas)  # Libreria de skills on-demand
├── commands/              # Templates de comandos
└── scripts/               # whoami-on/off
```

## Roadmap — Auto-aprendizaje

- [x] Memoria cross-sesion (`whoami-state.md`)
- [x] Workflows predefinidos (BUILD, FIX, REFACTOR, REVERSE)
- [x] CLI standalone (`@whoami/cli`)
- [x] Skills on-demand (45 skills)
- [ ] Aprendizaje por refuerzo sobre resultados de agentes
- [ ] Generacion automatica de nuevos subagentes segun necesidad
- [ ] Optimizacion de pipelines basada en historico de exito/fallo
- [ ] Memoria semantica vectorizada (HNSW)
- [ ] Auto-healing: detecta fallos recurrentes y ajusta estrategia

## Skills Criticos

| Skill | Proposito |
|-------|-----------|
| `whoami-orchestration` | GOAP, Circuit Breaker, Token Budget, Handoff Guardian |
| `reverse-methodology` | REVERSE engineering 5 pasos |
| `whoami-frontend` | Reglas de diseno frontend |
| `tdd-workflow` | TDD methodology |
| `security-review` | Auditoria OWASP |
| `optimality-ladder` | Escalera de optimalidad |
| `strategic-compact` | Compactacion estrategica de contexto |
| `silent-verify` | Verificacion silenciosa post-entrega |
| `chess-engine` | Simulacion pre-ejecucion de impacto |

## Requisitos

- Node.js 18+
- `npx ruflo@latest` disponible globalmente
- Ruflo MCP configurado (para funcionamiento completo dentro de OpenCode/Kilo)

---

**Proyecto mantenido por [REGT-URRED](https://github.com/REGT-URRED)**
