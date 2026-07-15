import { HandInfo, HandStatusDetail, ChannelInfo, SecurityReport } from './backend';

const DEFAULT_ENDPOINT = 'http://127.0.0.1:4200';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

interface ChatResponse {
  choices: { message: { content: string } }[];
  usage?: { total_tokens: number };
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class OpenFangClient {
  private endpoint: string;
  private apiKey?: string;

  constructor(endpoint?: string, apiKey?: string) {
    this.endpoint = (endpoint || DEFAULT_ENDPOINT).replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  setEndpoint(url: string): void {
    this.endpoint = url.replace(/\/+$/, '');
  }

  private async request<T>(path: string, opts?: {
    method?: string;
    body?: unknown;
  }): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const res = await fetch(`${this.endpoint}${path}`, {
        method: opts?.method || 'GET',
        headers,
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status}: ${text}` };
      }

      const data = await res.json() as T;
      return { ok: true, data };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ApiResponse<ChatResponse>> {
    const body: ChatRequest = { model, messages, stream: false };
    return this.request<ChatResponse>('/v1/chat/completions', { method: 'POST', body });
  }

  async health(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }

  async listHands(): Promise<ApiResponse<HandInfo[]>> {
    return this.request<HandInfo[]>('/api/hands');
  }

  async activateHand(name: string, schedule?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/hands/activate', {
      method: 'POST',
      body: { name, schedule },
    });
  }

  async handStatus(name: string): Promise<ApiResponse<HandStatusDetail>> {
    return this.request<HandStatusDetail>(`/api/hands/${name}`);
  }

  async pauseHand(name: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/hands/${name}/pause`, { method: 'POST' });
  }

  async listChannels(): Promise<ApiResponse<ChannelInfo[]>> {
    return this.request<ChannelInfo[]>('/api/channels');
  }

  async sendToChannel(channel: string, message: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/channels/send', {
      method: 'POST',
      body: { channel, message },
    });
  }

  async getSecurityReport(): Promise<ApiResponse<SecurityReport>> {
    return this.request<SecurityReport>('/api/security');
  }
}
