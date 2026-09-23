import type { NextRequest } from 'next/server';

// In-memory limiter: per serverless instance, so a coarse guard —
// the honeypot and minimum-time checks do most of the anti-spam work.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Returns true when `key` has already made `max` requests in the window. */
export function isRateLimited(key: string, max = 3, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}
