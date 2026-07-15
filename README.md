<div align="center">
  <pre>
██╗    ██╗██╗  ██╗ ██████╗  █████╗ ███╗   ███╗██╗
██║    ██║██║  ██║██╔═══██╗██╔══██╗████╗ ████║██║
██║ █╗ ██║███████║██║   ██║███████║██╔████╔██║██║
██║███╗██║██╔══██║██║   ██║██╔══██║██║╚██╔╝██║██║
╚███╔███╔╝██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║
 ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝
  </pre>
</div>

# WHOAMI — The Modular Agent Operating System

A meta-orchestrator that doesn't execute code directly. It classifies, selects, and deploys
specialized agents across **11 pluggable backends**. Like a brain that coordinates specialists.
Swap backends at runtime, define your own pipelines, add agent personalities, connect 40+
messaging channels. Built as a pnpm monorepo with **17 packages**, **59 agent definitions**,
**55 skills**, and integrations with 9 external ecosystems.

[![Version](https://img.shields.io/badge/version-2.3.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)]()
[![pnpm](https://img.shields.io/badge/pnpm-11.5-orange)]()
[![Backends](https://img.shields.io/badge/backends-11-purple)]()
[![Agents](https://img.shields.io/badge/agents-59-green)]()

**17 packages · 11 backends · 59 agents · 15 pipelines · 55 skills · 40 channels · 52 agent files**

---

## What Modular Means

WHOAMI v2.3 is built on a fully modular architecture where every layer is replaceable:

- **AgentBackend interface** — a single TypeScript interface (`spawnAgent`, `runWorkflow`, `listAgents`, `healthCheck`) that any backend must implement. Swap the entire execution engine by changing one config value.

- **11 backend implementations** — 5 real backends that integrate with live services (Ruflo, CBM, Gentle, OpenFang, Crawl4AI) and 6 stub backends that act as bridges to external repos (Agent Reach, Autoloop, Page Agent, Zero, Ponytail, Agency). All registered through the same `plugin-loader.ts` registry.

- **Plugin system (`registerBackend`)** — any package or config can call `registerBackend(name, factory)` to add new backends at runtime. No need to fork the monorepo.

- **Pluggable pipelines** — pipelines are JSON arrays in `whoami.config.json`. Each step references an agent by name. Define build, fix, refactor, reverse, research, social, security, or custom workflows.

- **Swap backends at runtime** — change `"backend": "openfang"` to `"backend": "crawl4ai"` and the same CLI commands (`build`, `fix`, `review`) route through a completely different execution engine.

- **9 external repos integrated as plugins** — OpenFang, Crawl4AI, Autoloop, Ponytail, Page Agent, Zero, Agent Reach, Awesome Design MD, and Agency Agents are all consumed as plugin integrations, not forked code.

- **Every package independently replaceable** — the monorepo has 16 scoped packages under `@whoami/*` plus the root meta package. Each has its own `package.json`, own `tsconfig`, and can be published, versioned, and swapped independently.

---

## Backends

All 11 backends are registered in `src/core/plugin-loader.ts` and selectable via `whoami.config.json`.

| Backend | Type | Description | How to Use |
|---------|------|-------------|------------|
| `ruflo` | Real | Ruflo AI agent orchestration — spawns agents via `npx ruflo@latest`. Default backend. | `"backend": "ruflo"` — requires `npx ruflo@latest` |
| `cbm` | Real | Codebase-memory-mcp knowledge graph — searches code structure via `codebase-memory-mcp cli`. | `"backend": "cbm"` — requires `codebase-memory-mcp` installed |
| `gentle` | Real | Gentle-AI ecosystem configurator — integration pending, returns stub responses. | `"backend": "gentle"` — ready for integration |
| `openfang` | Real | OpenFang Agent OS — 7 autonomous Hands, 53 tools, 40 channels, 16 security layers. Connects to running OpenFang instance. | `"backend": "openfang"` — requires OpenFang at localhost:4200 |
| `crawl4ai` | Real | Crawl4AI — LLM-friendly web crawler. Single-page scrape, deep BFS/DFS crawl, structured LLM extraction. | `"backend": "crawl4ai"` — requires `pip install -U crawl4ai` |
| `agent-reach` | Stub | Agent Reach — 14-platform web access bridge (Twitter, GitHub, YouTube, Reddit, RSS). | `"backend": "agent-reach"` — requires `pip install agent-reach` |
| `autoloop` | Stub | Autoloop — autonomous loop harness with 7 presets (autocode, autotest, autofix, autoreview, autosec, autoqa, autospec). | `"backend": "autoloop"` |
| `page-agent` | Stub | Page Agent — in-page GUI agent that controls the browser DOM through text-based commands. | `"backend": "page-agent"` |
| `zero` | Stub | Zero — permission sandbox, session management, streaming protocol for agent communication. | `"backend": "zero"` |
| `ponytail` | Stub | Ponytail — 7-rung Optimality Ladder that enforces code minimalism and YAGNI discipline. | `"backend": "ponytail"` |
| `agency` | Stub | Agency — 30+ specialized agent personalities across 15 divisions (frontend, backend, devops, security, data, content, AI, testing, UI, product, management, performance). | `"backend": "agency"` |

---

## Ecosystem Integration

| Repo | What It Provides | Status |
|------|-----------------|--------|
| [openfang](https://github.com/REGT-URRED/RightNow-AI) / openfang | 7 autonomous Hands (agents), 53 tools, 40 messaging channels (Telegram, Slack, Discord, email), 16 security layers, LLM-agnostic chat | ✅ |
| [crawl4ai](https://github.com/unclecode/crawl4ai) | Web crawling with LLM-friendly output. Single-page scrape, BFS/DFS deep crawl with stealth mode, structured extraction via natural language queries | ✅ |
| [pi-autoloop](https://github.com/mikeyobrien/pi-autoloop) | 7 loop presets (autocode, autotest, autofix, autoreview, autosec, autoqa, autospec), run registry with JSONL, stall detection, token/step budgets | ✅ |
| [ponytail](https://github.com/DietrichGebert/ponytail) | 7-rung Optimality Ladder for code minimalism. Enforces YAGNI, stdlib-first, deletion over addition. Configurable intensity (lite/full/ultra) | ✅ |
| [page-agent](https://github.com/alibaba/page-agent) | In-page GUI agent that controls the browser via text-based DOM manipulation. No screenshots needed — direct element selection and interaction | ✅ |
| [zero](https://github.com/Gitlawb/zero) | Permission system with read-only/restricted modes, session management with checkpoints, streaming protocol for agent-to-agent communication | ✅ |
| [agent-reach](https://github.com/Panniantong/agent-reach) | 14-platform web access bridge: Twitter/X, GitHub, YouTube, Reddit, RSS feeds, and web scraping with structured output | ✅ |
| [awesome-design-md](https://github.com/voltagent/awesome-design-md) | 7 brand token sets (colors, typography, spacing, breakpoints, shadows, motion, icons) plus DESIGN.md parser for design system extraction | ✅ |
| [agency-agents](https://github.com/msitarzewski/agency-agents) | 32 specialized agent personalities across 15 divisions: frontend, backend, devops, security, data, content, AI, testing, UI, product, engineering, design, management, performance | ✅ |

---

## Architecture

```
whoami/                     ← pnpm monorepo
├── packages/               ← 17 packages
│   ├── cli/               ← Commander CLI (25 commands)
│   ├── core/              ← AgentBackend interface, plugin-loader
│   ├── orchestrator/      ← CircuitBreaker, HandoffGuardian, Topology
│   ├── presets/           ← AutoloopManager, RunRegistry, 12 presets
│   ├── sandbox/           ← PermissionGate, SubprocessSandbox
│   ├── session/           ← SessionStore, CheckpointManager
│   ├── stream/            ← Stream-JSON protocol
│   ├── specialists/       ← AgentCatalog (32 manifests)
│   ├── design/            ← DESIGN.md parser + brand tokens
│   ├── providers/         ← LLM provider abstraction
│   ├── tooling/           ← MacroTool, Doctor, HealthChecker
│   ├── tui/               ← Interactive TUI
│   ├── rag-memory/        ← RAG memory
│   ├── page-agent/        ← In-page GUI agent
│   └── agent-reach/       ← 14-platform web access
├── agents/                ← 52 agent .md files
├── commands/              ← 13 command templates
├── skills/                ← 55 domain skills
└── whoami.config.json     ← User configuration
```

---

## Quick Start

```bash
# npm (cross-platform)
npm install -g @whoami/cli

# pnpm
pnpm add -g @whoami/cli

# yarn
yarn global add @whoami/cli

# Bash (Linux/macOS)
curl -fsSL https://whoami.sh/install | sh

# PowerShell (Windows)
irm https://whoami.sh/install.ps1 | iex
```

Use directly without install:

```bash
npx @whoami/cli build "implement login with JWT"
```

Interactive mode:

```bash
whoami tui
```

---

## Configuration

Create `whoami.config.json` in your project or home directory:

```json
{
  "name": "WHOAMI",
  "version": "2.3.0",
  "backend": "openfang",
  "theme": "neon",
  "colors": {
    "primary": "#00FF88",
    "secondary": "#FF00FF",
    "accent": "#00FFFF",
    "error": "#FF3333",
    "success": "#00FF44",
    "warning": "#FFAA00",
    "info": "#00AAFF",
    "muted": "#444444"
  },
  "agents": {
    "enabled": ["architect", "tdd-guide", "code-reviewer", "ramon"],
    "disabled": ["vega"]
  },
  "pipelines": {
    "build": [
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
  "autoLearn": true,
  "openfang": {
    "endpoint": "http://127.0.0.1:4200",
    "channels": ["telegram", "slack", "discord", "email"],
    "defaultHands": ["researcher", "browser"]
  },
  "crawl4ai": {
    "mode": "cli",
    "defaultStrategy": "bfs",
    "defaultMaxPages": 10,
    "stealth": true
  }
}
```

---

## Commands

### Pipeline Commands

| Command | Description |
|---------|-------------|
| `whoami build "implement login"` | Full BUILD pipeline (architect → tdd-guide → code-reviewer → build-error-resolver → ramon → e2e-runner → doc-updater) |
| `whoami fix "error 500 in /api"` | Bug fix pipeline (build-error-resolver → tdd-guide → code-reviewer) |
| `whoami refactor "src/controllers/"` | Refactor pipeline (refactor-cleaner → ramon → code-reviewer) |
| `whoami reverse "src/legacy/"` | REVERSE engineering pipeline (explorer → hypothesis → validator → spec-writer) |

### Single Agent Commands

| Command | Description |
|---------|-------------|
| `whoami review` | Code review on current diff |
| `whoami plan "migrate DB"` | Multi-path planning (read-only) |
| `whoami audit [path]` | Full repository audit |

### OpenFang Commands

| Command | Description |
|---------|-------------|
| `whoami hands` | List available OpenFang Hands |
| `whoami hand-activate <name>` | Activate an OpenFang Hand (option: `--schedule <cron>`) |
| `whoami hand-pause <name>` | Pause an OpenFang Hand |
| `whoami hand-status <name>` | Show OpenFang Hand status (running, uptime, tasks completed) |
| `whoami channels` | List available OpenFang channels |
| `whoami send <channel> <message>` | Send a message through an OpenFang channel |
| `whoami security` | Show OpenFang security report (layers, threats) |

### Crawl4AI Commands

| Command | Description |
|---------|-------------|
| `whoami crawl <url>` | Crawl a URL, output as markdown |
| `whoami crawl <url> --deep` | Deep crawl using BFS strategy |
| `whoami crawl <url> -q "extract prices"` | LLM-based extraction from page |
| `whoami deep-crawl <url>` | Deep crawl with configurable strategy and max pages |
| `whoami extract <url> -q "what to extract"` | Structured data extraction via LLM |

### Meta Commands

| Command | Description |
|---------|-------------|
| `whoami backend` | Show current backend, description, and available backends |
| `whoami config` | Show full current configuration |
| `whoami tui` | Launch interactive TUI mode |
| `whoami stats` | Show agent performance statistics from memory |

---

## Themes

| Theme | Description |
|-------|-------------|
| `default` | Clean terminal default colors |
| `neon` | Cyberpunk green + magenta + cyan |
| `custom` | Define all 8 color tokens in `whoami.config.json` |

Define custom colors:

```json
{
  "theme": "custom",
  "colors": {
    "primary": "#00FF88",
    "secondary": "#FF00FF",
    "accent": "#00FFFF",
    "error": "#FF3333",
    "success": "#00FF44",
    "warning": "#FFAA00",
    "info": "#00AAFF",
    "muted": "#444444"
  }
}
```

---

## Memory & Auto-Learning

When `memory.enabled: true`, WHOAMI tracks every agent run in a local SQLite database:

- Success rate per agent per command type
- Average execution duration
- Best-agent suggestions based on historical performance
- Memory persists across sessions at `~/.whoami/memory.db`

View stats with `whoami stats`.

---

## Pipelines

Pre-configured pipelines in `whoami.config.json`:

| Pipeline | Agents |
|----------|--------|
| `build` | architect, tdd-guide, code-reviewer, build-error-resolver, ramon, e2e-runner, doc-updater |
| `fix` | build-error-resolver, tdd-guide, code-reviewer |
| `refactor` | refactor-cleaner, ramon, code-reviewer |
| `reverse` | reverse-explorer, reverse-hypothesis, reverse-validator, reverse-spec-writer |
| `research` | researcher, predictor |
| `social` | twitter, doc-updater |
| `intel` | collector, researcher |
| `autocode` | autocode, code-reviewer |
| `autotest` | autotest, autoqa |
| `autofix` | autofix, tdd-guide |
| `autosec` | autosec, security-reviewer |
| `research-deep` | agent-reach-web, researcher, predictor |
| `social-media` | agent-reach-twitter, twitter, doc-updater |
| `frontend` | frontend-developer, ui-designer |
| `agency-build` | architect, frontend-developer, code-reviewer |

Define your own pipelines by adding entries to the `pipelines` object in the config.

---

## Agent Catalog

52 agent definition files across 7 domains:

| Domain | Agents |
|--------|--------|
| Core | whoami, whoami-planner, whoami-loop, architect, tdd-guide, code-reviewer, build-error-resolver, security-reviewer, refactor-cleaner, planner, ramon, vega, e2e-runner, doc-updater |
| Reverse Engineering | reverse-explorer, reverse-hypothesis, reverse-validator, reverse-spec-writer |
| OpenFang Hands | clip, lead, collector, predictor, researcher, twitter, browser |
| Crawl4AI | scraper, deep-crawler, extractor |
| Autoloop | autocode, autotest, autofix, autoreview, autosec, autoqa, autospec |
| Agency | 32 specialized personalities across 15 divisions |
| Agent Reach | web-scraper, twitter-agent, github-agent, youtube-agent, reddit-agent, rss-agent, agent-reach |
| Zero | sandbox-agent, session-agent |

---

## Development

```bash
# Clone and install
git clone https://github.com/REGT-URRED/whoami.git
cd whoami
pnpm install

# Build all packages
pnpm build

# Development mode (watch)
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint
```

---

## Requirements

- **Node.js 18+**
- **pnpm 8+** (for monorepo development)
- For **OpenFang** backend: OpenFang running at `localhost:4200`
- For **Crawl4AI** backend: `pip install -U crawl4ai`
- For **Agent Reach** backend: `pip install agent-reach`
- For **Ruflo** backend: `npx ruflo@latest` available
- For **CBM** backend: `codebase-memory-mcp` installed

---

## License

MIT License. Maintained by [REGT-URRED](https://github.com/REGT-URRED).
