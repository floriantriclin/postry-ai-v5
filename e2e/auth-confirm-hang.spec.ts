
import { test, expect } from '@playwright/test';

test.describe('Auth Confirm Page', () => {
  // Use a fresh context for these tests to avoid global auth setup interference
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect with timeout error if no auth event occurs', async ({ page }) => {
    // Navigate to /auth/confirm without params
    await page.goto('/auth/confirm');
    
    // Expect it to eventually redirect to home with a timeout error
    await page.waitForURL(/\/\?error=auth_timeout/, { timeout: 21000 });
    
    // Verify the URL
    const url = new URL(page.url());
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('error')).toBe('auth_timeout');
    expect(url.searchParams.get('message')).toBeTruthy();
  });

  test('should also redirect with timeout for a fake token hash', async ({ page }) => {
    await page.goto('/auth/confirm?token_hash=fake&type=email&next=/dashboard');
    
    // Expect it to eventually redirect to home with a timeout error
    await page.waitForURL(/\/\?error=auth_timeout/, { timeout: 21000 });

    const url = new URL(page.url());
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('error')).toBe('auth_timeout');
  });

  test('should handle implicit flow hash by attempting to set session', async ({ page }) => {
    // Navigate with a fake access_token in the hash
    await page.goto('/auth/confirm#access_token=fake&refresh_token=fake&type=recovery');

    // It should try to set the session, fail, and show an error message ON THE PAGE (not redirect to home)
    // My code sets setErrorMsg("Erreur lors de la validation du lien.")
    
    await expect(page.locator('text=Erreur lors de la validation du lien.')).toBeVisible({ timeout: 5000 });
  });

  // Real token test removed for security.
  // Verified manually that it redirects correctly with a valid token.
});
