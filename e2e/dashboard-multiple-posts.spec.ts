/**
 * Dashboard Multiple Posts E2E Test
 * 
 * Tests BUG-002: Dashboard should handle multiple posts correctly
 * - Should not crash with 2+ posts
 * - Should display most recent post (by created_at DESC)
 * - Should only show posts with status='revealed'
 * - Should distinguish between DB errors and no posts found
 */

import { test, expect } from "@playwright/test";
import "dotenv/config";
import { authenticateProgrammatically } from "./helpers/supabase";

test.describe("Dashboard Multiple Posts (BUG-002)", () => {
  test.describe("Authenticated", () => {
    test("should display most recent post when multiple revealed posts exist", async ({
      page,
      context,
    }) => {
      // Skip Firefox: Known issue with programmatic auth cookie injection in localhost
      // See: story-2-9-storagestate-investigation-report.md
      if (test.info().project.name === "firefox") {
        test.skip();
        return;
      }

      // Solution 3: Programmatic authentication with per-test user isolation
      const testId = test.info().testId || "recent-post-test";
      const setup = await authenticateProgrammatically(page, context, testId);
      if (!setup) {
        test.skip();
        return;
      }
      const { supabaseAdmin, user } = setup;

      // Clean up any existing test posts AND seed post first
      // Delete seed post to ensure our test posts are displayed
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .or("theme.like.Test Multiple Posts%,theme.eq.Tech Leadership");

      // Wait for cleanup to propagate (avoid race with parallel tests)
      await page.waitForTimeout(300);

      // Create 2 posts with different created_at timestamps
      // Use future dates to ensure they're ALWAYS more recent than any other test
      const now = new Date();
      const futureBase = now.getTime() + (48 * 60 * 60 * 1000); // Start 2 days in future
      const oldPostDate = new Date(futureBase - 24 * 60 * 60 * 1000).toISOString(); // 1 day before new
      const newPostDate = new Date(futureBase).toISOString(); // Most recent

      const { error: error1 } = await supabaseAdmin.from("posts").insert({
        user_id: user.id,
        email: user.email,
        status: "revealed",
        theme: "Test Multiple Posts - Old Post",
        content: "This is the older post content",
        created_at: oldPostDate,
        equalizer_settings: {
          profile: { label_final: "Test Profile" },
          archetype: { name: "Test Archetype" },
        },
      });

      const { error: error2 } = await supabaseAdmin.from("posts").insert({
        user_id: user.id,
        email: user.email,
        status: "revealed",
        theme: "Test Multiple Posts - New Post",
        content: "This is the newer post content",
        created_at: newPostDate,
        equalizer_settings: {
          profile: { label_final: "Test Profile" },
          archetype: { name: "Test Archetype" },
        },
      });

      if (error1 || error2) {
        console.error("Failed to create test posts:", error1 || error2);
        test.skip();
        return;
      }

      // Verify posts were created successfully
      const { data: createdPosts, error: verifyError } = await supabaseAdmin
        .from("posts")
        .select("id, theme, created_at")
        .eq("user_id", user.id)
        .in("theme", ["Test Multiple Posts - Old Post", "Test Multiple Posts - New Post"])
        .order("created_at", { ascending: false });
      
      if (verifyError || !createdPosts || createdPosts.length !== 2) {
        console.error("Posts verification failed:", verifyError, "Posts:", createdPosts);
        test.skip();
        return;
      }

      // Small delay to ensure DB consistency
      await page.waitForTimeout(500);

      // Navigate to dashboard - cookies are already injected
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      
      // Verify we're authenticated (should be on dashboard)
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
      
      // Wait for post content to be ready (either post or no post message)
      await page.getByTestId('post-content').or(page.getByText('Aucun post généré')).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Verify: Most recent post is displayed (newer one)
      await expect(page.getByText("Test Multiple Posts - New Post")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("This is the newer post content")).toBeVisible();

      // Verify: Older post is NOT displayed
      await expect(page.getByText("Test Multiple Posts - Old Post")).not.toBeVisible();

      // Verify: No Supabase error occurred (dashboard loaded successfully)
      // Check if post exists before verifying testId (handles case where no posts exist)
      const postContent = page.getByTestId("post-content");
      const noPostMessage = page.getByText("Aucun post généré");
      const hasPost = await postContent.isVisible().catch(() => false);
      const hasNoPost = await noPostMessage.isVisible().catch(() => false);
      
      // Either post content OR no post message should be visible (not both, not neither)
      expect(hasPost || hasNoPost).toBe(true);
      // Since we created posts, we expect post content to be visible
      if (!hasPost) {
        throw new Error("Expected post content to be visible after creating test posts");
      }

      // Cleanup: Remove test posts
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .like("theme", "Test Multiple Posts%");
    });

    test("should not display posts with status='pending'", async ({
      page,
      context,
    }) => {
      // Skip Firefox: Known issue with programmatic auth cookie injection in localhost
      if (test.info().project.name === "firefox") {
        test.skip();
        return;
      }

      // Solution 3: Programmatic authentication with per-test user isolation
      const testId = test.info().testId || "pending-post-test";
      const setup = await authenticateProgrammatically(page, context, testId);
      if (!setup) {
        test.skip();
        return;
      }
      const { supabaseAdmin, user } = setup;

      // Clean up any existing test posts AND seed post first
      // Delete seed post to ensure our test scenario is clean
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .or("theme.like.Test Pending Post%,theme.eq.Tech Leadership");

      // Wait for cleanup to propagate (avoid race with parallel tests)
      await page.waitForTimeout(300);

      // Create a pending post (should NOT be displayed)
      // Use future timestamp to ensure it would be "most recent" if status was revealed
      const futureDate = new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(); // 3 days future
      const { error } = await supabaseAdmin.from("posts").insert({
        user_id: user.id,
        email: user.email,
        status: "pending", // Should be filtered out
        theme: "Test Pending Post - Should Not Appear",
        content: "This pending post should not be visible",
        created_at: futureDate,
      });

      if (error) {
        console.error("Failed to create test post:", error);
        test.skip();
        return;
      }

      // Small delay to ensure DB consistency
      await page.waitForTimeout(500);

      // Navigate to dashboard - cookies are already injected
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      
      // Verify we're authenticated (should be on dashboard)
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
      
      // Wait for dashboard to load
      await page.getByTestId('post-content').or(page.getByText('Aucun post généré')).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Verify: Pending post is NOT displayed
      await expect(page.getByText("Test Pending Post - Should Not Appear")).not.toBeVisible({ timeout: 3000 });

      // Verify: Dashboard shows either "Aucun post généré" or a revealed post (from seed data)
      const noPostMessage = page.getByText("Aucun post généré");
      const postContent = page.getByTestId("post-content");
      
      // Either no posts message OR a revealed post should be visible
      const hasNoPost = await noPostMessage.isVisible().catch(() => false);
      const hasPost = await postContent.isVisible().catch(() => false);
      
      expect(hasNoPost || hasPost).toBe(true);

      // Cleanup: Remove test post
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .like("theme", "Test Pending Post%");
    });

    test("should handle 10+ posts without performance issues", async ({
      page,
      context,
    }) => {
      // Skip Firefox: Known issue with programmatic auth cookie injection in localhost
      if (test.info().project.name === "firefox") {
        test.skip();
        return;
      }

      // Solution 3: Programmatic authentication with per-test user isolation
      const testId = test.info().testId || "performance-test";
      const setup = await authenticateProgrammatically(page, context, testId);
      if (!setup) {
        test.skip();
        return;
      }
      const { supabaseAdmin, user } = setup;

      // Clean up ANY existing test posts AND seed post first
      // This ensures we start with a clean slate (previous tests may have left posts)
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .or("theme.like.Test %,theme.eq.Tech Leadership");

      // Wait for cleanup to propagate (avoid race with parallel tests)
      await page.waitForTimeout(300);

      // Create 10+ posts with timestamps ensuring they're ALWAYS most recent
      // Use future timestamps to avoid interference from other parallel tests
      const posts = [];
      const now = new Date();
      const futureBase = now.getTime() + (24 * 60 * 60 * 1000); // Start 1 day in future
      for (let i = 0; i < 12; i++) {
        // Create posts with decreasing timestamps from future (Post 0 = most recent)
        const postDate = new Date(futureBase - (i * 60 * 60 * 1000)).toISOString();
        posts.push({
          user_id: user.id,
          email: user.email,
          status: "revealed",
          theme: `Test Performance Post ${i}`,
          content: `Content for post ${i}`,
          created_at: postDate,
          equalizer_settings: {
            profile: { label_final: "Test Profile" },
            archetype: { name: "Test Archetype" },
          },
        });
      }

      const { error } = await supabaseAdmin.from("posts").insert(posts);

      if (error) {
        console.error("Failed to create test posts:", error);
        test.skip();
        return;
      }

      // Verify posts were created successfully
      const { data: createdPosts, error: verifyError } = await supabaseAdmin
        .from("posts")
        .select("id, theme, created_at")
        .eq("user_id", user.id)
        .like("theme", "Test Performance%")
        .order("created_at", { ascending: false });
      
      if (verifyError || !createdPosts || createdPosts.length !== 12) {
        console.error("Posts verification failed:", verifyError, "Posts count:", createdPosts?.length);
        test.skip();
        return;
      }

      // Small delay to ensure DB consistency
      await page.waitForTimeout(500);

      // Navigate to dashboard and measure load time - cookies are already injected
      const startTime = Date.now();
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      const loadTime = Date.now() - startTime;
      
      // Verify we're authenticated (should be on dashboard)
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
      
      // Wait for post content to be ready
      await page.getByTestId('post-content').or(page.getByText('Aucun post généré')).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Verify: Dashboard loads successfully (no crash)
      // Check if post exists before verifying testId (handles case where no posts exist)
      const postContent = page.getByTestId("post-content");
      const noPostMessage = page.getByText("Aucun post généré");
      const hasPost = await postContent.isVisible({ timeout: 10000 }).catch(() => false);
      const hasNoPost = await noPostMessage.isVisible().catch(() => false);
      
      // Either post content OR no post message should be visible
      expect(hasPost || hasNoPost).toBe(true);
      // Since we created 12 posts, we expect post content to be visible
      if (!hasPost) {
        throw new Error("Expected post content to be visible after creating 12 test posts");
      }

      // Verify: Most recent post (Post 0) is displayed
      await expect(page.getByText("Test Performance Post 0")).toBeVisible();

      // Verify: Performance is acceptable (loads within 5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // Cleanup: Remove test posts
      await supabaseAdmin
        .from("posts")
        .delete()
        .eq("user_id", user.id)
        .like("theme", "Test Performance%");
    });
  });
});
