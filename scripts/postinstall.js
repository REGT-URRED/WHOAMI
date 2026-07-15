#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOGO = `
  ╔═══════════════════════════════════════════╗
  ║   __      __  _____  ___   _    __  __    ║
  ║   \\ \\    / / | ____|/ _ \\ | |  |  \\/  |   ║
  ║    \\ \\  / /  |  _| | | | || |  | |\\/| |   ║
  ║     \\ \\/ /   | |___| |_| || |__| |  | |   ║
  ║      \\__/    |_____|\\___/ |____|_|  |_|   ║
  ║                                           ║
  ║   Autonomous Multi-Agent Orchestrator     ║
  ║           v2.3.0                          ║
  ╚═══════════════════════════════════════════╝
`;

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd} 2>/dev/null || where ${cmd} 2>nul`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectTool(name, cmd, configKey, configSection) {
  const found = commandExists(cmd);
  if (found) {
    console.log(`  ✓ ${name} detected (${cmd})`);
  } else {
    console.log(`  ✗ ${name} not found`);
  }
  return found;
}

function updateConfig(tools) {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '~', '.whoami', 'whoami.config.json');
  const localConfigPath = path.resolve(process.cwd(), 'whoami.config.json');
  const targetPath = fs.existsSync(localConfigPath) ? localConfigPath : configPath;

  let config = {};
  if (fs.existsSync(targetPath)) {
    try {
      config = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    } catch {
      config = {};
    }
  }

  if (tools.openfang) {
    config.openfang = config.openfang || {};
    config.openfang.endpoint = config.openfang.endpoint || 'http://127.0.0.1:4200';
    config.openfang.enabled = true;
  }
  if (tools.crawl4ai) {
    config.crawl4ai = config.crawl4ai || {};
    config.crawl4ai.mode = config.crawl4ai.mode || 'cli';
    config.crawl4ai.cliPath = config.crawl4ai.cliPath || 'crwl';
    config.crawl4ai.enabled = true;
  }
  if (tools.agentReach) {
    config.agents = config.agents || {};
    config.agents.enabled = config.agents.enabled || [];
    const reachAgents = ['agent-reach', 'agent-reach-web', 'agent-reach-twitter', 'agent-reach-youtube', 'agent-reach-github', 'agent-reach-reddit', 'agent-reach-rss'];
    for (const agent of reachAgents) {
      if (!config.agents.enabled.includes(agent)) {
        config.agents.enabled.push(agent);
      }
    }
  }

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
  return targetPath;
}

console.log(LOGO);
console.log('WHOAMI v2.3.0 - Autonomous Multi-Agent Orchestrator\n');
console.log('Scanning environment for available tools...\n');

const tools = {
  openfang: detectTool('OpenFang', 'openfang', 'openfang', null),
  crawl4ai: detectTool('Crawl4AI', 'crwl', 'crawl4ai', null),
  agentReach: detectTool('AgentReach', 'agent-reach', 'agent-reach', 'agents'),
};

const configPath = updateConfig(tools);
console.log(`\nConfiguration written to: ${configPath}\n`);

console.log('── Setup Instructions ──');
if (!tools.openfang)    console.log('  • Install OpenFang: https://github.com/regt-urred/openfang');
if (!tools.crawl4ai)    console.log('  • Install Crawl4AI: pip install crawl4ai');
if (!tools.agentReach)  console.log('  • Install AgentReach: npm install -g @whoami/agent-reach');
console.log('\nGet started: whoami --help');
console.log('Documentation: https://github.com/regt-urred/whoami\n');
