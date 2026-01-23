import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Service role client for admin tasks (bypass RLS)
// Only use this in server-side contexts (API routes, Server Actions)
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || ''
);
