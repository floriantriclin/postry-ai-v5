import { test, expect } from '@playwright/test';

test.describe('Quiz Robustness & Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Basic mock for Phase 1 generation to ensure consistent questions
    await page.route('**/api/quiz/generate', async (route) => {
        try {
            const data = route.request().postDataJSON();
            if (data && data.phase === 1) {
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
                return;
            }
        } catch (e) {
            // Ignore parsing errors
        }
        await route.continue();
    });
  });

  test('E2E-1.8.3-01: Should persist progress after page reload', async ({ page }) => {
    // 1. Navigate and Start
    await page.goto('/quiz');
    
    // Clear storage to be safe (though incognito context should be fresh)
    await page.evaluate(() => localStorage.clear());
    
    await page.getByTestId('theme-t1').click();
    await page.getByTestId('start-quiz-btn').click();

    // 2. Answer 2 questions
    // Wait for questions to appear
    await expect(page.getByText('[ 01 / 06 ]')).toBeVisible();
    
    await page.getByTestId('option-a').click(); // Q1 -> Q2
    await page.getByTestId('option-a').click(); // Q2 -> Q3

    // 3. Verify progress label
    await expect(page.getByText('[ 03 / 06 ]')).toBeVisible();

    // 4. Reload
    await page.reload();

    // 5. Assert State Preserved
    // Should be back at Q3
    await expect(page.getByText('[ 03 / 06 ]')).toBeVisible();
    
    // Continue quiz to ensure it's functional
    await page.getByTestId('option-a').click();
    await expect(page.getByText('[ 04 / 06 ]')).toBeVisible();
  });

  test('E2E-1.8.3-02: Should display Tech Error Toast on API failure', async ({ page }) => {
     // Mock failure for generate
     await page.route('**/api/quiz/generate', async (route) => {
        await route.fulfill({ status: 500, body: 'Internal Server Error' });
     });

     await page.goto('/quiz');
     await page.getByTestId('theme-t1').click();
     
     // This triggers loadP1 which should fail
     // Toast should appear
     
     await expect(page.getByText('CONNEXION INSTABLE. MODE DEGRADE ACTIVE.')).toBeVisible();
     await expect(page.getByText('SYSTEM ALERT')).toBeVisible();
     
     // Verify we can still start (Fallback mode)
     await expect(page.getByTestId('start-quiz-btn')).toBeVisible();
  });
});
