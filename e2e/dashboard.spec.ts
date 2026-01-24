
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
      await page.waitForSelector(".blur-sm");
      await expect(page.locator(".blur-sm")).toBeVisible();
      await page.waitForTimeout(1500);
      await expect(page.locator(".blur-0")).toBeVisible();
      await expect(page.locator("text=Theme")).toBeVisible();
    });

    test("should copy the post content to clipboard", async ({ page }) => {
      await page.locator("text=[ COPIER LE TEXTE ]").click();
      await expect(page.locator("text=COPIÉ !")).toBeVisible();
      await page.waitForTimeout(3000);
      await expect(page.locator("text=[ COPIER LE TEXTE ]")).toBeVisible();
    });

    test("should logout the user", async ({ page }) => {
      await page.locator("text=Déconnexion").click();
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
