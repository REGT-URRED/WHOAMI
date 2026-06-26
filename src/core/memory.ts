import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

let db: Database.Database | null = null;

function getDbPath(): string {
  const p = join(homedir(), '.whoami', 'memory.db');
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  return p;
}

function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        task TEXT NOT NULL,
        agent TEXT NOT NULL,
        success INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_runs_command ON runs(command);
      CREATE INDEX IF NOT EXISTS idx_runs_success ON runs(success);
    `);
  }
  return db;
}

export function recordRun(command: string, task: string, agent: string, success: boolean, duration: number): void {
  try {
    const d = getDb();
    d.prepare('INSERT INTO runs (command, task, agent, success, duration_ms) VALUES (?, ?, ?, ?, ?)')
      .run(command, task, agent, success ? 1 : 0, duration);
  } catch {}
}

export interface AgentStats {
  agent: string;
  total: number;
  successRate: number;
  avgDuration: number;
}

export function getAgentStats(): AgentStats[] {
  try {
    const d = getDb();
    return d.prepare(`
      SELECT agent, COUNT(*) as total,
        ROUND(CAST(SUM(success) AS REAL) / COUNT(*) * 100, 1) as successRate,
        ROUND(AVG(duration_ms), 0) as avgDuration
      FROM runs GROUP BY agent ORDER BY total DESC
    `).all() as AgentStats[];
  } catch {
    return [];
  }
}

export function suggestBestAgent(command: string): string | null {
  try {
    const d = getDb();
    const row = d.prepare(`
      SELECT agent, ROUND(CAST(SUM(success) AS REAL) / COUNT(*) * 100, 2) as rate
      FROM runs WHERE command = ? GROUP BY agent ORDER BY rate DESC, COUNT(*) DESC LIMIT 1
    `).get(command) as { agent: string; rate: number } | undefined;
    return row && row.rate > 70 ? row.agent : null;
  } catch {
    return null;
  }
}
