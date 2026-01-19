import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
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
    for (let i = 0; i < 6; i++) {
       await expect(page.getByText(`${i + 1}/6`)).toBeVisible();
       // Wait for animation or next question to be ready if needed, but click should work
       await page.getByTestId('option-a').click();
    }

    // 5. Transition
    await expect(page.getByText('Le Stratège')).toBeVisible();
    await page.getByTestId('continue-refining-btn').click();

    // 6. Phase 2 (5 Questions)
    for (let i = 0; i < 5; i++) {
        await expect(page.getByText(/Précision:/)).toBeVisible();
        await page.getByTestId('option-a').click();
    }

    // 7. Loading -> Final Reveal
    // Wait for loading to finish (mocked 2.5s)
    await expect(page.getByText('Le Stratège Lumineux')).toBeVisible({ timeout: 10000 });
    
    // 8. Check Final UI
    await expect(page.getByPlaceholder('De quoi voulez-vous parler ?')).toBeVisible();
  });
});
