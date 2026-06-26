import { AgentBackend } from './backend';
import { RufloBackend } from '../backends/ruflo';
import { CbmBackend } from '../backends/cbm';
import { GentleBackend } from '../backends/gentle';

const BACKENDS: Record<string, () => AgentBackend> = {
  ruflo: () => new RufloBackend(),
  cbm: () => new CbmBackend(),
  gentle: () => new GentleBackend(),
};

export function getBackend(name: string): AgentBackend {
  const factory = BACKENDS[name];
  if (!factory) {
    console.error(`[WHOAMI] Unknown backend: ${name}`);
    console.error(`[WHOAMI] Available: ${Object.keys(BACKENDS).join(', ')}`);
    console.error(`[WHOAMI] Falling back to ruflo.`);
    return new RufloBackend();
  }
  return factory();
}

export function registerBackend(name: string, factory: () => AgentBackend): void {
  BACKENDS[name] = factory;
}

export function listBackends(): string[] {
  return Object.keys(BACKENDS);
}
