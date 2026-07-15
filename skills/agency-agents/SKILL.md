---
name: agency-agents
description: >
  Full division-based agent catalog with 30+ built-in agents across
  engineering, design, product, security, testing, support, and specialized
  divisions. Includes agent search, activation, and capability probing.
origin: WHOAMI agency-agents integration
---

# Agency Agents — Agent Catalog System

The agency-agents system provides a tiered, division-based catalog of 30+ agent manifests for autonomous delegation.

## Core concepts

### Divisions (15+)

| Division | Code | Agents |
|----------|------|--------|
| Engineering | `engineering` | 12 agents |
| Design | `design` | 3 agents |
| Product | `product` | 5 agents |
| Security | `security` | 3 agents |
| Testing | `testing` | 2 agents |
| Support | `support` | 2 agents |
| Project Management | `project-management` | 1 agent |
| Strategy | `strategy` | — |
| Finance | `finance` | — |
| Healthcare | `healthcare` | — |
| Academic | `academic` | — |
| Game Development | `game-development` | 2 agents |
| GIS | `gis` | — |
| Spatial Computing | `spatial-computing` | 1 agent |

### Agent tiers

- **Tier 0** — Zero-config: works with stdlib, built-in tools, no keys
- **Tier 1** — Free key: needs a free API key or account
- **Tier 2** — Auth/pro: requires paid tier or specific access

## API Reference (`@whoami/specialists`)

```typescript
import { AgentCatalog, registerDefaultCatalog, BUILTIN_AGENTS } from '@whoami/specialists';

const catalog = registerDefaultCatalog();

// Basic lookup
const agent = catalog.get('Frontend Developer');

// Filtering
const engineering = catalog.getByDivision('engineering');
const tier0 = catalog.getByTier(0);
const reactUsers = catalog.getByTool('react');

// Search
const results = catalog.search('api');
const suggestions = catalog.suggest('secur', 3);

// Health check probes
catalog.registerProbe({
  name: 'openai-connectivity',
  check: async () => ({ status: 'ok', message: 'API reachable' }),
  backends: ['openai'],
});
const health = await catalog.healthCheck();
```

## File layout

```
agents/agency/
├── engineering.md          — Engineering division overview
├── design.md               — Design division overview
├── product.md              — Product division overview
├── security.md             — Security division overview
├── testing.md              — Testing division overview
├── frontend-developer.md   — Individual agent definition
├── backend-architect.md    — Individual agent definition
├── product-manager.md      — Individual agent definition
├── ui-designer.md          — Individual agent definition
├── ai-engineer.md          — Individual agent definition
├── devops-automator.md     — Individual agent definition
├── security-auditor.md     — Individual agent definition
├── performance-tester.md   — Individual agent definition
├── data-analyst.md         — Individual agent definition
└── content-strategist.md   — Individual agent definition

commands/
└── agency.md               — /agency:list /agency:activate /agency:search

skills/
└── agency-agents/
    └── SKILL.md            — This file
```

## When to load this skill

Load this skill via `skill("agency-agents")` when:
- You need to delegate work and want to select the right specialist
- You need to search the agent catalog by division, tool, or tier
- You need to activate an agent definition into context
- You are building orchestration that routes tasks to specialist agents
