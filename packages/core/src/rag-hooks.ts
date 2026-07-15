import { autoInitMemory, ProjectMemory, ContextBundle } from '@whoami/rag-memory';

let currentMemory: ProjectMemory | null = null;

export async function ensureMemory(projectPath?: string): Promise<ProjectMemory | null> {
  if (currentMemory?.isReady) return currentMemory;
  const cwd = projectPath || process.cwd();
  currentMemory = await autoInitMemory(cwd);
  return currentMemory;
}

export async function getMemory(): Promise<ProjectMemory | null> {
  return currentMemory;
}

export async function onTaskStart(task: string, projectPath?: string): Promise<ContextBundle | null> {
  const mem = await ensureMemory(projectPath);
  if (!mem) return null;
  return mem.getContext(task);
}

export async function onTaskComplete(decision?: string, error?: string, fix?: string): Promise<void> {
  const mem = currentMemory;
  if (!mem) return;
  if (decision) await mem.addDecision(decision, '');
  if (error && fix) await mem.addError(error, fix);
  await mem.addSession(`Session completed at ${new Date().toISOString()}`);
  await mem.flush();
}
