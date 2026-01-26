/**
 * Critical User Journeys E2E Tests
 * 
 * According to testing-standards.md Section 5:
 * - Test critical user paths (happy path)
 * - Use data-testid for locators
 * - Manage state for independent tests
 * - Avoid sleep, use waitFor
 */

import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.describe('Complete User Journey: Quiz to Dashboard', () => {
    // Start unauthenticated for full journey
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Mock all API endpoints for consistent testing
      await page.route('**/api/quiz/generate', async (route) => {
        const data = route.request().postDataJSON();
        if (data.phase === 1) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: 'Q1', dimension: 'POS', option_A: 'Positif A', option_B: 'Positif B' },
              { id: 'Q2', dimension: 'TEM', option_A: 'Tempo A', option_B: 'Tempo B' },
              { id: 'Q3', dimension: 'DEN', option_A: 'Densité A', option_B: 'Densité B' },
              { id: 'Q4', dimension: 'PRI', option_A: 'Prisme A', option_B: 'Prisme B' },
              { id: 'Q5', dimension: 'CAD', option_A: 'Cadence A', option_B: 'Cadence B' },
              { id: 'Q6', dimension: 'REG', option_A: 'Registre A', option_B: 'Registre B' },
            ])
          });
        } else if (data.phase === 2) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: 'Q7', dimension: 'STR', option_A: 'Structure A', option_B: 'Structure B' },
              { id: 'Q8', dimension: 'INF', option_A: 'Influence A', option_B: 'Influence B' },
              { id: 'Q9', dimension: 'ANC', option_A: 'Ancrage A', option_B: 'Ancrage B' },
              { id: 'Q10', dimension: 'DEN', option_A: 'Densité A', option_B: 'Densité B' },
              { id: 'Q11', dimension: 'PRI', option_A: 'Prisme A', option_B: 'Prisme B' },
            ])
          });
        }
      });

      await page.route('**/api/quiz/archetype', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            archetype: {
              id: 1,
              name: 'Le Stratège',
              family: 'RATIONALS',
              baseVector: [50, 50, 50, 50, 50, 50, 50, 50, 50]
            },
            targetDimensions: ['STR', 'INF', 'ANC', 'DEN', 'PRI']
          })
        });
      });

      await page.route('**/api/quiz/profile', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            label_final: 'Le Stratège Visionnaire',
            definition_longue: 'Vous êtes un penseur stratégique qui excelle dans la planification à long terme.'
          })
        });
      });

      await page.route('**/api/quiz/post', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hook: 'La stratégie commence par la vision',
            content: 'Un post généré automatiquement basé sur votre profil unique.',
            cta: 'Qu\'en pensez-vous ?',
            style_analysis: 'Style direct et analytique'
          })
        });
      });

      await page.route('**/api/quiz/pre-persist', async (route) => {
        await route.fulfill({
          status: 200,
          json: { success: true }
        });
      });

      // Mock Supabase auth
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

    test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
      // Step 1: Navigate to quiz
      await page.goto('/quiz');
      await expect(page).toHaveURL('/quiz');

      // Step 2: Select theme
      await expect(page.getByText('Choisissez votre Terrain')).toBeVisible();
      const themeButton = page.getByTestId('theme-t1');
      await expect(themeButton).toBeVisible();
      await themeButton.click();

      // Step 3: Start quiz
      await expect(page.getByText('Phase 1 : Calibration')).toBeVisible();
      const startButton = page.getByTestId('start-quiz-btn');
      await expect(startButton).toBeVisible();
      await startButton.click();

      // Step 4: Complete Phase 1 (6 questions)
      for (let i = 0; i < 6; i++) {
        await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
        await page.getByTestId('option-a').click();
      }

      // Step 5: Verify archetype transition
      await expect(page.getByText('Le Stratège')).toBeVisible({ timeout: 10000 });
      const continueButton = page.getByTestId('continue-refining-btn');
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      // Step 6: Complete Phase 2 (5 questions)
      for (let i = 0; i < 5; i++) {
        await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 15000 });
        await page.getByTestId('option-a').click();
      }

      // Step 7: Verify final reveal
      await expect(page.getByTestId('final-reveal-container')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Le Stratège Visionnaire')).toBeVisible();

      // Step 8: Generate post
      const topicInput = page.getByPlaceholder('De quoi voulez-vous parler ?');
      await expect(topicInput).toBeVisible();
      await topicInput.fill('Leadership en entreprise');
      
      const generateButton = page.getByRole('button', { name: 'Générer un post' });
      await expect(generateButton).toBeVisible();
      await generateButton.click();

      // Step 9: Verify auth modal appears
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Sauvegardez votre post')).toBeVisible();

      // Step 10: Submit email
      const emailInput = page.getByLabel('Email Address');
      await expect(emailInput).toBeVisible();
      await emailInput.fill('journey-test@example.com');
      
      const sendLinkButton = page.getByRole('button', { name: 'Envoyez-moi un lien' });
      await expect(sendLinkButton).toBeVisible();
      await sendLinkButton.click();

      // Step 11: Verify success message
      await expect(page.getByText('Lien envoyé !')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Form Validation End-to-End', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
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
          json: {
            hook: 'Hook',
            content: 'Content',
            cta: 'CTA',
            style_analysis: 'Analysis'
          }
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
    });

    test('E2E-VALIDATION-01: Email validation in auth modal', async ({ page }) => {
      await page.goto('/quiz');
      
      // Generate post to trigger auth modal
      await expect(page.getByTestId('final-reveal-container')).toBeVisible();
      await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Test Topic');
      await page.getByRole('button', { name: 'Générer un post' }).click();

      // Wait for modal
      await expect(page.getByRole('dialog')).toBeVisible();

      // Test Case 1: Empty email
      await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
      await expect(page.getByText('Adresse email invalide')).toBeVisible();

      // Test Case 2: Invalid format
      await page.getByPlaceholder('moi@exemple.com').fill('not-an-email');
      await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
      await expect(page.getByText('Adresse email invalide')).toBeVisible();

      // Test Case 3: Invalid format with @
      await page.getByPlaceholder('moi@exemple.com').fill('invalid@');
      await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
      await expect(page.getByText('Adresse email invalide')).toBeVisible();

      // Test Case 4: Valid email
      await page.getByPlaceholder('moi@exemple.com').fill('valid@example.com');
      await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
      await expect(page.getByText('Lien envoyé !')).toBeVisible({ timeout: 10000 });
    });

    test('E2E-VALIDATION-02: Topic input validation', async ({ page }) => {
      await page.goto('/quiz');
      
      await expect(page.getByTestId('final-reveal-container')).toBeVisible();
      
      // Test Case 1: Empty topic should disable button
      const generateButton = page.getByRole('button', { name: 'Générer un post' });
      await expect(generateButton).toBeDisabled();

      // Test Case 2: Valid topic enables button
      await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Valid Topic');
      await expect(generateButton).toBeEnabled();

      // Test Case 3: Clearing topic disables button again
      await page.getByPlaceholder('De quoi voulez-vous parler ?').clear();
      await expect(generateButton).toBeDisabled();
    });
  });

  test.describe('Error Handling End-to-End', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('E2E-ERROR-01: API failure during quiz generation', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/quiz/generate', async (route) => {
        await route.fulfill({
          status: 500,
          body: 'Internal Server Error'
        });
      });

      await page.goto('/quiz');
      await page.getByTestId('theme-t1').click();

      // Verify error toast appears
      await expect(page.getByText('CONNEXION INSTABLE. MODE DEGRADE ACTIVE.')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('SYSTEM ALERT')).toBeVisible();

      // Verify fallback mode is active
      await expect(page.getByTestId('start-quiz-btn')).toBeVisible();
    });

    test('E2E-ERROR-02: Pre-persist failure handling', async ({ page }) => {
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

      // Mock pre-persist failure
      await page.route('**/api/quiz/pre-persist', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Database error' })
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
      
      // Generate post and submit email
      await expect(page.getByTestId('final-reveal-container')).toBeVisible();
      await page.getByPlaceholder('De quoi voulez-vous parler ?').fill('Test Topic');
      await page.getByRole('button', { name: 'Générer un post' }).click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByLabel('Email Address').fill('test@example.com');
      await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();

      // Verify error message
      await expect(page.getByText('Impossible de sauvegarder votre post. Veuillez réessayer.')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('State Persistence', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.route('**/api/quiz/generate', async (route) => {
        const data = route.request().postDataJSON();
        if (data && data.phase === 1) {
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
        }
      });
    });

    test('E2E-PERSIST-01: Quiz progress persists after page reload', async ({ page }) => {
      await page.goto('/quiz');
      
      // Clear storage to start fresh
      await page.evaluate(() => localStorage.clear());
      
      // Start quiz
      await page.getByTestId('theme-t1').click();
      await page.getByTestId('start-quiz-btn').click();

      // Answer 3 questions
      for (let i = 0; i < 3; i++) {
        await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
        await page.getByTestId('option-a').click();
      }

      // Verify we're on question 4
      await expect(page.getByTestId('option-a')).toBeVisible();

      // Reload page
      await page.reload();

      // Verify state is preserved (should still be on question 4)
      await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
      
      // Continue quiz to verify functionality
      await page.getByTestId('option-a').click();
      await expect(page.getByTestId('option-a')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ 
      viewport: { width: 375, height: 667 },
      storageState: { cookies: [], origins: [] }
    });

    test('E2E-MOBILE-01: Quiz flow on mobile viewport', async ({ page }) => {
      await page.route('**/api/quiz/generate', async (route) => {
        const data = route.request().postDataJSON();
        if (data.phase === 1) {
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

      // Verify theme selector is visible and clickable on mobile
      await expect(page.getByText('Choisissez votre Terrain')).toBeVisible();
      const themeButton = page.getByTestId('theme-t1');
      await expect(themeButton).toBeVisible();
      
      // Verify button is large enough for touch (minimum 44x44px)
      const boundingBox = await themeButton.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }

      await themeButton.click();

      // Verify start button on mobile
      const startButton = page.getByTestId('start-quiz-btn');
      await expect(startButton).toBeVisible();
      await startButton.click();

      // Verify question display on mobile
      await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('option-b')).toBeVisible();
    });
  });
});
