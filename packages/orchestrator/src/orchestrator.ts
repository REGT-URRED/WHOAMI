// @whoami/orchestrator — core orchestrator with ponytail 7-rung ladder
import { CircuitBreaker, type CircuitBreakerConfig, type CircuitState } from './circuit-breaker';
import { createPipeline, type TopologyType, type TopologyConfig, type AgentTask } from './topology';

/* ── Types ───────────────────────────────────────────────────── */

export type TaskTier = 'T1' | 'T2' | 'T3' | 'T4';
export type TaskKind = 'build' | 'fix' | 'refactor' | 'reverse' | 'review' | 'autocode' | 'autoqa' | 'autotest' | 'autofix' | 'autoreview' | 'autosec' | 'autospec';
export type GateResult = 'PASS' | 'FAIL';

export interface TaskClassification {
  kind: TaskKind;
  tier: TaskTier;
  files: number;
  isCrossLayer: boolean;
}

export interface GateResults {
  build: GateResult;
  lint: GateResult;
  tests: GateResult;
  optimality: GateResult;
}

export interface OrchestratorOptions {
  maxAgentStrikes?: number;
  circuitCooldownMs?: number;
  agentTimeoutMs?: number;
}

/* ── Handoff Guardian ────────────────────────────────────────── */

class HandoffGuardian {
  private attempts = 0;

  validate(output: string): { ok: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // STRUCTURAL: non-empty
    if (!output || output.trim().length === 0) reasons.push('empty output');

    // SEMANTIC: not an error disguised as success
    const errorSignals = ['i cannot', 'error:', 'unable to', 'failed', 'timeout'];
    const lower = output.toLowerCase();
    for (const s of errorSignals) {
      if (lower.includes(s)) { reasons.push(`contains error signal: "${s}"`); break; }
    }

    // COMPLETENESS: has substance
    if (output.split(/\s+/).length < 10) reasons.push('output too short (<10 words)');

    this.attempts++;
    return { ok: reasons.length === 0, reasons };
  }

  getAttempts(): number { return this.attempts; }

  reset(): void { this.attempts = 0; }
}

/* ── Ponytail / 7-Rung Optimality Ladder ─────────────────────── */

export interface LadderCheck {
  rung: number;
  name: string;
  passed: boolean;
  note?: string;
}

export class OptimalityLadder {
  /**
   * 7-rung ponytail ladder. Returns which rung the proposed code passes.
   * Higher rung = more minimal solution.
   */
  static evaluate(description: string, codeSnippet: string): LadderCheck[] {
    const lines = codeSnippet.split('\n').filter(l => l.trim());
    const checks: LadderCheck[] = [];

    // Rung 1: YAGNI — does this need to exist?
    checks.push({
      rung: 1,
      name: 'YAGNI — Need to exist?',
      passed: lines.length > 0,
      note: lines.length === 0 ? 'speculative, no code' : undefined,
    });

    // Rung 2: Already in codebase?
    const hasReuse = /import|require|from\s+|use\s+/i.test(codeSnippet);
    checks.push({
      rung: 2,
      name: 'Reuse existing?',
      passed: hasReuse,
      note: hasReuse ? undefined : 'no imports — could be reusing existing',
    });

    // Rung 3: Stdlib?
    const hasStdlib = /\b(fs|path|process|Buffer|JSON|Math|Date|RegExp|Array|Object|String|Number)\b/i.test(codeSnippet);
    checks.push({
      rung: 3,
      name: 'Stdlib available?',
      passed: hasStdlib || lines.length <= 3,
      note: !hasStdlib && lines.length > 3 ? 'consider stdlib before dependencies' : undefined,
    });

    // Rung 4: Native platform?
    const hasNative = /<input|<select|<button|<form|cursor:|flex|grid|@media|transform:|transition:/i.test(codeSnippet);
    checks.push({
      rung: 4,
      name: 'Native platform?',
      passed: hasNative || lines.length <= 5,
      note: undefined,
    });

    // Rung 5: Already-installed dependency?
    // ponytail: naive heuristic — checks for import specifiers that might be installed
    checks.push({
      rung: 5,
      name: 'Installed dep?',
      passed: true, // assumed — we don't check package.json here
      note: undefined,
    });

    // Rung 6: One line?
    checks.push({
      rung: 6,
      name: 'One line possible?',
      passed: lines.length <= 1,
      note: lines.length > 1 ? `could ${lines.length}-line be 1 line?` : undefined,
    });

    // Rung 7: Minimum code
    checks.push({
      rung: 7,
      name: 'Minimum code',
      passed: lines.length <= 5,
      note: lines.length > 5 ? `${lines.length} lines — consider trimming` : undefined,
    });

    return checks;
  }

  static highestPassedRung(checks: LadderCheck[]): number {
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].passed) return checks[i].rung;
    }
    return 0;
  }
}

/* ── Orchestrator ────────────────────────────────────────────── */

export class Orchestrator {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private guardian = new HandoffGuardian();
  private activeDelegations = new Map<string, Promise<unknown>>();

  constructor(private options: OrchestratorOptions = {}) {}

  /* ── Task Classification ──────────────────────────────────── */

  classifyTask(description: string, filesCount: number, stack?: string): TaskClassification {
    const lower = description.toLowerCase();

    let kind: TaskKind = 'build';
    if (/bug|error|crash|broken|fail/i.test(lower)) kind = 'fix';
    else if (/refactor|clean|consolidate|duplicate/i.test(lower)) kind = 'refactor';
    else if (/reverse|document|understand|explore/i.test(lower)) kind = 'reverse';
    else if (/review|audit|check/i.test(lower)) kind = 'review';
    else if (/auto.*code|implement|feature/i.test(lower)) kind = 'autocode';
    else if (/auto.*qa|quality/i.test(lower)) kind = 'autoqa';
    else if (/auto.*test|coverage/i.test(lower)) kind = 'autotest';
    else if (/auto.*fix|repair/i.test(lower)) kind = 'autofix';
    else if (/auto.*review/i.test(lower)) kind = 'autoreview';
    else if (/sec|vulnerability|owasp/i.test(lower)) kind = 'autosec';
    else if (/spec|rfc|proposal/i.test(lower)) kind = 'autospec';

    // Tier
    let tier: TaskTier = 'T1';
    if (filesCount > 10 || /architecture|refactor|migration/i.test(lower)) tier = 'T4';
    else if (filesCount > 5 || /multi|pipeline|complex/i.test(lower)) tier = 'T3';
    else if (filesCount > 1) tier = 'T2';

    return { kind, tier, files: filesCount, isCrossLayer: !!stack && stack.includes('->') };
  }

  /* ── Pipeline Selection ───────────────────────────────────── */

  selectPipeline(classification: TaskClassification): { agents: string[]; topology: TopologyType; maxIterations: number } {
    const kind = classification.kind;

    const pipelines: Record<TaskKind, { agents: string[]; topology: TopologyType; maxIterations: number }> = {
      'build':       { agents: ['architect', 'tdd-guide', 'build-error-resolver', 'code-reviewer'], topology: 'sequential', maxIterations: 10 },
      'fix':         { agents: ['build-error-resolver', 'tdd-guide', 'code-reviewer'], topology: 'sequential', maxIterations: 6 },
      'refactor':    { agents: ['refactor-cleaner', 'ramon', 'code-reviewer'], topology: 'sequential', maxIterations: 8 },
      'reverse':     { agents: ['reverse-explorer', 'reverse-hypothesis', 'reverse-validator', 'reverse-spec-writer'], topology: 'sequential', maxIterations: 6 },
      'review':      { agents: ['code-reviewer'], topology: 'sequential', maxIterations: 3 },
      'autocode':    { agents: ['architect', 'tdd-guide', 'code-reviewer', 'build-error-resolver', 'ramon'], topology: 'sequential', maxIterations: 15 },
      'autoqa':      { agents: ['code-reviewer', 'refactor-cleaner', 'ramon'], topology: 'parallel', maxIterations: 10 },
      'autotest':    { agents: ['tdd-guide', 'code-reviewer', 'build-error-resolver'], topology: 'sequential', maxIterations: 12 },
      'autofix':     { agents: ['build-error-resolver', 'tdd-guide', 'code-reviewer', 'ramon'], topology: 'sequential', maxIterations: 8 },
      'autoreview':  { agents: ['code-reviewer', 'security-reviewer'], topology: 'parallel', maxIterations: 5 },
      'autosec':     { agents: ['security-reviewer', 'code-reviewer'], topology: 'sequential', maxIterations: 10 },
      'autospec':    { agents: ['reverse-explorer', 'reverse-hypothesis', 'reverse-spec-writer', 'code-reviewer'], topology: 'sequential', maxIterations: 8 },
    };

    return pipelines[kind];
  }

  /* ── Agent Deployment ─────────────────────────────────────── */

  async deployAgent(agent: string, task: AgentTask): Promise<string> {
    const cb = this.getOrCreateBreaker(agent);

    try {
      const result = await cb.execute(async () => {
        // ponytail: simulate agent call — real impl would delegate to agent runtime
        return `[${agent}] processed: ${task.instruction}`;
      }) as string;

      // HandoffGuardian validation
      const validation = this.guardian.validate(result);
      if (!validation.ok && this.guardian.getAttempts() <= 1) {
        // redeploy once
        return this.deployAgent(agent, task);
      }

      return result;
    } catch (err) {
      throw new Error(`Agent ${agent} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async deployAgents(pipeline: { agents: string[]; topology: TopologyType }, task: string): Promise<Map<string, string>> {
    const config: TopologyConfig = { type: pipeline.topology, agents: pipeline.agents };
    const tasks = createPipeline(config, task);
    const results = new Map<string, string>();

    if (pipeline.topology === 'parallel') {
      const promises = pipeline.agents.map(async (agent, i) => {
        results.set(agent, await this.deployAgent(agent, tasks[i] || tasks[0]));
      });
      await Promise.all(promises);
    } else {
      // sequential
      for (let i = 0; i < pipeline.agents.length; i++) {
        const t = tasks[i] || { agent: pipeline.agents[i], instruction: task, context: [], expectedOutput: '' };
        results.set(pipeline.agents[i], await this.deployAgent(pipeline.agents[i], t));
      }
    }

    return results;
  }

  /* ── Gate Verification ────────────────────────────────────── */

  async verifyGates(buildCmd?: string): Promise<GateResults> {
    // ponytail: check gates — real impl would run actual build/lint/test commands
    const gates: GateResults = { build: 'PASS', lint: 'PASS', tests: 'PASS', optimality: 'PASS' };

    // ponytail: run build check if command provided
    if (buildCmd) {
      try {
        // placeholder for actual execution
        gates.build = 'PASS';
      } catch {
        gates.build = 'FAIL';
      }
    }

    // ponytail: optimality ladder on recent diff
    const ladderCheck = OptimalityLadder.evaluate('recent changes', `// ${buildCmd || 'no-op'}`);
    if (OptimalityLadder.highestPassedRung(ladderCheck) < 2) {
      gates.optimality = 'FAIL';
    }

    return gates;
  }

  /* ── Delegate (main entry point) ───────────────────────────── */

  async delegate(agent: string, task: string): Promise<{ ok: boolean; result?: string; error?: string; gates?: GateResults }> {
    try {
      // 1. classify
      const classification = this.classifyTask(task, 1);
      // 2. select pipeline
      const pipeline = this.selectPipeline(classification);
      // 3. deploy agents
      const results = await this.deployAgents(pipeline, task);
      // 4. verify gates
      const gates = await this.verifyGates();

      const output = Array.from(results.entries()).map(([a, r]) => `[${a}]: ${r}`).join('\n');

      return {
        ok: gates.build === 'PASS' && gates.tests === 'PASS',
        result: output,
        gates,
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /* ── Private ───────────────────────────────────────────────── */

  private getOrCreateBreaker(agent: string): CircuitBreaker {
    if (!this.circuitBreakers.has(agent)) {
      const config: CircuitBreakerConfig = {
        maxStrikes: this.options.maxAgentStrikes ?? 3,
        cooldownMs: this.options.circuitCooldownMs ?? 30000,
        timeoutMs: this.options.agentTimeoutMs ?? 180000,
      };
      this.circuitBreakers.set(agent, new CircuitBreaker(config));
    }
    return this.circuitBreakers.get(agent)!;
  }

  getCircuitStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    this.circuitBreakers.forEach((cb, agent) => { states[agent] = cb.getState(); });
    return states;
  }
}
