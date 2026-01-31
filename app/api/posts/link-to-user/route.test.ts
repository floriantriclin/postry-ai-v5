/**
 * Unit Tests for POST /api/posts/link-to-user
 * Story 2.11b (BMA-48) - Persist-First Architecture
 * 
 * Target Coverage: >85%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock Supabase client
const mockGetUser = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser
  },
  from: mockFrom
};

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('POST /api/posts/link-to-user', () => {
  const validPayload = {
    postId: '550e8400-e29b-41d4-a716-446655440000' // Valid UUID v4
  };

  const mockUser = {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Valid UUID v1
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    // Chain for .from().select().eq().single()
    mockSingle.mockResolvedValue({
      data: { user_id: null }, // Default: no user linked
      error: null
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      select: mockSelect
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      single: mockSingle
    });
    mockUpdate.mockReturnValue({
      eq: mockEq
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test 1: Link post to user successfully (200)
   */
  it('should link post to authenticated user successfully', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('postId', validPayload.postId);
    expect(data).toHaveProperty('userId', mockUser.id);

    // Verify update was called with correct params
    expect(mockFrom).toHaveBeenCalledWith('posts');
    expect(mockUpdate).toHaveBeenCalledWith({
      user_id: mockUser.id,
      status: 'revealed'
    });
    expect(mockEq).toHaveBeenCalledWith('id', validPayload.postId);
  });

  /**
   * Test 2: Unauthorized without session (401)
   */
  it('should return 401 when user is not authenticated', async () => {
    // Mock no user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' }
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Unauthorized');

    // DB should NOT be called
    expect(mockFrom).not.toHaveBeenCalled();
  });

  /**
   * Test 3: Post not found (404)
   */
  it('should return 404 when post does not exist', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Mock post not found
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' }
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Post not found');
  });

  /**
   * Test 4: Post already linked (409)
   */
  it('should return 409 when post is already linked to another user', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Mock post already has user_id different from current user
    mockSingle.mockResolvedValue({
      data: { user_id: '99999999-9999-9999-9999-999999999999' }, // Different user
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('already linked');
  });

  /**
   * Test 5: Database error handled (500)
   */
  it('should return 500 when database update fails', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Mock DB error
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed', code: 'PGRST301' }
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to link post');
  });

  /**
   * Test 6: Invalid postId rejected (400)
   */
  it('should return 400 when postId is missing', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/posts/link-to-user', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({}) // Missing postId
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid input');
  });
});
