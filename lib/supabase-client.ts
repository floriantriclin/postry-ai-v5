import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Client-side Supabase instance
 * Safe to use in Client Components
 */

// Validate required env vars before creating client
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. ' +
    `Current values: URL=${env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing'}, ` +
    `KEY=${env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing'}`
  );
}

export const supabase = createSupabaseClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
