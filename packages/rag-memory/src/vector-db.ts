import fs from 'fs';
import path from 'path';

export interface VectorDoc {
  id: string;
  vector: number[];
  metadata: Record<string, string>;
  content: string;
  timestamp: number;
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, string>;
}

export class InMemoryVectorDB {
  private docs: VectorDoc[] = [];
  private dirty = false;

  constructor(private storePath?: string) {}

  get size(): number { return this.docs.length; }

  insert(doc: VectorDoc): void {
    this.docs.push(doc);
    this.dirty = true;
  }

  upsert(doc: VectorDoc): void {
    const idx = this.docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) this.docs[idx] = doc;
    else this.docs.push(doc);
    this.dirty = true;
  }

  remove(id: string): void {
    this.docs = this.docs.filter(d => d.id !== id);
    this.dirty = true;
  }

  get(id: string): VectorDoc | undefined {
    return this.docs.find(d => d.id === id);
  }

  all(): VectorDoc[] {
    return [...this.docs];
  }

  search(queryVec: number[], k = 5): SearchResult[] {
    const scored = this.docs.map(doc => ({
      id: doc.id,
      score: cosineSimilarity(queryVec, doc.vector),
      content: doc.content,
      metadata: doc.metadata,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  async save(): Promise<void> {
    if (!this.storePath || !this.dirty) return;
    const dir = path.dirname(this.storePath);
    await fs.promises.mkdir(dir, { recursive: true });
    const data = this.docs.map(d => ({
      id: d.id, vector: d.vector, metadata: d.metadata,
      content: d.content, timestamp: d.timestamp
    }));
    await fs.promises.writeFile(this.storePath, JSON.stringify(data), 'utf-8');
    this.dirty = false;
  }

  async load(): Promise<void> {
    if (!this.storePath) return;
    try {
      const raw = await fs.promises.readFile(this.storePath, 'utf-8');
      const data = JSON.parse(raw);
      this.docs = data.map((d: any) => ({
        id: d.id, vector: d.vector, metadata: d.metadata,
        content: d.content, timestamp: d.timestamp
      }));
    } catch { this.docs = []; }
    this.dirty = false;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
