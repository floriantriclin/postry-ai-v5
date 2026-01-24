import { test, expect } from '@playwright/test';

test.describe('Authentication Modal Flow', () => {
  // Ensure we start unauthenticated so the modal appears
  test.use({ storageState: { cookies: [], origins: [] } });

  let setCompletedQuizState: (page: any) => Promise<void>;

  test.beforeEach(async ({ page }) => {
    // Mock the post generation API
    await page.route('**/api/quiz/post', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hook: 'The Hook',
          content: 'The Content',
          style_analysis: 'The Analysis',
        }),
      });
    });

    // Mock Pre-Persist to avoid polluting the DB
    await page.route('**/api/quiz/pre-persist', async (route) => {
      await route.fulfill({ status: 200, json: { success: true } });
    });

    setCompletedQuizState = async (page: any) => {
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
          definition_longue: "Une définition de test pour vérifier l'affichage.",
        },
      };
        window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
      });
    };
      await page.addInitScript(() => {
        const originalFetch = window.fetch;
        window.fetch = async (url, options) => {
          if (typeof url === 'string' && url.includes('/auth/v1/otp')) {
            return new Response(
              JSON.stringify({ data: { user: null, session: null }, error: null }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          return originalFetch(url, options);
        };
      });
  });

  test('should display and handle the auth modal correctly', async ({ page }) => {
    // 1. Set the state to be at the final reveal step and navigate
    await setCompletedQuizState(page);
    await page.goto('/quiz');

    // 2. We are on the reveal screen. Generate a post.
    await expect(page.getByTestId('final-reveal-container')).toBeVisible();
    await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('My test topic');
    await page.getByRole('button', { name: 'Générer un post' }).click();

    // 3. Auth Modal should be visible over the post
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Sauvegardez votre post')).toBeVisible();
    
    // 4. Test Case: Invalid email (empty is covered by this)
    await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
    await expect(page.getByText('Adresse email invalide')).toBeVisible();
    
    await page.getByPlaceholder('moi@exemple.com').fill('invalid-email');
    await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
    await expect(page.getByText('Adresse email invalide')).toBeVisible();

    // 5. Test Case: Valid Email & Success
    // The Supabase fetch call is mocked via addInitScript in beforeEach
    // We use a different email to avoid polluting the main test user's dashboard
    await page.getByPlaceholder('moi@exemple.com').fill('modal-test@example.com');
    await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();

    // Check for loading state, then success message
    await expect(page.getByText('Lien envoyé !')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Un lien de connexion a été envoyé à votre adresse email. Veuillez consulter votre boîte de réception.')).toBeVisible();
    
    // 6. Test Case: Modal should not be closable
    // Try to press escape
    await page.keyboard.press('Escape');
    // The dialog should remain visible
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.describe('on Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display correctly on mobile', async ({ page }) => {
        // 1. Set the state to be at the final reveal step and navigate
        await setCompletedQuizState(page);
        await page.goto('/quiz');
        
        // 2. We are on the reveal screen. Generate a post.
        await expect(page.getByTestId('final-reveal-container')).toBeVisible();
        await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('My test topic');
        await page.getByRole('button', { name: 'Générer un post' }).click();

        // 3. Auth Modal should be visible and look good
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal).toHaveScreenshot('auth-modal-mobile.png');
    });
  });
});
