import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API calls to ensure stability and reduce resource usage
    await page.route('**/api/quiz/generate', async (route) => {
      const data = route.request().postDataJSON();
      if (data.phase === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' },
            { id: 'Q2', dimension: 'TEM', option_A: 'A', option_B: 'B' },
            { id: 'Q3', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q4', dimension: 'PRI', option_A: 'A', option_B: 'B' },
            { id: 'Q5', dimension: 'CAD', option_A: 'A', option_B: 'B' },
            { id: 'Q6', dimension: 'REG', option_A: 'A', option_B: 'B' },
          ])
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'Q7', dimension: 'STR', option_A: 'A', option_B: 'B' },
            { id: 'Q8', dimension: 'INF', option_A: 'A', option_B: 'B' },
            { id: 'Q9', dimension: 'ANC', option_A: 'A', option_B: 'B' },
            { id: 'Q10', dimension: 'DEN', option_A: 'A', option_B: 'B' },
            { id: 'Q11', dimension: 'PRI', option_A: 'A', option_B: 'B' },
          ])
        });
      }
    });

    await page.route('**/api/quiz/archetype', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          archetype: { id: 1, name: 'Le Stratège', baseVector: [50,50,50,50,50,50,50,50,50] },
          targetDimensions: ['STR', 'INF', 'ANC']
        })
      });
    });

    await page.route('**/api/quiz/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ label_final: 'Le Stratège', definition_longue: '...' })
      });
    });
  });

  test('should complete the full quiz journey', async ({ page }) => {
    // 1. Navigate to Quiz
    await page.goto('/quiz');
    
    // 2. Select Theme
    await expect(page.getByText('Choisissez votre Terrain')).toBeVisible();
    await page.getByTestId('theme-t1').click();

    // 3. Instructions
    await expect(page.getByText('Phase 1 : Calibration')).toBeVisible();
    await page.getByTestId('start-quiz-btn').click();

    // 4. Phase 1 (6 Questions)
    // Sequence B, A, B, B, A, A -> Signature 101100 -> Le Stratège
    const sequence = ['option-b', 'option-a', 'option-b', 'option-b', 'option-a', 'option-a'];
    for (let i = 0; i < 6; i++) {
       // Wait for question to be visible via option-a or option-b
       await expect(page.getByTestId('option-a')).toBeVisible();
       await page.getByTestId(sequence[i]).click();
    }

    // 5. Transition
    await expect(page.getByText('Le Stratège')).toBeVisible();
    await page.getByTestId('continue-refining-btn').click();

    // 6. Phase 2 (5 Questions)
    for (let i = 0; i < 5; i++) {
        // Wait for question to be ready (handles loading state)
        await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 15000 });
        await page.getByTestId('option-a').click();
    }

    // 7. Loading -> Final Reveal
    // Use a more flexible check for the reveal as Gemini might return different titles
    await expect(page.getByTestId('final-reveal-container')).toBeVisible({ timeout: 15000 });
    
    // 8. Check Final UI
    await expect(page.getByPlaceholder('De quoi voulez-vous parler ?')).toBeVisible();
  });
});
