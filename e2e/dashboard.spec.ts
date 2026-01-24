
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  // This test runs with an authenticated user because of the global setup.
  test.describe("Authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
    });

    test("should display the post reveal view if authenticated", async ({
      page,
    }) => {
      // Fail fast check (Task 2.6.11)
      await expect(page).toHaveURL("/dashboard");

      const postContent = page.getByTestId("post-content");
      const postMeta = page.getByTestId("post-meta");

      // Verify Initial Blur State (Robust check)
      // We expect the blur class to be present initially
      await expect(postContent).toHaveClass(/blur-md/);
      
      // Verify Transition to Clear
      // The transition takes 1000ms + 100ms delay
      await expect(postContent).toHaveClass(/blur-0/, { timeout: 5000 });
      await expect(postContent).toHaveClass(/opacity-100/);

      // Verify Content
      await expect(postMeta).toContainText("Theme: Tech Leadership");
      await expect(postContent).toContainText("This is a robust test post");
    });

    test("should copy the post content to clipboard", async ({ page, context, browserName }) => {
      if (browserName !== "chromium") test.skip();
      
      await context.grantPermissions(['clipboard-write', 'clipboard-read']);
      await expect(page).toHaveURL("/dashboard");
      await page.getByTestId("copy-button").click();
      await expect(page.getByRole("button", { name: "COPIÉ !" })).toBeVisible();
      
      // Wait for reset
      await expect(page.getByTestId("copy-button")).toContainText("[ COPIER LE TEXTE ]", { timeout: 5000 });
    });

    test("should logout the user", async ({ page }) => {
      await page.getByTestId("logout-button").click();
      await expect(page).toHaveURL("/");
    });

    test("should match the visual snapshot", async ({ page }) => {
      await expect(page).toHaveScreenshot();
    });
  });

  // This test runs without authentication.
  test.describe("Unauthenticated", () => {
    test("should redirect to login if not authenticated", async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/");
    });
  });
});
