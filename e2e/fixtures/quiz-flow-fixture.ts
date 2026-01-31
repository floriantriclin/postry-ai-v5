import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';

type QuizFixture = {
  completeQuizFlow: (page: Page, options?: { topic?: string }) => Promise<void>;
  unauthenticatedContext: BrowserContext;
};

export const test = base.extend<QuizFixture>({
  unauthenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: undefined });
    await use(context);
    await context.close(); // Auto-cleanup
  },
  
  completeQuizFlow: async ({}, use) => {
    const completeFlow = async (page: Page, options: { topic?: string } = {}) => {
      const topic = options.topic || 'Test topic';
      
      // Navigate to quiz
      await page.goto('/quiz');
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      // Select theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      
      // Wait for interstitial
      await page.waitForSelector('h2:has-text("Phase 1")', { timeout: 10000 });
      
      // Wait for questions to be loaded (loader disappears)
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      // Start quiz
      const startBtn = page.locator('[data-testid="start-quiz-btn"]');
      await expect(startBtn).toBeVisible();
      await expect(startBtn).toBeEnabled();
      await startBtn.click();
      await page.waitForTimeout(300); // Strategic wait for quiz initialization
      
      // Wait for first question
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      // Answer all questions (mock: 6 P1 + 5 P2 = 11 questions)
      for (let i = 0; i < 11; i++) {
        // Check if we've reached final reveal (quiz complete) 
        const finalRevealVisible = await page.locator('[data-testid="final-reveal-container"]').isVisible().catch(() => false);
        if (finalRevealVisible) {
          break;
        }
        
        // Answer question
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(200); // Strategic wait for UI transition
        
        // Look for continue button
        const continueBtn = page.locator('button:has-text("Continuer")');
        const continueVisible = await continueBtn.isVisible().catch(() => false);
        
        if (continueVisible) {
          await continueBtn.click();
          await page.waitForTimeout(300); // Strategic wait for next question load
        }
      }
      
      // Wait for final reveal container
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 10000 });
      
      // Fill topic and generate post
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', topic);
      await page.click('button:has-text("Générer un post")');
      
      // Wait for post to be generated
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 5000 });
    };
    
    await use(completeFlow);
  },
});

export { expect } from '@playwright/test';
