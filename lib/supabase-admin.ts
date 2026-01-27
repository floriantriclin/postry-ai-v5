import { createClient } from '@supabase/supabase-js';

// Service role client for admin tasks (bypass RLS)
// Only use this in server-side contexts (API routes, Server Actions)

// Use process.env directly to avoid validation at module load time
// Validation happens at runtime when client is actually used
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '[supabase-admin] Missing environment variables:',
    `URL=${supabaseUrl ? 'set' : 'MISSING'}`,
    `SERVICE_KEY=${supabaseServiceKey ? 'set' : 'MISSING'}`
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
