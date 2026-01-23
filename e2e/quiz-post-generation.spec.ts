import { test, expect } from '@playwright/test';

test('Story 1.9: Post Generation Flow', async ({ page }) => {
  // Inject completed quiz state
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
        archetype: {
            id: 1,
            name: "Le Stratège",
            family: "RATIONALS",
            signature: "Signature",
            description: "Description",
            baseVector: [50, 50, 50, 50, 50, 50, 50, 50, 50],
            binarySignature: "000000"
        },
        targetDimensions: []
      },
      profileData: {
          label_final: "Le Stratège Test",
          definition_longue: "Une définition de test pour vérifier l'affichage."
      }
    };
    window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
  });

  await page.goto('/quiz');
  
  // Check if Final Reveal is visible
  await expect(page.getByTestId('final-reveal-container')).toBeVisible();

  // Enter topic
  await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Intelligence Artificielle');

  // Mock the API call
  await page.route('**/api/quiz/post', async route => {
    const json = {
      hook: "L'IA change tout.",
      content: "Voici pourquoi...",
      cta: "Qu'en pensez-vous ?",
      style_analysis: "Style très direct."
    };
    await route.fulfill({ json });
  });

  // Click generate
  await page.getByRole('button', { name: 'Générer un post' }).click();

  // Validate "Focus View" appearance
  await expect(page.getByText('Intelligence Artificielle')).toBeVisible();
  await expect(page.getByText('Draft Mode')).toBeVisible();
  await expect(page.getByText("L'IA change tout.")).toBeVisible();
  
  // Show and validate style analysis
  await page.getByRole('button', { name: 'Voir l\'analyse de style' }).click();
  await expect(page.getByText('Style très direct.')).toBeVisible();
  
  // Check masking/blur elements (Check placeholders for now as per code)
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Sauvegardez votre post')).toBeVisible();
});
