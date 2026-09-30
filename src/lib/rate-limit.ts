const attempts = new Map<string, { count: number; resetAt: number }>();

/** Small in-memory limiter for the login route. Resets when the server restarts. */
export function isRateLimited(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
