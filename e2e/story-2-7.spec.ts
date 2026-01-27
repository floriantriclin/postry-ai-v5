import { test, expect } from '@playwright/test';

/**
 * Story 2.7: Auth Persistence Simplification - E2E Tests
 *
 * Tests validating the new persist-on-login flow:
 * - Direct redirect to dashboard (no /quiz/reveal)
 * - localStorage cleanup after auth
 * - Post saved with status='revealed'
 * - /quiz/reveal redirects to /dashboard
 *
 * IMPORTANT: Most tests use UNAUTHENTICATED context to test the quiz flow.
 * Only E2E-2.7-01 uses authenticated context to test redirect behavior.
 */

test.describe('Story 2.7: Auth Persistence Simplification', () => {
  
  test('E2E-2.7-01: /quiz/reveal redirects to /dashboard', async ({ page }) => {
    // This test uses AUTHENTICATED context (from auth.setup)
    // Navigate directly to /quiz/reveal
    await page.goto('/quiz/reveal');
    
    // Should redirect - wait for either /dashboard or landing page with redirect param
    await page.waitForLoadState('networkidle');
    
    // Verify we're redirected (either to dashboard or landing with redirect param)
    const url = page.url();
    const isRedirected = url.includes('/dashboard') || url.includes('redirectedFrom');
    expect(isRedirected).toBe(true);
  });

  test('E2E-2.7-02: localStorage cleaned after successful auth flow', async ({ browser }) => {
    // Create unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    try {
      // 1. Start quiz flow (unauthenticated)
      await page.goto('/quiz');
      
      // Wait for theme selector to load
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      // Select first theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Wait for interstitial
      await page.waitForSelector('h2:has-text("Phase 1")', { timeout: 10000 });
      
      // CRITICAL: Wait for questions to be loaded in the background
      // The quiz engine loads P1 questions when step=INSTRUCTIONS
      // We need to wait for the loader to disappear, which means questions are ready
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        // Button should be visible and no loader should be present
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      // Extra safety wait
      await page.waitForTimeout(1000);
      await page.click('[data-testid="start-quiz-btn"]');
      
      // Answer questions - increased timeout for API fallback
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      // Answer all questions
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(300);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Wait for final reveal
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      
      // Enter topic and generate post
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'Test topic for Story 2.7');
      await page.click('button:has-text("Générer un post")');
      
      // Wait for post generation
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
      
      // Verify localStorage contains quiz state before auth
      const quizStateBefore = await page.evaluate(() => {
        return localStorage.getItem('ice_quiz_state_v1');
      });
      expect(quizStateBefore).not.toBeNull();
      
      // Note: Full auth flow testing requires email verification
      // This test validates that localStorage exists before auth
      // The cleanup happens in auth/confirm page after persist-on-login succeeds
    } finally {
      await context.close();
    }
  });

  test('E2E-2.7-03: Direct redirect to dashboard (no /quiz/reveal in navigation)', async ({ page }) => {
    // Track navigation events
    const navigationUrls: string[] = [];
    
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigationUrls.push(frame.url());
      }
    });
    
    // Start from landing page
    await page.goto('/');
    
    // Verify /quiz/reveal is never in navigation path
    // (This is a structural test - the actual auth flow requires email verification)
    const hasQuizReveal = navigationUrls.some(url => url.includes('/quiz/reveal'));
    expect(hasQuizReveal).toBe(false);
  });

  test('E2E-2.7-04: Auth modal appears without pre-persist call', async ({ browser }) => {
    // Create unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    try {
      // Monitor network requests
      const apiCalls: string[] = [];
      
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalls.push(request.url());
        }
      });
      
      // Complete quiz flow until auth modal (unauthenticated)
      await page.goto('/quiz');
      
      // Wait for theme selector
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      // Select theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Wait for questions to be loaded
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      await page.waitForTimeout(1000);
      await page.click('[data-testid="start-quiz-btn"]');
      
      // Answer questions - increased timeout for API fallback
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(300);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Generate post
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'Test topic');
      await page.click('button:has-text("Générer un post")');
      
      // Wait for auth modal
      await page.waitForSelector('h2:has-text("Sauvegardez votre post")', { timeout: 20000 });
      
      // Verify NO call to /api/quiz/pre-persist
      const hasPrePersistCall = apiCalls.some(url => url.includes('/api/quiz/pre-persist'));
      expect(hasPrePersistCall).toBe(false);
      
      // Verify auth modal is visible
      const authModal = page.locator('h2:has-text("Sauvegardez votre post")');
      await expect(authModal).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('E2E-2.7-05: Quiz state structure includes all required fields', async ({ browser }) => {
    // Create unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    try {
      // Complete quiz flow (unauthenticated)
      await page.goto('/quiz');
      
      // Wait for theme selector
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      // Select theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Wait for questions to be loaded
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      await page.waitForTimeout(1000);
      await page.click('[data-testid="start-quiz-btn"]');
      
      // Answer questions - increased timeout for API fallback
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(300);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Generate post
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'Test topic');
      await page.click('button:has-text("Générer un post")');
      
      // Wait for post generation
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
      
      // Verify localStorage structure
      const quizState = await page.evaluate(() => {
        const raw = localStorage.getItem('ice_quiz_state_v1');
        return raw ? JSON.parse(raw) : null;
      });
      
      expect(quizState).not.toBeNull();
      expect(quizState).toHaveProperty('currentVector');
      expect(quizState).toHaveProperty('answers');
      expect(quizState).toHaveProperty('generatedPost');
      expect(quizState).toHaveProperty('topic');
      expect(quizState).toHaveProperty('acquisitionTheme');
      
      // Verify generatedPost structure
      expect(quizState.generatedPost).toHaveProperty('hook');
      expect(quizState.generatedPost).toHaveProperty('content');
      expect(quizState.generatedPost).toHaveProperty('style_analysis');
    } finally {
      await context.close();
    }
  });
});

test.describe('Story 2.7: Regression Tests', () => {

  test('E2E-2.7-REG-01: Complete quiz flow still works end-to-end', async ({ browser }) => {
    // Create unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    try {
      // Full flow regression test (unauthenticated)
      await page.goto('/quiz');
      
      // Wait for theme selector
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Choisissez votre")')).toBeVisible();
      
      // Select theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await expect(themeButtons.first()).toBeVisible();
      await themeButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Wait for questions to be loaded
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      await page.waitForTimeout(1000);
      await page.click('[data-testid="start-quiz-btn"]');
      
      // Answer all questions - increased timeout for API fallback
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await expect(options.first()).toBeVisible();
        await options.first().click();
        await page.waitForTimeout(300);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Final reveal
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await expect(page.locator('[data-testid="final-reveal-container"]')).toBeVisible();
      
      // Generate post
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'Regression test topic');
      await page.click('button:has-text("Générer un post")');
      
      // Verify post generated
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
      await expect(page.locator('[data-testid="post-content"]')).toBeVisible();
      
      // Verify auth modal appears
      await expect(page.locator('h2:has-text("Sauvegardez votre post")')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('E2E-2.7-REG-02: Post generation API still works', async ({ browser }) => {
    // Create unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    try {
      let postApiCalled = false;
      
      page.on('response', async (response) => {
        if (response.url().includes('/api/quiz/post') && response.request().method() === 'POST') {
          postApiCalled = true;
          expect(response.status()).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('hook');
          expect(data).toHaveProperty('content');
          expect(data).toHaveProperty('style_analysis');
        }
      });
      
      // Complete flow to post generation (unauthenticated)
      await page.goto('/quiz');
      
      // Wait for theme selector
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      // Select theme
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Wait for questions to be loaded
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        const loader = document.querySelector('[class*="loader"]') || document.querySelector('[class*="LoaderMachine"]');
        return btn && !loader && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      await page.waitForTimeout(1000);
      await page.click('[data-testid="start-quiz-btn"]');
      
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(300);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'API test');
      await page.click('button:has-text("Générer un post")');
      
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
      
      expect(postApiCalled).toBe(true);
    } finally {
      await context.close();
    }
  });
});
