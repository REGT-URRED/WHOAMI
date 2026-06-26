import { spawn, spawnSync } from 'child_process';
import { resolve } from 'path';

const AGENT_DIR = resolve(__dirname, '..', 'agents');
const PROMPTS_DIR = resolve(__dirname, '..', '..', 'prompts', '_internal');

function getPromptFile(agentName: string): string | null {
  const candidates = [
    resolve(AGENT_DIR, `${agentName}.md`),
    resolve(AGENT_DIR, `${agentName}.txt`),
    resolve(PROMPTS_DIR, `${agentName}.txt`),
  ];
  const fs = require('fs');
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export async function runWorkflow(name: string, task: string = ''): Promise<void> {
  console.log(`[WHOAMI] Launching workflow: ${name}`);
  if (task) console.log(`[WHOAMI] Task: ${task}`);
  console.log('');

  const args = ['-y', 'ruflo@latest', 'workflow', 'run', '--template', name];
  if (task) args.push('--task', task);

  const child = spawn('npx', args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n[WHOAMI] Workflow ${name} completed.`);
        resolve();
      } else {
        console.error(`\n[WHOAMI] Workflow ${name} exited with code ${code}`);
        reject(new Error(`Exit code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

export async function spawnAgent(
  agentType: string,
  config: string,
  task?: string
): Promise<void> {
  console.log(`[WHOAMI] Spawning agent: ${config}`);
  if (task) console.log(`[WHOAMI] Task: ${task}`);
  console.log('');

  const promptFile = getPromptFile(config);
  if (promptFile) {
    console.log(`[WHOAMI] Prompt: ${promptFile}`);
  }

  const args = ['-y', 'ruflo@latest', 'agent', 'spawn', '-t', agentType];

  if (promptFile) {
    args.push('--prompt', promptFile);
  }
  if (task) {
    args.push('--task', task);
  }

  // Fallback: if ruflo agent spawn doesn't support prompt files directly,
  // just run it with task context
  const child = spawn('npx', args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n[WHOAMI] Agent ${config} completed.`);
        resolve();
      } else {
        console.error(`\n[WHOAMI] Agent ${config} exited with code ${code}`);
        reject(new Error(`Exit code ${code}`));
      }
    });
    child.on('error', reject);
  });
}
