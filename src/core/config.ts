import { cosmiconfig } from 'cosmiconfig';
import { WhoamiConfig } from './backend';

const DEFAULT_CONFIG: WhoamiConfig = {
  name: 'WHOAMI',
  version: '2.0.0',
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
};

let cachedConfig: WhoamiConfig | null = null;

export async function loadConfig(): Promise<WhoamiConfig> {
  if (cachedConfig) return cachedConfig;

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
