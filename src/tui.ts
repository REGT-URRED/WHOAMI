import inquirer from 'inquirer';
import { loadConfig } from './core/config';
import { getBackend, listBackends } from './core/plugin-loader';
import { banner, primary, secondary, accent, success, error, warning, info, muted } from './core/display';
import { getAgentStats, suggestBestAgent } from './core/memory';

export async function startTui(): Promise<void> {
  const config = await loadConfig();
  const backend = getBackend(config.backend, config);

  console.clear();
  console.log(banner());
  console.log(muted(`Backend: ${backend.name} — ${backend.description}`));
  console.log(muted(`Config: whoami.config.json — Theme: ${config.theme}`));

  const stats = getAgentStats();
  if (stats.length > 0) {
    console.log('');
    console.log(info('Memory Stats:'));
    for (const s of stats.slice(0, 5)) {
      const rate = s.successRate >= 80 ? success(`${s.successRate}%`) : s.successRate >= 50 ? primary(`${s.successRate}%`) : `${s.successRate}%`;
      console.log(muted(`  ${s.agent.padEnd(25)} ${s.total} runs | ${rate} success | ${s.avgDuration}ms avg`));
    }
  }

  while (true) {
    console.log('');
    const { action } = await inquirer.prompt<{ action: string }>([{
      type: 'list',
      name: 'action',
      message: primary('What would you like to do?'),
      choices: [
        { name: `${success('🚀')} Build — Full pipeline`, value: 'build' },
        { name: `${success('🔧')} Fix — Bug fix pipeline`, value: 'fix' },
        { name: `${success('♻️ ') } Refactor — Clean & restructure`, value: 'refactor' },
        { name: `${success('🔍')} Reverse — Analyze codebase`, value: 'reverse' },
        { name: `${info('👀')} Review — Code review`, value: 'review' },
        { name: `${info('📋')} Plan — Multi-path planning`, value: 'plan' },
        { name: `${info('🩺')} Audit — Full repository audit`, value: 'audit' },
        { name: `${info('👐')} Hands — List OpenFang Hands`, value: 'hands' },
        { name: `${info('📡')} Channels — List OpenFang channels`, value: 'channels' },
        { name: `${info('🔒')} Security — OpenFang security report`, value: 'security' },
        { name: `${info('🕸️')} Crawl — Single URL crawl`, value: 'crawl' },
        { name: `${info('🕷️')} Deep Crawl — Multi-page BFS crawl`, value: 'deep-crawl' },
        { name: `${accent('⚙️ ')} Config — View/change settings`, value: 'config' },
        { name: `${accent('📊')} Stats — Agent performance`, value: 'stats' },
        new inquirer.Separator(),
        { name: muted('Exit'), value: 'exit' },
      ],
    }]);

    if (action === 'exit') {
      console.log(success('\nWHOAMI signing off. Stay autonomous.\n'));
      process.exit(0);
    }

    if (action === 'hands') {
      if (!(backend as any).listHands) {
        console.log(error('\nHands require OpenFang backend.'));
        continue;
      }
      const hands = await (backend as any).listHands();
      console.log(info(`\nOpenFang Hands (${hands.length}):`));
      for (const h of hands) {
        const st = h.status === 'active' ? success('active') : h.status === 'paused' ? warning('paused') : muted(h.status);
        console.log(muted(`  ${h.name.padEnd(16)} ${st}  ${h.description || ''}`));
      }
      continue;
    }

    if (action === 'channels') {
      if (!(backend as any).listChannels) {
        console.log(error('\nChannels require OpenFang backend.'));
        continue;
      }
      const chs = await (backend as any).listChannels();
      console.log(info(`\nOpenFang Channels (${chs.length}):`));
      for (const c of chs) {
        const st = c.status === 'connected' ? success('connected') : muted(c.status);
        console.log(muted(`  ${c.name.padEnd(18)} ${st}  ${c.adapter || ''}`));
      }
      continue;
    }

    if (action === 'security') {
      if (!(backend as any).getSecurityReport) {
        console.log(error('\nSecurity report requires OpenFang backend.'));
        continue;
      }
      const rep = await (backend as any).getSecurityReport();
      console.log(info('\nOpenFang Security Report:'));
      const st = rep.status === 'active' ? success('ACTIVE') : warning('DEGRADED');
      console.log(muted(`  Status: ${st}`));
      console.log(muted(`  Layers: ${rep.layers}/16`));
      continue;
    }

    if (action === 'crawl' || action === 'deep-crawl') {
      if (!(backend as any).crawl) {
        console.log(error('\nCrawl requires crawl4ai backend.'));
        continue;
      }
      const { url, query } = await inquirer.prompt([
        { type: 'input', name: 'url', message: 'URL to crawl:', validate: (v: string) => v.startsWith('http') ? true : 'Must be a valid URL' },
        { type: 'input', name: 'query', message: 'Extraction query (optional):' },
      ]);
      const res = await (backend as any).crawl({
        url,
        deep: action === 'deep-crawl',
        strategy: 'bfs',
        maxPages: action === 'deep-crawl' ? 10 : undefined,
        query: query || undefined,
      });
      if (res.ok) console.log(success(`\n${action === 'deep-crawl' ? 'Deep crawl' : 'Crawl'} complete.`));
      else console.log(error(`\nCrawl failed: ${res.error}`));
      continue;
    }

    if (action === 'config') {
      console.log(info('\nCurrent configuration:'));
      console.log(JSON.stringify(config, null, 2));
      continue;
    }

    if (action === 'stats') {
      const allStats = getAgentStats();
      console.log(info('\nAgent Performance:'));
      if (allStats.length === 0) {
        console.log(muted('  No data yet. Run some commands first.'));
      }
      for (const s of allStats) {
        console.log(muted(`  ${s.agent.padEnd(25)} ${s.total} runs | ${s.successRate}% | ${s.avgDuration}ms avg`));
      }
      continue;
    }

    const { task } = await inquirer.prompt<{ task: string }>([{
      type: 'input',
      name: 'task',
      message: primary('Describe the task:'),
      validate: (v: string) => v.trim().length > 0 ? true : 'Task cannot be empty',
    }]);

    const suggestion = suggestBestAgent(action);
    if (suggestion) {
      console.log(info(`\nMemory suggests: ${suggestion} (best success rate for ${action})`));
    }

    console.log(secondary(`\nLaunching ${action} pipeline...`));
    console.log(muted(`Task: ${task}`));

    // For single-agent commands, spawn directly
    if (['review', 'plan', 'audit'].includes(action)) {
      const agentMap: Record<string, string> = { review: 'code-reviewer', plan: 'planner', audit: 'ramon' };
      await backend.spawnAgent(agentMap[action], task);
    } else {
      await backend.runWorkflow(`whoami-${action}`, task);
    }
  }
}
