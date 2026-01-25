
import { test, expect } from '@playwright/test';

test('Repro: Final Reveal Visibility', async ({ page }) => {
  await page.addInitScript(() => {
    const state = {
      step: 'FINAL_REVEAL',
      status: 'idle',
      postTopic: 'Test Subject',
      themeId: 't7',
      questionsP1: [],
      answersP1: {},
      questionsP2: [],
      answersP2: {},
      currentVector: [50, 50, 50, 50, 50, 50, 50, 50, 50],
      archetypeData: {
        archetype: {
            id: 1,
            name: "Le Stratège",
            family: "RATIONALS",
            baseVector: [50, 50, 50, 50, 50, 50, 50, 50, 50],
        },
        targetDimensions: []
      },
      profileData: {
          label_final: "Le Stratège Test",
          definition_longue: "Une définition de test."
      },
      generatedPost: {
          hook: "Ceci est un hook très lisible.",
          content: "Ceci est le contenu du post qui devrait être flouté mais pas complètement invisible. On veut voir qu'il y a du texte, mais ne pas pouvoir le lire confortablement. Si c'est tout blanc, c'est un problème.\n\nParagraphe 2.\n\nParagraphe 3.",
          cta: "En savoir plus",
          style_analysis: "Analyse"
      },
      error: null
    };
    window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
  });

  // Mock API to prevent errors
  await page.route('**/auth/v1/**', async route => {
      await route.fulfill({ status: 200, body: '{}' }); // No session
  });

  await page.goto('/quiz');

  // Wait for the hook to be visible (it should be clear)
  await expect(page.getByText('Ceci est un hook très lisible.')).toBeVisible();

  // Take a screenshot to verify the blur/gradient
  await page.screenshot({ path: 'screenshots/repro-visibility.png', fullPage: true });
});
