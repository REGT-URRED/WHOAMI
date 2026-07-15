// @whoami/orchestrator — Circuit Breaker pattern (pi-autoloop)
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  maxStrikes: number;
  cooldownMs: number;
  timeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private strikes = 0;
  private lastFailure = 0;

  constructor(private config: CircuitBreakerConfig = { maxStrikes: 3, cooldownMs: 30000, timeoutMs: 180000 }) {}

  getState(): CircuitState { return this.state; }
  getStrikes(): number { return this.strikes; }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.config.cooldownMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs)
        )
      ]);
      if (this.state === 'HALF_OPEN') { this.reset(); }
      return result;
    } catch (e) {
      this.strikes++;
      this.lastFailure = Date.now();
      if (this.strikes >= this.config.maxStrikes) {
        this.state = 'OPEN';
      }
      throw e;
    }
  }

  reset(): void { this.strikes = 0; this.state = 'CLOSED'; }
}
