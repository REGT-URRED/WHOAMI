import { AgentBackend, AgentResult, WhoamiConfig } from '../core/backend';
import { execSync } from 'child_process';
import { join, resolve } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as memory from '../core/memory';

const SKILLS_DIR = resolve(__dirname, '..', '..', 'skills', 'harness-creator');
const SCRIPTS_DIR = join(SKILLS_DIR, 'scripts');
const TEMPLATES_DIR = join(SKILLS_DIR, 'templates');

const HARNESS_AGENTS = [
  'harness-creator',
  'stack-detector',
  'harness-configurator',
  'team-factory',
  'eval-harness',
];

const HARNESS_WORKFLOWS = [
  'harness-create',
  'harness-validate',
  'harness-setup',
  'harness-team',
  'eval',
];

interface HarnessSubsystems {
  instructions: number;
  state: number;
  verification: number;
  scope: number;
  lifecycle: number;
}

interface HarnessScore {
  total: number;
  subsystems: HarnessSubsystems;
  issues: string[];
  recommendations: string[];
}

function detectStack(projectPath: string): { stacks: Array<{ type: string; language: string; framework: string; packageManager: string }>; tools: Record<string, string> } {
  const stacks: Array<{ type: string; language: string; framework: string; packageManager: string }> = [];
  const tools: Record<string, string> = {};

  const checks: Array<{ files: string[]; type: string; language: string; framework: string; pm: string }> = [
    { files: ['pnpm-workspace.yaml'], type: 'monorepo', language: 'typescript', framework: 'pnpm', pm: 'pnpm' },
    { files: ['package.json'], type: 'fullstack', language: 'typescript', framework: 'node', pm: 'npm' },
    { files: ['pyproject.toml', 'requirements.txt'], type: 'backend', language: 'python', framework: 'python', pm: 'pip' },
    { files: ['go.mod'], type: 'backend', language: 'go', framework: 'go', pm: 'go' },
    { files: ['Cargo.toml'], type: 'backend', language: 'rust', framework: 'rust', pm: 'cargo' },
    { files: ['pom.xml', 'build.gradle', 'build.gradle.kts'], type: 'backend', language: 'java', framework: 'spring', pm: 'maven' },
    { files: ['Gemfile'], type: 'backend', language: 'ruby', framework: 'rails', pm: 'bundler' },
    { files: ['composer.json'], type: 'backend', language: 'php', framework: 'laravel', pm: 'composer' },
    { files: ['deno.json', 'deno.jsonc'], type: 'backend', language: 'typescript', framework: 'deno', pm: 'deno' },
    { files: ['bun.lock', 'bunfig.toml'], type: 'fullstack', language: 'typescript', framework: 'bun', pm: 'bun' },
  ];

  for (const chk of checks) {
    for (const f of chk.files) {
      if (existsSync(join(projectPath, f))) {
        if (f === 'package.json') {
          try {
            const pkg = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps.next) { chk.framework = 'nextjs'; }
            else if (deps.nuxt) { chk.framework = 'nuxt'; }
            else if (deps.svelte || deps['@sveltejs/kit']) { chk.framework = 'svelte'; }
            else if (deps.vue) { chk.framework = 'vue'; }
            else if (deps.react) { chk.framework = 'react'; }
            else if (deps.angular) { chk.framework = 'angular'; }
            if (deps.typescript) { chk.language = 'typescript'; }
            if (pkg.scripts?.build) tools.build = 'npm run build';
            if (pkg.scripts?.test) tools.test = 'npm test';
            if (pkg.scripts?.lint) tools.lint = 'npm run lint';
          } catch {}
        }
        stacks.push({ type: chk.type, language: chk.language, framework: chk.framework, packageManager: chk.pm });
        break;
      }
    }
  }

  return { stacks, tools };
}

function scaffoldHarness(projectPath: string): { success: boolean; output: string } {
  try {
    const createScript = join(SCRIPTS_DIR, 'create-harness.mjs');
    if (!existsSync(createScript)) {
      return { success: false, output: 'create-harness.mjs not found in harness-creator scripts' };
    }
    const result = execSync(`node "${createScript}"`, { cwd: projectPath, timeout: 30000, stdio: 'pipe', encoding: 'utf-8' });
    return { success: true, output: result };
  } catch (err: any) {
    return { success: false, output: err.stderr || err.stdout || err.message };
  }
}

function manualValidate(projectPath: string): HarnessScore {
  const subsystems: HarnessSubsystems = { instructions: 0, state: 0, verification: 0, scope: 0, lifecycle: 0 };
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (existsSync(join(projectPath, 'AGENTS.md')) || existsSync(join(projectPath, 'CLAUDE.md'))) {
    subsystems.instructions = 100;
  } else { subsystems.instructions = 0; issues.push('Missing AGENTS.md or CLAUDE.md'); recommendations.push('Run harness create to scaffold AGENTS.md'); }

  if (existsSync(join(projectPath, 'feature_list.json'))) {
    subsystems.state = 80;
  } else { subsystems.state = 0; issues.push('Missing feature_list.json'); recommendations.push('Create feature_list.json for scope tracking'); }

  const hasTests = existsSync(join(projectPath, 'package.json')) && (() => {
    try { const pkg = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8')); return !!(pkg.scripts?.test); } catch { return false; }
  })();
  if (hasTests) { subsystems.verification = 80; } else { subsystems.verification = 0; issues.push('No test command in package.json'); recommendations.push('Add test script to package.json'); }

  if (existsSync(join(projectPath, 'feature_list.json')) || existsSync(join(projectPath, 'progress.md'))) {
    subsystems.scope = 60;
  } else { subsystems.scope = 0; issues.push('Missing progress tracking'); recommendations.push('Create progress.md or feature_list.json'); }

  if (existsSync(join(projectPath, 'session-handoff.md')) || existsSync(join(projectPath, '.claude', 'session-handoff.md'))) {
    subsystems.lifecycle = 80;
  } else { subsystems.lifecycle = 0; issues.push('Missing session-handoff.md'); recommendations.push('Create session-handoff.md for clean session restarts'); }

  const total = Math.round((subsystems.instructions + subsystems.state + subsystems.verification + subsystems.scope + subsystems.lifecycle) / 5);
  return { total, subsystems, issues, recommendations };
}

function validateHarness(projectPath: string): HarnessScore {
  try {
    const validateScript = join(SCRIPTS_DIR, 'validate-harness.mjs');
    if (!existsSync(validateScript)) return manualValidate(projectPath);
    const result = execSync(`node "${validateScript}" --json`, { cwd: projectPath, timeout: 30000, stdio: 'pipe', encoding: 'utf-8' });
    const parsed = JSON.parse(result);
    return { total: parsed.score || parsed.total || 0, subsystems: { instructions: parsed.instructions || 0, state: parsed.state || 0, verification: parsed.verification || 0, scope: parsed.scope || 0, lifecycle: parsed.lifecycle || 0 }, issues: parsed.issues || [], recommendations: parsed.recommendations || [] };
  } catch {
    return manualValidate(projectPath);
  }
}

function setupInitScript(_projectPath: string, tools: Record<string, string>): string {
  const lines: string[] = ['#!/bin/bash', '# WHOAMI Harness Init Script', '# Auto-generated by HarnessBackend', ''];
  if (tools.build) lines.push(tools.build);
  if (tools.test) lines.push(tools.test);
  if (tools.lint) lines.push(tools.lint);
  if (lines.length <= 3) {
    lines.push('# No build/test/lint commands detected');
    lines.push('echo "Customize this init.sh with your project verification commands"');
  }
  return lines.join('\n');
}

export class HarnessBackend implements AgentBackend {
  readonly name = 'harness';
  readonly description = 'Harness Engineering backend — five-subsystem project harness with EDD, skill promotion, cross-project auto-learning. Delegates non-harness agents to configured backend.';
  private delegate: AgentBackend | null = null;

  constructor(config?: WhoamiConfig) {
    const delegateName = (config as any)?.harness?.delegateBackend || config?.backend || 'ruflo';
    if (delegateName !== 'harness') {
      try {
        const { getBackend } = require('../core/plugin-loader');
        this.delegate = getBackend(delegateName, config);
      } catch { this.delegate = null; }
    }
  }

  async healthCheck(): Promise<boolean> {
    try { memory.getAgentStats(); return true; } catch { return false; }
  }

  async listAgents(): Promise<string[]> {
    const agents = [...HARNESS_AGENTS];
    if (this.delegate) {
      try { const dAgents = await this.delegate.listAgents(); for (const a of dAgents) { if (!agents.includes(a)) agents.push(a); } } catch {}
    }
    return agents;
  }

  async spawnAgent(agent: string, task: string, prompt?: string): Promise<AgentResult> {
    if (HARNESS_AGENTS.includes(agent)) return this.spawnHarnessAgent(agent, task);
    if (this.delegate) return this.delegate.spawnAgent(agent, task, prompt);
    return { success: false, output: `No delegate backend. Set harness.delegateBackend in config.`, agent, duration: 0 };
  }

  async runWorkflow(name: string, task: string, variables?: Record<string, string>): Promise<AgentResult> {
    if (HARNESS_WORKFLOWS.includes(name)) return this.runHarnessWorkflow(name, task);
    if (this.delegate) return this.delegate.runWorkflow(name, task, variables);
    return { success: false, output: `No delegate backend. Set harness.delegateBackend in config.`, agent: name, duration: 0 };
  }

  public getGlobalSkills(): Array<{ skillName: string; sourceProject: string; usageCount: number; successRate: number }> {
    return memory.getGlobalSkills();
  }

  public getCrossProjectPatterns(limit?: number): Array<{ skillName: string; evidence: string; usageCount: number }> {
    return memory.getCrossProjectPatterns(limit);
  }

  public getHarnessEvalStats(project?: string): memory.HarnessEvalStats[] {
    return memory.getHarnessEvalStats(project);
  }

  public promoteSkillToGlobal(skillName: string, sourceProject: string, evidence: string): void {
    memory.promoteSkillToGlobal(skillName, sourceProject, evidence);
  }

  private async spawnHarnessAgent(agent: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    const projectPath = process.cwd();

    try {
      switch (agent) {
        case 'harness-creator': {
          if (task.includes('validate') || task.includes('score') || task.includes('audit')) {
            const score = validateHarness(projectPath);
            memory.recordHarnessScaffold(projectPath, score.total, score.subsystems);
            return { success: true, output: JSON.stringify(score, null, 2), agent, duration: Date.now() - start };
          }
          if (task.includes('create') || task.includes('scaffold') || task.includes('setup')) {
            const result = scaffoldHarness(projectPath);
            if (result.success) {
              const score = validateHarness(projectPath);
              memory.recordHarnessScaffold(projectPath, score.total, score.subsystems);
            }
            return { success: result.success, output: result.output, agent, duration: Date.now() - start };
          }
          const result = scaffoldHarness(projectPath);
          return { success: result.success, output: result.output, agent, duration: Date.now() - start };
        }

        case 'stack-detector': {
          const detection = detectStack(projectPath);
          return { success: detection.stacks.length > 0, output: JSON.stringify(detection, null, 2), agent, duration: Date.now() - start };
        }

        case 'harness-configurator': {
          const detection = detectStack(projectPath);
          const initScript = setupInitScript(projectPath, detection.tools);

          const initPath = join(projectPath, '.harness', 'init.sh');
          mkdirSync(join(projectPath, '.harness'), { recursive: true });
          writeFileSync(initPath, initScript);

          const agentsContent = `# ${projectPath.split(/[/\\]/).pop() || 'Project'} — WHOAMI Harness

## Working Rules
- Follow the five-subsystem harness model
- Run init.sh before declaring done
- Track progress in .harness/progress.md
- Leave clean state for next session via .harness/session-handoff.md

## Verification Commands
${detection.tools.build ? '- Build: `' + detection.tools.build + '`' : ''}
${detection.tools.test ? '- Test: `' + detection.tools.test + '`' : ''}
${detection.tools.lint ? '- Lint: `' + detection.tools.lint + '`' : ''}

## Stack Detected
${detection.stacks.map(s => `- ${s.type}: ${s.language} (${s.framework}) via ${s.packageManager}`).join('\n')}
`;
          writeFileSync(join(projectPath, 'AGENTS.md'), agentsContent);

          const featureList = { features: [{ id: 'feat-001', name: 'Setup harness', description: 'Initialize project harness infrastructure', dependencies: [], status: 'done', evidence: 'AGENTS.md and init.sh created' }] };
          writeFileSync(join(projectPath, 'feature_list.json'), JSON.stringify(featureList, null, 2));

          const harnessDir = join(projectPath, '.harness');
          mkdirSync(harnessDir, { recursive: true });
          writeFileSync(join(harnessDir, 'progress.md'), `# Progress\n\n## Current\n- Setting up harness infrastructure\n\n## Done\n- Stack detection complete\n- AGENTS.md generated\n- feature_list.json created\n\n## Next\n- Run harness validate to score the harness\n- Define first eval with /eval\n`);
          writeFileSync(join(harnessDir, 'session-handoff.md'), `# Session Handoff\n\n## Last Session\n- Date: ${new Date().toISOString()}\n- Stack: ${detection.stacks.map(s => s.framework).join(', ')}\n\n## Checklist for Next Session\n1. Read AGENTS.md for working rules\n2. Run init.sh for environment setup\n3. Check feature_list.json for current status\n4. Read .harness/progress.md for context\n`);

          return { success: true, output: JSON.stringify({ configured: true, stacks: detection.stacks, files: ['AGENTS.md', 'feature_list.json', '.harness/progress.md', '.harness/session-handoff.md', '.harness/init.sh'] }, null, 2), agent, duration: Date.now() - start };
        }

        case 'team-factory': {
          const detection = detectStack(projectPath);
          const patterns = ['pipeline', 'fan-out', 'expert-pool', 'producer-reviewer', 'supervisor', 'hierarchical'];
          const modes = ['agent-teams', 'subagents', 'hybrid'];
          const suggested = { pattern: task.includes('parallel') ? 'fan-out' : task.includes('review') ? 'producer-reviewer' : 'pipeline', mode: task.includes('multi') ? 'agent-teams' : 'subagents', team: task.split(/[,;]/).map(s => s.trim()).filter(Boolean) };
          return { success: true, output: JSON.stringify({ available_patterns: patterns, available_modes: modes, suggested, stacks: detection.stacks }, null, 2), agent, duration: Date.now() - start };
        }

        case 'eval-harness': {
          if (task.includes('check') || task.includes('run')) {
            const stats = memory.getHarnessEvalStats(projectPath);
            memory.recordHarnessEval(projectPath, 'check', 'code', task, 'CHECK', 0);
            return { success: true, output: JSON.stringify({ action: 'check', projectStats: stats }, null, 2), agent, duration: Date.now() - start };
          }
          if (task.includes('define')) {
            const evalsDir = join(projectPath, '.claude', 'evals');
            mkdirSync(evalsDir, { recursive: true });
            memory.recordHarnessEval(projectPath, 'capability', 'code', task, 'defined', 0);
            return { success: true, output: JSON.stringify({ action: 'define', eval: { project: projectPath, definition: task, pass_at_k_target: 0.9 } }, null, 2), agent, duration: Date.now() - start };
          }
          if (task.includes('report')) {
            const stats = memory.getHarnessEvalStats(projectPath);
            const globalSkills = memory.getGlobalSkills();
            const crossPatterns = memory.getCrossProjectPatterns(5);
            return { success: true, output: JSON.stringify({ report: { projectStats: stats, globalSkills, crossProjectPatterns: crossPatterns } }, null, 2), agent, duration: Date.now() - start };
          }
          if (task.includes('promote') || task.includes('global')) {
            memory.promoteSkillToGlobal(task, projectPath, 'promoted by eval-harness');
            return { success: true, output: JSON.stringify({ promoted: task, project: projectPath }, null, 2), agent, duration: Date.now() - start };
          }
          return { success: true, output: JSON.stringify({ message: 'eval-harness ready. Use define/check/report/promote.' }, null, 2), agent, duration: Date.now() - start };
        }

        default:
          return { success: false, output: `Unknown harness agent: ${agent}`, agent, duration: Date.now() - start };
      }
    } catch (err: any) {
      return { success: false, output: err.message, agent, duration: Date.now() - start };
    }
  }

  private async runHarnessWorkflow(name: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    try {
      switch (name) {
        case 'harness-create': return this.spawnHarnessAgent('harness-creator', 'create harness');
        case 'harness-validate': {
          const cr = await this.spawnHarnessAgent('harness-creator', 'validate harness');
          const er = await this.spawnHarnessAgent('eval-harness', 'check current');
          return { success: cr.success && er.success, output: [cr.output, er.output].join('\n'), agent: name, duration: Date.now() - start };
        }
        case 'harness-setup': {
          const dr = await this.spawnHarnessAgent('stack-detector', 'detect');
          const cfr = await this.spawnHarnessAgent('harness-configurator', `configure harness: ${task}`);
          const er = await this.spawnHarnessAgent('eval-harness', 'check current');
          return { success: dr.success && cfr.success, output: [dr.output, cfr.output, er.output].join('\n'), agent: name, duration: Date.now() - start };
        }
        case 'harness-team': {
          const tr = await this.spawnHarnessAgent('team-factory', task);
          const er = await this.spawnHarnessAgent('eval-harness', 'check current');
          return { success: tr.success, output: [tr.output, er.output].join('\n'), agent: name, duration: Date.now() - start };
        }
        case 'eval': {
          if (task.includes('define')) return this.spawnHarnessAgent('eval-harness', task);
          if (task.includes('report')) return this.spawnHarnessAgent('eval-harness', 'report');
          return this.spawnHarnessAgent('eval-harness', task.includes('check') ? task : 'check current');
        }
        default: return { success: false, output: `Unknown harness workflow: ${name}`, agent: name, duration: Date.now() - start };
      }
    } catch (err: any) {
      return { success: false, output: err.message, agent: name, duration: Date.now() - start };
    }
  }
}
