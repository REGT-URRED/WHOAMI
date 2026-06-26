export interface AgentResult {
  success: boolean;
  output: string;
  agent: string;
  duration: number;
}

export interface AgentBackend {
  readonly name: string;
  readonly description: string;

  /** Spawn a single agent with a task */
  spawnAgent(agent: string, task: string, prompt?: string): Promise<AgentResult>;

  /** Run a named workflow/pipeline */
  runWorkflow(name: string, task: string, variables?: Record<string, string>): Promise<AgentResult>;

  /** List available agents in this backend */
  listAgents(): Promise<string[]>;

  /** Health check */
  healthCheck(): Promise<boolean>;
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
}
