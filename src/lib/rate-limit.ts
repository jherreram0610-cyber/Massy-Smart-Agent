const ipMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20; // per IP per window

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}
