// @whoami/session — full session management system (zero pattern)

import * as fs from 'fs';
import * as path from 'path';

export const VERSION = '2.1.0';

// ---- Session interface ----

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: SessionMessage[];
  metadata: Record<string, unknown>;
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  durationMs?: number;
}

// ---- SessionStore ----

export class SessionStore {
  private baseDir: string;
  private sessions: Map<string, Session> = new Map();

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(require('os').homedir(), '.whoami', 'sessions');
    this.ensureDir();
    this.loadAll();
  }

  getBaseDir(): string {
    return this.baseDir;
  }

  create(metadata: Record<string, unknown> = {}): Session {
    const id = this.generateId();
    const now = new Date().toISOString();
    const session: Session = {
      id,
      createdAt: now,
      updatedAt: now,
      messages: [],
      metadata,
    };
    this.sessions.set(id, session);
    this.persist(session);
    return session;
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  appendMessage(sessionId: string, message: SessionMessage): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    this.persist(session);
    return true;
  }

  list(limit = 20): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  search(query: string): Session[] {
    const q = query.toLowerCase();
    return Array.from(this.sessions.values()).filter(s =>
      s.messages.some(m => m.content.toLowerCase().includes(q)) ||
      s.id.includes(q) ||
      JSON.stringify(s.metadata).toLowerCase().includes(q)
    );
  }

  delete(id: string): boolean {
    this.sessions.delete(id);
    try {
      fs.unlinkSync(this.sessionPath(id));
      return true;
    } catch {
      return false;
    }
  }

  // -- disk persistence --

  private sessionPath(id: string): string {
    return path.join(this.baseDir, `${id}.json`);
  }

  private persist(session: Session): void {
    try {
      fs.writeFileSync(this.sessionPath(session.id), JSON.stringify(session, null, 2), 'utf-8');
    } catch (e) {
      // ponytail: silent write fail, safe to ignore transient fs errors
    }
  }

  private loadAll(): void {
    try {
      const files = fs.readdirSync(this.baseDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(this.baseDir, file), 'utf-8');
          const session: Session = JSON.parse(raw);
          this.sessions.set(session.id, session);
        } catch {
          // skip corrupted files
        }
      }
    } catch {
      // directory doesn't exist yet
    }
  }

  private ensureDir(): void {
    try {
      fs.mkdirSync(this.baseDir, { recursive: true });
    } catch {
      // race condition safe
    }
  }

  private generateId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

// ---- CheckpointManager ----

export interface Checkpoint {
  id: string;
  sessionId: string;
  timestamp: string;
  label: string;
  messageCount: number;
}

export class CheckpointManager {
  private store: SessionStore;
  private checkpoints: Map<string, Checkpoint> = new Map();

  constructor(store: SessionStore) {
    this.store = store;
    this.loadCheckpoints();
  }

  create(sessionId: string, label: string): Checkpoint | null {
    const session = this.store.get(sessionId);
    if (!session) return null;
    const id = `ckpt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const checkpoint: Checkpoint = {
      id,
      sessionId,
      timestamp: new Date().toISOString(),
      label,
      messageCount: session.messages.length,
    };
    this.checkpoints.set(id, checkpoint);
    this.persistCheckpoint(checkpoint, session);
    return checkpoint;
  }

  list(sessionId: string): Checkpoint[] {
    return Array.from(this.checkpoints.values())
      .filter(c => c.sessionId === sessionId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  restore(checkpointId: string): boolean {
    const ckpt = this.checkpoints.get(checkpointId);
    if (!ckpt) return false;
    try {
      const ckptPath = path.join(this.store.getBaseDir(), 'checkpoints', `${ckpt.id}.json`);
      const data = JSON.parse(fs.readFileSync(ckptPath, 'utf-8'));
      const session = this.store.get(ckpt.sessionId);
      if (!session) return false;
      session.messages = data.messages.slice(0, ckpt.messageCount);
      session.updatedAt = new Date().toISOString();
      this.store.appendMessage(ckpt.sessionId, {
        role: 'tool',
        content: `[restored to checkpoint: ${ckpt.label}]`,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  }

  private persistCheckpoint(ckpt: Checkpoint, session: Session): void {
    try {
      const dir = path.join(this.store.getBaseDir(), 'checkpoints');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, `${ckpt.id}.json`),
        JSON.stringify({ id: ckpt.id, messages: session.messages }, null, 2),
        'utf-8'
      );
    } catch {
      // safe to ignore
    }
  }

  private loadCheckpoints(): void {
    try {
      const dir = path.join(this.store.getBaseDir(), 'checkpoints');
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
          const data = JSON.parse(raw);
          const meta = data.id ? {
            id: data.id,
            sessionId: '',
            timestamp: '',
            label: '',
            messageCount: 0,
          } : null;
          if (meta) {
            this.checkpoints.set(meta.id, meta);
          }
        } catch {
          // skip
        }
      }
    } catch {
      // no checkpoints dir
    }
  }
}

// ---- SessionFork ----

export class SessionFork {
  private store: SessionStore;

  constructor(store: SessionStore) {
    this.store = store;
  }

  fork(sourceId: string, label: string): Session | null {
    const source = this.store.get(sourceId);
    if (!source) return null;
    const fork = this.store.create({
      ...source.metadata,
      forkedFrom: sourceId,
      forkLabel: label,
    });
    fork.messages = source.messages.map(m => ({
      ...m,
      timestamp: new Date().toISOString(),
    }));
    fork.updatedAt = new Date().toISOString();
    this.store.appendMessage(fork.id, {
      role: 'tool',
      content: `[forked from ${sourceId} at ${source.messages.length} messages]`,
      timestamp: new Date().toISOString(),
    });
    return fork;
  }
}
