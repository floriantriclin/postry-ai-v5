/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase Admin - use vi.hoisted to define mocks before imports
const { mockSupabaseAdmin } = vi.hoisted(() => ({
  mockSupabaseAdmin: {
    from: vi.fn()
  }
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

// Mock cookies
const { mockCookieStore } = vi.hoisted(() => ({
  mockCookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore)
}));

// Mock Supabase SSR client
const { mockSupabaseClient } = vi.hoisted(() => ({
  mockSupabaseClient: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient)
}));

// Mock rate limiting
const { mockRateLimit, mockCreateRateLimitResponse, mockCreateRateLimitHeaders } = vi.hoisted(() => ({
  mockRateLimit: vi.fn(),
  mockCreateRateLimitResponse: vi.fn(),
  mockCreateRateLimitHeaders: vi.fn()
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
  createRateLimitResponse: mockCreateRateLimitResponse,
  createRateLimitHeaders: mockCreateRateLimitHeaders
}));

// Mock alerting
const { mockAlertAuthFailure, mockAlertValidationError, mockAlertDatabaseError, mockAlertUnhandledException } = vi.hoisted(() => ({
  mockAlertAuthFailure: vi.fn(),
  mockAlertValidationError: vi.fn(),
  mockAlertDatabaseError: vi.fn(),
  mockAlertUnhandledException: vi.fn()
}));

vi.mock('@/lib/alerting', () => ({
  alertAuthFailure: mockAlertAuthFailure,
  alertValidationError: mockAlertValidationError,
  alertDatabaseError: mockAlertDatabaseError,
  alertUnhandledException: mockAlertUnhandledException
}));

describe('POST /api/auth/persist-on-login', () => {
  // Valid payload fixture
  const validPayload = {
    email: 'test@example.com',
    stylistic_vector: [0.5, 0.3, 0.2],
    profile: { trait1: 'value1', trait2: 'value2' },
    archetype: { name: 'Visionary', description: 'desc' },
    theme: 'Test Theme',
    post_content: 'Test post content',
    quiz_answers: { q1: 'answer1', q2: 'answer2' },
    hook: 'Test hook',
    cta: 'Test CTA',
    style_analysis: 'Test analysis',
    content_body: 'Test body'
  };

  // Mock authenticated user
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Default: Rate limit allows request
    mockRateLimit.mockReturnValue({
      allowed: true,
      limit: 10,
      remaining: 9,
      reset: Math.floor((Date.now() + 60000) / 1000)
    });

    // Default: User is authenticated
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Default: Database insert succeeds
    mockSupabaseAdmin.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'post-123', ...validPayload },
        error: null
      })
    });

    // Default: Rate limit headers
    mockCreateRateLimitHeaders.mockReturnValue({
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '9',
      'X-RateLimit-Reset': '1234567890'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Cases', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Arrange: Mock authentication failure
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockAlertAuthFailure).toHaveBeenCalledWith(
        'User not authenticated in persist-on-login',
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login'
        })
      );
    });

    it('should return 400 when validation fails - missing required field', async () => {
      // Arrange: Invalid payload (missing email)
      const invalidPayload = { ...validPayload };
      delete (invalidPayload as any).email;

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(invalidPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(mockAlertValidationError).toHaveBeenCalledWith(
        'Validation failed in persist-on-login',
        undefined,
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          userId: mockUser.id
        })
      );
    });

    it('should return 400 when validation fails - invalid email format', async () => {
      // Arrange: Invalid email format
      const invalidPayload = { ...validPayload, email: 'not-an-email' };

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(invalidPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(mockAlertValidationError).toHaveBeenCalled();
    });

    it('should return 403 when email mismatch (security check)', async () => {
      // Arrange: Payload email doesn't match authenticated user email
      const mismatchPayload = { ...validPayload, email: 'different@example.com' };

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(mismatchPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Email mismatch');
      // No alert for email mismatch (security: don't leak info)
      expect(mockAlertAuthFailure).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      // Arrange: Mock database insert failure
      mockSupabaseAdmin.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed', code: 'DB_ERROR' }
        })
      });

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
      expect(mockAlertDatabaseError).toHaveBeenCalledWith(
        'Failed to insert post in persist-on-login',
        expect.any(Object),
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          userId: mockUser.id,
          email: validPayload.email,
          theme: validPayload.theme
        })
      );
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Arrange: Mock rate limit exceeded
      const rateLimitResult = {
        allowed: false,
        limit: 10,
        remaining: 0,
        reset: Math.floor((Date.now() + 60000) / 1000)
      };
      
      mockRateLimit.mockReturnValue(rateLimitResult);
      mockCreateRateLimitResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        })
      );

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(429);
      expect(mockCreateRateLimitResponse).toHaveBeenCalledWith(rateLimitResult);
      expect(mockRateLimit).toHaveBeenCalledWith(req, {
        limit: 10,
        windowMs: 60000
      });
    });
  });

  describe('Success Cases', () => {
    it('should return 200 and create post on success', async () => {
      // Arrange: Mock successful database insert
      const mockInsertedPost = {
        id: 'post-abc123',
        user_id: mockUser.id,
        email: validPayload.email,
        theme: validPayload.theme,
        content: validPayload.post_content,
        status: 'revealed',
        archetype: validPayload.archetype.name
      };

      mockSupabaseAdmin.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockInsertedPost,
          error: null
        })
      });

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.postId).toBe(mockInsertedPost.id);
      
      // Verify insert was called with correct params
      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          email: validPayload.email,
          theme: validPayload.theme,
          content: validPayload.post_content,
          status: 'revealed',
          archetype: validPayload.archetype.name
        })
      );
    });

    it('should include rate limit headers in success response', async () => {
      // Arrange
      const rateLimitHeaders = {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '7',
        'X-RateLimit-Reset': '1234567890'
      };
      mockCreateRateLimitHeaders.mockReturnValue(rateLimitHeaders);

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      expect(mockCreateRateLimitHeaders).toHaveBeenCalled();
    });

    it('should store equalizer settings with all metadata', async () => {
      // Arrange
      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      await POST(req);

      // Assert: Verify equalizer_settings structure
      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          equalizer_settings: expect.objectContaining({
            vector: validPayload.stylistic_vector,
            profile: validPayload.profile,
            archetype: validPayload.archetype,
            generated_components: expect.objectContaining({
              hook: validPayload.hook,
              cta: validPayload.cta,
              style_analysis: validPayload.style_analysis,
              content: validPayload.content_body
            })
          })
        })
      );
    });
  });

  describe('Alerting Integration', () => {
    it('should send alert on auth failure', async () => {
      // Arrange: Mock authentication failure
      const authError = { message: 'Session expired' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: authError
      });

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      await POST(req);

      // Assert
      expect(mockAlertAuthFailure).toHaveBeenCalledTimes(1);
      expect(mockAlertAuthFailure).toHaveBeenCalledWith(
        'User not authenticated in persist-on-login',
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          error: authError.message
        })
      );
    });

    it('should send alert on validation error with detailed context', async () => {
      // Arrange: Invalid payload
      const invalidPayload = { ...validPayload };
      delete (invalidPayload as any).theme;

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(invalidPayload)
      });

      // Act
      await POST(req);

      // Assert
      expect(mockAlertValidationError).toHaveBeenCalledTimes(1);
      expect(mockAlertValidationError).toHaveBeenCalledWith(
        'Validation failed in persist-on-login',
        undefined,
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          userId: mockUser.id,
          validationErrors: expect.any(Array)
        })
      );
    });

    it('should send alert on database error with context', async () => {
      // Arrange: Mock database error
      const dbError = { message: 'Connection timeout', code: 'TIMEOUT' };
      mockSupabaseAdmin.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: dbError
        })
      });

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      await POST(req);

      // Assert
      expect(mockAlertDatabaseError).toHaveBeenCalledTimes(1);
      expect(mockAlertDatabaseError).toHaveBeenCalledWith(
        'Failed to insert post in persist-on-login',
        expect.any(Object),
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          userId: mockUser.id,
          email: validPayload.email,
          theme: validPayload.theme
        })
      );
    });

    it('should send alert on unhandled exception', async () => {
      // Arrange: Force an exception by making JSON parsing fail
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(500);
      expect(mockAlertUnhandledException).toHaveBeenCalledTimes(1);
      expect(mockAlertUnhandledException).toHaveBeenCalledWith(
        'Unhandled exception in persist-on-login',
        expect.any(Error),
        expect.objectContaining({
          endpoint: '/api/auth/persist-on-login',
          method: 'POST'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle optional fields correctly', async () => {
      // Arrange: Minimal valid payload (only required fields)
      const minimalPayload = {
        email: validPayload.email,
        stylistic_vector: validPayload.stylistic_vector,
        profile: validPayload.profile,
        archetype: validPayload.archetype,
        theme: validPayload.theme,
        post_content: validPayload.post_content
        // All optional fields omitted
      };

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(minimalPayload)
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle archetype without name field', async () => {
      // Arrange: Archetype is an object without name field
      const payloadWithoutArchetypeName = {
        ...validPayload,
        archetype: { description: 'No name field' }
      };

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(payloadWithoutArchetypeName)
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      
      // Verify archetype column gets null when no name
      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          archetype: null
        })
      );
    });

    it('should handle quiz_answers as null when not provided', async () => {
      // Arrange: quiz_answers explicitly null
      const payloadWithNullQuiz = {
        ...validPayload,
        quiz_answers: undefined
      };

      const req = new NextRequest('http://localhost:3000/api/auth/persist-on-login', {
        method: 'POST',
        body: JSON.stringify(payloadWithNullQuiz)
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      
      // Verify quiz_answers stored as null
      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          quiz_answers: null
        })
      );
    });
  });
});
