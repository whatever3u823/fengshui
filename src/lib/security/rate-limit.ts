import "server-only";
import { AppError } from "@/lib/errors";

/**
 * Minimal fixed-window rate limiter held in process memory. It protects a
 * single instance from runaway API spend; with several instances, replace the
 * store with Redis/Upstash (or enforce per-user credits once accounts exist).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForBuckets = globalThis as unknown as { __fengShuiRateLimit?: Map<string, Bucket> };
const buckets = (globalForBuckets.__fengShuiRateLimit ??= new Map());

export function clientKey(request: Request): string {
  // Only meaningful behind a proxy that sets these headers; falls back to one shared bucket.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function enforceRateLimit(
  scope: string,
  key: string,
  limit: { maxRequests: number; windowMs: number },
  now = Date.now(),
): void {
  const id = `${scope}:${key}`;
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + limit.windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit.maxRequests) throw new AppError("RATE_LIMITED");
}
