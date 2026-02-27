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
// RATE_LIMIT_PER_DAY controls the hard cap on spec starts (analyze-project).
// Other limits are derived relative to that cap so they never become a bottleneck.
export function getLimits() {
  const specsPerDay = parseInt(process.env.RATE_LIMIT_PER_DAY ?? '5', 10);
  return {
    'analyze-project': specsPerDay * 3,           // ~3 retries per spec
    'generate-answer': specsPerDay * 11 * 2,      // 11 questions * 2x headroom
    'generate-all-answers': specsPerDay,          // One per spec (batch call)
    'generate-spec': specsPerDay,                 // Hard cap — one per spec
    'generate-project-description': specsPerDay * 2,
  };
}

// Convenience export for callers that need a quick lookup without the function call.
// Evaluated once at module load — that's fine for serverless cold starts.
export const LIMITS = getLimits();
