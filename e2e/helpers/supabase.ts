/**
 * E2E Test Helpers for Supabase Admin Operations
 * 
 * Provides reusable functions for setting up Supabase Admin client
 * and retrieving authenticated user from auth file.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BrowserContext, Page } from "@playwright/test";
import * as fs from "fs";

/**
 * Setup Supabase Admin client using service role key
 * @returns Supabase Admin client or null if env vars missing
 */
export function setupSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Get authenticated user from auth file
 * @param authFilePath Path to auth file (default: "e2e/.auth/user.json")
 * @returns User ID or null if not found
 */
export async function getAuthenticatedUser(
  supabaseAdmin: SupabaseClient,
  authFilePath: string = "e2e/.auth/user.json"
): Promise<{ id: string; email: string | null } | null> {
  if (!fs.existsSync(authFilePath)) {
    return null;
  }

  const sessionData = JSON.parse(fs.readFileSync(authFilePath, "utf-8"));
  
  // Try to get user from cookies (Playwright storageState format)
  const cookies = sessionData.cookies || [];
  const authCookie = cookies.find((c: any) => c.name.includes("auth-token"));
  
  if (authCookie) {
    try {
      // Cookie value is a JSON stringified session object
      const session = JSON.parse(authCookie.value);
      
      // Extract user directly from session if available
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email ?? null,
        };
      }
      
      // Otherwise try to get user from access_token
      if (session?.access_token) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(session.access_token);
        if (user) {
          return {
            id: user.id,
            email: user.email ?? null,
          };
        }
      }
    } catch (e) {
      // If parsing fails, try as direct token
      const { data: { user } } = await supabaseAdmin.auth.getUser(authCookie.value);
      if (user) {
        return {
          id: user.id,
          email: user.email ?? null,
        };
      }
    }
  }
  
  // Try to get user from localStorage (Playwright storageState format)
  const origins = sessionData.origins || [];
  for (const origin of origins) {
    const localStorage = origin.localStorage || [];
    const authStorage = localStorage.find((item: any) => item.name.includes("auth-token"));
    
    if (authStorage) {
      try {
        const session = JSON.parse(authStorage.value);
        if (session?.user) {
          return {
            id: session.user.id,
            email: session.user.email ?? null,
          };
        }
        if (session?.access_token) {
          const { data: { user } } = await supabaseAdmin.auth.getUser(session.access_token);
          if (user) {
            return {
              id: user.id,
              email: user.email ?? null,
            };
          }
        }
      } catch (e) {
        // Continue to next origin
      }
    }
  }

  return null;
}

/**
 * Complete setup: Get Supabase Admin client and authenticated user
 * @param authFilePath Path to auth file (default: auto-detect from available auth files)
 * @returns Object with supabaseAdmin and user, or null if setup fails
 */
export async function setupSupabaseAdminWithUser(
  authFilePath?: string
): Promise<{ supabaseAdmin: SupabaseClient; user: { id: string; email: string | null } } | null> {
  const supabaseAdmin = setupSupabaseAdmin();
  if (!supabaseAdmin) {
    return null;
  }

  // Auto-detect auth file if not provided
  // Try common Playwright project files in order of preference
  if (!authFilePath) {
    const possibleFiles = [
      "e2e/.auth/user.chromium.json",  // Most common
      "e2e/.auth/user.firefox.json",
      "e2e/.auth/user.webkit.json",
      "e2e/.auth/user.json",           // Fallback
    ];

    for (const file of possibleFiles) {
      if (fs.existsSync(file)) {
        authFilePath = file;
        break;
      }
    }

    // If still no file found, return null
    if (!authFilePath) {
      return null;
    }
  }

  const user = await getAuthenticatedUser(supabaseAdmin, authFilePath);
  if (!user) {
    return null;
  }

  return { supabaseAdmin, user };
}

/**
 * Force inject cookies from storageState file into browser context
 * 
 * Solves race condition where Playwright's automatic storageState restoration
 * happens asynchronously AFTER middleware has already checked for auth cookies.
 * 
 * This function also includes a "warm-up" navigation to ensure cookies are
 * properly attached to subsequent requests.
 * 
 * Usage:
 * ```typescript
 * test("my test", async ({ page, context }) => {
 *   await forceInjectCookiesWithWarmup(page, context, test.info().project.name);
 *   await page.goto("/dashboard"); // Now middleware will see cookies
 * });
 * ```
 * 
 * @param page Playwright Page object
 * @param context Playwright BrowserContext
 * @param projectName Project name (chromium/firefox/webkit)
 * @returns true if cookies injected, false if failed
 */
export async function forceInjectCookiesWithWarmup(
  page: any, // Using any to avoid circular import, but this is Playwright Page
  context: BrowserContext,
  projectName: string = "chromium"
): Promise<boolean> {
  const authFile = `e2e/.auth/user.${projectName}.json`;
  
  if (!fs.existsSync(authFile)) {
    console.warn(`[forceInjectCookies] Auth file not found: ${authFile}`);
    return false;
  }

  try {
    const storageState = JSON.parse(fs.readFileSync(authFile, "utf-8"));
    
    if (storageState.cookies && Array.isArray(storageState.cookies)) {
      // Inject cookies
      await context.addCookies(storageState.cookies);
      console.log(`[forceInjectCookies] Successfully injected ${storageState.cookies.length} cookies`);
      
      // Warm-up: Navigate to root to "activate" cookies in browser session
      // This ensures cookies are attached to next request
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(200); // Small delay for cookies to propagate
      
      console.log(`[forceInjectCookies] Cookie warm-up complete`);
      return true;
    } else {
      console.warn(`[forceInjectCookies] No cookies found in ${authFile}`);
      return false;
    }
  } catch (e) {
    console.error(`[forceInjectCookies] Failed to inject cookies:`, e);
    return false;
  }
}

/**
 * Legacy function - use forceInjectCookiesWithWarmup for better reliability
 * @deprecated Use forceInjectCookiesWithWarmup instead
 */
export async function forceInjectCookies(
  context: BrowserContext,
  projectName: string = "chromium"
): Promise<boolean> {
  const authFile = `e2e/.auth/user.${projectName}.json`;
  
  if (!fs.existsSync(authFile)) {
    console.warn(`[forceInjectCookies] Auth file not found: ${authFile}`);
    return false;
  }

  try {
    const storageState = JSON.parse(fs.readFileSync(authFile, "utf-8"));
    
    if (storageState.cookies && Array.isArray(storageState.cookies)) {
      await context.addCookies(storageState.cookies);
      console.log(`[forceInjectCookies] Successfully injected ${storageState.cookies.length} cookies`);
      return true;
    } else {
      console.warn(`[forceInjectCookies] No cookies found in ${authFile}`);
      return false;
    }
  } catch (e) {
    console.error(`[forceInjectCookies] Failed to inject cookies:`, e);
    return false;
  }
}

/**
 * Authenticate programmatically by creating a fresh Supabase session
 * and injecting it directly into browser localStorage AND cookies.
 * 
 * This bypasses all Playwright storageState/cookie race conditions by
 * creating the session programmatically and injecting it synchronously.
 * 
 * Each test gets its own isolated user to prevent parallel test races.
 * 
 * Usage:
 * ```typescript
 * test("my test", async ({ page, context }) => {
 *   const testId = test.info().testId; // Unique per test
 *   const { supabaseAdmin, user } = await authenticateProgrammatically(page, context, testId);
 *   await page.goto("/dashboard"); // Now authenticated
 *   // Test continues...
 * });
 * ```
 * 
 * @param page Playwright Page object
 * @param context Playwright BrowserContext (optional, for Firefox compatibility)
 * @param testIdentifier Unique identifier for data isolation (use test.info().testId)
 * @returns Object with supabaseAdmin client and authenticated user
 */
export async function authenticateProgrammatically(
  page: Page,
  context?: BrowserContext,
  testIdentifier: string = "default"
): Promise<{ supabaseAdmin: SupabaseClient; user: { id: string; email: string | null } } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error("[authenticateProgrammatically] Missing Supabase env vars");
    return null;
  }

  try {
    // Create test-specific credentials for complete data isolation
    // Use hash of testIdentifier to keep email length reasonable
    const testHash = testIdentifier.replace(/[^a-z0-9]/gi, "").substring(0, 20);
    const credentials = {
      email: `test-${testHash}@example.com`,
      password: "password",
    };

    console.log(`[authenticateProgrammatically] Using isolated user: ${credentials.email}`);

    // Create Supabase clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Ensure user exists (idempotent)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find((u) => u.email === credentials.email);

    if (user) {
      // Update existing user to ensure password is correct
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: credentials.password,
        email_confirm: true,
        user_metadata: { name: "Test User" },
      });
    } else {
      // Create new user (handle "already exists" gracefully)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: credentials.email,
        password: credentials.password,
        email_confirm: true,
        user_metadata: { name: "Test User" },
      });
      
      if (createError) {
        // If user already exists (not found by listUsers due to pagination/timing), try to login
        if (createError.message.includes("already been registered") || createError.message.includes("email_exists")) {
          console.log(`[authenticateProgrammatically] User exists but not in list, will login directly`);
          // User will be set after login below
        } else {
          throw createError;
        }
      } else {
        user = newUser.user!;
      }
    }

    // Create session programmatically (this also validates user exists)
    const { data: { session }, error: loginError } = await supabaseClient.auth.signInWithPassword(credentials);
    if (loginError) throw loginError;
    if (!session) throw new Error("No session created");
    if (!session.user) throw new Error("No user in session");

    console.log(`[authenticateProgrammatically] Session created for user: ${credentials.email}`);

    // Ensure public user record exists (use session user id)
    const userId = session.user.id;
    const { data: publicUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();
    
    if (!publicUser) {
      await supabaseAdmin.from("users").insert({ id: userId, email: credentials.email });
    }

    // Ensure user is set from session
    const finalUser = user || session.user;
    if (!finalUser) {
      throw new Error("No user available after authentication");
    }

    // Navigate to root first to establish domain context
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Inject session into localStorage (synchronous, no race condition)
    const hostname = new URL(supabaseUrl).hostname;
    let projectRef = hostname.split(".")[0];
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      projectRef = "127";
    }

    const cookieName = `sb-${projectRef}-auth-token`;

    // Inject session into localStorage
    await page.evaluate(
      ({ key, session }) => {
        localStorage.setItem(key, JSON.stringify(session));
      },
      { key: cookieName, session }
    );

    // CRITICAL: Also inject cookies via Playwright API (more reliable than document.cookie, especially on Firefox)
    if (context) {
      try {
        await context.addCookies([
          {
            name: cookieName,
            value: JSON.stringify(session),
            domain: "localhost",
            path: "/",
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
          },
        ]);
        console.log(`[authenticateProgrammatically] Session injected via context.addCookies (Firefox-compatible)`);
      } catch (e) {
        console.warn(`[authenticateProgrammatically] Failed to inject via context.addCookies:`, e);
      }
    }

    // Fallback: Also set via document.cookie (for browsers that don't have context passed)
    await page.evaluate(
      ({ key, session }) => {
        document.cookie = `${key}=${JSON.stringify(session)}; path=/; SameSite=Lax`;
      },
      { key: cookieName, session }
    );

    console.log(`[authenticateProgrammatically] Session injected into localStorage AND cookies as ${cookieName}`);

    // Small delay to ensure cookies are propagated
    await page.waitForTimeout(300);

    return {
      supabaseAdmin,
      user: {
        id: finalUser.id,
        email: finalUser.email ?? null,
      },
    };
  } catch (e) {
    console.error("[authenticateProgrammatically] Failed to authenticate:", e);
    return null;
  }
}
