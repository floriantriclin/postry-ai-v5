import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY missing in .env.local.');
  console.log('Skipping automated RLS/Trigger tests (TD-2.1-03, 04, 05).');
  console.log('Please perform manual testing as per Test Design doc.');
  process.exit(0);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const supabaseAnon = createClient(supabaseUrl, anonKey);

async function runTests() {
    console.log('🚀 Starting Full DB Tests (Trigger & RLS)...');

    const timestamp = Date.now();
    const emailA = `test_a_${timestamp}@example.com`;
    const emailB = `test_b_${timestamp}@example.com`;
    const password = 'password123';

    // 1. Create User A
    const { data: { user: userA }, error: errA } = await supabaseAdmin.auth.admin.createUser({
        email: emailA,
        password: password,
        email_confirm: true
    });
    if (errA) throw new Error(`Failed to create User A: ${errA.message}`);
    console.log(`✅ User A created: ${userA.id}`);

    // 2. Verify Trigger (TD-2.1-03)
    // Check if public.users has the entry
    const { data: publicUserA, error: errPubA } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userA.id)
        .single();
    
    if (errPubA || !publicUserA) {
        throw new Error('TD-2.1-03 FAILED: User A not found in public.users (Trigger failed)');
    }
    console.log('✅ TD-2.1-03 Passed: Trigger created public user profile.');

    // 3. Create User B
    const { data: { user: userB }, error: errB } = await supabaseAdmin.auth.admin.createUser({
        email: emailB,
        password: password,
        email_confirm: true
    });
    if (errB) throw new Error(`Failed to create User B: ${errB.message}`);
    console.log(`✅ User B created: ${userB.id}`);

    // 4. Create Posts
    // Post A by User A (Inserted by Admin, using user_id)
    const { error: errPostA } = await supabaseAdmin.from('posts').insert({
        user_id: userA.id,
        theme: 'Theme A',
        content: 'Content A'
    });
    if (errPostA) throw new Error(`Failed to create Post A: ${errPostA.message}`);

    // Post B by User B
    const { error: errPostB } = await supabaseAdmin.from('posts').insert({
        user_id: userB.id,
        theme: 'Theme B',
        content: 'Content B'
    });
    if (errPostB) throw new Error(`Failed to create Post B: ${errPostB.message}`);
    
    console.log('✅ Posts created for A and B.');

    // 5. Test RLS - Read Isolation (TD-2.1-04)
    // Sign in as User A to get a session
    const { data: loginDataA, error: loginErrorA } = await supabaseAnon.auth.signInWithPassword({
        email: emailA,
        password: password
    });
    if (loginErrorA) throw new Error(`Login A failed: ${loginErrorA.message}`);
    
    const tokenA = loginDataA.session.access_token;
    
    // Create client for User A
    const clientA = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${tokenA}` } }
    });

    // Request all posts
    const { data: postsA, error: readErrA } = await clientA.from('posts').select('*');
    if (readErrA) throw new Error(`Read A failed: ${readErrA.message}`);
    
    const seesOwn = postsA.some(p => p.user_id === userA.id);
    const seesOther = postsA.some(p => p.user_id === userB.id);

    if (seesOwn && !seesOther) {
        console.log(`✅ TD-2.1-04 Passed: User A sees ${postsA.length} post(s) (Own only).`);
    } else {
        console.error(`❌ TD-2.1-04 FAILED: Own=${seesOwn}, Other=${seesOther}`);
        throw new Error('RLS Isolation failed');
    }

    // 6. Test RLS - Modification (TD-2.1-05)
    // Try to update User B's profile as User A
    // (User A should only be able to update own profile)
    const { count, error: updateErr } = await clientA
        .from('users')
        .update({ credits_count: 999 })
        .eq('id', userB.id)
        .select('*', { count: 'exact' });

    // Since RLS policies for UPDATE often filter rows, if I try to update ID B, 
    // the policy "auth.uid() = id" will make the row invisible/unwritable.
    // It usually returns 0 updated rows and no error, OR an error depending on Supabase config.
    // But importantly, the data shouldn't change.

    // Let's check User B's credits via Admin
    const { data: userBCheck } = await supabaseAdmin
        .from('users')
        .select('credits_count')
        .eq('id', userB.id)
        .single();
    
    if (userBCheck.credits_count === 5) { // 5 is default
        console.log('✅ TD-2.1-05 Passed: User A could not modify User B (Credits remained 5).');
    } else {
         console.error(`❌ TD-2.1-05 FAILED: User B credits changed to ${userBCheck.credits_count}`);
    }

    // Cleanup
    console.log('🧹 Cleaning up...');
    await supabaseAdmin.auth.admin.deleteUser(userA.id);
    await supabaseAdmin.auth.admin.deleteUser(userB.id);
    console.log('✅ Cleanup complete.');
}

runTests().catch(e => {
    console.error('❌ Test Suite Failed:', e);
    process.exit(1);
});
