import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client-side Supabase instance
 * Safe to use in Client Components
 */

// Use process.env directly to avoid validation at module load time during build
// This prevents Next.js build failures when env vars aren't available at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase-client] Missing environment variables:',
    `URL=${supabaseUrl ? 'set' : 'MISSING'}`,
    `ANON_KEY=${supabaseAnonKey ? 'set' : 'MISSING'}`
  );
}

export const supabase = createSupabaseClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
