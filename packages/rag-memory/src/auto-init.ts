import path from 'path';
import fs from 'fs';
import { ProjectMemory } from './project-memory';
import { EmbedderStrategy } from './embedder';

export interface DetectionResult {
  triggered: boolean;
  reason: string;
  projectPath: string;
}

export function detectComplexProject(cwd: string): DetectionResult {
  const result: DetectionResult = {
    triggered: false,
    reason: '',
    projectPath: cwd,
  };

  const manifestFiles = [
    'package.json', 'Cargo.toml', 'go.mod', 'Gemfile',
    'requirements.txt', 'Pipfile', 'setup.py', 'pyproject.toml',
    'pom.xml', 'build.gradle', 'Makefile', 'CMakeLists.txt',
    '.csproj', 'pubspec.yaml', 'mix.exs',
  ];

  const sourcePatterns = [
    'src/', 'lib/', 'app/', 'cmd/', 'internal/',
  ];

  const hasManifest = manifestFiles.some(f => {
    try { return fs.statSync(path.join(cwd, f)).isFile(); } catch { return false; }
  });

  const hasSourceDirs = sourcePatterns.some(d => {
    try { return fs.statSync(path.join(cwd, d)).isDirectory(); } catch { return false; }
  });

  let fileCount = 0;
  try {
    fileCount = fs.readdirSync(cwd).length;
  } catch {}

  if (hasManifest && (hasSourceDirs || fileCount > 15)) {
    result.triggered = true;
    result.reason = `Project detected: manifest=${hasManifest} sourceDirs=${hasSourceDirs} files=${fileCount}`;
  }

  return result;
}

export async function autoInitMemory(projectPath: string, strategy?: EmbedderStrategy): Promise<ProjectMemory | null> {
  const detection = detectComplexProject(projectPath);
  if (!detection.triggered) return null;

  const memory = new ProjectMemory(projectPath);
  const memoryDir = path.join(projectPath, '.whoami', 'memory');

  try {
    await fs.promises.mkdir(memoryDir, { recursive: true });
  } catch {}

  const needsInit = !fs.existsSync(path.join(memoryDir, 'vectors.json'));
  await memory.init(strategy);

  try {
    await memory.indexProject();
  } catch (e) {
    console.warn('[whoami] Initial indexing warning:', String(e));
  }

  return memory;
}
