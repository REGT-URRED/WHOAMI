import { spawn } from 'child_process';
import { resolve } from 'path';
import { AgentBackend, AgentResult } from '../core/backend';

const AGENT_DIR = resolve(__dirname, '..', '..', 'agents');
const PROMPTS_DIR = resolve(__dirname, '..', '..', 'prompts', '_internal');

export class RufloBackend implements AgentBackend {
  readonly name = 'ruflo';
  readonly description = 'Ruflo AI agent orchestration platform';

  async spawnAgent(agent: string, task: string, promptFile?: string): Promise<AgentResult> {
    const start = Date.now();
    const resolved = promptFile || this.getPromptFile(agent);
    const args = ['-y', 'ruflo@latest', 'agent', 'spawn', '-t', 'sonnet'];

    if (resolved) args.push('--prompt', resolved);
    if (task) args.push('--task', task);

    try {
      const output = await this.exec(args);
      return { success: true, output, agent, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent, duration: Date.now() - start };
    }
  }

  async runWorkflow(name: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    const args = ['-y', 'ruflo@latest', 'workflow', 'run', '--template', name];
    if (task) args.push('--task', task);

    try {
      const output = await this.exec(args);
      return { success: true, output, agent: name, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent: name, duration: Date.now() - start };
    }
  }

  async listAgents(): Promise<string[]> {
    return [
      'architect', 'tdd-guide', 'code-reviewer', 'build-error-resolver',
      'security-reviewer', 'refactor-cleaner', 'planner', 'ramon', 'vega',
      'e2e-runner', 'doc-updater', 'reverse-explorer', 'reverse-hypothesis',
      'reverse-validator', 'reverse-spec-writer', 'whoami-planner', 'whoami-loop',
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const args = ['-y', 'ruflo@latest', '--version'];
      await this.exec(args);
      return true;
    } catch {
      return false;
    }
  }

  private getPromptFile(agentName: string): string | null {
    const fs = require('fs');
    const candidates = [
      resolve(AGENT_DIR, `${agentName}.md`),
      resolve(AGENT_DIR, `${agentName}.txt`),
      resolve(PROMPTS_DIR, `${agentName}.txt`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  private exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('npx', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        env: { ...process.env },
      });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (d) => { stdout += d; process.stdout.write(d); });
      child.stderr?.on('data', (d) => { stderr += d; process.stderr.write(d); });
      child.on('close', (code) => {
        code === 0 ? resolve(stdout) : reject(new Error(stderr || `Exit ${code}`));
      });
      child.on('error', reject);
    });
  }
}
