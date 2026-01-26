
import { test, expect } from '@playwright/test';

test.describe('Auth Confirm Page', () => {
  // Use a fresh context for these tests to avoid global auth setup interference
  test.use({ storageState: { cookies: [], origins: [] } });

  test('E2E-AUTH-01: should show error message if no auth event occurs', async ({ page }) => {
    // Navigate to /auth/confirm without params
    await page.goto('/auth/confirm');
    
    // Attendre le message d'erreur (timeout de 20s + marge)
    await expect(page.getByText('Erreur d\'authentification')).toBeVisible({ timeout: 21000 });
    await expect(page.getByText('Erreur lors de la récupération de l\'utilisateur.')).toBeVisible();
    
    // Vérifier le bouton de retour
    const backButton = page.getByRole('button', { name: 'Retour à l\'accueil' });
    await expect(backButton).toBeVisible();
    
    // Tester la navigation manuelle
    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  test('E2E-AUTH-02: should show error for fake token hash', async ({ page }) => {
    await page.goto('/auth/confirm?token_hash=fake&type=email&next=/dashboard');
    
    // Même comportement attendu
    await expect(page.getByText('Erreur d\'authentification')).toBeVisible({ timeout: 21000 });
    
    const backButton = page.getByRole('button', { name: 'Retour à l\'accueil' });
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  test('E2E-AUTH-03: should handle implicit flow hash error', async ({ page }) => {
    // Navigate with a fake access_token in the hash
    await page.goto('/auth/confirm#access_token=fake&refresh_token=fake&type=recovery');

    // Vérifier le message d'erreur spécifique
    await expect(page.getByText('Erreur lors de la validation du lien.')).toBeVisible({ timeout: 5000 });
  });
});
