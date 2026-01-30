import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, createRateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit';
import { alertAuthFailure, alertValidationError, alertDatabaseError, alertUnhandledException } from '@/lib/alerting';

// Define input schema matching the localStorage data structure
const PersistOnLoginSchema = z.object({
  email: z.string().email(),
  stylistic_vector: z.array(z.number()),
  profile: z.record(z.string(), z.any()),
  archetype: z.any(),
  theme: z.string(),
  post_content: z.string(),
  quiz_answers: z.any().optional(),
  hook: z.string().optional(),
  cta: z.string().optional(),
  style_analysis: z.string().optional(),
  content_body: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting: 10 requests per minute per IP
    const rateLimitResult = rateLimit(req, {
      limit: 10,
      windowMs: 60000 // 1 minute
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Get authenticated user from session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Persist-on-login: User not authenticated', authError);
      alertAuthFailure('User not authenticated in persist-on-login', {
        endpoint: '/api/auth/persist-on-login',
        error: authError?.message
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = PersistOnLoginSchema.safeParse(body);

    if (!validation.success) {
      console.error('Persist-on-login: Validation failed', validation.error);
      alertValidationError('Validation failed in persist-on-login', undefined, {
        endpoint: '/api/auth/persist-on-login',
        userId: user.id,
        validationErrors: validation.error.issues
      });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      email,
      stylistic_vector,
      profile,
      archetype,
      theme,
      post_content,
      quiz_answers,
      hook,
      cta,
      style_analysis,
      content_body
    } = validation.data;

    // Verify email matches authenticated user
    if (email !== user.email) {
      console.error('Persist-on-login: Email mismatch', { provided: email, user: user.email });
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    // Store vector/profile in equalizer_settings
    const metaData = {
      vector: stylistic_vector,
      profile: profile,
      archetype: archetype,
      generated_components: {
        hook,
        cta,
        style_analysis,
        content: content_body
      }
    };

    // Insert post with status='revealed' (not 'pending')
    const { data: insertedPost, error: insertError } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: user.id,
        email: email,
        theme: theme,
        content: post_content,
        quiz_answers: quiz_answers || null,
        equalizer_settings: metaData,
        archetype: archetype?.name || null, // BUG-003: Denormalize archetype name to column
        status: 'revealed' // Critical: Direct to revealed status
      })
      .select()
      .single();

    if (insertError) {
      console.error('Persist-on-login: Database error', insertError);
      alertDatabaseError('Failed to insert post in persist-on-login', insertError as Error, {
        endpoint: '/api/auth/persist-on-login',
        userId: user.id,
        email: email,
        theme: theme
      });
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('Persist-on-login: Success', { postId: insertedPost.id, userId: user.id });

    return NextResponse.json(
      {
        success: true,
        postId: insertedPost.id
      },
      {
        headers: createRateLimitHeaders(rateLimitResult)
      }
    );

  } catch (err) {
    console.error('Persist-on-login: Exception', err);
    alertUnhandledException('Unhandled exception in persist-on-login', err as Error, {
      endpoint: '/api/auth/persist-on-login',
      method: 'POST'
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
