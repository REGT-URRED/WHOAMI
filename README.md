# WHOAMI v2 — Modular Autonomous Agent CLI Framework

> **Seed idea**: A meta-orchestrator that doesn't execute code directly.
> Its only purpose is to classify, select, and deploy the right agent for
> each task. Like a brain that coordinates specialists.
>
> **v2.0**: Now a **modular framework**. Choose your backend, customize
> colors, add/remove agents, define your own pipelines. Nothing is hardcoded.

---

## Philosophy

WHOAMI is not just another agent. It's an **orchestrator framework**. It
doesn't edit files, write code, or implement features directly. It
**orchestrates**.

**DELEGATION FIRST.** Before any input, the only thought is:
"Which agent is right for this?"

---

## What Makes v2 Modular

| Feature | v1 | v2 |
|---------|----|-----|
| Backend | Ruflo only (hardcoded) | Pluggable (Ruflo, codebase-memory, gentle-ai) |
| Colors | None | Theme system (neon, default, dark, custom) |
| Agents | Fixed set of 17 | Configurable in `whoami.config.json` |
| Pipelines | Hardcoded | User-defined in config |
| Memory | None | SQLite auto-learn (tracks success rates) |
| TUI | CLI only | Interactive mode (`--tui`) |
| Config | None | `whoami.config.json` controls everything |

---

## Quick Start

```bash
# Install globally
npm install -g @whoami/cli

# Or use directly
npx @whoami/cli build "implement login with JWT"

# Interactive mode
whoami tui
```

## Configuration

Create `whoami.config.json` in your project or home directory:

```json
{
  "name": "My Custom Agent",
  "backend": "ruflo",
  "theme": "neon",
  "colors": {
    "primary": "#00FF88",
    "secondary": "#FF00FF",
    "accent": "#00FFFF"
  },
  "agents": {
    "enabled": ["architect", "tdd-guide", "code-reviewer"],
    "disabled": ["vega"]
  },
  "pipelines": {
    "my-build": [
      { "agent": "architect" },
      { "agent": "tdd-guide" },
      { "agent": "code-reviewer" }
    ]
  },
  "memory": {
    "enabled": true,
    "backend": "sqlite",
    "path": "~/.whoami/memory.db"
  },
  "autoLearn": true
}
```

## Commands

```bash
# Pipelines
whoami build "implement login"     # Full BUILD pipeline
whoami fix "error 500 in /api"     # Bug fix pipeline
whoami refactor "src/controllers/" # Refactor pipeline
whoami reverse "src/legacy/"       # REVERSE engineering

# Single agents
whoami review                      # Code review
whoami plan "migrate DB"           # Multi-path planning
whoami audit [path]                # Full repo audit

# Meta
whoami tui                         # Interactive mode
whoami config                      # Show current config
whoami backend                     # Show backend info
whoami stats                       # Agent performance stats
```

## Backends

| Backend | Status | Description |
|---------|--------|-------------|
| `ruflo` | ✅ Ready | Ruflo AI agent orchestration (default) |
| `cbm` | ✅ Ready | Codebase-memory-mcp knowledge graph |
| `gentle` | 🔄 Pending | Gentle-AI ecosystem configurator |

Add your own backend by implementing the `AgentBackend` interface in
`src/backends/` and registering it in `src/core/plugin-loader.ts`.

## Themes

| Theme | Style |
|-------|-------|
| `default` | Clean terminal default |
| `neon` | Cyberpunk green + magenta + cyan |
| `custom` | Define your own colors in `whoami.config.json` |

## Memory & Auto-Learning

When `memory.enabled: true`, WHOAMI tracks every agent run in SQLite:
- Success rate per agent per command type
- Average execution duration
- Suggests best agent for each task based on history

View stats: `whoami stats`

## Architecture

```
whoami/
├── whoami.config.json    ← Your configuration (controls everything)
├── src/
│   ├── index.ts          ← CLI entry point (Commander)
│   ├── tui.ts            ← Interactive TUI (inquirer)
│   ├── core/
│   │   ├── backend.ts    ← AgentBackend interface
│   │   ├── config.ts     ← Config loader (cosmiconfig)
│   │   ├── plugin-loader.ts ← Backend registry
│   │   ├── display.ts    ← Theme/color engine (chalk)
│   │   └── memory.ts     ← SQLite auto-learn
│   ├── backends/
│   │   ├── ruflo.ts      ← Ruflo backend
│   │   ├── cbm.ts        ← Codebase-memory backend
│   │   └── gentle.ts     ← Gentle-AI backend
│   └── themes/
│       ├── default.ts
│       ├── neon.ts
│       └── index.ts
├── agents/ (17 files)    ← Agent prompts (editable)
├── skills/ (45 dirs)     ← On-demand skills
└── README.md
```

## Roadmap

- [x] Modular architecture (backends, themes, config)
- [x] TUI interactive mode
- [x] Memory + auto-learn (SQLite)
- [x] Theme system (neon, default, custom)
- [ ] Plugin marketplace (community backends)
- [ ] Web dashboard
- [ ] Codebase-memory-mcp full integration
- [ ] Gentle-AI integration
- [ ] Multi-agent swarm visualization

---

## Requirements

- Node.js 18+
- For `ruflo` backend: `npx ruflo@latest` available
- For `cbm` backend: `codebase-memory-mcp` installed

---

**Project maintained by [REGT-URRED](https://github.com/REGT-URRED)**
