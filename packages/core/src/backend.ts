export interface AgentResult {
  success: boolean;
  output: string;
  agent: string;
  duration: number;
}

export interface HandInfo {
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  schedule?: string;
}

export interface HandStatusDetail {
  name: string;
  running: boolean;
  uptime: number;
  tasksCompleted: number;
  lastRun?: string;
}

export interface ChannelInfo {
  name: string;
  adapter: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface SecurityReport {
  layers: number;
  status: 'active' | 'degraded' | 'down';
  activeThreats: number;
  lastAudit?: string;
}

export interface AgentBackend {
  readonly name: string;
  readonly description: string;

  spawnAgent(agent: string, task: string, prompt?: string): Promise<AgentResult>;
  runWorkflow(name: string, task: string, variables?: Record<string, string>): Promise<AgentResult>;
  listAgents(): Promise<string[]>;
  healthCheck(): Promise<boolean>;

  listHands?(): Promise<HandInfo[]>;
  activateHand?(name: string, schedule?: string): Promise<void>;
  handStatus?(name: string): Promise<HandStatusDetail>;
  pauseHand?(name: string): Promise<void>;
  listChannels?(): Promise<ChannelInfo[]>;
  sendToChannel?(channel: string, message: string): Promise<void>;
  getSecurityReport?(): Promise<SecurityReport>;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  muted: string;
}

export interface Theme {
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface PipelineStep {
  agent: string;
  description?: string;
}

export interface OpenFangConfig {
  endpoint: string;
  apiKey?: string;
  channels?: string[];
  defaultHands?: string[];
}

export interface CrawlOptions {
  url: string;
  deep?: boolean;
  strategy?: 'bfs' | 'dfs';
  maxPages?: number;
  query?: string;
  extractSchema?: string;
  outputFormat?: 'markdown' | 'html' | 'json';
  stealth?: boolean;
  waitFor?: string;
}

export interface CrawlResult {
  url: string;
  markdown?: string;
  html?: string;
  extracted?: Record<string, unknown>;
  links: string[];
  metadata: { title?: string; description?: string; status: number };
  duration: number;
}

export interface Crawl4AIConfig {
  mode: 'cli' | 'docker';
  cliPath?: string;
  dockerEndpoint?: string;
  defaultStrategy?: 'bfs' | 'dfs';
  defaultMaxPages?: number;
  outputFormat?: 'markdown' | 'html' | 'json';
  stealth?: boolean;
}

export interface WhoamiConfig {
  name: string;
  version: string;
  backend: string;
  theme: string;
  colors?: Partial<ThemeColors>;
  agents: {
    enabled: string[];
    disabled: string[];
  };
  pipelines: {
    [key: string]: PipelineStep[];
  };
  memory: {
    enabled: boolean;
    backend: string;
    path: string;
  };
  autoLearn: boolean;
  openfang?: OpenFangConfig;
  crawl4ai?: Crawl4AIConfig;
}
