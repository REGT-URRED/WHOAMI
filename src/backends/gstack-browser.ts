import { AgentBackend, AgentResult } from '../core/backend';
import { execSync, spawn } from 'child_process';
import http from 'http';

const DEFAULT_PORT = 4321;

function findBrowseBinary(): string | null {
  try { execSync('browse --version', { stdio: 'ignore' }); return 'browse'; } catch {}
  try { execSync('npx gstack browse --version', { stdio: 'ignore' }); return 'npx gstack browse'; } catch {}
  return null;
}

async function browseRequest(path: string, method = 'GET', body?: unknown, port = DEFAULT_PORT): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const data = body ? JSON.stringify(body) : undefined;
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }, (res) => {
      let out = '';
      res.on('data', (c) => { out += c; });
      res.on('end', () => {
        try { resolve({ ok: true, data: JSON.parse(out) }); } catch { resolve({ ok: true, data: out }); }
      });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    if (data) req.write(data);
    req.end();
  });
}

export class GstackBrowserBackend implements AgentBackend {
  readonly name = 'gstack-browser';
  readonly description = 'Gstack headless browser daemon — sub-100ms page navigation and testing';
  private binary: string | null = null;

  async healthCheck(): Promise<boolean> {
    const res = await browseRequest('/health');
    return res.ok;
  }

  async listAgents(): Promise<string[]> {
    return ['browser-daemon'];
  }

  async spawnAgent(agent: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    try {
      this.binary = findBrowseBinary();
      if (!this.binary) return { success: false, output: 'browse binary not found. Install: npm i -g gstack', agent, duration: Date.now() - start };

      let path = '/';
      let method = 'GET';
      let body: unknown;
      if (task.includes('navigate') || task.includes('goto')) {
        const urlMatch = task.match(/https?:\/\/\S+/);
        if (urlMatch) { path = '/navigate'; method = 'POST'; body = { url: urlMatch[0] }; }
      } else if (task.includes('screenshot')) {
        path = '/screenshot'; method = 'POST';
      } else if (task.includes('click')) {
        path = '/click'; method = 'POST'; body = { selector: task };
      } else if (task.includes('type') || task.includes('fill')) {
        path = '/type'; method = 'POST'; body = { text: task };
      }

      const res = await browseRequest(path, method, body);
      return { success: res.ok, output: typeof res.data === 'string' ? res.data : JSON.stringify(res.data || {}), agent, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent, duration: Date.now() - start };
    }
  }

  async runWorkflow(name: string, task: string): Promise<AgentResult> {
    const start = Date.now();
    try {
      const res = await browseRequest('/', 'GET');
      return { success: res.ok, output: `[gstack-browser] ${name}: ${task}`, agent: name, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err.message, agent: name, duration: Date.now() - start };
    }
  }
}
