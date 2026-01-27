import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from 'fs';

const authFile = "e2e/.auth/user.firefox.json";
const testUser = {
  email: "test@example.com",
  password: "password",
};

setup("authenticate for Firefox", async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  let isAuthenticated = false;
  let userId: string | undefined;

  // 1. Smart Auth: Try to reuse session
  if (fs.existsSync(authFile)) {
    try {
        const sessionData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
        const origin = sessionData.origins?.find((o: any) => 
            o.origin.includes('localhost') || o.origin.includes('127.0.0.1')
        );
        
        if (origin && origin.localStorage) {
            const tokenEntry = origin.localStorage.find((item: any) => 
                item.name.includes('sb-') && item.name.includes('-auth-token')
            );
            
            if (tokenEntry) {
                 const session = JSON.parse(tokenEntry.value);
                 const { data: { user }, error } = await supabaseClient.auth.getUser(session.access_token);
                 
                 if (user && !error) {
                     isAuthenticated = true;
                     userId = user.id;
                     console.log("✅ [Firefox] Session reused and valid for user:", user.email);
                     
                     if (sessionData.cookies) {
                        await page.context().addCookies(sessionData.cookies);
                     }
                     await page.goto('/');
                     await page.evaluate((storageItems) => {
                        storageItems.forEach((item: any) => {
                            localStorage.setItem(item.name, item.value);
                        });
                     }, origin.localStorage);
                 } else {
                     console.log("⚠️ [Firefox] Session invalid or expired.");
                 }
            }
        }
    } catch (e) {
        console.log("⚠️ [Firefox] Failed to parse auth file or validate session:", e);
    }
  }

  // 2. Full Auth if needed
  if (!isAuthenticated) {
      console.log("🔄 [Firefox] Performing full authentication...");
      
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      let user = users.find((u) => u.email === testUser.email);

      if (user) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { 
              password: testUser.password,
              email_confirm: true,
              user_metadata: { name: "Test User" }
          });
      } else {
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: testUser.email,
              password: testUser.password,
              email_confirm: true,
              user_metadata: { name: "Test User" }
          });
          if (createError) throw createError;
          user = newUser.user!;
      }
      userId = user.id;

      const { data: publicUser } = await supabaseAdmin.from('users').select('id').eq('id', userId).single();
      if (!publicUser) {
          console.log("⚠️ [Firefox] Public user missing, inserting manually...");
          await supabaseAdmin.from('users').insert({ id: userId, email: testUser.email });
      }

      const { data: { session }, error: loginError } = await supabaseClient.auth.signInWithPassword(testUser);
      if (loginError) throw loginError;
      if (!session) throw new Error("No session created");

      const hostname = new URL(supabaseUrl).hostname;
      let projectRef = hostname.split('.')[0];
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
          projectRef = '127';
      }

      const token = JSON.stringify(session);
      const cookieName = `sb-${projectRef}-auth-token`;

      // Firefox: Use Lax sameSite policy (same as Chromium for consistency)
      await page.context().addCookies([
        {
          name: cookieName,
          value: token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-localhost-auth-token',
          value: token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/');
      await page.evaluate(({ key, token }) => {
          localStorage.setItem(key, token);
      }, { key: cookieName, token });
  }

  // 3. Idempotent Data Seeding (shared logic)
  console.log("🛠️ [Firefox] Ensuring data consistency...");
  if (!userId) throw new Error("User ID missing after auth flow");

  const { data: existingPosts } = await supabaseAdmin.from('posts').select('id').eq('user_id', userId);
  
  if (!existingPosts || existingPosts.length === 0) {
      console.log("📝 [Firefox] Creating seed post...");
      const { error: insertError } = await supabaseAdmin.from('posts').insert({
          user_id: userId,
          email: testUser.email,
          status: 'revealed',
          theme: "Tech Leadership",
          content: "This is a robust test post content used for E2E testing.\n\nIt serves to verify the dashboard display.",
          created_at: new Date().toISOString(),
          quiz_answers: {
              acquisition_theme: "leadership",
              p1: { "STR": "A", "INF": "B" },
              p2: { "ANC": "C" }
          },
          equalizer_settings: {
              topic: "Tech Leadership",
              profile: { label_final: "Visionary Tech" },
              archetype: { name: "Architect", baseVector: [1,2,3,4,5,6] },
              vector: [1,2,3,4,5,6]
          }
      });

      if (insertError) {
        console.error("❌ [Firefox] Failed to insert seed post:", insertError);
        throw insertError;
      }
  } else {
      console.log("✅ [Firefox] Seed post already exists.");
  }

  // 4. Verify & Save State
  await page.goto('/dashboard');
  
  try {
    await page.waitForSelector('[data-testid="post-content"]', { timeout: 15000 });
    console.log("✅ [Firefox] Dashboard loaded successfully");
  } catch (e) {
    console.error("❌ [Firefox] Login failed or Dashboard failed to load post.");
    await page.screenshot({ path: 'e2e/auth-setup-failure-firefox.png' });
    throw e;
  }
  
  await page.context().storageState({ path: authFile });
  console.log("✅ [Firefox] Auth state saved to:", authFile);
});
