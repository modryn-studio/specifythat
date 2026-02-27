/**
 * Versioned localStorage wrapper for SpecifyThat.
 *
 * All keys are namespaced as `specifythat:*`.
 * STORAGE_VERSION is bumped when the schema changes — stale data is cleared.
 *
 * Best-effort: read/write errors never crash the app.
 */

const NS = 'specifythat';
const STORAGE_VERSION = 1;
const VERSION_KEY = `${NS}:version`;

type StorageKey = 'session' | 'specs';

function key(k: StorageKey): string {
  return `${NS}:${k}`;
}

/** Run schema migrations on startup. Call once at app boot. */
export function initStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = window.localStorage.getItem(VERSION_KEY);
    const storedVersion = stored ? parseInt(stored, 10) : 0;

    if (storedVersion < STORAGE_VERSION) {
      // Wipe all specifythat:* keys when schema version bumps.
      // Add targeted migrations here in future versions instead.
      const toDelete: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(`${NS}:`)) toDelete.push(k);
      }
      toDelete.forEach((k) => window.localStorage.removeItem(k));
      window.localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    }
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.)
  }
}

/** Read and deserialize a value. Returns null on any error. */
export function storageGet<T>(k: StorageKey): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key(k));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Serialize and write a value. Silently no-ops on error. */
export function storageSet<T>(k: StorageKey, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(k), JSON.stringify(value));
  } catch {
    // Storage full or unavailable — leave silently
  }
}

/** Remove a single key. */
export function storageRemove(k: StorageKey): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key(k));
  } catch {
    // ignore
  }
}

/** Wipe all specifythat:* keys (used by "clear history" action). */
export function storageClearAll(): void {
  if (typeof window === 'undefined') return;
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(`${NS}:`)) toDelete.push(k);
    }
    toDelete.forEach((k) => window.localStorage.removeItem(k));
    // Restore version marker
    window.localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
  } catch {
    // ignore
  }
}
