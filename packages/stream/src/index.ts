// @whoami/stream — Stream-JSON protocol + progress + turn tracking (zero pattern)

// ---- existing StreamEvent / StreamProtocol ----

export interface StreamEvent {
  type: 'run_start' | 'text' | 'reasoning' | 'tool_call' | 'tool_result' |
        'permission' | 'checkpoint' | 'usage' | 'final' | 'error' | 'run_end';
  data: Record<string, unknown>;
  timestamp: string;
}

export class StreamProtocol {
  static serialize(event: StreamEvent): string {
    return JSON.stringify(event);
  }

  static deserialize(line: string): StreamEvent | null {
    try { return JSON.parse(line); } catch { return null; }
  }

  static createEvent(type: StreamEvent['type'], data: Record<string, unknown>): StreamEvent {
    return { type, data, timestamp: new Date().toISOString() };
  }

  // Progress line protocol (pi-autoloop: [progress] key=value format)
  static parseProgressLine(line: string): Record<string, string> | null {
    const match = line.match(/^\[progress\]\s+(.+)$/);
    if (!match) return null;
    const result: Record<string, string> = {};
    const pairs = match[1].match(/(\w+)=("[^"]*"|\S+)/g);
    if (!pairs) return null;
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      result[key] = valueParts.join('=').replace(/^"|"$/g, '');
    }
    return result;
  }
}

// ---- StreamJSONParser ----

export interface StreamJSONChunk {
  token: string;
  done: boolean;
  metadata?: Record<string, unknown>;
}

export class StreamJSONParser {
  private buffer: string;
  private depth: number;
  private inString: boolean;
  private escape: boolean;

  constructor() {
    this.buffer = '';
    this.depth = 0;
    this.inString = false;
    this.escape = false;
  }

  feed(chunk: string): StreamJSONChunk | null {
    this.buffer += chunk;
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i];
      if (this.escape) { this.escape = false; continue; }
      if (c === '\\' && this.inString) { this.escape = true; continue; }
      if (c === '"') { this.inString = !this.inString; continue; }
      if (this.inString) continue;
      if (c === '{' || c === '[') this.depth++;
      if (c === '}' || c === ']') this.depth--;
    }
    if (this.depth <= 0 && this.buffer.trim().length > 0) {
      const full = this.buffer.trim();
      this.buffer = '';
      this.depth = 0;
      this.inString = false;
      this.escape = false;
      return { token: full, done: true };
    }
    return { token: chunk, done: false };
  }

  reset(): void {
    this.buffer = '';
    this.depth = 0;
    this.inString = false;
    this.escape = false;
  }

  remaining(): string {
    return this.buffer;
  }
}

// ---- ProgressTracker ----

export interface ProgressState {
  step: number;
  total: number;
  message: string;
  status: 'running' | 'paused' | 'done' | 'error';
  percentage: number;
}

export class ProgressTracker {
  private state: ProgressState;

  constructor(total: number, message = '') {
    this.state = { step: 0, total, message, status: 'running', percentage: 0 };
  }

  advance(message?: string): ProgressState {
    this.state.step = Math.min(this.state.step + 1, this.state.total);
    this.state.percentage = Math.round((this.state.step / this.state.total) * 100);
    if (message) this.state.message = message;
    return { ...this.state };
  }

  setMessage(message: string): ProgressState {
    this.state.message = message;
    return { ...this.state };
  }

  pause(): ProgressState {
    this.state.status = 'paused';
    return { ...this.state };
  }

  resume(): ProgressState {
    this.state.status = 'running';
    return { ...this.state };
  }

  done(message?: string): ProgressState {
    this.state.step = this.state.total;
    this.state.percentage = 100;
    this.state.status = 'done';
    if (message) this.state.message = message;
    return { ...this.state };
  }

  error(message: string): ProgressState {
    this.state.status = 'error';
    this.state.message = message;
    return { ...this.state };
  }

  getState(): ProgressState {
    return { ...this.state };
  }

  toProgressLine(): string {
    const pct = this.state.percentage;
    const bar = '='.repeat(Math.floor(pct / 10)) + '-'.repeat(10 - Math.floor(pct / 10));
    return `[progress] step=${this.state.step} total=${this.state.total} pct=${pct} status=${this.state.status} msg="${this.state.message}"`;
  }
}

// ---- TurnTracker ----

export interface TurnMetric {
  turnIndex: number;
  toolCallCount: number;
  totalDurationMs: number;
  tokensIn: number;
  tokensOut: number;
  tools: string[];
  startedAt: string;
  endedAt: string;
}

export class TurnTracker {
  private turns: TurnMetric[] = [];
  private current: TurnMetric | null = null;
  private startTime: number = 0;

  beginTurn(turnIndex: number): void {
    this.startTime = Date.now();
    this.current = {
      turnIndex,
      toolCallCount: 0,
      totalDurationMs: 0,
      tokensIn: 0,
      tokensOut: 0,
      tools: [],
      startedAt: new Date().toISOString(),
      endedAt: '',
    };
  }

  recordToolCall(toolName: string, tokensIn = 0, tokensOut = 0): void {
    if (!this.current) return;
    this.current.toolCallCount++;
    this.current.tokensIn += tokensIn;
    this.current.tokensOut += tokensOut;
    if (!this.current.tools.includes(toolName)) {
      this.current.tools.push(toolName);
    }
  }

  endTurn(): TurnMetric | null {
    if (!this.current) return null;
    this.current.totalDurationMs = Date.now() - this.startTime;
    this.current.endedAt = new Date().toISOString();
    this.turns.push(this.current);
    const snapshot = { ...this.current };
    this.current = null;
    return snapshot;
  }

  getTurns(): TurnMetric[] {
    return [...this.turns];
  }

  getCurrent(): TurnMetric | null {
    return this.current ? { ...this.current, totalDurationMs: Date.now() - this.startTime } : null;
  }

  totalDurationMs(): number {
    return this.turns.reduce((sum, t) => sum + t.totalDurationMs, 0);
  }

  totalToolCalls(): number {
    return this.turns.reduce((sum, t) => sum + t.toolCallCount, 0);
  }

  toStreamEvent(): StreamEvent {
    return StreamProtocol.createEvent('usage', {
      turns: this.turns,
      totalDurationMs: this.totalDurationMs(),
      totalToolCalls: this.totalToolCalls(),
    });
  }
}
