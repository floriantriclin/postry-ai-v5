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
  quiz_answers: z.array(z.any()).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = PrePersistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, stylistic_vector, profile, archetype, theme, post_content, quiz_answers } = validation.data;

    // Store vector/profile in equalizer_settings as temporary storage
    // This allows retrieval of context even if the user isn't fully set up yet
    const metaData = {
      vector: stylistic_vector,
      profile: profile,
      archetype: archetype
    };

    // Check if a pending post already exists for this email
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    let error;
    if (existingPost) {
       const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({
             theme,
             content: post_content,
             quiz_answers: quiz_answers || null,
             equalizer_settings: metaData
        })
        .eq('id', existingPost.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabaseAdmin
        .from('posts')
        .insert({
            email,
            theme,
            content: post_content,
            quiz_answers: quiz_answers || null,
            equalizer_settings: metaData,
            status: 'pending'
        });
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
