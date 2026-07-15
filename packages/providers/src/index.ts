// @whoami/providers — LLM model abstraction layer (zero pattern: 25+ providers)
export interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  models: string[];
}

export interface CompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  tools?: unknown[];
}

export interface CompletionEvent {
  type: 'text' | 'tool_call' | 'error' | 'done';
  content?: string;
  toolCall?: { name: string; arguments: string };
  usage?: { input: number; output: number };
}

export interface Provider {
  name: string;
  models: string[];
  streamCompletion(request: CompletionRequest): AsyncGenerator<CompletionEvent>;
  healthCheck(): Promise<boolean>;
}

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): void { this.providers.set(provider.name, provider); }
  get(name: string): Provider | undefined { return this.providers.get(name); }
  list(): string[] { return Array.from(this.providers.keys()); }

  findModel(modelId: string): { provider: Provider; model: string } | null {
    for (const [_, provider] of this.providers) {
      if (provider.models.includes(modelId)) return { provider, model: modelId };
    }
    return null;
  }
}
