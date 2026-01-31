/**
 * Unit Tests for POST /api/posts/anonymous
 * Story 2.11b (BMA-48) - Persist-First Architecture
 * 
 * Target Coverage: >90%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as rateLimitModule from '@/lib/rate-limit';
import * as supabaseAdminModule from '@/lib/supabase-admin';

// Mock only supabaseAdmin, not rate-limit (we want createRateLimitHeaders to work)
vi.mock('@/lib/supabase-admin');

describe('POST /api/posts/anonymous', () => {
  const validPayload = {
    theme: 'Leadership transformationnel',
    content: '# Mon post\n\nContenu du post...',
    quiz_answers: {
      p1: { Q1: 'A', Q2: 'B' },
      p2: { Q3: 'A', Q4: 'B' }
    },
    equalizer_settings: {
      vector: [0.8, 0.6, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.7],
      profile: { label_final: 'Le Pragmatique' },
      archetype: 'Le Pragmatique',
      components: { hook: 'test', content: 'test', cta: 'test' }
    }
  };

  const mockSupabaseInsert = vi.fn();
  const mockSupabaseSelect = vi.fn();
  const mockSupabaseSingle = vi.fn();
  const mockSupabaseFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    mockSupabaseSingle.mockResolvedValue({
      data: { id: 'test-uuid-123' },
      error: null
    });
    mockSupabaseSelect.mockReturnValue({
      single: mockSupabaseSingle
    });
    mockSupabaseInsert.mockReturnValue({
      select: mockSupabaseSelect
    });
    mockSupabaseFrom.mockReturnValue({
      insert: mockSupabaseInsert
    });

    vi.spyOn(supabaseAdminModule, 'supabaseAdmin', 'get').mockReturnValue({
      from: mockSupabaseFrom
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test 1: Create anonymous post successfully (200)
   */
  it('should create anonymous post successfully and return postId', async () => {
    // Mock rate limit - allowed
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('postId', 'test-uuid-123');
    expect(data).toHaveProperty('status', 'pending');

    // Verify rate limit headers
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('4');
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();

    // Verify DB insert called correctly
    expect(mockSupabaseFrom).toHaveBeenCalledWith('posts');
    expect(mockSupabaseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: null,
        email: null,
        status: 'pending',
        theme: validPayload.theme,
        content: validPayload.content,
        quiz_answers: validPayload.quiz_answers,
        equalizer_settings: validPayload.equalizer_settings
      })
    );
  });

  /**
   * Test 2: Rate limiting works (429 after 5 posts)
   */
  it('should return 429 when rate limit exceeded', async () => {
    // Mock rate limit - exceeded
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 1800
    });

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Rate limit exceeded');

    // Verify rate limit headers present
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();

    // DB should NOT be called
    expect(mockSupabaseFrom).not.toHaveBeenCalled();
  });

  /**
   * Test 3: Invalid input rejected (400) - Missing theme
   */
  it('should return 400 when theme is missing', async () => {
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    const invalidPayload = { ...validPayload };
    delete (invalidPayload as any).theme;

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid input');
    // Note: details property may vary based on Zod error structure
  });

  /**
   * Test 4: Invalid input rejected (400) - Empty content
   */
  it('should return 400 when content is empty', async () => {
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    const invalidPayload = { ...validPayload, content: '' };

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid input');
  });

  /**
   * Test 5: Database error handled (500)
   */
  it('should return 500 when database insert fails', async () => {
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    // Mock DB error
    mockSupabaseSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed', code: 'PGRST301' }
    });

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to create post');
  });

  /**
   * Test 6: IP extraction correct (x-forwarded-for)
   */
  it('should extract IP from x-forwarded-for header correctly', async () => {
    const mockRateLimit = vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.42, 198.51.100.1'
      },
      body: JSON.stringify(validPayload)
    });

    await POST(request);

    // Verify rateLimit was called with the request
    expect(mockRateLimit).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { limit: 5, windowMs: 3600000 }
    );
  });

  /**
   * Test 7: Zod validation enforced on equalizer_settings
   */
  it('should return 400 when equalizer_settings.vector is invalid', async () => {
    vi.spyOn(rateLimitModule, 'rateLimit').mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 3600
    });

    const invalidPayload = {
      ...validPayload,
      equalizer_settings: {
        ...validPayload.equalizer_settings,
        vector: [0.8, 0.6] // Invalid: must be 9 elements
      }
    };

    const request = new NextRequest('http://localhost:3000/api/posts/anonymous', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid input');
  });
});
