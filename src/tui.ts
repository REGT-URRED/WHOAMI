import inquirer from 'inquirer';
import { loadConfig } from './core/config';
import { getBackend, listBackends } from './core/plugin-loader';
import { banner, primary, secondary, accent, success, info, muted } from './core/display';
import { getAgentStats, suggestBestAgent } from './core/memory';

export async function startTui(): Promise<void> {
  const config = await loadConfig();
  const backend = getBackend(config.backend);

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
