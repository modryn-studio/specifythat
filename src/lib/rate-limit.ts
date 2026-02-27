// In-memory IP rate limiter.
// NOTE: In-memory means limits are per-instance and reset on cold start.
// This is intentional for the free tier — it's a best-effort abuse guard,
// not a hard billing boundary. Vercel's typical warm-instance lifetime means
// most burst abuse will be caught. Upgrade to Vercel KV/Redis when billing ships.

interface WindowEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Separate stores per route so limits are tracked independently.
const stores = new Map<string, Map<string, WindowEntry>>();

function getStore(route: string): Map<string, WindowEntry> {
  if (!stores.has(route)) stores.set(route, new Map());
  return stores.get(route)!;
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  // Fallback — should not happen on Vercel but prevents crashes locally
  return 'unknown';
}

/**
 * Returns true if the IP has exceeded `limit` requests within the 24-hour window.
 * Increments the counter on every non-limited call.
 */
export function isRateLimited(route: string, ip: string, limit: number): boolean {
  const store = getStore(route);
  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (existing.count >= limit) {
    return true;
  }

  existing.count++;
  return false;
}

// Per-route limits.
// These are conservative — adjust based on analytics data once live.
export const LIMITS = {
  'analyze-project': 15,        // ~3 retries per spec * 5 specs/day
  'generate-answer': 110,       // 11 questions * 5 specs + headroom
  'generate-spec': 5,           // Hard cap — this is the money shot
  'generate-project-description': 10,
} as const;
