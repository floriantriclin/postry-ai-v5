/**
 * Feature Flags System
 * Story 2.11b (BMA-48) - Architecture Persist-First
 * 
 * Purpose: Enable/disable persist-first architecture for gradual rollout
 * Owner: Tech Lead
 * Date: 2026-01-27
 */

/**
 * Feature flag configuration
 * Loaded from environment variables at runtime
 * 
 * Note: Flags are evaluated dynamically on each call to support testing
 */
export const FeatureFlags = {
  /**
   * ENABLE_PERSIST_FIRST
   * 
   * Controls whether posts are persisted to DB BEFORE auth modal (persist-first)
   * or saved to localStorage (legacy behavior)
   * 
   * Default: false (legacy behavior - safe)
   * Rollout plan:
   *   - Phase 1: 10% users → Monitor 24h
   *   - Phase 2: 50% users → Monitor 24h  
   *   - Phase 3: 100% users → Monitor 48h
   * 
   * Rollback: Set to false in .env, redeploy (< 5 min)
   */
  get ENABLE_PERSIST_FIRST(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST === 'true';
  },
  
  /**
   * Helper: Check if persist-first is enabled
   */
  isPersistFirstEnabled(): boolean {
    return this.ENABLE_PERSIST_FIRST;
  },
  
  /**
   * Helper: Get current behavior mode
   */
  getPostPersistMode(): 'persist-first' | 'localStorage-legacy' {
    return this.ENABLE_PERSIST_FIRST ? 'persist-first' : 'localStorage-legacy';
  },
  
  /**
   * Debug helper: Get all flags status
   */
  getAllFlags(): Record<string, boolean> {
    return {
      ENABLE_PERSIST_FIRST: this.ENABLE_PERSIST_FIRST,
    };
  },
};

/**
 * Type-safe feature flag checker
 * Use this in components/API routes
 * 
 * @example
 * ```typescript
 * if (FeatureFlags.isPersistFirstEnabled()) {
 *   // Call /api/posts/anonymous
 * } else {
 *   // Use localStorage (legacy)
 * }
 * ```
 */
export function usePersistFirst(): boolean {
  return FeatureFlags.isPersistFirstEnabled();
}

/**
 * Server-side only: Get feature flags from server env
 * Use in API routes to check flags
 */
export function getServerFeatureFlags() {
  return {
    ENABLE_PERSIST_FIRST: process.env.ENABLE_PERSIST_FIRST === 'true',
  };
}
