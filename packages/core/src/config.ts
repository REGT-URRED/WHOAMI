import { cosmiconfig } from 'cosmiconfig';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { WhoamiConfig } from './backend';

const CONFIG_FILES = [
  'whoami.config.json',
  '.whoamirc.json',
  '.whoamirc',
];

const DEFAULT_CONFIG: WhoamiConfig = {
  name: 'WHOAMI',
  version: '2.3.0',
  backend: 'ruflo',
  theme: 'default',
  agents: {
    enabled: [],
    disabled: [],
  },
  pipelines: {
    build: [
      { agent: 'architect', description: 'Design architecture' },
      { agent: 'tdd-guide', description: 'TDD implementation' },
      { agent: 'code-reviewer', description: 'Code review' },
    ],
    fix: [
      { agent: 'build-error-resolver', description: 'Resolve errors' },
      { agent: 'code-reviewer', description: 'Review fix' },
    ],
    refactor: [
      { agent: 'refactor-cleaner', description: 'Clean code' },
      { agent: 'code-reviewer', description: 'Review refactor' },
    ],
    reverse: [
      { agent: 'reverse-explorer', description: 'Explore codebase' },
      { agent: 'reverse-hypothesis', description: 'Infer rules' },
      { agent: 'reverse-validator', description: 'Validate' },
      { agent: 'reverse-spec-writer', description: 'Write spec' },
    ],
  },
  memory: {
    enabled: false,
    backend: 'sqlite',
    path: '~/.whoami/memory.db',
  },
  autoLearn: false,
  crawl4ai: {
    mode: 'cli',
    cliPath: 'crwl',
    dockerEndpoint: 'http://127.0.0.1:8000',
    defaultStrategy: 'bfs',
    defaultMaxPages: 10,
    outputFormat: 'markdown',
    stealth: true,
  },
};

let cachedConfig: WhoamiConfig | null = null;

function findConfigFile(): string | null {
  for (const f of CONFIG_FILES) {
    const p = resolve(f);
    if (existsSync(p)) return p;
  }
  return null;
}

export async function loadConfig(): Promise<WhoamiConfig> {
  if (cachedConfig) return cachedConfig;

  const localFile = findConfigFile();
  if (localFile) {
    try {
      const raw = readFileSync(localFile, 'utf-8');
      const cfg = JSON.parse(raw) as Partial<WhoamiConfig>;
      cachedConfig = { ...DEFAULT_CONFIG, ...cfg };
      return cachedConfig;
    } catch {}
  }

  const explorer = cosmiconfig('whoami');
  try {
    const result = await explorer.search();
    const cfg = (result?.config || {}) as Partial<WhoamiConfig>;
    cachedConfig = { ...DEFAULT_CONFIG, ...cfg };
  } catch {
    cachedConfig = DEFAULT_CONFIG;
  }

  return cachedConfig!;
}

export function getDefaultConfig(): WhoamiConfig {
  return { ...DEFAULT_CONFIG };
}
