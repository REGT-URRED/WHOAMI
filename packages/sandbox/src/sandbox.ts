// @whoami/sandbox — zero-style permission system

export type PermissionLevel = 'read-only' | 'write' | 'execute' | 'network';

export interface SandboxPolicy {
  workspaceRoot: string;
  allowedPaths: string[];
  allowedCommands: string[];
  permissionLevel: PermissionLevel;
  allowedDomains?: string[];
  allowElevated?: boolean;
  envPassthrough?: string[];
}

export interface AgentIdentity {
  id: string;
  publicKey: string;
  scopes: string[];
  attestation: string;
}

// ---- PermissionGate ----

export type GateKind = 'fileRead' | 'fileWrite' | 'shellExecute' | 'networkAccess' | 'elevatedAction';

export interface GateRule {
  kind: GateKind;
  allow: boolean;
  patterns?: string[];
}

export class PermissionGate {
  private rules: Map<GateKind, GateRule> = new Map();

  constructor(rules: GateRule[] = []) {
    for (const r of rules) this.rules.set(r.kind, r);
  }

  allows(kind: GateKind, target?: string): boolean {
    const rule = this.rules.get(kind);
    if (!rule) return false;
    if (!rule.allow) return false;
    if (rule.patterns && target) {
      return rule.patterns.some(p => target.startsWith(p) || new RegExp(p).test(target));
    }
    return rule.allow;
  }

  toJSON(): GateRule[] {
    return Array.from(this.rules.values());
  }
}

// ---- SandboxPolicyBuilder ----

export class SandboxPolicyBuilder {
  private policy: Partial<SandboxPolicy> & { gates?: GateRule[] } = {
    allowedPaths: [],
    allowedCommands: [],
    allowedDomains: [],
    gates: [],
  };

  setWorkspaceRoot(path: string): this {
    this.policy.workspaceRoot = path;
    return this;
  }

  allowReadPath(path: string): this {
    this.policy.allowedPaths!.push(path);
    this.policy.gates!.push({ kind: 'fileRead', allow: true, patterns: [path] });
    return this;
  }

  allowCommand(cmd: string): this {
    this.policy.allowedCommands!.push(cmd);
    this.policy.gates!.push({ kind: 'shellExecute', allow: true, patterns: [cmd] });
    return this;
  }

  allowDomain(domain: string): this {
    this.policy.allowedDomains!.push(domain);
    this.policy.gates!.push({ kind: 'networkAccess', allow: true, patterns: [domain] });
    return this;
  }

  allowElevated(allow: boolean): this {
    this.policy.allowElevated = allow;
    this.policy.gates!.push({ kind: 'elevatedAction', allow });
    return this;
  }

  setPermissionLevel(level: PermissionLevel): this {
    this.policy.permissionLevel = level;
    return this;
  }

  setEnvPassthrough(vars: string[]): this {
    this.policy.envPassthrough = vars;
    return this;
  }

  build(): SandboxPolicy {
    if (!this.policy.workspaceRoot) throw new Error('workspaceRoot is required');
    return {
      workspaceRoot: this.policy.workspaceRoot,
      allowedPaths: this.policy.allowedPaths ?? [],
      allowedCommands: this.policy.allowedCommands ?? [],
      permissionLevel: this.policy.permissionLevel ?? 'read-only',
      allowedDomains: this.policy.allowedDomains,
      allowElevated: this.policy.allowElevated,
      envPassthrough: this.policy.envPassthrough,
    };
  }

  getGates(): GateRule[] {
    return this.policy.gates ?? [];
  }
}

// ---- SubprocessSandbox ----

export interface SubprocessEnv {
  PATH?: string;
  HOME?: string;
  [key: string]: string | undefined;
}

export class SubprocessSandbox {
  private env: SubprocessEnv = {};
  private allowedVars: string[] = [];

  constructor(policy?: SandboxPolicy) {
    if (policy?.envPassthrough) {
      this.allowedVars = policy.envPassthrough;
      for (const v of this.allowedVars) {
        if (process.env[v] !== undefined) this.env[v] = process.env[v];
      }
    }
  }

  env_clear(): void {
    this.env = {};
  }

  passthrough(...vars: string[]): void {
    for (const v of vars) {
      if (process.env[v] !== undefined) this.env[v] = process.env[v];
    }
    this.allowedVars.push(...vars);
  }

  getEnv(): SubprocessEnv {
    return { ...this.env };
  }

  allowedVariables(): string[] {
    return [...this.allowedVars];
  }
}

// ---- Sandbox (extended) ----

export class Sandbox {
  private policy: SandboxPolicy;
  private gates: PermissionGate;
  private audit: string[] = [];

  constructor(policy: SandboxPolicy) {
    this.policy = policy;
    this.gates = new PermissionGate([
      { kind: 'fileRead', allow: true, patterns: [policy.workspaceRoot, ...policy.allowedPaths] },
      { kind: 'fileWrite', allow: policy.permissionLevel !== 'read-only', patterns: [policy.workspaceRoot, ...policy.allowedPaths] },
      { kind: 'shellExecute', allow: policy.permissionLevel === 'execute' || policy.permissionLevel === 'network', patterns: policy.allowedCommands },
      { kind: 'networkAccess', allow: policy.permissionLevel === 'network', patterns: policy.allowedDomains },
      { kind: 'elevatedAction', allow: !!policy.allowElevated },
    ]);
  }

  canRead(path: string): boolean {
    return this.isInWorkspace(path) || this.policy.allowedPaths.some(p => path.startsWith(p));
  }

  canWrite(path: string): boolean {
    return this.policy.permissionLevel !== 'read-only' && this.canRead(path);
  }

  canExecute(command: string): boolean {
    if (this.policy.permissionLevel === 'read-only') return false;
    if (this.policy.permissionLevel === 'write') return false;
    return this.policy.allowedCommands.some(c => command.startsWith(c));
  }

  canAccessNetwork(url: string): boolean {
    if (!this.gates.allows('networkAccess', url)) return false;
    if (!this.policy.allowedDomains) return false;
    try {
      const parsed = new URL(url);
      return this.policy.allowedDomains.some(d => parsed.hostname.endsWith(d));
    } catch {
      return false;
    }
  }

  canElevate(): boolean {
    return this.gates.allows('elevatedAction');
  }

  auditLog(): string[] {
    return [...this.audit];
  }

  logAudit(entry: string): void {
    this.audit.push(`[${new Date().toISOString()}] ${entry}`);
  }

  getPolicy(): SandboxPolicy {
    return { ...this.policy };
  }

  getGates(): PermissionGate {
    return this.gates;
  }

  private isInWorkspace(path: string): boolean {
    return path.startsWith(this.policy.workspaceRoot);
  }
}

// ---- TrustVerifier (extended) ----

export class TrustVerifier {
  verify(identity: AgentIdentity, requiredScope: string): boolean {
    return identity.scopes.includes(requiredScope);
  }

  trustScore(identity: AgentIdentity, failureCount: number): number {
    return Math.max(0, 1.0 - failureCount * 0.1);
  }

  verifyGate(identity: AgentIdentity, gate: GateKind): boolean {
    if (gate === 'elevatedAction') {
      return identity.scopes.includes('admin') || identity.scopes.includes('root');
    }
    if (gate === 'networkAccess') {
      return identity.scopes.includes('network');
    }
    return true; // lower gates are always verified if identity is valid
  }
}
