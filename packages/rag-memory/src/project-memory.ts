import path from 'path';
import fs from 'fs';
import { Collection } from './collection';
import { InMemoryVectorDB } from './vector-db';
import { Embedder, createEmbedder, EmbedderStrategy } from './embedder';
import { Indexer } from './indexer';
import { Retriever, ContextBundle } from './retriever';

export interface MemoryStats {
  files: number;
  decisions: number;
  errors: number;
  sessions: number;
  embedder: string;
  projectPath: string;
  lastIndex: string;
}

export interface Decision {
  id: string;
  decision: string;
  context: string;
  timestamp: number;
}

export interface ErrorPattern {
  id: string;
  error: string;
  fix: string;
  timestamp: number;
}

export class ProjectMemory {
  private embedder!: Embedder;
  private collections = new Map<string, Collection>();
  private retriever!: Retriever;
  private memoryDir: string;
  private initialized = false;

  constructor(public projectPath: string) {
    this.memoryDir = path.join(projectPath, '.whoami', 'memory');
  }

  get isReady(): boolean { return this.initialized; }

  async init(strategy?: EmbedderStrategy): Promise<void> {
    this.embedder = await createEmbedder(strategy);
    const collections: Array<{ name: string; file: string }> = [
      { name: 'files', file: 'vectors.json' },
      { name: 'decisions', file: 'decisions.jsonl' },
      { name: 'errors', file: 'errors.jsonl' },
      { name: 'sessions', file: 'sessions.jsonl' },
    ];
    for (const { name, file } of collections) {
      const db = new InMemoryVectorDB(path.join(this.memoryDir, file));
      await db.load();
      this.collections.set(name, new Collection(name, db, this.embedder));
    }
    this.retriever = new Retriever(this.collections);
    this.initialized = true;
  }

  async indexProject(): Promise<void> {
    if (!this.initialized) await this.init();
    const indexer = new Indexer({ projectPath: this.projectPath, embedder: this.embedder });
    const col = this.collections.get('files')!;
    const existingCount = col.count;

    const files = await indexer.scanChanges();
    await col.addBatch(files.map(f => ({ id: f.id, content: f.content, metadata: f.metadata })));

    const newCount = col.count - existingCount;
    await this.flush();

    if (newCount > 0) {
      const sessionCol = this.collections.get('sessions')!;
      await sessionCol.add(`idx:${Date.now()}`, `Indexed ${newCount} files | total: ${col.count}`, { source: 'auto-index' });
    }
  }

  async addDecision(decision: string, context: string): Promise<void> {
    if (!this.initialized) await this.init();
    const col = this.collections.get('decisions')!;
    const id = `dec:${Date.now()}`;
    await col.add(id, decision, { context: context.slice(0, 200) });
    await col.save();
  }

  async addError(error: string, fix: string): Promise<void> {
    if (!this.initialized) await this.init();
    const col = this.collections.get('errors')!;
    const id = `err:${Date.now()}`;
    await col.add(id, `ERROR: ${error}\nFIX: ${fix}`, { error: error.slice(0, 100) });
    await col.save();
  }

  async addSession(sessionData: string): Promise<void> {
    if (!this.initialized) await this.init();
    const col = this.collections.get('sessions')!;
    const id = `ses:${Date.now()}`;
    await col.add(id, sessionData, { source: 'session' });
    await col.save();
  }

  async getContext(task: string): Promise<ContextBundle> {
    if (!this.initialized) await this.init();
    return this.retriever.getContext(task);
  }

  async search(query: string, k = 5) {
    if (!this.initialized) await this.init();
    return this.retriever.searchAll(query, k);
  }

  async flush(): Promise<void> {
    for (const col of this.collections.values()) await col.save();
  }

  getStats(): MemoryStats {
    return {
      files: this.collections.get('files')?.count || 0,
      decisions: this.collections.get('decisions')?.count || 0,
      errors: this.collections.get('errors')?.count || 0,
      sessions: this.collections.get('sessions')?.count || 0,
      embedder: this.embedder?.strategy || 'none',
      projectPath: this.projectPath,
      lastIndex: new Date().toISOString(),
    };
  }

  getEmbedderStrategy(): string {
    return this.embedder?.strategy || 'none';
  }
}
