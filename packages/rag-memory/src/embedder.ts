export type EmbedderStrategy = 'bow' | 'tfidf' | 'minilm';

export interface Embedder {
  strategy: EmbedderStrategy;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  readonly dimension: number;
}

export class BagOfWordsEmbedder implements Embedder {
  readonly strategy = 'bow';
  readonly dimension = 256;
  private vocab: Map<string, number> = new Map();
  private frozen = false;

  freeze(): void { this.frozen = true; }

  tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && w.length < 50);
  }

  async embed(text: string): Promise<number[]> {
    const tokens = this.tokenize(text);
    if (!this.frozen) {
      for (const t of tokens) {
        if (!this.vocab.has(t)) this.vocab.set(t, this.vocab.size % this.dimension);
      }
    }
    const vec = new Array(this.dimension).fill(0);
    for (const t of tokens) {
      const idx = this.vocab.get(t) ?? 0;
      vec[idx] = (vec[idx] || 0) + 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return norm > 0 ? vec.map(v => v / norm) : vec;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

export class TfIdfEmbedder implements Embedder {
  readonly strategy = 'tfidf';
  readonly dimension = 512;
  private tfidf: Map<string, number[]> = new Map();

  tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && w.length < 50);
  }

  private computeTf(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    const len = tokens.length || 1;
    for (const [k, v] of tf) tf.set(k, v / len);
    return tf;
  }

  async embed(text: string): Promise<number[]> {
    const tokens = this.tokenize(text);
    const tf = this.computeTf(tokens);
    const vec = new Array(this.dimension).fill(0);
    for (const [token, freq] of tf) {
      const idx = this.hashToken(token) % this.dimension;
      vec[idx] += freq;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return norm > 0 ? vec.map(v => v / norm) : vec;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }

  private hashToken(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export async function createEmbedder(strategy?: EmbedderStrategy): Promise<Embedder> {
  if (strategy === 'tfidf') return new TfIdfEmbedder();
  if (strategy === 'minilm') {
    try {
      const { pipeline } = await tryImportTransformers();
      return new MiniLMEmbedder(pipeline);
    } catch {
      console.warn('[whoami] MiniLM not available, falling back to TF-IDF');
      return new TfIdfEmbedder();
    }
  }
  return new BagOfWordsEmbedder();
}

async function tryImportTransformers(): Promise<{ pipeline: any }> {
  try {
    const mod = Function('return require("@xenova/transformers")')();
    return mod;
  } catch {
    throw new Error('@xenova/transformers not installed');
  }
}

class MiniLMEmbedder implements Embedder {
  readonly strategy = 'minilm';
  readonly dimension = 384;
  private pipe: any;

  constructor(pipeline: any) { this.pipe = pipeline; }

  async embed(text: string): Promise<number[]> {
    const result = await this.pipe('feature-extraction', text, { pooling: 'mean', normalize: true });
    return Array.from(result.data) as number[];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results = await Promise.all(texts.map(t => this.embed(t)));
    return results;
  }
}
