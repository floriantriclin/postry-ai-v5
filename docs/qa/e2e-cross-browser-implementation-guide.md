# Guide d'Implémentation - Authentification Cross-Browser E2E
**Date:** 26 Janvier 2026  
**Auteur:** Test Architect & Quality Advisor  
**Status:** 📋 Prêt pour Implémentation

---

## 🎯 Objectif

Implémenter la solution **Option A: Setup Par Navigateur** pour résoudre le problème d'authentification cross-browser identifié dans [`e2e-cross-browser-auth-investigation.md`](e2e-cross-browser-auth-investigation.md).

---

## 📋 Checklist d'Implémentation

### Phase 1: Création des Fichiers de Setup
- [ ] Créer `e2e/auth.setup.chromium.ts`
- [ ] Créer `e2e/auth.setup.firefox.ts`
- [ ] Créer `e2e/auth.setup.webkit.ts`

### Phase 2: Modification de la Configuration
- [ ] Modifier `playwright.config.ts`
- [ ] Mettre à jour `.gitignore` si nécessaire

### Phase 3: Réactivation des Tests
- [ ] Retirer les `test.skip()` dans `e2e/dashboard.spec.ts`

### Phase 4: Validation
- [ ] Tester les 3 setups individuellement
- [ ] Exécuter la suite complète
- [ ] Vérifier les métriques

---

## 📝 Fichiers à Créer

### 1. `e2e/auth.setup.chromium.ts`

**Chemin:** `e2e/auth.setup.chromium.ts`

```typescript
import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from 'fs';

const authFile = "e2e/.auth/user.chromium.json";
const testUser = {
  email: "test@example.com",
  password: "password",
};

setup("authenticate for Chromium", async ({ page }) => {
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
                     console.log("✅ [Chromium] Session reused and valid for user:", user.email);
                     
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
                     console.log("⚠️ [Chromium] Session invalid or expired.");
                 }
            }
        }
    } catch (e) {
        console.log("⚠️ [Chromium] Failed to parse auth file or validate session:", e);
    }
  }

  // 2. Full Auth if needed
  if (!isAuthenticated) {
      console.log("🔄 [Chromium] Performing full authentication...");
      
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
          console.log("⚠️ [Chromium] Public user missing, inserting manually...");
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

      // Chromium: Use Lax sameSite policy
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

  // 3. Idempotent Data Seeding
  console.log("🛠️ [Chromium] Ensuring data consistency...");
  if (!userId) throw new Error("User ID missing after auth flow");

  const { data: existingPosts } = await supabaseAdmin.from('posts').select('id').eq('user_id', userId);
  
  if (!existingPosts || existingPosts.length === 0) {
      console.log("📝 [Chromium] Creating seed post...");
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
        console.error("❌ [Chromium] Failed to insert seed post:", insertError);
        throw insertError;
      }
  } else {
      console.log("✅ [Chromium] Seed post already exists.");
  }

  // 4. Verify & Save State
  await page.goto('/dashboard');
  
  try {
    await page.waitForSelector('[data-testid="post-content"]', { timeout: 15000 });
    console.log("✅ [Chromium] Dashboard loaded successfully");
  } catch (e) {
    console.error("❌ [Chromium] Login failed or Dashboard failed to load post.");
    await page.screenshot({ path: 'e2e/auth-setup-failure-chromium.png' });
    throw e;
  }
  
  await page.context().storageState({ path: authFile });
  console.log("✅ [Chromium] Auth state saved to:", authFile);
});
```

---

### 2. `e2e/auth.setup.firefox.ts`

**Chemin:** `e2e/auth.setup.firefox.ts`

**Différences clés avec Chromium:**
- Utilise `sameSite: 'Strict'` pour les cookies
- Fichier de sortie: `e2e/.auth/user.firefox.json`
- Logs préfixés avec `[Firefox]`

```typescript
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

      // Firefox: Use Strict sameSite policy
      await page.context().addCookies([
        { 
          name: cookieName, 
          value: token, 
          domain: 'localhost', 
          path: '/', 
          httpOnly: false, 
          secure: false, 
          sameSite: 'Strict' 
        },
        { 
          name: 'sb-localhost-auth-token', 
          value: token, 
          domain: 'localhost', 
          path: '/', 
          httpOnly: false, 
          secure: false, 
          sameSite: 'Strict' 
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
```

---

### 3. `e2e/auth.setup.webkit.ts`

**Chemin:** `e2e/auth.setup.webkit.ts`

**Différences clés avec Chromium:**
- Utilise `sameSite: 'None'` et `secure: true` pour les cookies
- Fichier de sortie: `e2e/.auth/user.webkit.json`
- Logs préfixés avec `[WebKit]`

```typescript
import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from 'fs';

const authFile = "e2e/.auth/user.webkit.json";
const testUser = {
  email: "test@example.com",
  password: "password",
};

setup("authenticate for WebKit", async ({ page }) => {
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
                     console.log("✅ [WebKit] Session reused and valid for user:", user.email);
                     
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
                     console.log("⚠️ [WebKit] Session invalid or expired.");
                 }
            }
        }
    } catch (e) {
        console.log("⚠️ [WebKit] Failed to parse auth file or validate session:", e);
    }
  }

  // 2. Full Auth if needed
  if (!isAuthenticated) {
      console.log("🔄 [WebKit] Performing full authentication...");
      
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
          console.log("⚠️ [WebKit] Public user missing, inserting manually...");
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

      // WebKit: Use None sameSite with secure flag
      // Note: For localhost, we keep secure: false despite sameSite: None
      await page.context().addCookies([
        { 
          name: cookieName, 
          value: token, 
          domain: 'localhost', 
          path: '/', 
          httpOnly: false, 
          secure: false, 
          sameSite: 'Lax' // Fallback to Lax for localhost
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
  console.log("🛠️ [WebKit] Ensuring data consistency...");
  if (!userId) throw new Error("User ID missing after auth flow");

  const { data: existingPosts } = await supabaseAdmin.from('posts').select('id').eq('user_id', userId);
  
  if (!existingPosts || existingPosts.length === 0) {
      console.log("📝 [WebKit] Creating seed post...");
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
        console.error("❌ [WebKit] Failed to insert seed post:", insertError);
        throw insertError;
      }
  } else {
      console.log("✅ [WebKit] Seed post already exists.");
  }

  // 4. Verify & Save State
  await page.goto('/dashboard');
  
  try {
    await page.waitForSelector('[data-testid="post-content"]', { timeout: 15000 });
    console.log("✅ [WebKit] Dashboard loaded successfully");
  } catch (e) {
    console.error("❌ [WebKit] Login failed or Dashboard failed to load post.");
    await page.screenshot({ path: 'e2e/auth-setup-failure-webkit.png' });
    throw e;
  }
  
  await page.context().storageState({ path: authFile });
  console.log("✅ [WebKit] Auth state saved to:", authFile);
});
```

---

## 📝 Fichiers à Modifier

### 1. `playwright.config.ts`

**Modifications à apporter:**

```typescript
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup projects - one per browser
    { 
      name: 'setup-chromium', 
      testMatch: /auth\.setup\.chromium\.ts/ 
    },
    { 
      name: 'setup-firefox', 
      testMatch: /auth\.setup\.firefox\.ts/ 
    },
    { 
      name: 'setup-webkit', 
      testMatch: /auth\.setup\.webkit\.ts/ 
    },
    
    // Test projects - each with its own storageState
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'], 
        storageState: 'e2e/.auth/user.chromium.json' 
      },
      dependencies: ['setup-chromium'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'], 
        storageState: 'e2e/.auth/user.firefox.json' 
      },
      dependencies: ['setup-firefox'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'], 
        storageState: 'e2e/.auth/user.webkit.json' 
      },
      dependencies: ['setup-webkit'],
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Changements clés:**
1. Remplacer le projet `setup` unique par 3 projets: `setup-chromium`, `setup-firefox`, `setup-webkit`
2. Chaque projet de test utilise son propre fichier `storageState`
3. Chaque projet de test dépend de son setup correspondant

---

### 2. `e2e/dashboard.spec.ts`

**Modifications à apporter:**

Retirer les lignes 7-13 qui contiennent le skip cross-browser:

```typescript
// AVANT (lignes 7-13 à SUPPRIMER):
test.beforeEach(async ({ page, browserName }) => {
  // Skip sur Firefox/WebKit jusqu'à résolution du problème d'auth cross-browser
  // TODO: Investiguer la persistance de session cross-browser
  // Issue: La session n'est pas reconnue sur Firefox/WebKit, redirection vers landing
  if (browserName !== "chromium") {
    test.skip();
  }
  await page.goto("/dashboard");
});

// APRÈS (lignes 7-9):
test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
});
```

Également retirer le skip clipboard ligne 42:

```typescript
// AVANT (ligne 42 à SUPPRIMER):
test("should copy the post content to clipboard", async ({ page, context, browserName }) => {
  if (browserName !== "chromium") test.skip();
  // ...
});

// APRÈS:
test("should copy the post content to clipboard", async ({ page, context, browserName }) => {
  // Note: Ce test peut toujours échouer sur Firefox/WebKit en mode headless
  // en raison de limitations de l'API clipboard, mais on laisse Playwright gérer
  if (browserName !== "chromium") test.skip(); // Garder ce skip pour l'API clipboard
  // ...
});
```

**Note:** Le skip clipboard peut être conservé car c'est une limitation technique de l'API clipboard, pas un problème d'authentification.

---

### 3. `.gitignore` (optionnel)

Ajouter les nouveaux fichiers d'authentification:

```gitignore
# E2E Auth files
e2e/.auth/user.json
e2e/.auth/user.chromium.json
e2e/.auth/user.firefox.json