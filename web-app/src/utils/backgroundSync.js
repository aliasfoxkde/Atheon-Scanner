/**
 * Pending submissions queue for offline support.
 * Stores scan submissions in localStorage when offline and retries when back online.
 */

const PENDING_KEY = 'atheon_pending_submissions';

/**
 * Get all pending submissions.
 * @returns {Array<{id: string, target: string, type: string, submittedAt: string}>}
 */
export function getPendingSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Atomically add a submission to the pending queue using a lock to prevent
 * race conditions from concurrent addPendingSubmission calls.
 * @param {{ target: string, type: string }} submission
 * @returns {{ id: string, target: string, type: string, submittedAt: string }}
 */
export function addPendingSubmission({ target, type }) {
  const lockKey = `${PENDING_KEY}_lock`;
  const entry = {
    id: `pending-${Date.now()}`,
    target,
    type,
    submittedAt: new Date().toISOString(),
  };

  // Simple spin-lock to serialize concurrent writes (max 50 attempts × 10ms)
  let acquired = false;
  for (let i = 0; i < 50; i++) {
    if (localStorage.getItem(lockKey) === null) {
      try {
        localStorage.setItem(lockKey, '1');
        acquired = true;
        break;
      } catch {
        // Storage full — lock write failed, try again
      }
    }
    // Yield to event loop before retrying
    const start = Date.now();
    while (Date.now() - start < 10) {
      /* spin */
    }
  }

  try {
    if (acquired) {
      const pending = getPendingSubmissions();
      pending.unshift(entry);
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }
  } catch {
    // localStorage full or unavailable
  } finally {
    if (acquired) {
      try {
        localStorage.removeItem(lockKey);
      } catch {
        // ignore
      }
    }
  }

  return entry;
}

/**
 * Remove a submission from the pending queue by id.
 * Idempotent — removing a non-existent id is a no-op.
 * @param {string} id
 */
export function removePendingSubmission(id) {
  const pending = getPendingSubmissions();
  const next = pending.filter((p) => p.id !== id);
  // Only write if something was actually removed (idempotent — no-op if not found)
  if (next.length !== pending.length) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
}

/**
 * Check if there are pending submissions.
 * @returns {boolean}
 */
export function hasPendingSubmissions() {
  return getPendingSubmissions().length > 0;
}
