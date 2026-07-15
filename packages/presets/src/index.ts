// @whoami/presets — Autonomous loop preset system (pi-autoloop pattern)
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

/* ── Core Types ───────────────────────────────────────────────── */

export interface PresetConfig {
  name: string;
  description: string;
  maxIterations: number;
  maxCostUsd?: number;
  stallIterations?: number;
  maxRuntime?: number;
  roles: string[];
}

export interface RunEntry {
  runId: string;
  preset: string;
  startedAt: string;
  status: 'running' | 'completed' | 'failed' | 'aborted' | 'stalled';
  iteration: number;
  costUsd: number;
  error?: string;
}

export interface AutoloopOptions {
  preset: string;
  goal: string;
  cwd?: string;
  budgetUsd?: number;
  maxIterations?: number;
}

/* ── Run Registry (.autoloop/registry.jsonl) ─────────────────── */

export class RunRegistry {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.cwd();
  }

  private get registryPath(): string {
    return path.join(this.baseDir, '.autoloop', 'registry.jsonl');
  }

  private ensureDir(): void {
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  append(entry: RunEntry): void {
    this.ensureDir();
    fs.appendFileSync(this.registryPath, JSON.stringify(entry) + '\n', 'utf-8');
  }

  readAll(): RunEntry[] {
    if (!fs.existsSync(this.registryPath)) return [];
    const raw = fs.readFileSync(this.registryPath, 'utf-8').trim();
    if (!raw) return [];
    return raw.split('\n').filter(Boolean).map(line => JSON.parse(line) as RunEntry);
  }

  getLatest(preset: string): RunEntry | undefined {
    return this.readAll().reverse().find(r => r.preset === preset);
  }
}

/* ── Stall Detection ─────────────────────────────────────────── */

export interface StallConfig {
  thresholdIterations: number;
  thresholdTimeMs: number;
}

export class StallDetector {
  private previousOutputs: string[] = [];

  constructor(private config: StallConfig) {}

  feed(iteration: number, output: string): boolean {
    this.previousOutputs.push(output);
    if (this.previousOutputs.length > this.config.thresholdIterations) {
      this.previousOutputs.shift();
    }
    if (this.previousOutputs.length < 2) return false;
    return this.previousOutputs.every(o => o === output);
  }

  reset(): void { this.previousOutputs = []; }
}

/* ── Cost Budget ─────────────────────────────────────────────── */

export class CostBudget {
  private spent = 0;

  constructor(private maxUsd: number) {}

  track(cost: number): void { this.spent += cost; }
  getSpent(): number { return this.spent; }
  getRemaining(): number { return Math.max(0, this.maxUsd - this.spent); }
  isExhausted(): boolean { return this.spent >= this.maxUsd; }
  getUsagePct(): number { return (this.spent / this.maxUsd) * 100; }
}

/* ── AutoloopManager ─────────────────────────────────────────── */

export interface AutoloopStatus {
  runId: string;
  preset: string;
  goal: string;
  status: 'running' | 'completed' | 'failed' | 'aborted' | 'stalled';
  iteration: number;
  maxIterations: number;
  costUsd: number;
  budgetUsd: number;
  startedAt: string;
  elapsedMs: number;
}

export class AutoloopManager extends EventEmitter {
  private runs = new Map<string, {
    preset: string;
    goal: string;
    status: AutoloopStatus['status'];
    iteration: number;
    maxIterations: number;
    budget: CostBudget;
    stallDetector: StallDetector;
    startedAt: number;
    timer?: NodeJS.Timeout;
  }>();

  private registry: RunRegistry;

  constructor(registry?: RunRegistry) {
    super();
    this.registry = registry || new RunRegistry();
  }

  start(opts: AutoloopOptions): string {
    const runId = `loop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const preset = BUILTIN_PRESETS[opts.preset];
    if (!preset) throw new Error(`Unknown preset: ${opts.preset}`);

    const maxIter = opts.maxIterations ?? preset.maxIterations;
    const budget = new CostBudget(opts.budgetUsd ?? preset.maxCostUsd ?? 10);
    const stall = new StallDetector({ thresholdIterations: preset.stallIterations ?? 3, thresholdTimeMs: preset.maxRuntime ?? 300000 });

    this.runs.set(runId, {
      preset: opts.preset,
      goal: opts.goal,
      status: 'running',
      iteration: 0,
      maxIterations: maxIter,
      budget,
      stallDetector: stall,
      startedAt: Date.now(),
    });

    const entry: RunEntry = {
      runId,
      preset: opts.preset,
      startedAt: new Date().toISOString(),
      status: 'running',
      iteration: 0,
      costUsd: 0,
    };
    this.registry.append(entry);
    this.emit('started', { runId, ...opts });
    return runId;
  }

  stop(runId: string): void {
    const run = this.runs.get(runId);
    if (!run) return;
    run.status = 'aborted';
    if (run.timer) clearTimeout(run.timer);
    this.registry.append({ runId, preset: run.preset, startedAt: new Date(run.startedAt).toISOString(), status: 'aborted', iteration: run.iteration, costUsd: run.budget.getSpent() });
    this.emit('stopped', runId);
  }

  status(runId: string): AutoloopStatus | undefined {
    const run = this.runs.get(runId);
    if (!run) return;
    return {
      runId,
      preset: run.preset,
      goal: run.goal,
      status: run.status,
      iteration: run.iteration,
      maxIterations: run.maxIterations,
      costUsd: run.budget.getSpent(),
      budgetUsd: run.budget['maxUsd'],
      startedAt: new Date(run.startedAt).toISOString(),
      elapsedMs: Date.now() - run.startedAt,
    };
  }

  list(): AutoloopStatus[] {
    return Array.from(this.runs.entries()).map(([k, v]) => this.status(k)!);
  }

  inspect(preset: string): PresetConfig | undefined {
    return BUILTIN_PRESETS[preset];
  }

  advance(runId: string, cost: number, output?: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'running') return;
    run.iteration++;
    run.budget.track(cost);

    // stall detection
    if (output !== undefined && run.stallDetector.feed(run.iteration, output)) {
      run.status = 'stalled';
      this.registry.append({ runId, preset: run.preset, startedAt: new Date(run.startedAt).toISOString(), status: 'stalled', iteration: run.iteration, costUsd: run.budget.getSpent(), error: 'Stalled: repeated output' });
      this.emit('stalled', runId);
      this.emit('finished', this.status(runId));
      return;
    }

    // budget exhaustion
    if (run.budget.isExhausted()) {
      run.status = 'completed';
      this.registry.append({ runId, preset: run.preset, startedAt: new Date(run.startedAt).toISOString(), status: 'completed', iteration: run.iteration, costUsd: run.budget.getSpent() });
      this.emit('completed', runId);
      this.emit('finished', this.status(runId));
      return;
    }

    // max iterations
    if (run.iteration >= run.maxIterations) {
      run.status = 'completed';
      this.registry.append({ runId, preset: run.preset, startedAt: new Date(run.startedAt).toISOString(), status: 'completed', iteration: run.iteration, costUsd: run.budget.getSpent() });
      this.emit('completed', runId);
      this.emit('finished', this.status(runId));
    }
  }
}

/* ── Built-in Presets ────────────────────────────────────────── */

export const BUILTIN_PRESETS: Record<string, PresetConfig> = {
  // Existing presets
  'build': {
    name: 'build',
    description: 'Full BUILD pipeline: architect -> tdd-guide -> code-reviewer -> build-error-resolver',
    maxIterations: 10,
    maxCostUsd: 5,
    stallIterations: 3,
    roles: ['architect', 'tdd-guide', 'code-reviewer', 'build-error-resolver', 'ramon']
  },
  'fix': {
    name: 'fix',
    description: 'Bug fix pipeline: build-error-resolver -> tdd-guide -> code-reviewer',
    maxIterations: 6,
    maxCostUsd: 3,
    stallIterations: 2,
    roles: ['build-error-resolver', 'tdd-guide', 'code-reviewer', 'ramon']
  },
  'refactor': {
    name: 'refactor',
    description: 'Refactor pipeline: refactor-cleaner -> ramon -> code-reviewer',
    maxIterations: 8,
    maxCostUsd: 4,
    stallIterations: 2,
    roles: ['refactor-cleaner', 'ramon', 'code-reviewer']
  },
  'reverse': {
    name: 'reverse',
    description: 'Reverse engineering: explorer -> hypothesis -> validator -> spec-writer',
    maxIterations: 6,
    maxCostUsd: 3,
    stallIterations: 2,
    roles: ['reverse-explorer', 'reverse-hypothesis', 'reverse-validator', 'reverse-spec-writer']
  },
  'review': {
    name: 'review',
    description: 'Code review with optimality ladder',
    maxIterations: 3,
    maxCostUsd: 1,
    stallIterations: 2,
    roles: ['code-reviewer']
  },
  // Autoloop presets
  'autocode': {
    name: 'autocode',
    description: 'Autonomous code: implement features, refactor, TDD pipeline with optimality gates',
    maxIterations: 15,
    maxCostUsd: 8,
    stallIterations: 3,
    roles: ['architect', 'tdd-guide', 'code-reviewer', 'build-error-resolver', 'ramon']
  },
  'autoqa': {
    name: 'autoqa',
    description: 'Quality audit: lint coverage, type strictness, dead code, test gaps, optimality',
    maxIterations: 10,
    maxCostUsd: 4,
    stallIterations: 2,
    roles: ['code-reviewer', 'refactor-cleaner', 'ramon']
  },
  'autotest': {
    name: 'autotest',
    description: 'Test suite tightening: coverage gaps, edge cases, property-based tests, CI gates',
    maxIterations: 12,
    maxCostUsd: 5,
    stallIterations: 2,
    roles: ['tdd-guide', 'code-reviewer', 'build-error-resolver']
  },
  'autofix': {
    name: 'autofix',
    description: 'Bug diagnosis and repair: reproduce -> isolate -> fix -> verify -> review',
    maxIterations: 8,
    maxCostUsd: 4,
    stallIterations: 2,
    roles: ['build-error-resolver', 'tdd-guide', 'code-reviewer', 'ramon']
  },
  'autoreview': {
    name: 'autoreview',
    description: 'Automated code review: diff analysis, optimality ladder, security scan, style check',
    maxIterations: 5,
    maxCostUsd: 2,
    stallIterations: 2,
    roles: ['code-reviewer', 'security-reviewer']
  },
  'autosec': {
    name: 'autosec',
    description: 'Security audit: OWASP scan, dependency audit, secrets detection, auth review',
    maxIterations: 10,
    maxCostUsd: 5,
    stallIterations: 2,
    roles: ['security-reviewer', 'code-reviewer']
  },
  'autospec': {
    name: 'autospec',
    description: 'RFC/spec generation: research -> outline -> draft -> review -> finalize',
    maxIterations: 8,
    maxCostUsd: 3,
    stallIterations: 2,
    roles: ['reverse-explorer', 'reverse-hypothesis', 'reverse-spec-writer', 'code-reviewer']
  }
};

/* ── Utility exports ─────────────────────────────────────────── */

export function loadPreset(name: string): PresetConfig | undefined {
  return BUILTIN_PRESETS[name];
}

export function listPresets(): string[] {
  return Object.keys(BUILTIN_PRESETS);
}

export function listAutoloopPresets(): string[] {
  return ['autocode', 'autoqa', 'autotest', 'autofix', 'autoreview', 'autosec', 'autospec'];
}
