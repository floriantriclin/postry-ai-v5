/// <reference types="vitest/globals" />
import { NextRequest } from 'next/server';
import {
  rateLimit,
  checkRateLimit,
  getClientIp,
  createRateLimitHeaders,
  createRateLimitResponse,
  clearRateLimitStore,
  stopCleanup,
  type RateLimitConfig
} from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearRateLimitStore();
    stopCleanup();
    vi.useRealTimers();
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
      });

      const ip = getClientIp(req);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '192.168.1.2'
        }
      });

      const ip = getClientIp(req);
      expect(ip).toBe('192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2'
        }
      });

      const ip = getClientIp(req);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const req = new NextRequest('http://localhost:3000/api/test');

      const ip = getClientIp(req);
      expect(ip).toBe('unknown');
    });

    it('should trim whitespace from IP addresses', () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  , 10.0.0.1'
        }
      });

      const ip = getClientIp(req);
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('checkRateLimit', () => {
    const config: RateLimitConfig = {
      limit: 10,
      windowMs: 60000 // 1 minute
    };

    it('should allow first request', () => {
      const result = checkRateLimit('192.168.1.1', config);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(result.reset).toBeGreaterThan(Date.now() / 1000);
    });

    it('should allow requests up to the limit', () => {
      const identifier = '192.168.1.1';

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it('should block request when limit exceeded', () => {
      const identifier = '192.168.1.1';

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, config);
      }

      // 11th request should be blocked
      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const identifier = '192.168.1.1';

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, config);
      }

      // 11th request blocked
      let result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(config.windowMs + 1000);

      // Should allow request again
      result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should track different identifiers separately', () => {
      const identifier1 = '192.168.1.1';
      const identifier2 = '192.168.1.2';

      // Make 10 requests from identifier1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier1, config);
      }

      // identifier1 should be blocked
      let result = checkRateLimit(identifier1, config);
      expect(result.allowed).toBe(false);

      // identifier2 should still be allowed
      result = checkRateLimit(identifier2, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should handle different rate limit configs', () => {
      const strictConfig: RateLimitConfig = {
        limit: 3,
        windowMs: 30000
      };

      const identifier = '192.168.1.1';

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit(identifier, strictConfig);
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = checkRateLimit(identifier, strictConfig);
      expect(result.allowed).toBe(false);
    });

    it('should return correct reset timestamp', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = checkRateLimit('192.168.1.1', config);

      const expectedReset = Math.floor((now + config.windowMs) / 1000);
      expect(result.reset).toBe(expectedReset);
    });
  });

  describe('rateLimit', () => {
    const config: RateLimitConfig = {
      limit: 10,
      windowMs: 60000
    };

    it('should apply rate limiting based on client IP', () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const result = rateLimit(req, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block requests from same IP after limit', () => {
      const createRequest = () => new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const req = createRequest();
        const result = rateLimit(req, config);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const req = createRequest();
      const result = rateLimit(req, config);
      expect(result.allowed).toBe(false);
    });

    it('should allow requests from different IPs', () => {
      const req1 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const req2 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.2'
        }
      });

      // Make 10 requests from IP1
      for (let i = 0; i < 10; i++) {
        rateLimit(req1, config);
      }

      // IP1 should be blocked
      let result = rateLimit(req1, config);
      expect(result.allowed).toBe(false);

      // IP2 should still be allowed
      result = rateLimit(req2, config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create correct headers', () => {
      const result = {
        allowed: true,
        limit: 10,
        remaining: 5,
        reset: 1234567890
      };

      const headers = createRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '5',
        'X-RateLimit-Reset': '1234567890'
      });
    });

    it('should handle zero remaining', () => {
      const result = {
        allowed: false,
        limit: 10,
        remaining: 0,
        reset: 1234567890
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create 429 response with correct headers', async () => {
      const result = {
        allowed: false,
        limit: 10,
        remaining: 0,
        reset: 1234567890
      };

      const response = createRateLimitResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBe('1234567890');

      const body = await response.json();
      expect(body.error).toBe('Too Many Requests');
      expect(body.retryAfter).toBe(1234567890);
      expect(body.message).toContain('Rate limit exceeded');
    });

    it('should include retry timestamp in message', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 60;
      const result = {
        allowed: false,
        limit: 10,
        remaining: 0,
        reset: resetTime
      };

      const response = createRateLimitResponse(result);
      const body = await response.json();

      expect(body.message).toContain(new Date(resetTime * 1000).toISOString());
    });
  });

  describe('cleanup functionality', () => {
    it('should clean up expired entries', () => {
      const config: RateLimitConfig = {
        limit: 10,
        windowMs: 60000
      };

      // Create some entries
      checkRateLimit('192.168.1.1', config);
      checkRateLimit('192.168.1.2', config);

      // Advance time past window
      vi.advanceTimersByTime(config.windowMs + 1000);

      // Trigger cleanup (runs every 5 minutes)
      vi.advanceTimersByTime(5 * 60 * 1000);

      // New requests should start fresh
      const result1 = checkRateLimit('192.168.1.1', config);
      const result2 = checkRateLimit('192.168.1.2', config);

      expect(result1.remaining).toBe(9);
      expect(result2.remaining).toBe(9);
    });
  });

  describe('clearRateLimitStore', () => {
    it('should clear all rate limit entries', () => {
      const config: RateLimitConfig = {
        limit: 10,
        windowMs: 60000
      };

      // Make some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit('192.168.1.1', config);
      }

      // Clear store
      clearRateLimitStore();

      // Should start fresh
      const result = checkRateLimit('192.168.1.1', config);
      expect(result.remaining).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should handle very small window', () => {
      const config: RateLimitConfig = {
        limit: 5,
        windowMs: 100 // 100ms
      };

      const identifier = '192.168.1.1';

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, config);
      }

      // Should be blocked
      let result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);

      // Advance past window
      vi.advanceTimersByTime(150);

      // Should be allowed again
      result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
    });

    it('should handle limit of 1', () => {
      const config: RateLimitConfig = {
        limit: 1,
        windowMs: 60000
      };

      const identifier = '192.168.1.1';

      // First request allowed
      let result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);

      // Second request blocked
      result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);
    });

    it('should handle concurrent requests from same IP', () => {
      const config: RateLimitConfig = {
        limit: 10,
        windowMs: 60000
      };

      const identifier = '192.168.1.1';

      // Simulate concurrent requests
      const results = Array.from({ length: 15 }, () => 
        checkRateLimit(identifier, config)
      );

      const allowed = results.filter(r => r.allowed).length;
      const blocked = results.filter(r => !r.allowed).length;

      expect(allowed).toBe(10);
      expect(blocked).toBe(5);
    });
  });
});
