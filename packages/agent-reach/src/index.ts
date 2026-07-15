import {
  AgentBackend,
  AgentResult,
  WhoamiConfig,
  getBackend,
  registerBackend,
} from '@whoami/core';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type Platform =
  | 'web' | 'twitter' | 'youtube' | 'github' | 'reddit' | 'rss'
  | 'bilibili' | 'linkedin' | 'facebook' | 'instagram'
  | 'xiaohongshu' | 'v2ex' | 'xueqiu' | 'xiaoyuzhou';

export interface PlatformChannel {
  name: Platform;
  preferredBackend: string;
  fallbackBackends: string[];
  status: 'online' | 'offline' | 'degraded';
}

export interface ReachResult {
  platform: Platform;
  success: boolean;
  data?: string;
  error?: string;
  backend: string;
  duration: number;
}

// ──────────────────────────────────────────────
// 14-platform channel registry
// ──────────────────────────────────────────────

const CHANNELS: PlatformChannel[] = [
  { name: 'web',           preferredBackend: 'jina-reader', fallbackBackends: ['crawl4ai', 'openfang'],    status: 'online' },
  { name: 'twitter',       preferredBackend: 'openfang',    fallbackBackends: ['nitter'],                   status: 'online' },
  { name: 'youtube',       preferredBackend: 'youtube-dl',  fallbackBackends: ['openfang'],                 status: 'online' },
  { name: 'github',        preferredBackend: 'openfang',    fallbackBackends: [],                           status: 'online' },
  { name: 'reddit',        preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'online' },
  { name: 'rss',           preferredBackend: 'openfang',    fallbackBackends: [],                           status: 'online' },
  { name: 'bilibili',      preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'online' },
  { name: 'linkedin',      preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'degraded' },
  { name: 'facebook',      preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'degraded' },
  { name: 'instagram',     preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'degraded' },
  { name: 'xiaohongshu',   preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'degraded' },
  { name: 'v2ex',          preferredBackend: 'openfang',    fallbackBackends: ['rss', 'crawl4ai'],          status: 'online' },
  { name: 'xueqiu',        preferredBackend: 'openfang',    fallbackBackends: ['crawl4ai'],                 status: 'degraded' },
  { name: 'xiaoyuzhou',    preferredBackend: 'openfang',    fallbackBackends: ['rss'],                      status: 'online' },
];

const CHANNEL_MAP = new Map<Platform, PlatformChannel>(
  CHANNELS.map(c => [c.name, c]),
);

// ──────────────────────────────────────────────
// AgentReachClient
// ──────────────────────────────────────────────

export class AgentReachClient {
  private backendCache = new Map<string, AgentBackend>();
  private config: WhoamiConfig | undefined;

  constructor(config?: WhoamiConfig) {
    this.config = config;
  }

  // Resolve the first healthy backend for a channel (preferred → fallback chain)
  private async resolveBackend(channel: PlatformChannel): Promise<AgentBackend> {
    const candidates = [channel.preferredBackend, ...channel.fallbackBackends];
    for (const name of candidates) {
      let backend = this.backendCache.get(name);
      if (!backend) {
        backend = getBackend(name, this.config);
        this.backendCache.set(name, backend);
      }
      try {
        const healthy = await backend.healthCheck();
        if (healthy) return backend;
      } catch {
        continue;
      }
    }
    throw new Error(`[agent-reach] No healthy backend for platform: ${channel.name}`);
  }

  async invoke(channel: PlatformChannel, task: string): Promise<ReachResult> {
    const start = Date.now();
    const backend = await this.resolveBackend(channel);
    const result = await backend.spawnAgent(channel.name, task);
    return {
      platform: channel.name,
      success: result.success,
      data: result.success ? result.output : undefined,
      error: result.success ? undefined : result.output,
      backend: backend.name,
      duration: Date.now() - start,
    };
  }

  // ── Per-platform methods ──

  async readWeb(url: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('web')!, `Read webpage content from: ${url}`);
  }

  async searchTwitter(query: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('twitter')!, `Search Twitter/X for: ${query}`);
  }

  async readYouTube(url: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('youtube')!, `Get YouTube transcript from: ${url}`);
  }

  async searchGitHub(repo: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('github')!, `Get GitHub repo info for: ${repo}`);
  }

  async readReddit(url: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('reddit')!, `Read Reddit post/thread from: ${url}`);
  }

  async readRSS(url: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('rss')!, `Parse RSS/Atom feed from: ${url}`);
  }

  async searchBilibili(query: string): Promise<ReachResult> {
    return this.invoke(CHANNEL_MAP.get('bilibili')!, `Search Bilibili for: ${query}`);
  }

  // ── Doctor: check all platforms ──

  async doctor(): Promise<Record<Platform, { status: string; latency: number; backend: string; error?: string }>> {
    const results: Record<string, any> = {};
    for (const channel of CHANNELS) {
      const start = Date.now();
      try {
        const backend = await this.resolveBackend(channel);
        results[channel.name] = {
          status: 'ok',
          latency: Date.now() - start,
          backend: backend.name,
        };
      } catch (e: any) {
        results[channel.name] = {
          status: 'error',
          latency: Date.now() - start,
          backend: channel.preferredBackend,
          error: e.message,
        };
      }
    }
    return results as any;
  }

  // ── Introspection ──

  getChannels(): PlatformChannel[] {
    return [...CHANNELS];
  }

  getChannel(name: Platform): PlatformChannel | undefined {
    return CHANNEL_MAP.get(name);
  }
}

// ──────────────────────────────────────────────
// Singleton factory
// ──────────────────────────────────────────────

let defaultClient: AgentReachClient | null = null;

export function getReachClient(config?: WhoamiConfig): AgentReachClient {
  if (!defaultClient || config) {
    defaultClient = new AgentReachClient(config);
  }
  return defaultClient;
}

// ──────────────────────────────────────────────
// Plugin registration (hooks into @whoami/core plugin-loader)
// ──────────────────────────────────────────────

export function registerReachPlugin(): void {
  registerBackend('agent-reach', (cfg?: WhoamiConfig): AgentBackend => ({
    name: 'agent-reach',
    description: 'Agent Reach — 14-platform web access bridge',

    spawnAgent: async (agent: string, task: string): Promise<AgentResult> => {
      const client = getReachClient(cfg);
      try {
        const result = await client.invoke(
          CHANNEL_MAP.get(agent as Platform) ?? CHANNELS[0],
          task,
        );
        return {
          success: result.success,
          output: result.data ?? result.error ?? '',
          agent: `agent-reach/${agent}`,
          duration: result.duration,
        };
      } catch (e: any) {
        return { success: false, output: e.message, agent: `agent-reach/${agent}`, duration: 0 };
      }
    },

    runWorkflow: async (name: string, task: string): Promise<AgentResult> => {
      const client = getReachClient(cfg);
      if (name === 'doctor') {
        const report = await client.doctor();
        return {
          success: true,
          output: JSON.stringify(report, null, 2),
          agent: 'agent-reach',
          duration: 0,
        };
      }
      return { success: false, output: `Unknown agent-reach workflow: ${name}`, agent: 'agent-reach', duration: 0 };
    },

    listAgents: async (): Promise<string[]> => CHANNELS.map(c => c.name),

    healthCheck: async (): Promise<boolean> => true,
  }));
}
