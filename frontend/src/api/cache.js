const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Read cached data from sessionStorage.
 * Returns null if missing or expired.
 */
export function readCache(key, ttl = DEFAULT_TTL) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Write data to sessionStorage with a timestamp.
 */
export function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/**
 * Remove a cache entry.
 */
export function clearCache(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

// ── Cache keys (centralised so every page can invalidate cross-page) ──
export const CACHE_KEYS = {
  DASHBOARD: "sb_student_dashboard",
  CAREER_MATCH: "sb_career_match",
  JOB_READINESS: "sb_job_readiness",
  JOB_MATCHES: "sb_job_matches",
  SKILL_VERIFICATION: "sb_skill_verification",
  STUDENT_PROFILE: "sb_student_profile",
};

/**
 * Clear ALL student caches at once (useful after profile edit).
 */
export function clearAllStudentCaches() {
  Object.values(CACHE_KEYS).forEach(clearCache);
}
