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
specialized agents across **13 pluggable backends**. Like a brain that coordinates specialists.
Swap backends at runtime, define your own pipelines, add agent personalities, connect 40+
messaging channels. Built as a pnpm monorepo with **17 packages**, **59 agent definitions**,
**55 skills**, and integrations with 9 external ecosystems.

[![Version](https://img.shields.io/badge/version-2.3.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)]()
[![pnpm](https://img.shields.io/badge/pnpm-11.5-orange)]()
[![Backends](https://img.shields.io/badge/backends-13-purple)]()
[![Agents](https://img.shields.io/badge/agents-59-green)]()

**17 packages · 13 backends · 71 agents · 26 pipelines · 63 skills · 40 channels · 58 agent files**

---

## What Modular Means

WHOAMI v2.3 is built on a fully modular architecture where every layer is replaceable:

- **AgentBackend interface** — a single TypeScript interface (`spawnAgent`, `runWorkflow`, `listAgents`, `healthCheck`) that any backend must implement. Swap the entire execution engine by changing one config value.

- **11 backend implementations** — 5 real backends + 6 stub backends = 13 total. All registered through `plugin-loader.ts`. Default: `harness` — wraps any delegate backend with the five-subsystem harness.

- **Plugin system (`registerBackend`)** — any package or config can call `registerBackend(name, factory)` to add new backends at runtime. No need to fork the monorepo.

- **Pluggable pipelines** — pipelines are JSON arrays in `whoami.config.json`. Each step references an agent by name. Define build, fix, refactor, reverse, research, social, security, or custom workflows.

- **Swap backends at runtime** — change `"backend": "openfang"` to `"backend": "crawl4ai"` and the same CLI commands (`build`, `fix`, `review`) route through a completely different execution engine.

- **9 external repos integrated as plugins** — OpenFang, Crawl4AI, Autoloop, Ponytail, Page Agent, Zero, Agent Reach, Awesome Design MD, and Agency Agents are all consumed as plugin integrations, not forked code.

- **Every package independently replaceable** — the monorepo has 16 scoped packages under `@whoami/*` plus the root meta package. Each has its own `package.json`, own `tsconfig`, and can be published, versioned, and swapped independently.

---

## Backends

All 13 backends are registered in `src/core/plugin-loader.ts` and selectable via `whoami.config.json`.

| Backend | Type | Description | How to Use |
|---------|------|-------------|------------|
| `harness` | Real | **Default** — Harness Engineering backend. Implements five-subsystem model, EDD, skill promotion, cross-project auto-learning. Delegates non-harness agents to configured `delegateBackend`. | `"backend": "harness"` — no external deps, works standalone |
| `openfang` | Real | OpenFang Agent OS — 7 autonomous Hands, 53 tools, 40 channels, 16 security layers. | `"backend": "openfang"` — requires OpenFang at localhost:4200 |
| `crawl4ai` | Real | Crawl4AI — LLM-friendly web crawler. Single-page scrape, deep crawl, structured extraction. | `"backend": "crawl4ai"` — requires `pip install crawl4ai` |
| `ruflo` | Real | Ruflo AI agent orchestration — spawns agents via `npx ruflo@latest`. | `"backend": "ruflo"` — requires npx ruflo@latest |
| `cbm` | Real | Codebase-memory-mcp knowledge graph. | `"backend": "cbm"` — requires codebase-memory-mcp |
| `gstack-browser` | Real | Gstack headless browser daemon — sub-100ms page navigation. | `"backend": "gstack-browser"` — requires browse binary |
| `gentle` | Real | Gentle-AI ecosystem configurator. | `"backend": "gentle"` |
| `agent-reach` | Stub | Agent Reach — 14-platform web access bridge. | `"backend": "agent-reach"` |
| `autoloop` | Stub | Autoloop — autonomous loop harness with 7 presets. | `"backend": "autoloop"` |
| `page-agent` | Stub | Page Agent — in-page GUI agent, DOM control. | `"backend": "page-agent"` |
| `zero` | Stub | Zero — permission sandbox, session management. | `"backend": "zero"` |
| `ponytail` | Stub | Ponytail — 7-rung Optimality Ladder. | `"backend": "ponytail"` |
| `agency` | Stub | Agency — 30+ specialized agent personalities. | `"backend": "agency"` |

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
| [learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) | Harness Engineering course — Five-Subsystem model, harness-creator skill with templates, eval framework, loop engineering patterns | ✅ |
| [harnest](https://github.com/AlexGladkov/harnest) | AI coding assistant configurator — 92 stack detection, agent discovery, YAML declarative config, drift detection for 6 AI tools | ✅ |
| [harness](https://github.com/revfactory/harness) | Meta-skill factory — generates multi-agent teams from domain descriptions with 6 architectural patterns + 3 execution modes | ✅ |
| [opc-skills](https://github.com/ReScienceLab/opc-skills) | 10 indy hacker skills — SEO/GEO, image generation, domain search, Product Hunt API, Twitter, Reddit | ✅ |
| [gstack](https://github.com/garrytan/gstack) | (Selected skills) spec writer v2, diagram generator, PDF generator, headless browser daemon | ✅ |

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
├── agents/                ← 71 agent .md files
├── commands/              ← 16 command templates
├── skills/                ← 63 domain skills
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
  "backend": "harness",
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
  "harness": {
    "subsystems": ["instructions", "state", "verification", "scope", "lifecycle"],
    "evalsDir": ".claude/evals",
    "harnessDir": ".harness"
  },
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

## Harness Engineering

WHOAMI v2.3 integrates **Harness Engineering** — the discipline of designing the environment, state management, verification, and control mechanisms that make AI agents reliable. Based on the **Five-Subsystem Model** from [walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) (10.6k stars), WHOAMI provides a complete harness framework.

### The Five-Subsystem Harness Model

| Subsystem | Artifact | Purpose |
|-----------|----------|---------|
| **Instructions** | `AGENTS.md` / `CLAUDE.md` | Working rules, definition of done, project context |
| **State** | `feature_list.json` / `progress.md` | Current feature, status, evidence, next step |
| **Verification** | `init.sh` + test/lint commands | Machine-verifiable checks agent must run before declaring done |
| **Scope** | Feature dependencies + done criteria | Prevents overreach and half-finished work |
| **Lifecycle** | `session-handoff.md` | Makes the next session restartable with clean state |

### Harness Pipeline

```
/harness create            Scaffold five-subsystem harness into any project
/harness validate          Score project across 5 subsystems (0-100)
/harness setup             Full setup: detect stack → configure → validate
/team "domain description"  Generate multi-agent team from description
/eval                      Eval-Driven Development: define → implement → evaluate → promote
```

### Eval-Driven Development (EDD)

Every feature goes through the EDD cycle:

1. **Define evals** (`/eval define`) — Capability evals + regression evals with pass@k targets
2. **Deploy agents** — Specialized agents implement with evals as acceptance criteria
3. **Run evals** (`/eval check`) — Code graders (deterministic), model graders (LLM-as-judge), human graders (review)
4. **Report** (`/eval report`) — pass@1, pass@3, pass^k metrics with SHIP IT / NEEDS WORK / BLOCKED status

### Cross-Project Auto-Learning

When `autoLearn: true` (default), WHOAMI's memory system auto-aliments:

1. **Skill Promotion**: If a pattern succeeds >= 3 times with >= 80% success rate in a project → automatically promoted to global memory
2. **Cross-Project Pattern Sharing**: New projects automatically receive relevant skills from similar past projects
3. **Harness Health Scoring**: Every project's harness gets scored and tracked in `project_harness` table
4. **Global Memory**: SQLite at `~/.whoami/memory.db` tracks harness runs, skill promotions, and cross-project patterns

### Built-in Graders

| Grader | Type | Example |
|--------|------|---------|
| **Code Grader** | Deterministic | `grep -q "export function" src/api.ts && echo PASS` |
| **Model Grader** | LLM-as-judge | Score 1-5 on structure, edge cases, error handling |
| **Human Grader** | Manual review | Flag for LOW/MEDIUM/HIGH risk manual check |

### Harness Commands

| Command | Description |
|---------|-------------|
| `whoami harness create` | Scaffold harness (AGENTS.md + feature_list.json + init.sh + progress + handoff) |
| `whoami harness validate` | Score repo across 5 subsystems + generate HTML report |
| `whoami harness setup` | Full project setup: stack detect → configure → validate |
| `whoami team "domain"` | Generate multi-agent team (6 patterns × 3 execution modes) |
| `whoami eval define` | Define capability + regression evals with pass@k targets |
| `whoami eval check` | Run current evals and report status |
| `whoami eval report` | Generate full EDD report with metrics |

### Architectural Patterns (from team-factory)

| Pattern | When |
|---------|------|
| **Pipeline** | Sequential dependent tasks |
| **Fan-out/Fan-in** | Parallel independent tasks |
| **Expert Pool** | Context-dependent selective invocation |
| **Producer-Reviewer** | Generation followed by quality review |
| **Supervisor** | Central agent with dynamic distribution |
| **Hierarchical** | Top-down recursive delegation |

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
| `harness-create` | harness-creator |
| `harness-validate` | harness-creator, eval-harness |
| `harness-setup` | stack-detector, harness-configurator, eval-harness |
| `harness-team` | team-factory, eval-harness |
| `eval` | eval-harness |
| `browse` | browser-daemon |
| `seo` | seo-specialist |
| `design-images` | image-designer |
| `product-research` | producthunt-agent |
| `domain` | domain-hunter |
| `spec-v2` | spec-writer-v2 |

Define your own pipelines by adding entries to the `pipelines` object in the config.

---

## Agent Catalog

52 agent definition files across 7 domains → now **71 agents across 10 domains**:

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
| Harness Engineering | harness-creator, stack-detector, harness-configurator, team-factory, eval-harness |
| SEO & Design | seo-specialist, domain-hunter, producthunt-agent, image-designer, spec-writer-v2 |
| Browser | browser-daemon |

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
