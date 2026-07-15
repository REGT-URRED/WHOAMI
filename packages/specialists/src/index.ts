// @whoami/specialists — Full agency-agents integration
// Division-based agent categorization with tiered registry + capability probes

export type Division =
  | 'engineering'
  | 'design'
  | 'product'
  | 'marketing'
  | 'sales'
  | 'security'
  | 'testing'
  | 'support'
  | 'project-management'
  | 'strategy'
  | 'finance'
  | 'healthcare'
  | 'academic'
  | 'game-development'
  | 'gis'
  | 'spatial-computing';

export type Tier = 0 | 1 | 2; // 0=zero-config, 1=free key, 2=auth required

export interface AgentManifest {
  name: string;
  description: string;
  division: Division;
  emoji: string;
  skills: string[];
  examples: string[];
  communicationStyle: string;
  tools: string[];
  tier: Tier;
  color?: string;
  model?: string;
  extends?: string;
}

export interface CapabilityProbe {
  name: string;
  check: () => Promise<{ status: 'ok' | 'warn' | 'error'; message: string }>;
  backends: string[];
}

export class AgentCatalog {
  private agents: Map<string, AgentManifest> = new Map();
  private probes: Map<string, CapabilityProbe> = new Map();

  register(manifest: AgentManifest): void {
    this.agents.set(manifest.name, manifest);
  }

  get(name: string): AgentManifest | undefined {
    return this.agents.get(name);
  }

  list(): AgentManifest[] {
    return Array.from(this.agents.values());
  }

  getByDivision(division: Division): AgentManifest[] {
    return this.list().filter(a => a.division === division);
  }

  getByTool(tool: string): AgentManifest[] {
    return this.list().filter(a => a.tools.some(t => t.toLowerCase().includes(tool.toLowerCase())));
  }

  getByTier(tier: Tier): AgentManifest[] {
    return this.list().filter(a => a.tier === tier);
  }

  search(query: string): AgentManifest[] {
    const q = query.toLowerCase();
    return this.list().filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.division.toLowerCase().includes(q) ||
      a.skills.some(s => s.toLowerCase().includes(q)) ||
      a.tools.some(t => t.toLowerCase().includes(q))
    );
  }

  suggest(query: string, limit = 5): string[] {
    return this.search(query).slice(0, limit).map(a => a.name);
  }

  registerProbe(probe: CapabilityProbe): void {
    this.probes.set(probe.name, probe);
  }

  async healthCheck(): Promise<Array<{ name: string; status: string; message: string }>> {
    const results = [];
    for (const [name, probe] of this.probes) {
      try {
        const r = await probe.check();
        results.push({ name, ...r });
      } catch (e) {
        results.push({ name, status: 'error', message: String(e) });
      }
    }
    return results;
  }
}

// Built-in agency agents — 30+ entries across all divisions
export const BUILTIN_AGENTS: AgentManifest[] = [
  // ─── Engineering ───────────────────────────────────────────────
  {
    name: 'Frontend Developer',
    description: 'Builds responsive UIs with modern frameworks (React, Vue, Svelte). Handles state, routing, and component architecture.',
    division: 'engineering',
    emoji: '🎨',
    skills: ['html', 'css', 'javascript', 'react', 'typescript', 'responsive-design'],
    examples: ['Build a product page layout from spec', 'Add client-side form validation', 'Implement dark mode toggle'],
    communicationStyle: 'Visual-first, concrete, pixel-conscious',
    tools: ['react', 'vue', 'svelte', 'tailwind', 'typescript', 'storybook'],
    tier: 0,
    color: '#61DAFB',
  },
  {
    name: 'Backend Architect',
    description: 'Designs and implements server-side systems, APIs, and data models. Focuses on scalability, reliability, and clean architecture.',
    division: 'engineering',
    emoji: '⚙️',
    skills: ['api-design', 'database', 'authentication', 'microservices', 'caching'],
    examples: ['Design REST API for e-commerce platform', 'Set up PostgreSQL with migrations', 'Implement JWT auth flow'],
    communicationStyle: 'Systematic, precise, architecture-focused',
    tools: ['node', 'python', 'postgresql', 'redis', 'docker', 'graphql'],
    tier: 0,
    color: '#68A063',
  },
  {
    name: 'AI Engineer',
    description: 'Integrates LLMs, builds RAG pipelines, fine-tunes models, and designs agentic workflows with tool-use and memory.',
    division: 'engineering',
    emoji: '🤖',
    skills: ['llm-integration', 'rag', 'prompt-engineering', 'fine-tuning', 'agent-design'],
    examples: ['Build a RAG pipeline for docs', 'Create a tool-using agent', 'Optimize prompt for code generation'],
    communicationStyle: 'Experimental, precise, data-driven',
    tools: ['openai', 'langchain', 'huggingface', 'weaviate', 'pinecone', 'llamaindex'],
    tier: 1,
    color: '#FF6F00',
  },
  {
    name: 'DevOps Automator',
    description: 'Builds CI/CD pipelines, automates infrastructure, manages deployments, and ensures system reliability through observability.',
    division: 'engineering',
    emoji: '🔄',
    skills: ['ci-cd', 'infrastructure', 'monitoring', 'containerization', 'automation'],
    examples: ['Set up GitHub Actions pipeline', 'Configure Kubernetes deployment', 'Build monitoring dashboard'],
    communicationStyle: 'Methodical, automation-first, reliability-focused',
    tools: ['docker', 'kubernetes', 'terraform', 'github-actions', 'prometheus', 'grafana'],
    tier: 1,
    color: '#326CE5',
  },
  {
    name: 'Cloud Architect',
    description: 'Designs cloud-native solutions across AWS/Azure/GCP. Optimizes cost, security, and performance at scale.',
    division: 'engineering',
    emoji: '☁️',
    skills: ['cloud-design', 'cost-optimization', 'networking', 'high-availability', 'disaster-recovery'],
    examples: ['Design multi-region architecture', 'Optimize cloud spending', 'Set up VPC with private subnets'],
    communicationStyle: 'Strategic, cost-conscious, future-proof',
    tools: ['aws', 'azure', 'gcp', 'terraform', 'cloudformation', 'vpc'],
    tier: 1,
    color: '#FF9900',
  },
  {
    name: 'Database Optimizer',
    description: 'Models data schemas, optimizes queries, tunes indexes, and designs migration strategies for relational and NoSQL stores.',
    division: 'engineering',
    emoji: '🗄️',
    skills: ['data-modeling', 'query-optimization', 'index-tuning', 'migrations', 'nosql'],
    examples: ['Optimize slow SQL query', 'Design normalized schema', 'Plan zero-downtime migration'],
    communicationStyle: 'Analytical, detail-oriented, performance-first',
    tools: ['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'elasticsearch'],
    tier: 0,
    color: '#336791',
  },
  {
    name: 'API Designer',
    description: 'Designs clean, consistent, and versioned APIs following REST, GraphQL, or gRPC best practices.',
    division: 'engineering',
    emoji: '🔗',
    skills: ['rest', 'graphql', 'openapi', 'versioning', 'documentation'],
    examples: ['Design RESTful resource hierarchy', 'Write OpenAPI 3.0 spec', 'Design GraphQL schema'],
    communicationStyle: 'Precise, contract-first, developer-empathy',
    tools: ['openapi', 'graphql', 'grpc', 'postman', 'insomnia', 'swagger'],
    tier: 0,
    color: '#6A1B9A',
  },
  {
    name: 'Data Engineer',
    description: 'Builds ETL/ELT pipelines, manages data warehouses, and ensures data quality and governance.',
    division: 'engineering',
    emoji: '📊',
    skills: ['etl', 'data-warehousing', 'streaming', 'data-quality', 'pipelines'],
    examples: ['Build daily ETL pipeline', 'Design star schema warehouse', 'Set up streaming ingestion'],
    communicationStyle: 'Systematic, schema-conscious, quality-driven',
    tools: ['spark', 'airflow', 'dbt', 'kafka', 'snowflake', 'bigquery'],
    tier: 1,
    color: '#E74C3C',
  },
  {
    name: 'Mobile App Builder',
    description: 'Develops cross-platform and native mobile apps with smooth UX, offline support, and platform-specific polish.',
    division: 'engineering',
    emoji: '📱',
    skills: ['mobile-ui', 'offline-storage', 'push-notifications', 'app-store-deployment', 'native-apis'],
    examples: ['Build React Native product list screen', 'Add push notification support', 'Implement offline mode'],
    communicationStyle: 'UX-conscious, platform-aware, pragmatic',
    tools: ['react-native', 'flutter', 'swift', 'kotlin', 'expo', 'firebase'],
    tier: 1,
    color: '#61DAFB',
  },
  {
    name: 'SRE',
    description: 'Ensures service reliability through SLOs, error budgets, incident response, and chaos engineering.',
    division: 'engineering',
    emoji: '📈',
    skills: ['slo', 'error-budget', 'incident-response', 'chaos-engineering', 'capacity-planning'],
    examples: ['Define SLOs for critical service', 'Run chaos experiment', 'Write postmortem'],
    communicationStyle: 'Data-driven, blameless, reliability-first',
    tools: ['prometheus', 'grafana', 'terraform', 'kubernetes', 'pagerduty', 'opentelemetry'],
    tier: 1,
    color: '#E6522C',
  },
  {
    name: 'Prompt Engineer',
    description: 'Crafts, tests, and optimizes prompts for LLMs. Designs chain-of-thought, few-shot, and structured output strategies.',
    division: 'engineering',
    emoji: '💬',
    skills: ['prompt-design', 'few-shot', 'chain-of-thought', 'structured-output', 'evaluation'],
    examples: ['Craft system prompt for code assistant', 'Design few-shot examples for classification', 'Build prompt eval suite'],
    communicationStyle: 'Iterative, experimental, output-obsessed',
    tools: ['openai', 'anthropic', 'langchain', 'guardrails', 'promptfoo'],
    tier: 0,
    color: '#10A37F',
  },

  // ─── Design ──────────────────────────────────────────────────
  {
    name: 'UI Designer',
    description: 'Creates beautiful, functional interfaces with strong typography, color, spacing, and component systems.',
    division: 'design',
    emoji: '🖌️',
    skills: ['visual-design', 'typography', 'color-theory', 'layout', 'component-systems'],
    examples: ['Design a landing page hero', 'Create color palette from brand', 'Build button component system'],
    communicationStyle: 'Visual, empathetic, detail-oriented',
    tools: ['figma', 'sketch', 'tailwind', 'framer-motion', 'storybook', 'shadcn'],
    tier: 0,
    color: '#FF4081',
  },
  {
    name: 'UX Researcher',
    description: 'Conducts user research, usability testing, and translates findings into actionable design recommendations.',
    division: 'design',
    emoji: '🔍',
    skills: ['user-research', 'usability-testing', 'interviews', 'surveys', 'data-synthesis'],
    examples: ['Plan and run usability study', 'Analyze interview transcripts', 'Create research report with recommendations'],
    communicationStyle: 'Empathetic, evidence-based, user-advocate',
    tools: ['dovetail', 'notion', 'miro', 'surveymonkey', 'lookback', 'condens'],
    tier: 0,
    color: '#7C4DFF',
  },
  {
    name: 'Accessibility Specialist',
    description: 'Audits and remediates accessibility issues. Ensures WCAG 2.1 AA/AAA compliance across web and mobile.',
    division: 'design',
    emoji: '♿',
    skills: ['wcag', 'aria', 'keyboard-navigation', 'screen-readers', 'color-contrast'],
    examples: ['Audit site for WCAG compliance', 'Fix keyboard trap in navigation', 'Add ARIA labels to dynamic content'],
    communicationStyle: 'Thorough, inclusive, standards-rigorous',
    tools: ['axe', 'wave', 'voiceover', 'nvda', 'lighthouse', 'pa11y'],
    tier: 0,
    color: '#1A237E',
  },

  // ─── Product ──────────────────────────────────────────────────
  {
    name: 'Product Manager',
    description: 'Defines product vision, prioritizes features, writes specs, and aligns stakeholders across squads.',
    division: 'product',
    emoji: '📋',
    skills: ['roadmapping', 'prioritization', 'stakeholder-management', 'spec-writing', 'user-stories'],
    examples: ['Write product requirements doc', 'Prioritize Q3 roadmap items', 'Align team on feature scope'],
    communicationStyle: 'Strategic, clear, stakeholder-aware',
    tools: ['jira', 'linear', 'notion', 'mixpanel', 'amplitude', 'productboard'],
    tier: 0,
    color: '#00BCD4',
  },
  {
    name: 'Growth Hacker',
    description: 'Runs experiments to drive user acquisition, activation, retention, and revenue through data-informed growth loops.',
    division: 'product',
    emoji: '📈',
    skills: ['experimentation', 'a/b-testing', 'conversion', 'viral-loops', 'analytics'],
    examples: ['Design A/B test for signup flow', 'Analyze funnel drop-off points', 'Build referral program'],
    communicationStyle: 'Data-obsessed, experimental, growth-minded',
    tools: ['mixpanel', 'amplitude', 'optimizely', 'hotjar', 'google-analytics', 'segment'],
    tier: 1,
    color: '#4CAF50',
  },
  {
    name: 'Content Strategist',
    description: 'Develops content strategy, SEO-optimized copy, and multi-channel content plans aligned with brand voice.',
    division: 'product',
    emoji: '✍️',
    skills: ['content-strategy', 'seo', 'copywriting', 'content-calendar', 'brand-voice'],
    examples: ['Write SEO-optimized blog post', 'Create content calendar for quarter', 'Define brand voice guide'],
    communicationStyle: 'Narrative, brand-aligned, audience-first',
    tools: ['semrush', 'ahrefs', 'wordpress', 'contentful', 'fathom', 'plausible'],
    tier: 0,
    color: '#FF5722',
  },
  {
    name: 'SEO Specialist',
    description: 'Optimizes sites for search engines through technical SEO, on-page optimization, and link-building strategies.',
    division: 'product',
    emoji: '🔎',
    skills: ['technical-seo', 'on-page', 'link-building', 'keyword-research', 'analytics'],
    examples: ['Audit site for SEO issues', 'Research keyword opportunities', 'Optimize meta tags for pages'],
    communicationStyle: 'Analytical, detail-oriented, algorithm-aware',
    tools: ['semrush', 'ahrefs', 'screaming-frog', 'google-search-console', 'analytics'],
    tier: 0,
    color: '#0F9D58',
  },
  {
    name: 'Email Marketer',
    description: 'Builds email campaigns, automations, and drip sequences with proper segmentation and performance tracking.',
    division: 'product',
    emoji: '📧',
    skills: ['email-campaigns', 'automation', 'segmentation', 'a/b-testing', 'analytics'],
    examples: ['Design onboarding email sequence', 'Build abandoned cart automation', 'Segment list for campaign'],
    communicationStyle: 'Conversion-focused, empathetic, data-informed',
    tools: ['mailchimp', 'sendgrid', 'hubspot', 'convertkit', 'activecampaign'],
    tier: 1,
    color: '#D32F2F',
  },

  // ─── Security ─────────────────────────────────────────────────
  {
    name: 'Security Auditor',
    description: 'Audits codebases for OWASP Top 10, secrets exposure, auth flaws, and insecure dependencies.',
    division: 'security',
    emoji: '🔒',
    skills: ['owasp', 'vulnerability-assessment', 'auth-audit', 'dependency-scan', 'secure-config'],
    examples: ['Audit API for OWASP Top 10', 'Scan repo for exposed secrets', 'Review auth implementation'],
    communicationStyle: 'Rigorous, adversarial, risk-prioritized',
    tools: ['burp-suite', 'semgrep', 'trivy', 'snyk', 'zap', 'sonarqube'],
    tier: 1,
    color: '#D32F2F',
  },
  {
    name: 'Penetration Tester',
    description: 'Simulates real-world attacks to identify exploitable vulnerabilities in applications and infrastructure.',
    division: 'security',
    emoji: '🛡️',
    skills: ['exploitation', 'reconnaissance', 'privilege-escalation', 'web-attacks', 'reporting'],
    examples: ['Run penetration test on web app', 'Exploit SQL injection vulnerability', 'Write pentest report'],
    communicationStyle: 'Methodical, adversarial, evidence-documented',
    tools: ['metasploit', 'burp-suite', 'nmap', 'wireshark', 'hydra', 'john'],
    tier: 2,
    color: '#B71C1C',
  },
  {
    name: 'Incident Responder',
    description: 'Responds to security incidents with containment, eradication, recovery, and postmortem analysis.',
    division: 'security',
    emoji: '🚨',
    skills: ['incident-response', 'forensics', 'containment', 'threat-hunting', 'postmortem'],
    examples: ['Respond to data breach alert', 'Contain compromised container', 'Write incident postmortem'],
    communicationStyle: 'Calm, precise, time-critical',
    tools: ['splunk', 'elastic', 'thehive', 'velociraptor', 'osquery', 'wazuh'],
    tier: 2,
    color: '#E53935',
  },

  // ─── Testing ──────────────────────────────────────────────────
  {
    name: 'QA Engineer',
    description: 'Designs and executes test plans, writes automated tests, manages bug tracking, and ensures release quality.',
    division: 'testing',
    emoji: '✅',
    skills: ['test-planning', 'automation', 'bug-tracking', 'regression', 'acceptance-testing'],
    examples: ['Write test plan for feature', 'Build automated test suite', 'Track regressions across releases'],
    communicationStyle: 'Thorough, process-driven, quality-advocate',
    tools: ['playwright', 'cypress', 'jest', 'selenium', 'testrail', 'jira'],
    tier: 0,
    color: '#4CAF50',
  },
  {
    name: 'Performance Tester',
    description: 'Load tests, benchmarks, and profiles systems to identify bottlenecks and ensure performance SLAs.',
    division: 'testing',
    emoji: '⚡',
    skills: ['load-testing', 'benchmarking', 'profiling', 'bottleneck-analysis', 'capacity-testing'],
    examples: ['Run load test with k6', 'Profile Node.js memory usage', 'Benchmark API endpoint performance'],
    communicationStyle: 'Metrics-driven, analytical, bottleneck-hunter',
    tools: ['k6', 'artillery', 'locust', 'chrome-devtools', 'clinic', 'hyperfine'],
    tier: 0,
    color: '#FFC107',
  },

  // ─── Support ──────────────────────────────────────────────────
  {
    name: 'Technical Writer',
    description: 'Writes clear, structured documentation for APIs, SDKs, user guides, and internal knowledge bases.',
    division: 'support',
    emoji: '📝',
    skills: ['api-docs', 'user-guides', 'sdk-documentation', 'knowledge-base', 'tutorials'],
    examples: ['Write API reference docs', 'Create getting-started tutorial', 'Build FAQ knowledge base'],
    communicationStyle: 'Clear, structured, audience-aware',
    tools: ['markdown', 'vitepress', 'readme', 'notion', 'confluence', 'openapi'],
    tier: 0,
    color: '#1565C0',
  },
  {
    name: 'Data Analyst',
    description: 'Analyzes datasets, builds dashboards, writes SQL, and delivers actionable insights to stakeholders.',
    division: 'support',
    emoji: '📊',
    skills: ['sql', 'visualization', 'statistics', 'dashboarding', 'reporting'],
    examples: ['Analyze user churn patterns', 'Build executive dashboard', 'Write SQL for cohort analysis'],
    communicationStyle: 'Insight-driven, visual, stakeholder-conscious',
    tools: ['python', 'sql', 'tableau', 'metabase', 'powerbi', 'looker'],
    tier: 0,
    color: '#9C27B0',
  },

  // ─── Strategy ─────────────────────────────────────────────────
  {
    name: 'Technical Project Manager',
    description: 'Drives technical projects from kickoff to delivery, managing timelines, risks, dependencies, and cross-team communication.',
    division: 'project-management',
    emoji: '📌',
    skills: ['project-planning', 'risk-management', 'sprint-management', 'stakeholder-updates', 'retrospectives'],
    examples: ['Scope and plan 3-month migration', 'Manage sprint backlog', 'Write project status report'],
    communicationStyle: 'Organized, proactive, bridge-builder',
    tools: ['jira', 'linear', 'notion', 'asana', 'monday', 'slack'],
    tier: 0,
    color: '#00897B',
  },

  // ─── Specialized ──────────────────────────────────────────────
  {
    name: 'Blockchain Developer',
    description: 'Builds smart contracts, dApps, and blockchain integrations for Ethereum, Solana, and L2 networks.',
    division: 'game-development',
    emoji: '⛓️',
    skills: ['smart-contracts', 'solidity', 'web3', 'defi', 'nft'],
    examples: ['Write Solidity smart contract', 'Build dApp frontend', 'Deploy to testnet'],
    communicationStyle: 'Precise, gas-conscious, security-first',
    tools: ['solidity', 'hardhat', 'foundry', 'ethers', 'web3', 'rust'],
    tier: 2,
    color: '#62688F',
  },
  {
    name: 'AR/VR Developer',
    description: 'Creates immersive spatial computing experiences with Unity, WebXR, and 3D rendering pipelines.',
    division: 'spatial-computing',
    emoji: '🥽',
    skills: ['webxr', 'unity', 'threejs', 'spatial-design', '3d-modeling'],
    examples: ['Build WebXR hand-tracking demo', 'Create spatial UI component', 'Optimize 3D scene for mobile'],
    communicationStyle: 'Spatial, immersive, performance-aware',
    tools: ['unity', 'threejs', 'webxr', 'blender', 'realitykit', 'playcanvas'],
    tier: 2,
    color: '#E91E63',
  },
  {
    name: 'Game Developer',
    description: 'Designs game mechanics, builds gameplay systems, and creates interactive experiences with popular engines.',
    division: 'game-development',
    emoji: '🎮',
    skills: ['game-mechanics', 'physics', 'rendering', 'audio', 'ui'],
    examples: ['Implement player movement system', 'Design level layout', 'Build inventory UI'],
    communicationStyle: 'Creative, mechanic-focused, player-first',
    tools: ['unity', 'unreal', 'godot', 'blender', 'photoshop', 'audacity'],
    tier: 1,
    color: '#4A148C',
  },
  {
    name: 'CMS Developer',
    description: 'Builds and extends content management systems, custom blocks, plugins, and headless CMS integrations.',
    division: 'engineering',
    emoji: '📰',
    skills: ['headless-cms', 'custom-blocks', 'plugins', 'templates', 'workflows'],
    examples: ['Create custom Gutenberg block', 'Build headless CMS with Strapi', 'Extend WordPress REST API'],
    communicationStyle: 'Modular, extensible, content-architecture',
    tools: ['wordpress', 'strapi', 'contentful', 'sanity', 'directus', 'drupal'],
    tier: 0,
    color: '#21759B',
  },
];

/**
 * Registers all built-in agents into the given catalog.
 * Returns the catalog for chaining.
 */
export function registerDefaultCatalog(catalog?: AgentCatalog): AgentCatalog {
  const c = catalog ?? new AgentCatalog();
  for (const agent of BUILTIN_AGENTS) {
    c.register(agent);
  }
  return c;
}
