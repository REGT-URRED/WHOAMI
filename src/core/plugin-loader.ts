import { AgentBackend, WhoamiConfig, OpenFangConfig, Crawl4AIConfig, AgentResult } from './backend';
import { RufloBackend } from '../backends/ruflo';
import { CbmBackend } from '../backends/cbm';
import { GentleBackend } from '../backends/gentle';
import { OpenFangBackend } from '../backends/openfang';
import { Crawl4AIBackend } from '../backends/crawl4ai';

function makeStubBackend(name: string, desc: string): (cfg?: WhoamiConfig) => AgentBackend {
  return () => ({
    name, description: desc,
    spawnAgent: async (agent, task): Promise<AgentResult> => ({
      success: true, output: `[${name}] ${agent}: ${task}`, agent, duration: 0,
    }),
    runWorkflow: async (_name, task): Promise<AgentResult> => ({
      success: true, output: `[${name}] workflow: ${task}`, agent: _name, duration: 0,
    }),
    listAgents: async () => [],
    healthCheck: async () => false,
  });
}

const BACKENDS: Record<string, (cfg?: WhoamiConfig) => AgentBackend> = {
  ruflo: () => new RufloBackend(),
  cbm: () => new CbmBackend(),
  gentle: () => new GentleBackend(),
  openfang: (cfg?: WhoamiConfig) => {
    const of = cfg?.openfang || {} as OpenFangConfig;
    return new OpenFangBackend(of.endpoint, of.apiKey, of.channels);
  },
  crawl4ai: (cfg?: WhoamiConfig) => new Crawl4AIBackend(cfg?.crawl4ai),
  'agent-reach': makeStubBackend('agent-reach', 'Agent Reach — 14-platform web access bridge'),
  autoloop: makeStubBackend('autoloop', 'Autoloop — autonomous loop harness with 7 presets'),
  'page-agent': makeStubBackend('page-agent', 'PageAgent — GUI Agent, in-page DOM control'),
  zero: makeStubBackend('zero', 'Zero — permission sandbox, session management, streaming'),
  ponytail: makeStubBackend('ponytail', 'Ponytail — 7-rung optimality ladder orchestration'),
  agency: makeStubBackend('agency', 'Agency — 30+ specialized agent personalities'),
};

export function getBackend(name: string, config?: WhoamiConfig): AgentBackend {
  const factory = BACKENDS[name];
  if (!factory) {
    console.error(`[WHOAMI] Unknown backend: ${name}`);
    console.error(`[WHOAMI] Available: ${Object.keys(BACKENDS).join(', ')}`);
    console.error(`[WHOAMI] Falling back to ruflo.`);
    return new RufloBackend();
  }
  return factory(config);
}

export function registerBackend(name: string, factory: (cfg?: WhoamiConfig) => AgentBackend): void {
  BACKENDS[name] = factory;
}

export function listBackends(): string[] {
  return Object.keys(BACKENDS);
}
