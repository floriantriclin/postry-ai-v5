/**
 * POST /api/posts/anonymous
 * 
 * Story 2.11b (BMA-48) - Persist-First Architecture
 * 
 * Persists post data BEFORE authentication with rate limiting.
 * This is the first step in the new "persist-first" flow.
 * 
 * Features:
 * - Rate limiting: 5 posts/hour per IP
 * - Zod validation on all inputs
 * - Returns postId for linking after auth
 * - Headers X-RateLimit-* for client feedback
 * 
 * @see https://linear.app/floriantriclin/issue/BMA-48
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, createRateLimitHeaders } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Zod schema for anonymous post creation
 */
const AnonymousPostSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
  content: z.string().min(1, 'Content is required'),
  quiz_answers: z.any(), // Allow any structure for quiz answers
  equalizer_settings: z.object({
    vector: z.array(z.number()).length(9, 'Vector must have exactly 9 elements'),
    profile: z.any(), // Allow any structure for profile
    archetype: z.string(),
    components: z.any() // Allow any structure for components
  })
});

type AnonymousPostInput = z.infer<typeof AnonymousPostSchema>;

/**
 * Rate limit configuration
 * Max 5 posts per hour per IP address
 */
const RATE_LIMIT_CONFIG = {
  limit: 5,
  windowMs: 60 * 60 * 1000 // 1 hour in milliseconds
};

/**
 * POST handler - Create anonymous post
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (BEFORE parsing body for performance)
    const rateLimitResult = rateLimit(req, RATE_LIMIT_CONFIG);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Maximum 5 acquisitions per hour.',
          retryAfter: rateLimitResult.reset
        },
        {
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    
    // Validate input with Zod
    const result = AnonymousPostSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: result.error.issues
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }
    
    const validated = result.data;

    // 3. Insert post into database with status='pending' and user_id=NULL
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: null, // Anonymous - will be linked after auth
        email: null, // Email will be set during auth flow
        status: 'pending', // Post is generated but not revealed yet
        theme: validated.theme,
        content: validated.content,
        quiz_answers: validated.quiz_answers,
        equalizer_settings: validated.equalizer_settings,
        is_revealed: false // Legacy column
      })
      .select('id')
      .single();

    if (error) {
      console.error('[POST /api/posts/anonymous] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { 
          status: 500,
          headers: rateLimitHeaders
        }
      );
    }

    if (!data) {
      console.error('[POST /api/posts/anonymous] No data returned from insert');
      return NextResponse.json(
        { error: 'Failed to create post' },
        { 
          status: 500,
          headers: rateLimitHeaders
        }
      );
    }

    // 4. Return success with postId and rate limit headers
    return NextResponse.json(
      {
        postId: data.id,
        status: 'pending'
      },
      {
        status: 200,
        headers: rateLimitHeaders
      }
    );

  } catch (error) {
    // Note: Zod errors are now handled inline above
    // This catch is for unexpected errors only
    console.error('[POST /api/posts/anonymous] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
