import { spawn } from 'child_process';
import { CrawlOptions, CrawlResult } from './backend';

const DOCKER_DEFAULT = 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class Crawl4AIClient {
  private mode: 'cli' | 'docker';
  private cliPath: string;
  private dockerEndpoint: string;
  private stealth: boolean;

  constructor(opts?: {
    mode?: 'cli' | 'docker';
    cliPath?: string;
    dockerEndpoint?: string;
    stealth?: boolean;
  }) {
    this.mode = opts?.mode || 'cli';
    this.cliPath = opts?.cliPath || 'crwl';
    this.dockerEndpoint = (opts?.dockerEndpoint || DOCKER_DEFAULT).replace(/\/+$/, '');
    this.stealth = opts?.stealth ?? true;
  }

  setMode(mode: 'cli' | 'docker'): void { this.mode = mode; }

  async crawl(opts: CrawlOptions): Promise<ApiResponse<CrawlResult>> {
    return this.mode === 'docker' ? this.crawlDocker(opts) : this.crawlCLI(opts);
  }

  async healthCheck(): Promise<boolean> {
    if (this.mode === 'docker') {
      try {
        const res = await fetch(`${this.dockerEndpoint}/health`, { signal: AbortSignal.timeout(5000) });
        return res.ok;
      } catch { return false; }
    }
    return new Promise(r => {
      const child = spawn(this.cliPath, ['--version'], { stdio: 'pipe' });
      child.on('close', c => r(c === 0));
      child.on('error', () => r(false));
    });
  }

  private async crawlCLI(opts: CrawlOptions): Promise<ApiResponse<CrawlResult>> {
    const args = [opts.url];

    if (opts.deep && opts.strategy) args.push('--deep-crawl', opts.strategy);
    if (opts.maxPages) args.push('--max-pages', String(opts.maxPages));
    if (opts.query) args.push('-q', opts.query);
    if (opts.outputFormat && opts.outputFormat !== 'markdown') args.push('-o', opts.outputFormat);
    if (this.stealth) args.push('--stealth');

    const start = Date.now();

    try {
      const stdout = await this.execCli(args);
      return {
        ok: true,
        data: {
          url: opts.url,
          markdown: stdout,
          links: [],
          metadata: { status: 200 },
          duration: Date.now() - start,
        },
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  private async crawlDocker(opts: CrawlOptions): Promise<ApiResponse<CrawlResult>> {
    try {
      const body: Record<string, unknown> = {
        url: opts.url,
        output_format: opts.outputFormat || 'markdown',
        stealth: this.stealth,
      };
      if (opts.deep) body['deep_crawl'] = true;
      if (opts.strategy) body['crawl_strategy'] = opts.strategy;
      if (opts.maxPages) body['max_pages'] = opts.maxPages;
      if (opts.query) body['extraction_question'] = opts.query;

      const start = Date.now();
      const res = await fetch(`${this.dockerEndpoint}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status}: ${text}` };
      }

      const data = await res.json() as Record<string, unknown>;
      return {
        ok: true,
        data: {
          url: opts.url,
          markdown: String(data['markdown'] || data['content'] || ''),
          links: (data['links'] as string[]) || [],
          metadata: {
            title: String(data['title'] || ''),
            description: String(data['description'] || ''),
            status: res.status,
          },
          duration: Date.now() - start,
        },
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  private execCli(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.cliPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', d => { stdout += d; });
      child.stderr?.on('data', d => { stderr += d; });
      child.on('close', code => {
        code === 0 ? resolve(stdout) : reject(new Error(stderr || `Exit ${code}`));
      });
      child.on('error', reject);
    });
  }
}
