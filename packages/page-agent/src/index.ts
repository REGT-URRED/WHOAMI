// @whoami/page-agent — in-page GUI agent (Alibaba PageAgent pattern)
// Orchestrates browser-level actions via MCP bridge

export interface ElementSelector {
  /** CSS selector string */
  css?: string;
  /** XPath expression */
  xpath?: string;
  /** Visible text content */
  text?: string;
  /** ARIA role */
  role?: string;
  /** Accessibility label */
  label?: string;
  /** Test ID attribute */
  testId?: string;
}

export type DomActionType =
  | 'click'
  | 'type'
  | 'select'
  | 'hover'
  | 'scroll'
  | 'extract'
  | 'wait'
  | 'navigate'
  | 'screenshot'
  | 'evaluate';

export interface DomAction {
  type: DomActionType;
  target: ElementSelector;
  value?: string;
  /** For type actions — clear before typing */
  clear?: boolean;
  /** For scroll actions */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** For extract actions — extraction schema */
  schema?: Record<string, string>;
  /** Timeout in ms */
  timeout?: number;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  screenshot?: string;
  duration: number;
  domSnapshot?: string;
}

export interface PageAgentConfig {
  model: string;
  baseURL: string;
  apiKey: string;
  language?: string;
  maxSteps?: number;
  headless?: boolean;
  viewport?: { width: number; height: number };
}

/**
 * MCPBridge — connects PageAgent to the MCP server for
 * remote browser control and DOM introspection.
 */
export class MCPBridge {
  private endpoint: string;
  private apiKey?: string;

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async send(action: DomAction): Promise<ActionResult> {
    const start = Date.now();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const res = await fetch(`${this.endpoint}/mcp/page`, {
        method: 'POST',
        headers,
        body: JSON.stringify(action),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `MCPBridge: HTTP ${res.status} ${res.statusText}`,
          duration: Date.now() - start,
        };
      }

      const data = await res.json();
      return { success: true, data, duration: Date.now() - start };
    } catch (err) {
      return {
        success: false,
        error: `MCPBridge: ${(err as Error).message}`,
        duration: Date.now() - start,
      };
    }
  }

  /** Ping the MCP server to verify connectivity */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

/**
 * PageAgent — high-level GUI agent that plans and executes
 * sequences of DOM actions on a target web page.
 */
export class PageAgent {
  private config: PageAgentConfig;
  private bridge: MCPBridge;
  private stepCount = 0;

  constructor(config: PageAgentConfig, bridge?: MCPBridge) {
    this.config = config;
    this.bridge = bridge ?? new MCPBridge(config.baseURL, config.apiKey);
  }

  get steps(): number {
    return this.stepCount;
  }

  /**
   * Execute a single DOM action.
   */
  async execute(action: DomAction): Promise<ActionResult> {
    this.stepCount++;
    return this.bridge.send(action);
  }

  /**
   * Plan and execute a sequence of actions from a natural language instruction.
   * Returns aggregated results.
   */
  async planAndExecute(instruction: string): Promise<ActionResult[]> {
    const results: ActionResult[] = [];
    const actions = await this.plan(instruction);

    for (const action of actions) {
      const result = await this.execute(action);
      results.push(result);
      if (!result.success) break; // stop on first failure
    }

    return results;
  }

  /**
   * Use the configured LLM to decompose an instruction into DOM actions.
   * Returns the action plan without executing.
   */
  async plan(instruction: string): Promise<DomAction[]> {
    // ponytail: naive keyword split, upgrade to LLM-based parsing when
    // instruction complexity exceeds simple verb-target patterns
    const actions: DomAction[] = [];
    const lower = instruction.toLowerCase();

    if (lower.startsWith('click ')) {
      actions.push({
        type: 'click',
        target: { text: instruction.slice(6).trim() },
      });
    } else if (lower.startsWith('type ')) {
      const rest = instruction.slice(5).trim();
      const parts = rest.split(/ into | on | at /i);
      if (parts.length >= 2) {
        actions.push({
          type: 'type',
          target: { text: parts[1].trim() },
          value: parts[0].trim(),
        });
      }
    } else if (lower.startsWith('navigate to ') || lower.startsWith('go to ')) {
      const url = instruction.replace(/^(navigate to|go to) /i, '').trim();
      actions.push({
        type: 'navigate',
        target: { css: 'body' },
        value: url.startsWith('http') ? url : `https://${url}`,
      });
    } else if (lower.startsWith('extract ')) {
      actions.push({
        type: 'extract',
        target: { css: 'body' },
        schema: { content: 'textContent' },
      });
    }

    return actions;
  }

  /** Reset step counter */
  reset(): void {
    this.stepCount = 0;
  }
}
