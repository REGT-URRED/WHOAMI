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
      CREATE TABLE IF NOT EXISTS harness_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT NOT NULL,
        eval_type TEXT NOT NULL DEFAULT 'capability',
        grader_type TEXT NOT NULL DEFAULT 'code',
        definition TEXT NOT NULL,
        result TEXT NOT NULL DEFAULT 'pending',
        pass_at_k REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_harness_project ON harness_runs(project);
      CREATE INDEX IF NOT EXISTS idx_harness_result ON harness_runs(result);
      CREATE TABLE IF NOT EXISTS harness_promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL UNIQUE,
        source_project TEXT NOT NULL,
        evidence TEXT NOT NULL DEFAULT '',
        usage_count INTEGER DEFAULT 1,
        success_rate REAL DEFAULT 1.0,
        promoted INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_promotions_skill ON harness_promotions(skill_name);
      CREATE TABLE IF NOT EXISTS project_harness (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        harness_score REAL DEFAULT 0,
        subsystems_json TEXT DEFAULT '{}',
        last_validated TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_project_path ON project_harness(project_path);
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

export function recordHarnessEval(project: string, evalType: string, graderType: string, definition: string, result: string, passAtK: number): void {
  try {
    const d = getDb();
    d.prepare('INSERT INTO harness_runs (project, eval_type, grader_type, definition, result, pass_at_k) VALUES (?, ?, ?, ?, ?, ?)')
      .run(project, evalType, graderType, definition, result, passAtK);
  } catch {}
}

export interface HarnessEvalStats {
  project: string;
  total: number;
  passed: number;
  avgPassAtK: number;
}

export function getHarnessEvalStats(project?: string): HarnessEvalStats[] {
  try {
    const d = getDb();
    const where = project ? 'WHERE project = ?' : '';
    const params = project ? [project] : [];
    return d.prepare(`
      SELECT project, COUNT(*) as total,
        SUM(CASE WHEN result = 'PASS' THEN 1 ELSE 0 END) as passed,
        ROUND(AVG(pass_at_k), 2) as avgPassAtK
      FROM harness_runs ${where} GROUP BY project ORDER BY total DESC
    `).all(...params) as HarnessEvalStats[];
  } catch {
    return [];
  }
}

export function promoteSkillToGlobal(skillName: string, sourceProject: string, evidence: string): void {
  try {
    const d = getDb();
    d.prepare(`
      INSERT INTO harness_promotions (skill_name, source_project, evidence, usage_count, success_rate)
      VALUES (?, ?, ?, 1, 1.0)
      ON CONFLICT(skill_name) DO UPDATE SET
        usage_count = usage_count + 1,
        evidence = evidence || '; ' || ?,
        updated_at = datetime('now')
    `).run(skillName, sourceProject, evidence);
  } catch {}
}

export function getGlobalSkills(context?: string): Array<{ skillName: string; sourceProject: string; usageCount: number; successRate: number }> {
  try {
    const d = getDb();
    return d.prepare('SELECT skill_name as skillName, source_project as sourceProject, usage_count as usageCount, success_rate as successRate FROM harness_promotions WHERE promoted = 0 ORDER BY usage_count DESC').all() as any[];
  } catch {
    return [];
  }
}

export function getCrossProjectPatterns(limit: number = 10): Array<{ skillName: string; evidence: string; usageCount: number }> {
  try {
    const d = getDb();
    return d.prepare('SELECT skill_name as skillName, evidence, usage_count as usageCount FROM harness_promotions WHERE usage_count >= 3 ORDER BY usage_count DESC LIMIT ?').all(limit) as any[];
  } catch {
    return [];
  }
}

export function recordHarnessScaffold(projectPath: string, score: number, subsystems: Record<string, number>): void {
  try {
    const d = getDb();
    d.prepare(`
      INSERT INTO project_harness (project_path, harness_score, subsystems_json, last_validated)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(project_path) DO UPDATE SET
        harness_score = ?, subsystems_json = ?, last_validated = datetime('now')
    `).run(projectPath, score, JSON.stringify(subsystems), score, JSON.stringify(subsystems));
  } catch {}
}

export function getProjectHarnessScore(projectPath: string): { score: number; subsystems: Record<string, number>; lastValidated: string } | null {
  try {
    const d = getDb();
    const row = d.prepare('SELECT harness_score, subsystems_json, last_validated FROM project_harness WHERE project_path = ?').get(projectPath) as any;
    if (!row) return null;
    return { score: row.harness_score, subsystems: JSON.parse(row.subsystems_json), lastValidated: row.last_validated };
  } catch {
    return null;
  }
}
