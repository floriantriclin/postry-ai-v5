import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Rate Limit Result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Total limit */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the rate limit resets (Unix timestamp in seconds) */
  reset: number;
}

/**
 * Rate Limit Store Entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 * Note: This is suitable for single-instance deployments.
 * For multi-instance deployments, consider using Redis or similar.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval for expired entries (runs every 5 minutes)
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Start automatic cleanup of expired rate limit entries
 */
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => rateLimitStore.delete(key));
  }, CLEANUP_INTERVAL_MS);
  
  // Ensure cleanup stops when process exits
  if (typeof process !== 'undefined') {
    process.on('exit', () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    });
  }
}

/**
 * Extract client IP address from request
 * Checks x-forwarded-for, x-real-ip headers, and falls back to connection IP
 */
export function getClientIp(req: NextRequest): string {
  // Check x-forwarded-for header (proxy/load balancer)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  // Check x-real-ip header
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to a default identifier
  // In production with proper proxy setup, this should rarely be used
  return 'unknown';
}

/**
 * Check rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (typically IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and headers info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  // Start cleanup on first use
  startCleanup();
  
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // No existing entry or entry expired
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime
    });
    
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.floor(resetTime / 1000)
    };
  }
  
  // Entry exists and is still valid
  if (entry.count < config.limit) {
    entry.count++;
    
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - entry.count,
      reset: Math.floor(entry.resetTime / 1000)
    };
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    limit: config.limit,
    remaining: 0,
    reset: Math.floor(entry.resetTime / 1000)
  };
}

/**
 * Apply rate limiting to a request
 * 
 * @param req - Next.js request object
 * @param config - Rate limit configuration
 * @returns Rate limit result, or null if allowed to proceed
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  const identifier = getClientIp(req);
  return checkRateLimit(identifier, config);
}

/**
 * Create rate limit headers for response
 * 
 * @param result - Rate limit result
 * @returns Headers object with rate limit information
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  };
}

/**
 * Create a 429 Too Many Requests response
 * 
 * @param result - Rate limit result
 * @returns NextResponse with 429 status and rate limit headers
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const headers = createRateLimitHeaders(result);
  
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again after ${new Date(result.reset * 1000).toISOString()}`,
      retryAfter: result.reset
    },
    {
      status: 429,
      headers
    }
  );
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
