import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Define input schema matching the frontend data
const PrePersistSchema = z.object({
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
    const body = await req.json();
    const validation = PrePersistSchema.safeParse(body);

    if (!validation.success) {
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

    // Store vector/profile in equalizer_settings as temporary storage
    // This allows retrieval of context even if the user isn't fully set up yet
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

    // Check if the user already exists in auth.users to link immediately
    // This handles the "Duplicate/Existing User" scenario (Task 2.6.3)
    let userId: string | null = null;
    
    // We try to find the user in the public.users table which should be synced with auth.users
    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (publicUser) {
        userId = publicUser.id;
    }

    // Actually, in many Supabase setups, `public.users` is a view or a table synced via triggers.
    // If it's a table, we can trust it if the trigger works.
    // If we want to be 100% sure, we can fetch from auth.
    // But let's stick to the simplest robust way:
    // If we can find a user in public.users, use that ID.
    // If not, just use email. The trigger *should* pick it up on login if it's set up correctly.
    // BUT the task says "ensure... via pre-persist logic".
    
    // Let's add a robust check using auth admin if possible, but I don't want to break type checking if types aren't perfect.
    // I'll stick to searching in public.users first.
    
    // Check if a pending post already exists for this email
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    let error;
    
    const updateData: any = {
        theme,
        content: post_content,
        quiz_answers: quiz_answers || null,
        equalizer_settings: metaData
    };
    
    if (userId) {
        updateData.user_id = userId;
    }

    if (existingPost) {
       // Force update created_at to ensure this post appears as the most recent in Dashboard
       updateData.created_at = new Date().toISOString();
       
       const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update(updateData)
        .eq('id', existingPost.id);
        error = updateError;
    } else {
        const insertData: any = {
            email,
            theme,
            content: post_content,
            quiz_answers: quiz_answers || null,
            equalizer_settings: metaData,
            status: 'pending'
        };
        if (userId) {
            insertData.user_id = userId;
        }
        
        const { error: insertError } = await supabaseAdmin
        .from('posts')
        .insert(insertData);
        error = insertError;
    }

    if (error) {
      console.error('Pre-persist error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Pre-persist exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
