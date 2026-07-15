// @whoami/orchestrator — Topology patterns (agency-agents: 5 multi-agent topologies)
export type TopologyType = 'sequential' | 'parallel' | 'hierarchical' | 'evaluator-optimizer' | 'mesh';

export interface TopologyConfig {
  type: TopologyType;
  agents: string[];
  maxAgents?: number;
  maxIterations?: number;
}

export interface AgentTask {
  agent: string;
  instruction: string;
  context: string[];
  expectedOutput: string;
}

export function createPipeline(config: TopologyConfig, task: string): AgentTask[] {
  switch (config.type) {
    case 'sequential':
      return config.agents.map((agent, i) => ({
        agent,
        instruction: i === 0 ? task : "Process output from previous agent",
        context: i === 0 ? [] : ["previous-output"],
        expectedOutput: config.agents.length === 1 ? "Final result" : "Intermediate result for next agent"
      }));
    case 'parallel':
      return config.agents.map(agent => ({ agent, instruction: task, context: [], expectedOutput: "Partial result" }));
    default:
      return [{ agent: config.agents[0] || 'whoami', instruction: task, context: [], expectedOutput: "Complete result" }];
  }
}
