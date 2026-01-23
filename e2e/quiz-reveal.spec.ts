import { test, expect } from '@playwright/test';

test('Story 2.4: Reveal Flow', async ({ page }) => {
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
          definition_longue: "Une définition de test."
      }
    };
    window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
  });

  await page.goto('/quiz');

  // Mock Generate Post
  await page.route('**/api/quiz/post', async route => {
    await route.fulfill({ json: {
      hook: "Post hook",
      content: "Post content",
      cta: "Call to action",
      style_analysis: "Analysis"
    }});
  });

  // Mock Pre-Persist
  let prePersistCalled = false;
  await page.route('**/api/quiz/pre-persist', async route => {
    prePersistCalled = true;
    const body = await route.request().postDataJSON();
    expect(body.email).toBe('test@example.com');
    expect(body.theme).toBe('Test Topic');
    await route.fulfill({ json: { success: true } });
  });
  
  // Mock Supabase Auth OTP call
  // Matches typical Supabase Auth API endpoint for OTP
  await page.route('**/auth/v1/otp', async route => {
      await route.fulfill({ status: 200, body: '{}' });
  });
  
  // Also try to catch typical magiclink endpoint if different SDK version
  await page.route('**/auth/v1/magicLink', async route => {
      await route.fulfill({ status: 200, body: '{}' });
  });

  // Generate Post
  await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Test Topic');
  await page.getByRole('button', { name: 'Générer un post' }).click();

  // Expect Auth Modal
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Sauvegardez votre post')).toBeVisible();

  // Fill Email
  await page.getByLabel('Email Address').fill('test@example.com');
  await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();

  // Verify Pre-Persist called
  await expect(page.getByText('Lien envoyé !')).toBeVisible();
  expect(prePersistCalled).toBe(true);

  // Test Navigation Lock
  // We can try to navigate back and see if we are still on the page
  await page.goBack();
  // Check if we are still on the quiz page or if the modal is still there
  // Note: goBack() might not work perfectly with pushState interception in Playwright in all modes,
  // but if the lock works, URL should not change to previous page outside quiz (if any)
  // or we should remain on /quiz.
  expect(page.url()).toContain('/quiz');
});
