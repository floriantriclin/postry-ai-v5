import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should complete the full quiz journey', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for real API calls
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
       const progress = `[ ${(i + 1).toString().padStart(2, '0')} / 06 ]`;
       await expect(page.getByText(progress)).toBeVisible();
       await page.getByTestId(sequence[i]).click();
    }

    // 5. Transition
    await expect(page.getByText('Le Stratège')).toBeVisible();
    await page.getByTestId('continue-refining-btn').click();

    // 6. Phase 2 (5 Questions)
    for (let i = 0; i < 5; i++) {
        // Wait for question to be ready (handles loading state)
        await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/PRECISION/i)).toBeVisible();
        await page.getByTestId('option-a').click();
    }

    // 7. Loading -> Final Reveal
    // Use a more flexible check for the reveal as Gemini might return different titles
    await expect(page.getByTestId('final-reveal-container')).toBeVisible({ timeout: 15000 });
    
    // 8. Check Final UI
    await expect(page.getByPlaceholder('De quoi voulez-vous parler ?')).toBeVisible();
  });
});
