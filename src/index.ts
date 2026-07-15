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
  const backend = getBackend(config.backend, config);

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

  // === OpenFang-specific commands (only available with openfang backend) ===
  const ofBackend = backend as any;

  program
    .command('hands')
    .description('List available OpenFang Hands')
    .action(async () => {
      if (!ofBackend.listHands) {
        console.log(error('Hands require OpenFang backend. Use: backend: "openfang"'));
        return;
      }
      const hands = await ofBackend.listHands() as any[];
      console.log(info(`OpenFang Hands (${hands.length}):`));
      for (const h of hands) {
        const st = h.status === 'active' ? success('active') : h.status === 'paused' ? warning('paused') : muted(h.status);
        console.log(`  ${primary(h.name.padEnd(16))} ${st}  ${muted(h.description || '')}`);
      }
    });

  program
    .command('hand-activate <name>')
    .description('Activate an OpenFang Hand')
    .option('--schedule <cron>', 'Schedule (cron expression)')
    .action(async (name: string, opts: { schedule?: string }) => {
      if (!ofBackend.activateHand) {
        return console.log(error('Hands require OpenFang backend'));
      }
      await ofBackend.activateHand(name, opts.schedule);
      console.log(success(`Hand '${name}' activated.`));
    });

  program
    .command('hand-pause <name>')
    .description('Pause an OpenFang Hand')
    .action(async (name: string) => {
      if (!ofBackend.pauseHand) return console.log(error('Hands require OpenFang backend'));
      await ofBackend.pauseHand(name);
      console.log(warning(`Hand '${name}' paused.`));
    });

  program
    .command('hand-status <name>')
    .description('Show OpenFang Hand status')
    .action(async (name: string) => {
      if (!ofBackend.handStatus) return console.log(error('Hands require OpenFang backend'));
      const st = await ofBackend.handStatus(name);
      console.log(info(`Hand: ${primary(st.name)}`));
      console.log(muted(`  Running: ${st.running ? success('yes') : muted('no')}`));
      console.log(muted(`  Uptime: ${st.uptime}s`));
      console.log(muted(`  Tasks completed: ${st.tasksCompleted}`));
    });

  program
    .command('channels')
    .description('List available OpenFang channels')
    .action(async () => {
      if (!ofBackend.listChannels) return console.log(error('Channels require OpenFang backend'));
      const chs = await ofBackend.listChannels() as any[];
      console.log(info(`OpenFang Channels (${chs.length}):`));
      for (const c of chs) {
        const st = c.status === 'connected' ? success('connected') : c.status === 'disconnected' ? muted('disconnected') : error(c.status);
        console.log(`  ${primary(c.name.padEnd(18))} ${st}  ${muted(c.adapter || '')}`);
      }
    });

  program
    .command('send <channel> <message...>')
    .description('Send a message through an OpenFang channel')
    .action(async (channel: string, messageParts: string[]) => {
      if (!ofBackend.sendToChannel) return console.log(error('Channels require OpenFang backend'));
      const msg = messageParts.join(' ');
      await ofBackend.sendToChannel(channel, msg);
      console.log(success(`Message sent to '${channel}'.`));
    });

  program
    .command('security')
    .description('Show OpenFang security report')
    .action(async () => {
      if (!ofBackend.getSecurityReport) return console.log(error('Security report requires OpenFang backend'));
      const rep = await ofBackend.getSecurityReport();
      console.log(info('OpenFang Security:'));
      const st = rep.status === 'active' ? success('ACTIVE') : rep.status === 'degraded' ? warning('DEGRADED') : error('DOWN');
      console.log(muted(`  Status: ${st}`));
      console.log(muted(`  Layers: ${rep.layers}/16`));
      console.log(muted(`  Active threats: ${rep.activeThreats > 0 ? error(String(rep.activeThreats)) : success('0')}`));
    });

  // === Crawl4AI-specific commands (only available with crawl4ai backend) ===
  const c4Backend = backend as any;

  program
    .command('crawl <url>')
    .description('Crawl a URL and get markdown output')
    .option('--deep', 'Deep crawl using BFS strategy')
    .option('--max-pages <n>', 'Maximum pages to crawl (default: 10)')
    .option('-q, --query <text>', 'Extraction question for LLM-based extraction')
    .option('-o, --output <format>', 'Output format: markdown, html, json')
    .action(async (url: string, opts: { deep?: boolean; maxPages?: string; query?: string; output?: string }) => {
      if (!c4Backend.crawl) return console.log(error('Crawl requires crawl4ai backend'));
      console.log(info(`[Crawl4AI] Crawling ${primary(url)}...`));
      const res = await c4Backend.crawl({
        url,
        deep: opts.deep || false,
        maxPages: opts.maxPages ? parseInt(opts.maxPages) : undefined,
        query: opts.query,
        outputFormat: (opts.output as any) || 'markdown',
      });
      if (res.ok) {
        console.log(success('\nCrawl complete.'));
        if (res.result) console.log(res.result.slice(0, 2000));
      } else {
        console.log(error(`\nCrawl failed: ${res.error}`));
      }
    });

  program
    .command('deep-crawl <url>')
    .description('Deep crawl with BFS strategy')
    .option('--max-pages <n>', 'Maximum pages to crawl (default: 10)')
    .option('--strategy <s>', 'Crawl strategy: bfs, dfs')
    .action(async (url: string, opts: { maxPages?: string; strategy?: string }) => {
      if (!c4Backend.crawl) return console.log(error('Deep crawl requires crawl4ai backend'));
      console.log(info(`[Crawl4AI] Deep crawling ${primary(url)}...`));
      const res = await c4Backend.crawl({
        url, deep: true,
        strategy: (opts.strategy as any) || 'bfs',
        maxPages: opts.maxPages ? parseInt(opts.maxPages) : 10,
      });
      if (res.ok) {
        console.log(success('\nDeep crawl complete.'));
        if (res.result) console.log(res.result.slice(0, 3000));
      } else {
        console.log(error(`\nDeep crawl failed: ${res.error}`));
      }
    });

  program
    .command('extract <url>')
    .description('Extract structured data from a URL using LLM')
    .option('-q, --query <text>', 'What to extract')
    .option('-o, --output <format>', 'Output format: json, markdown')
    .action(async (url: string, opts: { query?: string; output?: string }) => {
      if (!c4Backend.crawl) return console.log(error('Extract requires crawl4ai backend'));
      if (!opts.query) return console.log(error('Query required. Use: -q "what to extract"'));
      console.log(info(`[Crawl4AI] Extracting from ${primary(url)}...`));
      const res = await c4Backend.crawl({ url, query: opts.query, outputFormat: (opts.output as any) || 'json' });
      if (res.ok) {
        console.log(success('\nExtraction complete.'));
        if (res.result) console.log(res.result.slice(0, 3000));
      } else {
        console.log(error(`\nExtraction failed: ${res.error}`));
      }
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
