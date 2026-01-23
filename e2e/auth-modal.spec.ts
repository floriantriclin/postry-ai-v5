import { test, expect } from '@playwright/test';

test.describe('Authentication Modal Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the entire quiz flow to jump straight to the post generation phase
    await page.route('**/api/quiz/generate', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' }]) });
    });
    await page.route('**/api/quiz/archetype', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ archetype: { id: 1, name: 'Le Stratège' }, targetDimensions: ['STR'] }) });
    });
    await page.route('**/api/quiz/profile', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ label_final: 'Le Stratège Augmenté', definition_longue: 'A master of digital realms.' }) });
    });
    await page.route('**/api/quiz/post', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hook: 'The Hook', content: 'The Content', style_analysis: 'The Analysis' }) });
    });
  });

  test('should display and handle the auth modal correctly', async ({ page }) => {
    test.setTimeout(60000);
    // 1. Navigate and speed through the quiz to the reveal screen
    await page.goto('/');
    await page.getByRole('link', { name: 'DÉTERMINER MON STYLE' }).click();
    await page.screenshot({ path: 'screenshots/debug-auth-modal-test.png' });
    await page.waitForSelector('[data-testid="theme-t1"]');
    await page.getByTestId('theme-t1').click();
    await page.getByTestId('start-quiz-btn').click();
    await page.getByTestId('option-a').click(); // Answer first question
    await page.getByTestId('continue-refining-btn').click(); // Transition
    await page.getByTestId('option-a').click(); // Answer second phase question
    
    // 2. We are on the reveal screen. Generate a post.
    await expect(page.getByTestId('final-reveal-container')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('My test topic');
    await page.getByRole('button', { name: 'Générer un post' }).click();

    // 3. Auth Modal should be visible over the post
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Unlock Your Post')).toBeVisible();
    
    // 4. Test Case: Empty and Invalid email
    await page.getByRole('button', { name: 'Send Magic Link' }).click();
    await expect(page.getByText('Email address is required.')).toBeVisible();
    
    await page.getByPlaceholder('you@example.com').fill('invalid-email');
    await page.getByRole('button', { name: 'Send Magic Link' }).click();
    await expect(page.getByText('Adresse email invalide')).toBeVisible();

    // 5. Test Case: Valid Email & Success
    // Mock the Supabase call
    await page.route('**/auth/v1/otp', async (route) => {
      await route.fulfill({ status: 200, json: {} });
    });

    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await page.getByRole('button', { name: 'Send Magic Link' }).click();

    // Check for loading state, then success message
    await expect(page.getByRole('button', { name: 'Sending...' })).toBeVisible();
    await expect(page.getByText('Link Sent!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('A connection link has been sent to your email address. Please check your inbox.')).toBeVisible();
    
    // 6. Test Case: Close modal with Escape key
    await page.reload(); // Reload to get the modal back
    await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Another topic');
    await page.getByRole('button', { name: 'Générer un post' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.describe('on Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display correctly on mobile', async ({ page }) => {
        test.setTimeout(60000);
        // 1. Navigate and speed through the quiz to the reveal screen
        await page.goto('/');
        await page.getByRole('link', { name: 'DÉTERMINER MON STYLE' }).click();
        await page.screenshot({ path: 'screenshots/debug-auth-modal-mobile-test.png' });
        await page.waitForSelector('[data-testid="theme-t1"]');
        await page.getByTestId('theme-t1').click();
        await page.getByTestId('start-quiz-btn').click();
        await page.getByTestId('option-a').click(); // Answer first question
        await page.getByTestId('continue-refining-btn').click(); // Transition
        await page.getByTestId('option-a').click(); // Answer second phase question
        
        // 2. We are on the reveal screen. Generate a post.
        await expect(page.getByTestId('final-reveal-container')).toBeVisible({ timeout: 10000 });
        await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('My test topic');
        await page.getByRole('button', { name: 'Générer un post' }).click();

        // 3. Auth Modal should be visible and look good
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal).toHaveScreenshot('auth-modal-mobile.png');
    });
  });
});
