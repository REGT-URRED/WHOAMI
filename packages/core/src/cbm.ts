import { spawn } from 'child_process';
import { AgentBackend, AgentResult } from './backend';

export class CbmBackend implements AgentBackend {
  readonly name = 'cbm';
  readonly description = 'Codebase-memory-mcp — knowledge graph intelligence engine';

  async spawnAgent(agent: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    const args = ['codebase-memory-mcp', 'cli', 'search_graph',
      `{"name_pattern": ".*${task}.*", "label": "Function"}`];
    
    try {
      const output = await this.exec(args);
      return { success: true, output, agent, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent, duration: Date.now() - start };
    }
  }

  async runWorkflow(name: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    try {
      const output = await this.exec(['codebase-memory-mcp', 'cli', 'get_architecture', '{}']);
      return { success: true, output, agent: name, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent: name, duration: Date.now() - start };
    }
  }

  async listAgents(): Promise<string[]> {
    return ['codebase-memory-mcp'];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.exec(['where', 'codebase-memory-mcp']);
      return true;
    } catch {
      return false;
    }
  }

  private exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(args[0], args.slice(1), {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });
      let stdout = '';
      child.stdout?.on('data', (d) => { stdout += d; });
      child.stderr?.on('data', () => {});
      child.on('close', (code) => {
        code === 0 ? resolve(stdout) : reject(new Error(`Exit ${code}`));
      });
      child.on('error', reject);
    });
  }
}
