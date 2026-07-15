import { AgentBackend, AgentResult } from './backend';

export class GentleBackend implements AgentBackend {
  readonly name = 'gentle';
  readonly description = 'Gentle-AI — ecosystem configurator for AI agents';

  async spawnAgent(agent: string, task: string): Promise<AgentResult> {
    return {
      success: false,
      output: `gentle-ai backend: agent spawn '${agent}' for task '${task}' — gentle-ai integration pending`,
      agent,
      duration: 0,
    };
  }

  async runWorkflow(name: string, task: string): Promise<AgentResult> {
    return {
      success: false,
      output: `gentle-ai backend: workflow '${name}' for task '${task}' — integration pending`,
      agent: name,
      duration: 0,
    };
  }

  async listAgents(): Promise<string[]> {
    return ['gentle-ai'];
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}
