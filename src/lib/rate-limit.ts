import "server-only";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/** Simple in-memory fixed-window rate limiter (single-instance deployments). */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false as const, retryInMs: b.reset - now };
  return { ok: true as const };
}

// prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}, 60_000).unref?.();
