import fs from 'fs';
import path from 'path';
import { Embedder } from './embedder';
import simpleGit from 'simple-git';

export interface IndexConfig {
  projectPath: string;
  embedder: Embedder;
  extensions?: string[];
  excludeDirs?: string[];
  maxFileSize?: number;
}

const DEFAULT_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.c', '.cpp',
  '.h', '.hpp', '.java', '.rb', '.php', '.swift', '.kt', '.scala',
  '.md', '.mdx', '.txt', '.json', '.yaml', '.yml', '.toml',
  '.env', '.cfg', '.conf', '.ini', '.sql',
];

const DEFAULT_EXCLUDE = [
  'node_modules', '.git', 'dist', 'build', '.next', '.cache',
  '.kilo', '.kilocode', '.opencode', '.whoami', 'coverage',
  '__pycache__', '.venv', 'venv', '.tox',
];

export interface IndexedFile {
  id: string;
  path: string;
  content: string;
  vector: number[];
  metadata: Record<string, string>;
}

export class Indexer {
  private config: IndexConfig;

  constructor(config: IndexConfig) {
    this.config = {
      ...config,
      extensions: config.extensions ?? DEFAULT_EXTENSIONS,
      excludeDirs: config.excludeDirs ?? DEFAULT_EXCLUDE,
      maxFileSize: config.maxFileSize ?? 1024 * 100,
    };
  }

  async scanProject(): Promise<IndexedFile[]> {
    const files = await this.discoverFiles();
    const results: IndexedFile[] = [];

    for (const filePath of files) {
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.size > this.config.maxFileSize!) continue;
        const content = await fs.promises.readFile(filePath, 'utf-8');
        if (!content.trim()) continue;
        const ext = path.extname(filePath);
        const relativePath = path.relative(this.config.projectPath, filePath);
        const vector = await this.config.embedder.embed(content);
        results.push({
          id: `file:${relativePath}`,
          path: relativePath,
          content,
          vector,
          metadata: {
            extension: ext,
            size: String(stat.size),
            modified: stat.mtime.toISOString(),
          },
        });
      } catch {}
    }
    return results;
  }

  async scanChanges(): Promise<IndexedFile[]> {
    try {
      const git = simpleGit(this.config.projectPath);
      const diff = await git.diffSummary(['--', '.']);
      if (!diff.files.length) return [];
      const results: IndexedFile[] = [];
      for (const file of diff.files) {
        const fullPath = path.join(this.config.projectPath, file.file);
        try {
          const content = await fs.promises.readFile(fullPath, 'utf-8');
          const ext = path.extname(file.file);
          if (!this.config.extensions!.includes(ext)) continue;
          const vector = await this.config.embedder.embed(content);
          results.push({
            id: `file:${file.file}`,
            path: file.file,
            content,
            vector,
            metadata: { extension: ext, source: 'git-diff' },
          });
        } catch {}
      }
      return results;
    } catch {
      return this.scanProject();
    }
  }

  private async discoverFiles(): Promise<string[]> {
    const results: string[] = [];
    const queue = [this.config.projectPath];
    const excludeSet = new Set(this.config.excludeDirs || []);
    const extSet = new Set(this.config.extensions || []);

    while (queue.length > 0) {
      const dir = queue.shift()!;
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!excludeSet.has(entry.name)) queue.push(fullPath);
          } else if (entry.isFile()) {
            if (extSet.has(path.extname(entry.name))) results.push(fullPath);
          }
        }
      } catch {}
    }
    return results;
  }
}
