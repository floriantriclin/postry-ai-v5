/**
 * Feature Flags Tests
 * Story 2.11b (BMA-48)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeatureFlags, usePersistFirst, getServerFeatureFlags } from './feature-flags';

describe('FeatureFlags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('ENABLE_PERSIST_FIRST flag', () => {
    it('should default to false when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST;
      expect(FeatureFlags.isPersistFirstEnabled()).toBe(false);
    });

    it('should be false when env var is "false"', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'false';
      expect(FeatureFlags.isPersistFirstEnabled()).toBe(false);
    });

    it('should be true when env var is "true"', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
      expect(FeatureFlags.isPersistFirstEnabled()).toBe(true);
    });

    it('should be false for any other value', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = '1';
      expect(FeatureFlags.isPersistFirstEnabled()).toBe(false);
    });
  });

  describe('getPostPersistMode', () => {
    it('should return "localStorage-legacy" when flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'false';
      expect(FeatureFlags.getPostPersistMode()).toBe('localStorage-legacy');
    });

    it('should return "persist-first" when flag is on', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
      expect(FeatureFlags.getPostPersistMode()).toBe('persist-first');
    });
  });

  describe('getAllFlags', () => {
    it('should return all feature flags status', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
      const flags = FeatureFlags.getAllFlags();
      
      expect(flags).toHaveProperty('ENABLE_PERSIST_FIRST');
      expect(flags.ENABLE_PERSIST_FIRST).toBe(true);
    });
  });

  describe('usePersistFirst helper', () => {
    it('should return false when flag is disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'false';
      expect(usePersistFirst()).toBe(false);
    });

    it('should return true when flag is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
      expect(usePersistFirst()).toBe(true);
    });
  });

  describe('getServerFeatureFlags', () => {
    it('should read from ENABLE_PERSIST_FIRST (server-side)', () => {
      process.env.ENABLE_PERSIST_FIRST = 'true';
      const flags = getServerFeatureFlags();
      
      expect(flags.ENABLE_PERSIST_FIRST).toBe(true);
    });

    it('should default to false for server flags', () => {
      delete process.env.ENABLE_PERSIST_FIRST;
      const flags = getServerFeatureFlags();
      
      expect(flags.ENABLE_PERSIST_FIRST).toBe(false);
    });
  });
});
