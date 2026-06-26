#!/usr/bin/env node
import { Command } from 'commander';
import { runWorkflow, spawnAgent } from './ruflo-bridge';

const program = new Command();

program
  .name('whoami')
  .description('WHOAMI — Autonomous Multi-Agent Orchestrator\n  Meta-orquestador que clasifica, selecciona y despliega\n  el agente correcto para cada tarea.')
  .version('1.0.0');

program
  .command('build <task...>')
  .description('Full BUILD pipeline: architect -> tdd-guide -> code-reviewer -> build-fixer -> ramon -> e2e -> docs')
  .action(async (taskParts: string[]) => {
    const task = taskParts.join(' ');
    await runWorkflow('whoami-build', task);
  });

program
  .command('fix <bug...>')
  .description('BUG FIX pipeline: build-fixer -> tdd-guide -> code-reviewer')
  .action(async (bugParts: string[]) => {
    const bug = bugParts.join(' ');
    await runWorkflow('whoami-fix', bug);
  });

program
  .command('refactor <path>')
  .description('REFACTOR pipeline: clean -> ramon -> review')
  .action(async (path: string) => {
    await runWorkflow('whoami-refactor', path);
  });

program
  .command('reverse <path>')
  .description('REVERSE engineering: explore -> hypothesize -> validate -> spec')
  .action(async (path: string) => {
    await runWorkflow('whoami-reverse', path);
  });

program
  .command('review')
  .description('Code review on current git diff')
  .action(async () => {
    await spawnAgent('sonnet', 'code-reviewer');
  });

program
  .command('plan <task...>')
  .description('Multi-path planning (read-only, >=3 approaches)')
  .action(async (taskParts: string[]) => {
    const task = taskParts.join(' ');
    await spawnAgent('sonnet', 'planner', task);
  });

program
  .command('audit [path]')
  .description('Full repository audit for dead code & over-engineering')
  .action(async (path?: string) => {
    await spawnAgent('sonnet', 'ramon', path || '.');
  });

program
  .command('security')
  .description('OWASP security audit')
  .action(async () => {
    await spawnAgent('haiku', 'security-reviewer');
  });

program
  .command('supabase')
  .description('Diagnose Supabase connection (6 layers)')
  .action(async () => {
    await spawnAgent('sonnet', 'vega');
  });

program
  .command('e2e')
  .description('E2E browser tests with Playwright')
  .action(async () => {
    await spawnAgent('sonnet', 'e2e-runner');
  });

program
  .command('docs')
  .description('Auto-generate documentation (README, CHANGELOG, API)')
  .action(async () => {
    await spawnAgent('haiku', 'doc-updater');
  });

program
  .command('orchestrate <task...>')
  .description('Full WHOAMI meta-orchestrator pipeline')
  .action(async (taskParts: string[]) => {
    const task = taskParts.join(' ');
    await spawnAgent('sonnet', 'whoami', task);
  });

program.parse(process.argv);
