import { AgentBackend, AgentResult, HandInfo, HandStatusDetail, ChannelInfo, SecurityReport } from './backend';
import { OpenFangClient } from './openfang-client';
import { ChannelBridge } from './channel-bridge';

const BUILTIN_HANDS = [
  { name: 'clip', description: 'YouTube video → vertical shorts with captions' },
  { name: 'lead', description: 'Daily lead generation and ICP scoring' },
  { name: 'collector', description: 'OSINT intelligence monitoring with knowledge graphs' },
  { name: 'predictor', description: 'Superforecasting with calibrated reasoning chains' },
  { name: 'researcher', description: 'Deep multi-source research with CRAAP credibility scoring' },
  { name: 'twitter', description: 'Autonomous Twitter/X content and engagement manager' },
  { name: 'browser', description: 'Web automation with Playwright bridge and purchase approval gate' },
];

const BUILTIN_AGENTS = [
  'assistant', 'coder',
  ...BUILTIN_HANDS.map(h => h.name),
];

export class OpenFangBackend implements AgentBackend {
  readonly name = 'openfang';
  readonly description = 'OpenFang Agent OS — 7 autonomous Hands, 53 tools, 40 channels, 16 security layers';
  readonly client: OpenFangClient;
  readonly channels: ChannelBridge;

  constructor(endpoint?: string, apiKey?: string, channelAdapters?: string[]) {
    this.client = new OpenFangClient(endpoint, apiKey);
    this.channels = new ChannelBridge(this.client, channelAdapters);
  }

  async spawnAgent(agent: string, task: string, _prompt?: string): Promise<AgentResult> {
    const start = Date.now();
    try {
      const messages = [
        { role: 'system' as const, content: `You are ${agent}. Execute the following task autonomously.` },
        { role: 'user' as const, content: task },
      ];
      const res = await this.client.chat(agent, messages);
      if (!res.ok || !res.data) {
        return { success: false, output: res.error || 'No response', agent, duration: Date.now() - start };
      }
      const text = res.data.choices?.[0]?.message?.content || '';
      return { success: text.length > 0, output: text, agent, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: err?.message || String(err), agent, duration: Date.now() - start };
    }
  }

  async runWorkflow(name: string, task: string, _variables?: Record<string, string>): Promise<AgentResult> {
    const start = Date.now();
    const pipelineMap: Record<string, string[]> = {
      'whoami-build': ['architect', 'tdd-guide', 'code-reviewer', 'build-error-resolver'],
      'whoami-fix': ['build-error-resolver', 'tdd-guide', 'code-reviewer'],
      'whoami-refactor': ['refactor-cleaner', 'code-reviewer'],
      'whoami-reverse': ['reverse-explorer', 'reverse-hypothesis', 'reverse-validator', 'reverse-spec-writer'],
    };

    const agents = pipelineMap[name] || [name.replace('whoami-', '')];
    let lastOutput = task;

    for (const agent of agents) {
      const result = await this.spawnAgent(agent, lastOutput);
      if (!result.success) return result;
      lastOutput = result.output;
    }

    return {
      success: true,
      output: lastOutput,
      agent: name,
      duration: Date.now() - start,
    };
  }

  async listAgents(): Promise<string[]> {
    return [...BUILTIN_AGENTS];
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.client.health();
    return res.ok;
  }

  async listHands(): Promise<HandInfo[]> {
    const remote = await this.client.listHands();
    if (remote.ok && remote.data) return remote.data;
    return BUILTIN_HANDS.map(h => ({ ...h, status: 'stopped' as const }));
  }

  async activateHand(name: string, schedule?: string): Promise<void> {
    const res = await this.client.activateHand(name, schedule);
    if (!res.ok) throw new Error(res.error || `Failed to activate hand: ${name}`);
  }

  async handStatus(name: string): Promise<HandStatusDetail> {
    const res = await this.client.handStatus(name);
    if (res.ok && res.data) return res.data;
    throw new Error(res.error || `Failed to get hand status: ${name}`);
  }

  async pauseHand(name: string): Promise<void> {
    const res = await this.client.pauseHand(name);
    if (!res.ok) throw new Error(res.error || `Failed to pause hand: ${name}`);
  }

  async listChannels(): Promise<ChannelInfo[]> {
    const remote = await this.client.listChannels();
    if (remote.ok && remote.data) return remote.data;
    return this.channels.availableAdapters.map(name => ({
      name,
      adapter: this.channels.adapterDescriptions[name] || name,
      status: 'disconnected' as const,
    }));
  }

  async sendToChannel(channel: string, message: string): Promise<void> {
    const res = await this.channels.send(channel, message);
    if (!res.ok) throw new Error(res.error || `Failed to send to channel: ${channel}`);
  }

  async getSecurityReport(): Promise<SecurityReport> {
    const remote = await this.client.getSecurityReport();
    if (remote.ok && remote.data) return remote.data;
    return { layers: 16, status: 'degraded', activeThreats: 0, lastAudit: undefined };
  }
}
