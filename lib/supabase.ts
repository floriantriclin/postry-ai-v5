/**
 * @deprecated This file is deprecated and split into:
 * - lib/supabase-client.ts for Client Components
 * - lib/supabase-server.ts for Server Components
 * 
 * Re-exports for backward compatibility
 */
export { supabase } from './supabase-client';
export { createClient } from './supabase-server';
