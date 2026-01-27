import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  // Try to fetch something public or just check health?
  // We can try to select from a table.
  const { data, error } = await supabase.from('posts').select('*').limit(1);

  if (error) {
    // If table doesn't exist yet (migration not run), this will fail with code 42P01.
    if (error.code === '42P01') { 
        console.error('❌ Table "posts" does not exist. Please run migration 08_init.sql in Supabase Dashboard.');
    } else {
        console.log('✅ Connection established (Response received). Error (Expected due to RLS/Auth):', error.message);
    }
  } else {
    console.log('✅ Connection successful. Data received:', data);
  }
}

checkConnection();
