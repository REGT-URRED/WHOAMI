import { AgentBackend, AgentResult, CrawlOptions, Crawl4AIConfig } from '../core/backend';
import { Crawl4AIClient } from '../core/crawl4ai-client';

const CRAWL_AGENTS = ['crawl4ai-scraper', 'crawl4ai-deep-crawler', 'crawl4ai-extractor'];

export class Crawl4AIBackend implements AgentBackend {
  readonly name = 'crawl4ai';
  readonly description = 'Crawl4AI — LLM-friendly web crawler: single-page, deep BFS/DFS, structured extraction';
  readonly client: Crawl4AIClient;

  constructor(cfg?: Crawl4AIConfig) {
    this.client = new Crawl4AIClient({
      mode: cfg?.mode,
      cliPath: cfg?.cliPath,
      dockerEndpoint: cfg?.dockerEndpoint,
      stealth: cfg?.stealth,
    });
  }

  async spawnAgent(agent: string, task: string, _prompt?: string): Promise<AgentResult> {
    const start = Date.now();

    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : task;
    const isDeep = /deep|bfs|dfs/i.test(task);
    const hasQuery = /\b(extract|find|get|list|search|q:)/i.test(task);

    const opts: CrawlOptions = {
      url,
      deep: isDeep || agent === 'crawl4ai-deep-crawler',
      strategy: isDeep ? 'bfs' : undefined,
      maxPages: isDeep ? 10 : undefined,
      query: hasQuery ? task : undefined,
      outputFormat: 'markdown',
    };

    const res = await this.client.crawl(opts);
    if (!res.ok || !res.data) {
      return { success: false, output: res.error || 'Crawl failed', agent, duration: Date.now() - start };
    }

    const output = [
      `# Crawl Result: ${res.data.url}`,
      `- Status: ${res.data.metadata.status}`,
      `- Duration: ${res.data.duration}ms`,
      res.data.metadata.title ? `- Title: ${res.data.metadata.title}` : '',
      res.data.markdown ? `\n## Content\n\n${res.data.markdown.slice(0, 10000)}` : '',
      res.data.links.length > 0 ? `\n## Links (${res.data.links.length})\n${res.data.links.slice(0, 20).join('\n')}` : '',
    ].filter(Boolean).join('\n');

    return { success: true, output, agent, duration: Date.now() - start };
  }

  async runWorkflow(name: string, task: string, _variables?: Record<string, string>): Promise<AgentResult> {
    const start = Date.now();
    const pipelineMap: Record<string, string[]> = {
      'whoami-scrape': ['crawl4ai-scraper', 'crawl4ai-extractor'],
      'whoami-deep-scrape': ['crawl4ai-deep-crawler', 'crawl4ai-extractor'],
      'whoami-enrich': ['crawl4ai-scraper'],
    };

    const agents = pipelineMap[name] || [name.replace('whoami-', '')];
    let lastOutput = task;

    for (const agent of agents) {
      const result = await this.spawnAgent(agent, lastOutput);
      if (!result.success) return result;
      lastOutput = result.output;
    }

    return { success: true, output: lastOutput, agent: name, duration: Date.now() - start };
  }

  async listAgents(): Promise<string[]> {
    return [...CRAWL_AGENTS];
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck();
  }

  async crawl(opts: CrawlOptions): Promise<{ ok: boolean; result?: string; error?: string }> {
    const res = await this.client.crawl(opts);
    if (!res.ok || !res.data) return { ok: false, error: res.error };
    return { ok: true, result: res.data.markdown };
  }
}
