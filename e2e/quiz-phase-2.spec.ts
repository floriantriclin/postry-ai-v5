import { test, expect } from '@playwright/test';

test.describe('Quiz Phase 2 & Orchestration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Phase 1 Generation
    await page.route('**/api/quiz/generate', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData.phase === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'Q1', dimension: 'POS', option_A: 'Low', option_B: 'High' },
            { id: 'Q2', dimension: 'TEM', option_A: 'Low', option_B: 'High' },
            { id: 'Q3', dimension: 'DEN', option_A: 'Low', option_B: 'High' },
            { id: 'Q4', dimension: 'PRI', option_A: 'Low', option_B: 'High' },
            { id: 'Q5', dimension: 'CAD', option_A: 'Low', option_B: 'High' },
            { id: 'Q6', dimension: 'REG', option_A: 'Low', option_B: 'High' },
          ])
        });
      } else if (postData.phase === 2) {
        // Phase 2 Generation Mock
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'Q7', dimension: 'STR', option_A: 'Organic', option_B: 'Structured' },
            { id: 'Q8', dimension: 'INF', option_A: 'Facts', option_B: 'Story' },
            { id: 'Q9', dimension: 'ANC', option_A: 'Abstract', option_B: 'Concrete' },
            { id: 'Q10', dimension: 'DEN', option_A: 'Simple', option_B: 'Expert' },
            { id: 'Q11', dimension: 'PRI', option_A: 'Optimist', option_B: 'Critic' },
          ])
        });
      }
    });

    // Mock Archetype Identification
    await page.route('**/api/quiz/archetype', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          archetype: {
            id: 1,
            name: 'Le Stratège',
            baseVector: [50, 50, 50, 50, 50, 50, 50, 50, 50]
          },
          targetDimensions: ['STR', 'INF', 'ANC', 'DEN', 'PRI']
        })
      });
    });

    // Mock Profile Generation
    await page.route('**/api/quiz/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          label_final: 'Le Stratège Lumineux',
          definition_longue: 'Une définition précise et personnalisée qui reflète votre identité unique.'
        })
      });
    });
  });

  test('E2E-1.8.2-01: Full flow with Phase 2 and Profile Reveal', async ({ page }) => {
    await page.goto('/quiz');
    
    // Select Theme
    await page.getByTestId('theme-t1').click();
    
    // Start Quiz
    await page.getByTestId('start-quiz-btn').click();

    // Complete Phase 1
    for (let i = 0; i < 6; i++) {
      await page.getByTestId('option-a').click();
    }

    // Verify Archetype Transition & Prefetch Trigger
    await expect(page.getByText('Le Stratège')).toBeVisible();
    
    // At this point, /api/quiz/generate?phase=2 should have been triggered in background
    // We can't easily assert the request happened without spying, but we can verify we don't wait long
    
    await page.getByTestId('continue-refining-btn').click();

    // Complete Phase 2 (Zéro Latence)
    for (let i = 0; i < 5; i++) {
      // Check progress update
      await expect(page.getByText(`PRECISION : ${50 + i * 10}%`)).toBeVisible();
      await page.getByTestId('option-a').click();
    }

    // Verify Final Profile Reveal
    await expect(page.getByText('Le Stratège Lumineux')).toBeVisible();
    await expect(page.getByText('Une définition précise et personnalisée')).toBeVisible();
  });

  test('E2E-1.8.2-02: Loader handling when Phase 2 is slow', async ({ page }) => {
    // Override Phase 2 mock to be slow
    await page.route('**/api/quiz/generate', async (route) => {
      const request = route.request();
      if (request.postDataJSON().phase === 2) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Delay
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'Q7', dimension: 'STR', option_A: 'Organic', option_B: 'Structured' }
          ])
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/quiz');
    await page.getByTestId('theme-t1').click();
    await page.getByTestId('start-quiz-btn').click();
    for (let i = 0; i < 6; i++) await page.getByTestId('option-a').click();

    // Transition Screen
    await expect(page.getByText('Le Stratège')).toBeVisible();
    
    // Click Continue immediately (prefetch not finished due to delay)
    await page.getByTestId('continue-refining-btn').click();

    // Should see loader
    await expect(page.getByText('PREPARATION DE L\'AFFINAGE...')).toBeVisible();

    // Eventually Phase 2 starts
    await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 3000 });
  });
});
