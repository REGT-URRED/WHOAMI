import { InMemoryVectorDB, SearchResult } from './vector-db';
import { Embedder } from './embedder';

export class Collection {
  private db: InMemoryVectorDB;
  private embedder: Embedder;
  private name: string;

  constructor(name: string, db: InMemoryVectorDB, embedder: Embedder) {
    this.name = name;
    this.db = db;
    this.embedder = embedder;
  }

  get count(): number { return this.db.size; }
  get collectionName(): string { return this.name; }

  async add(id: string, content: string, metadata: Record<string, string> = {}): Promise<void> {
    const vector = await this.embedder.embed(content);
    this.db.upsert({ id, vector, content, metadata, timestamp: Date.now() });
  }

  async addBatch(entries: Array<{ id: string; content: string; metadata?: Record<string, string> }>): Promise<void> {
    for (const entry of entries) {
      await this.add(entry.id, entry.content, entry.metadata || {});
    }
  }

  async search(query: string, k = 5): Promise<SearchResult[]> {
    const queryVec = await this.embedder.embed(query);
    return this.db.search(queryVec, k);
  }

  get(id: string) {
    return this.db.get(id);
  }

  remove(id: string): void {
    this.db.remove(id);
  }

  async save(): Promise<void> {
    await this.db.save();
  }

  async load(): Promise<void> {
    await this.db.load();
  }
}
