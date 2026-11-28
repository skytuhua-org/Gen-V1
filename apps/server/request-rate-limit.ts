export type DesktopRequestBudget = 'models' | 'account-status' | 'account-signout' | 'preview' | 'widget-worker' | 'plugin-runtime' | 'static';

declare module 'fastify' {
  interface FastifyContextConfig {
    desktopRequestBudget?: DesktopRequestBudget;
  }
}

const MAX_IDENTITIES = 1000;

export class RequestRateLimit {
  private readonly hits = new Map<string, number>();
  private overflow = 0;
  private resetsAt = -Infinity;

  constructor(private readonly windowMs: number, private readonly now: () => number = () => performance.now()) {}

  consume(key: string, limit: number): boolean {
    return this.retryAfter(key, limit) === null;
  }

  /** Charge one request, returning whole seconds until the window resets if denied. */
  retryAfter(key: string, limit: number): number | null {
    const now = this.now();
    if (now >= this.resetsAt) {
      this.hits.clear();
      this.overflow = 0;
      this.resetsAt = now + this.windowMs;
    }
    const existing = this.hits.get(key);
    if (existing === undefined && this.hits.size === MAX_IDENTITIES) {
      // Preserve live counters. New identities share one bounded bucket until reset.
      if (this.overflow < limit) {
        this.overflow++;
        return null;
      }
    } else if ((existing ?? 0) < limit) {
      this.hits.set(key, (existing ?? 0) + 1);
      return null;
    }
    return Math.max(1, Math.ceil((this.resetsAt - now) / 1000));
  }
}
