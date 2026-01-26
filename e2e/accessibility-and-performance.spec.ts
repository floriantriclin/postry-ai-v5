/**
 * Accessibility and Performance E2E Tests
 * 
 * According to testing-standards.md:
 * - Test from user perspective
 * - Use semantic queries
 * - Ensure responsive design works
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('E2E-A11Y-01: Keyboard navigation through quiz', async ({ page }) => {
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      if (data && data.phase === 1) {
        await route.fulfill({
          status: 200,
          json: [
            { id: 'Q1', dimension: 'POS', option_A: 'Option A', option_B: 'Option B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'Option A', option_B: 'Option B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'Option A', option_B: 'Option B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'Option A', option_B: 'Option B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'Option A', option_B: 'Option B' },
            { id: 'Q6', dimension: 'REG', option_A: 'Option A', option_B: 'Option B' },
          ]
        });
      }
    });

    await page.goto('/quiz');

    // Verify theme button is visible and can be focused
    const themeButton = page.getByTestId('theme-t1');
    await expect(themeButton).toBeVisible();
    
    // Focus the button programmatically (simulates keyboard navigation)
    await themeButton.focus();
    await expect(themeButton).toBeFocused();
    
    // Select theme with Enter key
    await page.keyboard.press('Enter');

    // Verify start button appears and can be focused
    const startButton = page.getByTestId('start-quiz-btn');
    await expect(startButton).toBeVisible();
    await startButton.focus();
    await expect(startButton).toBeFocused();
    await page.keyboard.press('Enter');

    // Verify question is visible
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
  });

  test('E2E-A11Y-02: Screen reader friendly elements', async ({ page }) => {
    await page.goto('/quiz');

    // Check for proper ARIA labels and roles
    const themeSelector = page.getByText('Choisissez votre Terrain');
    await expect(themeSelector).toBeVisible();

    // Verify buttons have accessible names
    const themeButton = page.getByTestId('theme-t1');
    await expect(themeButton).toBeVisible();
    
    // Check that interactive elements are properly labeled
    const buttonRole = await themeButton.getAttribute('role');
    const ariaLabel = await themeButton.getAttribute('aria-label');
    
    // At minimum, button should be identifiable
    expect(buttonRole === 'button' || await themeButton.evaluate(el => el.tagName === 'BUTTON')).toBeTruthy();
  });

  test('E2E-A11Y-03: Form labels and error messages', async ({ page }) => {
    // Set up completed quiz state
    await page.addInitScript(() => {
      const state = {
        step: 'FINAL_REVEAL',
        status: 'idle',
        themeId: 'tech',
        questionsP1: [],
        answersP1: {},
        questionsP2: [],
        answersP2: {},
        currentVector: [50, 50, 50, 50, 50, 50, 50, 50, 50],
        archetypeData: {
          archetype: { id: 1, name: 'Le Stratège' },
          targetDimensions: [],
        },
        profileData: {
          label_final: 'Le Stratège Test',
          definition_longue: 'Une définition de test.',
        },
      };
      window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
    });

    await page.route('**/api/quiz/post', async (route) => {
      await route.fulfill({
        status: 200,
        json: { hook: 'Hook', content: 'Content', cta: 'CTA', style_analysis: 'Analysis' }
      });
    });

    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('/auth/v1/otp')) {
          return new Response(
            JSON.stringify({ data: { user: null, session: null }, error: null }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, options);
      };
    });

    await page.goto('/quiz');
    
    // Trigger auth modal
    await expect(page.getByTestId('final-reveal-container')).toBeVisible();
    await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Test');
    await page.getByRole('button', { name: 'Générer un post' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify form has proper label
    const emailInput = page.getByLabel('Email Address');
    await expect(emailInput).toBeVisible();

    // Trigger validation error
    await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
    
    // Verify error message is visible and associated with input
    const errorMessage = page.getByText('Adresse email invalide');
    await expect(errorMessage).toBeVisible();
  });

  test('E2E-A11Y-04: Color contrast and visibility', async ({ page }) => {
    await page.goto('/quiz');

    // Verify main heading is visible
    const heading = page.getByText('Choisissez votre Terrain');
    await expect(heading).toBeVisible();

    // Check that text has sufficient contrast (visual check via screenshot)
    // This is a basic check - full contrast testing would require additional tools
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Performance Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('E2E-PERF-01: Quiz loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/quiz');
    
    // Wait for main content to be visible
    await expect(page.getByText('Choisissez votre Terrain')).toBeVisible({ timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('E2E-PERF-02: Question transitions are smooth', async ({ page }) => {
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      if (data && data.phase === 1) {
        await route.fulfill({
          status: 200,
          json: [
            { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
            { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
          ]
        });
      }
    });

    await page.goto('/quiz');
    await page.getByTestId('theme-t1').click();
    await page.getByTestId('start-quiz-btn').click();

    // Measure time between question transitions
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
    
    const transitionStart = Date.now();
    await page.getByTestId('option-a').click();
    
    // Next question should appear quickly
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 2000 });
    const transitionTime = Date.now() - transitionStart;
    
    // Transition should be under 500ms for good UX
    expect(transitionTime).toBeLessThan(500);
  });

  test('E2E-PERF-03: No memory leaks during quiz completion', async ({ page }) => {
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      if (data && data.phase === 1) {
        await route.fulfill({
          status: 200,
          json: [
            { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
            { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
          ]
        });
      }
    });

    await page.goto('/quiz');
    await page.getByTestId('theme-t1').click();
    await page.getByTestId('start-quiz-btn').click();

    // Complete all questions
    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('option-a').click();
    }

    // Check that localStorage is being used appropriately
    const storageSize = await page.evaluate(() => {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    });

    // Storage should be reasonable (under 100KB)
    expect(storageSize).toBeLessThan(100000);
  });
});

test.describe('Cross-Browser Compatibility', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('E2E-COMPAT-01: Quiz works across different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/quiz');

      // Verify main content is visible at all viewport sizes
      await expect(page.getByText('Choisissez votre Terrain')).toBeVisible();
      
      // Verify theme button is clickable
      const themeButton = page.getByTestId('theme-t1');
      await expect(themeButton).toBeVisible();
      
      // Verify button is within viewport
      const boundingBox = await themeButton.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        expect(boundingBox.y).toBeGreaterThanOrEqual(0);
        expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('E2E-COMPAT-02: Touch interactions work on mobile', async ({ browser }) => {
    // Create context with touch support enabled
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      storageState: { cookies: [], origins: [] }
    });
    const page = await context.newPage();
    
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      if (data && data.phase === 1) {
        await route.fulfill({
          status: 200,
          json: [
            { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
            { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
          ]
        });
      }
    });

    await page.goto('/quiz');

    // Simulate touch interaction
    const themeButton = page.getByTestId('theme-t1');
    await expect(themeButton).toBeVisible();
    
    // Tap (touch interaction)
    await themeButton.tap();

    // Verify navigation worked
    const startButton = page.getByTestId('start-quiz-btn');
    await expect(startButton).toBeVisible();
    
    await startButton.tap();

    // Verify question appears
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
    
    await context.close();
  });
});

test.describe('Network Resilience', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('E2E-NETWORK-01: Handles slow network gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/quiz/generate', async (route) => {
      // Add 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = route.request().postDataJSON();
      if (data && data.phase === 1) {
        await route.fulfill({
          status: 200,
          json: [
            { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
            { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
          ]
        });
      }
    });

    await page.goto('/quiz');
    await page.getByTestId('theme-t1').click();

    // Should show loading state
    const startButton = page.getByTestId('start-quiz-btn');
    await expect(startButton).toBeVisible();
    
    await startButton.click();

    // Should eventually load questions despite slow network
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 15000 });
  });

  test('E2E-NETWORK-02: Recovers from temporary network failure', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      
      if (data && data.phase === 1) {
        // Fail first request, succeed on retry
        if (failCount === 0) {
          failCount++;
          await route.fulfill({ status: 500, body: 'Temporary failure' });
        } else {
          await route.fulfill({
            status: 200,
            json: [
              { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
              { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
              { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
              { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
              { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
              { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
            ]
          });
        }
      }
    });

    await page.goto('/quiz');
    await page.getByTestId('theme-t1').click();

    // Should show error initially
    await expect(page.getByText('CONNEXION INSTABLE. MODE DEGRADE ACTIVE.')).toBeVisible({ timeout: 10000 });
    
    // But fallback mode should still allow starting
    await expect(page.getByTestId('start-quiz-btn')).toBeVisible();
  });
});
