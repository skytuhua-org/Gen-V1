export class RequestRateLimit {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly windowMs: number, private readonly now: () => number = Date.now) {}

  consume(key: string, limit: number): boolean {
    const now = this.now(), cutoff = now - this.windowMs;
    const kept = (this.hits.get(key) ?? []).filter(at => at > cutoff);
    if (kept.length >= limit) {
      this.hits.set(key, kept);
      return false;
    }
    kept.push(now);
    this.hits.set(key, kept);
    if (this.hits.size > 1000) {
      for (const [bucket, times] of this.hits) {
        const live = times.filter(at => at > cutoff);
        if (live.length) this.hits.set(bucket, live);
        else this.hits.delete(bucket);
      }
      while (this.hits.size > 1000) this.hits.delete(this.hits.keys().next().value!);
    }
    return true;
  }
}
