// @whoami/tooling — MacroTool + LLM auto-fixer + Doctor/Health system (zero pattern)

import { z, ZodSchema } from 'zod';
import * as cp from 'child_process';

// ---- existing MacroTool ----

export interface MacroToolConfig<T> {
  name: string;
  schema: ZodSchema<T>;
  handler: (args: T) => Promise<unknown>;
}

export class MacroTool<T> {
  constructor(private config: MacroToolConfig<T>) {}

  getDefinition() {
    return {
      type: 'function' as const,
      function: {
        name: this.config.name,
        description: "Agent action — includes evaluation, memory, next goal, and action in one call",
        parameters: this.config.schema
      }
    };
  }

  async execute(rawArgs: unknown): Promise<unknown> {
    const args = this.config.schema.parse(rawArgs);
    return this.config.handler(args);
  }
}

// ---- existing autoFixLlmResponse ----

export function autoFixLlmResponse(raw: string): Record<string, unknown> | null {
  // Try direct parse
  try { return JSON.parse(raw); } catch {}

  // Fix double stringification
  try { const inner = JSON.parse(raw); return JSON.parse(inner); } catch {}

  // Fix missing action wrapper
  const actionMatch = raw.match(/\{"(\w+)":\s*(\{[^}]+\}|"[^"]*"|\d+)\}/);
  if (actionMatch) {
    return { action: JSON.parse(actionMatch[0]) };
  }

  // Fix primitive coercion
  const primMatch = raw.match(/\{"(\w+)":\s*(\d+)\}/);
  if (primMatch) {
    return { action: { [primMatch[1]]: { index: parseInt(primMatch[2]) } } };
  }

  return null;
}

// ---- Doctor / HealthChecker ----

export interface HealthCheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
  version?: string;
}

export interface SystemHealth {
  checks: HealthCheckResult[];
  passed: number;
  failed: number;
  total: number;
  timestamp: string;
}

export class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map();

  constructor() {
    this.register('crwl', () => this.checkBinary('crwl', 'crwl --version'));
    this.register('openfang', () => this.checkBinary('openfang', 'openfang --version'));
    this.register('python', () => this.checkBinary('python', 'python --version'));
    this.register('pip', () => this.checkBinary('pip', 'pip --version'));
    this.register('node', () => this.checkBinary('node', 'node --version'));
    this.register('npm', () => this.checkBinary('npm', 'npm --version'));
    this.register('pnpm', () => this.checkBinary('pnpm', 'pnpm --version'));
    this.register('git', () => this.checkBinary('git', 'git --version'));
    this.register('whoami', () => this.checkBinary('whoami', 'whoami --version'));
    this.register('openfang-endpoint', () => this.checkEndpoint('http://127.0.0.1:4200/health'));
  }

  register(name: string, checkFn: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, checkFn);
  }

  async runAll(): Promise<SystemHealth> {
    const results: HealthCheckResult[] = [];
    for (const [name, fn] of this.checks) {
      try {
        results.push(await fn());
      } catch {
        results.push({ name, status: 'fail', message: `Check threw unexpectedly` });
      }
    }
    const passed = results.filter(r => r.status === 'ok').length;
    const failed = results.filter(r => r.status === 'fail').length;
    return {
      checks: results,
      passed,
      failed,
      total: results.length,
      timestamp: new Date().toISOString(),
    };
  }

  async run(name: string): Promise<HealthCheckResult | null> {
    const fn = this.checks.get(name);
    if (!fn) return null;
    try { return await fn(); } catch {
      return { name, status: 'fail', message: 'Check threw unexpectedly' };
    }
  }

  private async checkBinary(name: string, cmd: string): Promise<HealthCheckResult> {
    try {
      const out = cp.execSync(cmd, { timeout: 5000, windowsHide: true });
      const version = out.toString().trim().split('\n')[0];
      return { name, status: 'ok', message: `${name} is available`, version };
    } catch {
      return { name, status: 'fail', message: `${name} not found in PATH` };
    }
  }

  private async checkEndpoint(url: string): Promise<HealthCheckResult> {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return { name: 'openfang-endpoint', status: 'ok', message: `Endpoint reachable at ${url}` };
      }
      return { name: 'openfang-endpoint', status: 'warn', message: `Endpoint responded with ${res.status}` };
    } catch {
      return { name: 'openfang-endpoint', status: 'warn', message: `Endpoint unreachable at ${url}` };
    }
  }
}

export class Doctor {
  private checker: HealthChecker;

  constructor(checker?: HealthChecker) {
    this.checker = checker ?? new HealthChecker();
  }

  async diagnose(names?: string[]): Promise<SystemHealth> {
    if (names && names.length > 0) {
      const results: HealthCheckResult[] = [];
      for (const name of names) {
        const r = await this.checker.run(name);
        if (r) results.push(r);
      }
      const passed = results.filter(r => r.status === 'ok').length;
      const failed = results.filter(r => r.status === 'fail').length;
      return { checks: results, passed, failed, total: results.length, timestamp: new Date().toISOString() };
    }
    return this.checker.runAll();
  }

  async doctorCommand(args: string): Promise<string> {
    const parts = args.trim().split(/\s+/);
    const names = parts.length > 0 && parts[0] ? parts : undefined;

    const health = await this.diagnose(names);
    let output = `## whoami doctor\n\n`;
    output += `Ran ${health.total} checks · ${health.passed} passed · ${health.failed} failed\n\n`;
    output += `| Dependency | Status | Detail |\n`;
    output += `|-----------|--------|--------|\n`;
    for (const check of health.checks) {
      const icon = check.status === 'ok' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
      output += `| ${check.name} | ${icon} | ${check.message}${check.version ? ` (${check.version})` : ''} |\n`;
    }
    output += `\n_Timestamp: ${health.timestamp}_\n`;
    return output;
  }
}
