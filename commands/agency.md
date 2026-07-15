---
description: Agency agent catalog operations — list, activate, search agents by division/tier/tool
agent: whoami
subtask: false
---

# /agency — Agency Agent Catalog

$ARGUMENTS

## Commands

### /agency:list
Lists all registered agents with division, tier, and emoji.

**Usage**: `/agency:list [division] [tier]`

Optional filters:
- `division:engineering` — show only engineering agents
- `tier:0` — show only tier 0 (zero-config) agents

### /agency:activate
Loads an agent's manifest and skills into the current context.

**Usage**: `/agency:activate <agent_name>`

Fetches the agent definition from `agents/agency/<name>.md` and loads its tool set and skills.

### /agency:search
Full-text search across agent names, descriptions, skills, and tools.

**Usage**: `/agency:search <query>`

Returns up to 5 matching agents with name, division, and tier.

---

## Agent manifest reference

The full catalog lives in `@whoami/specialists` (`packages/specialists/src/index.ts`).

Each `AgentManifest` contains:
- **name** — Display name
- **description** — What the agent does
- **division** — One of 15+ divisions
- **emoji** — Visual identifier
- **skills[]** — Keywords for matching
- **examples[]** — Example task descriptions
- **communicationStyle** — How the agent communicates
- **tools[]** — Preferred toolchain
- **tier** — 0 (zero-config) | 1 (free key) | 2 (auth/pro)

## Built-in catalog

The `registerDefaultCatalog()` function registers 30+ agents automatically.
Agents are organized by division, with division overviews in `agents/agency/`.
