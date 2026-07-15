import { SearchResult } from './vector-db';
import { Collection } from './collection';

export interface ContextBundle {
  files: string[];
  decisions: string[];
  patterns: string[];
  sessions: string[];
  summary: string;
}

export class Retriever {
  constructor(private collections: Map<string, Collection>) {}

  async searchAll(query: string, k = 5): Promise<Map<string, SearchResult[]>> {
    const results = new Map<string, SearchResult[]>();
    for (const [name, col] of this.collections) {
      const hits = await col.search(query, k);
      if (hits.length > 0) results.set(name, hits);
    }
    return results;
  }

  async getContext(task: string): Promise<ContextBundle> {
    const bundle: ContextBundle = { files: [], decisions: [], patterns: [], sessions: [], summary: '' };
    const allResults = await this.searchAll(task, 3);
    for (const [collection, results] of allResults) {
      for (const r of results) {
        switch (collection) {
          case 'files':
            bundle.files.push(`[${r.metadata.extension || '?'}] ${r.metadata.path || r.id}\n${r.content.slice(0, 500)}`);
            break;
          case 'decisions':
            bundle.decisions.push(r.content);
            break;
          case 'errors':
            bundle.patterns.push(r.content);
            break;
          case 'sessions':
            bundle.sessions.push(r.content);
            break;
        }
      }
    }
    const parts: string[] = [];
    if (bundle.files.length) parts.push(`ARCHIVOS RELEVANTES:\n${bundle.files.join('\n---\n')}`);
    if (bundle.decisions.length) parts.push(`DECISIONES PREVIAS:\n${bundle.decisions.join('\n')}`);
    if (bundle.patterns.length) parts.push(`PATRONES DE ERROR:\n${bundle.patterns.join('\n')}`);
    if (bundle.sessions.length) parts.push(`SESIONES ANTERIORES:\n${bundle.sessions.join('\n')}`);
    bundle.summary = parts.join('\n\n');
    return bundle;
  }
}
