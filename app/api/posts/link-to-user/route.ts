/**
 * POST /api/posts/link-to-user
 * 
 * Story 2.11b (BMA-48) - Persist-First Architecture
 * 
 * Links a pending post to an authenticated user after magic link confirmation.
 * This is the second step in the "persist-first" flow.
 * 
 * Features:
 * - Requires authentication
 * - Updates post status from 'pending' to 'revealed'
 * - Handles edge cases (post not found, already linked)
 * 
 * @see https://linear.app/floriantriclin/issue/BMA-48
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase-server';

/**
 * Zod schema for link-to-user request
 */
const LinkToUserSchema = z.object({
  postId: z.string().uuid('Invalid post ID format')
});

type LinkToUserInput = z.infer<typeof LinkToUserSchema>;

/**
 * POST handler - Link post to authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const result = LinkToUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: result.error.issues
        },
        { status: 400 }
      );
    }

    const { postId } = result.data;

    // 3. Check if post exists and get current user_id
    // Use service role to bypass RLS (post has user_id=NULL)
    const supabaseAdmin = createServiceRoleClient();
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('[POST /api/posts/link-to-user] Fetch error:', fetchError);
      
      // Check if it's a "not found" error
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to link post' },
        { status: 500 }
      );
    }

    // 4. Check if post is already linked to a different user
    if (existingPost && existingPost.user_id && existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Post is already linked to another user' },
        { status: 409 }
      );
    }

    // 5. Update post with user_id and status='revealed'
    // Use service role to bypass RLS
    const { data, error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        user_id: user.id,
        status: 'revealed'
      })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/posts/link-to-user] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to link post' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        postId: postId,
        userId: user.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[POST /api/posts/link-to-user] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
