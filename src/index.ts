#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './core/config';
import { getBackend, listBackends } from './core/plugin-loader';
import { initDisplay, banner, primary, secondary, accent, success, error, warning, info, muted } from './core/display';
import { recordRun, getAgentStats } from './core/memory';
import { startTui } from './tui';

async function main() {
  await initDisplay();
  const config = await loadConfig();
  const backend = getBackend(config.backend);

  const program = new Command();

  program
    .name('whoami')
    .description(`${banner()}`)
    .version(config.version);

  // === Backend info ===
  program
    .command('backend')
    .description('Show current backend information')
    .action(() => {
      console.log(info(`Active backend: ${primary(backend.name)}`));
      console.log(muted(backend.description));
      console.log(info(`Available backends: ${listBackends().join(', ')}`));
    });

  program
    .command('config')
    .description('Show current configuration')
    .action(async () => {
      console.log(info('Current configuration (whoami.config.json):'));
      console.log(JSON.stringify(config, null, 2));
    });

  // === TUI Mode ===
  program
    .command('tui')
    .description('Interactive TUI mode')
    .action(() => startTui());

  // === Pipeline commands (workflow-driven) ===
  program
    .command('build <task...>')
    .description('Full BUILD pipeline via workflow')
    .action(async (taskParts: string[]) => {
      const task = taskParts.join(' ');
      console.log(primary(`[WHOAMI] BUILD pipeline starting...`));
      console.log(muted(`Task: ${task}`));
      const result = await backend.runWorkflow('whoami-build', task);
      if (config.memory.enabled) recordRun('build', task, 'whoami-build', result.success, result.duration);
      if (result.success) console.log(success('\nBUILD complete.'));
      else console.log(error(`\nBUILD failed: ${result.output}`));
    });

  program
    .command('fix <bug...>')
    .description('BUG FIX pipeline via workflow')
    .action(async (bugParts: string[]) => {
      const bug = bugParts.join(' ');
      console.log(warning(`[WHOAMI] FIX pipeline starting...`));
      const result = await backend.runWorkflow('whoami-fix', bug);
      if (config.memory.enabled) recordRun('fix', bug, 'whoami-fix', result.success, result.duration);
      if (result.success) console.log(success('\nFIX complete.'));
      else console.log(error(`\nFIX failed: ${result.output}`));
    });

  program
    .command('refactor <path>')
    .description('REFACTOR pipeline via workflow')
    .action(async (path: string) => {
      console.log(accent(`[WHOAMI] REFACTOR pipeline starting...`));
      const result = await backend.runWorkflow('whoami-refactor', path);
      if (config.memory.enabled) recordRun('refactor', path, 'whoami-refactor', result.success, result.duration);
      if (result.success) console.log(success('\nREFACTOR complete.'));
      else console.log(error(`\nREFACTOR failed: ${result.output}`));
    });

  program
    .command('reverse <path>')
    .description('REVERSE engineering pipeline')
    .action(async (path: string) => {
      console.log(info(`[WHOAMI] REVERSE pipeline starting...`));
      const result = await backend.runWorkflow('whoami-reverse', path);
      if (config.memory.enabled) recordRun('reverse', path, 'whoami-reverse', result.success, result.duration);
      if (result.success) console.log(success('\nREVERSE complete.'));
      else console.log(error(`\nREVERSE failed: ${result.output}`));
    });

  // === Single-agent commands ===
  program
    .command('review')
    .description('Code review on current diff')
    .action(async () => {
      console.log(info(`[WHOAMI] Spawning code-reviewer...`));
      const result = await backend.spawnAgent('code-reviewer', 'Review current changes');
      if (config.memory.enabled) recordRun('review', 'current-diff', 'code-reviewer', result.success, result.duration);
      if (result.success) console.log(success('\nReview complete.'));
    });

  program
    .command('plan <task...>')
    .description('Multi-path planning (read-only)')
    .action(async (taskParts: string[]) => {
      const task = taskParts.join(' ');
      console.log(info(`[WHOAMI] Spawning planner...`));
      const result = await backend.spawnAgent('planner', task);
      if (config.memory.enabled) recordRun('plan', task, 'planner', result.success, result.duration);
      if (result.success) console.log(success('\nPlan complete.'));
    });

  program
    .command('audit [path]')
    .description('Full repository audit')
    .action(async (path?: string) => {
      const target = path || '.';
      console.log(warning(`[WHOAMI] Spawning ramon for audit...`));
      const result = await backend.spawnAgent('ramon', `Audit ${target}`);
      if (config.memory.enabled) recordRun('audit', target, 'ramon', result.success, result.duration);
      if (result.success) console.log(success('\nAudit complete.'));
    });

  program
    .command('stats')
    .description('Show agent performance statistics (from memory)')
    .action(() => {
      const stats = getAgentStats();
      if (stats.length === 0) {
        console.log(muted('No data yet. Run some commands with memory enabled.'));
        return;
      }
      console.log(info('Agent Performance:'));
      console.log('─'.repeat(60));
      for (const s of stats) {
        const rate = s.successRate >= 80 ? success(`${s.successRate}%`) : s.successRate >= 50 ? warning(`${s.successRate}%`) : error(`${s.successRate}%`);
        console.log(`  ${s.agent.padEnd(25)} ${String(s.total).padStart(5)} runs | ${rate} | ${String(s.avgDuration).padStart(6)}ms avg`);
      }
    });

  program.parse(process.argv);
}

main().catch(console.error);
