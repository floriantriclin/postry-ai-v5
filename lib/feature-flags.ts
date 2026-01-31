/**
 * Feature Flags Management
 * Story 2.11b (BMA-48)
 */

/**
 * Get persist-first flag status
 * Supports gradual rollout via percentage
 */
export function getPersistFirstEnabled(identifier?: string): boolean {
  // Base flag - must be true to enable rollout
  const baseFlag = process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST === 'true';
  
  if (!baseFlag) {
    return false;
  }

  // Rollout percentage (0-100)
  const rolloutPercentage = parseInt(process.env.NEXT_PUBLIC_PERSIST_FIRST_ROLLOUT || '100', 10);
  
  // 100% = everyone gets it
  if (rolloutPercentage >= 100) {
    return true;
  }

  // 0% = nobody gets it
  if (rolloutPercentage <= 0) {
    return false;
  }

  // For gradual rollout, use consistent hashing
  if (!identifier) {
    // No identifier = use random (not consistent across page reloads)
    return Math.random() * 100 < rolloutPercentage;
  }

  // Hash the identifier to get consistent result
  const hash = simpleHash(identifier);
  const bucket = hash % 100; // 0-99
  
  return bucket < rolloutPercentage;
}

/**
 * Simple hash function for consistent rollout
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * CLIENT-SIDE: Get persist-first flag
 * Uses session storage for consistency during session
 */
export function usePersistFirstClient(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Get or create session identifier
  let sessionId = sessionStorage.getItem('_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()}`;
    sessionStorage.setItem('_session_id', sessionId);
  }

  return getPersistFirstEnabled(sessionId);
}
