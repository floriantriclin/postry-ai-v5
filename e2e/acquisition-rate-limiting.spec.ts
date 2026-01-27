import { test, expect } from '@playwright/test';

/**
 * Story 2.11b: Rate Limiting - E2E Tests
 *
 * Tests validating the rate limiting behavior:
 * - Max 5 acquisitions per hour per IP
 * - 6th acquisition returns 429
 * - Rate limit headers present
 * - User-friendly error message
 *
 * IMPORTANT: These tests use multiple browser contexts to simulate same IP
 */

test.describe('Story 2.11b: Rate Limiting', () => {
  
  test('E2E-2.11b-RL-01: 5 acquisitions succeed, 6th returns 429', async ({ browser }) => {
    // This test validates the rate limiting behavior
    // It simulates 6 acquisition attempts from the same IP
    
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      const postIds: string[] = [];
      
      // Helper function to complete quiz flow
      const completeQuizAndSubmit = async (attemptNumber: number) => {
        await page.goto('/quiz');
        await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
        
        const themeButtons = page.locator('button[data-testid^="theme-"]');
        await themeButtons.first().click();
        await page.waitForTimeout(500);
        
        await page.waitForSelector('h2:has-text("Phase 1")', { timeout: 10000 });
        await page.waitForFunction(() => {
          const btn = document.querySelector('[data-testid="start-quiz-btn"]');
          return btn && btn.textContent?.includes('Lancer');
        }, { timeout: 45000 });
        
        await page.click('[data-testid="start-quiz-btn"]');
        await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
        
        // Answer questions quickly
        for (let i = 0; i < 10; i++) {
          const options = page.locator('[data-testid^="option-"]');
          await options.first().click();
          await page.waitForTimeout(100);
          
          const continueBtn = page.locator('button:has-text("Continuer")');
          if (await continueBtn.isVisible()) {
            await continueBtn.click();
            await page.waitForTimeout(200);
          }
        }
        
        await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
        await page.fill('input[placeholder*="De quoi voulez-vous parler"]', `Rate Limit Test ${attemptNumber}`);
        await page.click('button:has-text("Générer un post")');
        await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
        
        // Wait for persist API response
        const persistRequest = page.waitForResponse(
          response => response.url().includes('/api/posts/anonymous'),
          { timeout: 10000 }
        );
        
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill(`test-ratelimit-${attemptNumber}@example.com`);
        await page.locator('button:has-text("Envoyez-moi un lien")').click();
        
        const persistResponse = await persistRequest;
        return persistResponse;
      };
      
      // Attempt 1-5: Should succeed
      for (let i = 1; i <= 5; i++) {
        console.log(`Attempt ${i}/6...`);
        const response = await completeQuizAndSubmit(i);
        
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(data).toHaveProperty('postId');
        postIds.push(data.postId);
        
        // Verify rate limit headers present
        const headers = response.headers();
        expect(headers['x-ratelimit-limit']).toBe('5');
        expect(parseInt(headers['x-ratelimit-remaining'] || '0')).toBeGreaterThanOrEqual(0);
        
        // Small delay between attempts
        await page.waitForTimeout(500);
      }
      
      // Verify 5 distinct postIds
      const uniquePostIds = new Set(postIds);
      expect(uniquePostIds.size).toBe(5);
      
      // Attempt 6: Should fail with 429
      console.log('Attempt 6/6 (should fail)...');
      const response6 = await completeQuizAndSubmit(6);
      
      expect(response6.status()).toBe(429);
      
      // Verify rate limit headers in 429 response
      const headers6 = response6.headers();
      expect(headers6['x-ratelimit-limit']).toBe('5');
      expect(headers6['x-ratelimit-remaining']).toBe('0');
      expect(headers6['x-ratelimit-reset']).toBeTruthy();
      
      // Verify error message in response body
      const errorData = await response6.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Rate limit exceeded');
      
      // Verify user-friendly error message shown in UI
      await page.waitForSelector('p:has-text("Limite atteinte")', { timeout: 5000 });
      
      // Test passes ✅
      
    } finally {
      await context.close();
    }
  });

  test('E2E-2.11b-RL-02: Rate limit headers decrease correctly', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      const completeQuizAndSubmit = async (attemptNumber: number) => {
        await page.goto('/quiz');
        await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
        
        const themeButtons = page.locator('button[data-testid^="theme-"]');
        await themeButtons.first().click();
        await page.waitForTimeout(500);
        
        await page.waitForSelector('h2:has-text("Phase 1")', { timeout: 10000 });
        await page.waitForFunction(() => {
          const btn = document.querySelector('[data-testid="start-quiz-btn"]');
          return btn && btn.textContent?.includes('Lancer');
        }, { timeout: 45000 });
        
        await page.click('[data-testid="start-quiz-btn"]');
        await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
        
        for (let i = 0; i < 10; i++) {
          const options = page.locator('[data-testid^="option-"]');
          await options.first().click();
          await page.waitForTimeout(100);
          
          const continueBtn = page.locator('button:has-text("Continuer")');
          if (await continueBtn.isVisible()) {
            await continueBtn.click();
            await page.waitForTimeout(200);
          }
        }
        
        await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
        await page.fill('input[placeholder*="De quoi voulez-vous parler"]', `Headers Test ${attemptNumber}`);
        await page.click('button:has-text("Générer un post")');
        await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
        
        const persistRequest = page.waitForResponse(
          response => response.url().includes('/api/posts/anonymous'),
          { timeout: 10000 }
        );
        
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill(`test-headers-${attemptNumber}@example.com`);
        await page.locator('button:has-text("Envoyez-moi un lien")').click();
        
        return await persistRequest;
      };
      
      // First attempt
      const response1 = await completeQuizAndSubmit(1);
      expect(response1.status()).toBe(200);
      
      const headers1 = response1.headers();
      expect(headers1['x-ratelimit-limit']).toBe('5');
      const remaining1 = parseInt(headers1['x-ratelimit-remaining'] || '0');
      expect(remaining1).toBeLessThanOrEqual(4); // Should be 4 or less
      
      await page.waitForTimeout(500);
      
      // Second attempt
      const response2 = await completeQuizAndSubmit(2);
      expect(response2.status()).toBe(200);
      
      const headers2 = response2.headers();
      expect(headers2['x-ratelimit-limit']).toBe('5');
      const remaining2 = parseInt(headers2['x-ratelimit-remaining'] || '0');
      
      // Remaining should decrease
      expect(remaining2).toBeLessThan(remaining1);
      
      // Test passes if headers decrease correctly ✅
      
    } finally {
      await context.close();
    }
  });

  test('E2E-2.11b-RL-03: Error message user-friendly and actionable', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    try {
      // Mock the persist API to return 429 immediately
      await page.route('**/api/posts/anonymous', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 3600}`
          },
          body: JSON.stringify({
            error: 'Rate limit exceeded. Maximum 5 acquisitions per hour.',
            retryAfter: 3600
          })
        });
      });
      
      await page.goto('/quiz');
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });
      
      const themeButtons = page.locator('button[data-testid^="theme-"]');
      await themeButtons.first().click();
      await page.waitForTimeout(500);
      
      await page.waitForSelector('h2:has-text("Phase 1")', { timeout: 10000 });
      await page.waitForFunction(() => {
        const btn = document.querySelector('[data-testid="start-quiz-btn"]');
        return btn && btn.textContent?.includes('Lancer');
      }, { timeout: 45000 });
      
      await page.click('[data-testid="start-quiz-btn"]');
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });
      
      for (let i = 0; i < 10; i++) {
        const options = page.locator('[data-testid^="option-"]');
        await options.first().click();
        await page.waitForTimeout(100);
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(200);
        }
      }
      
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', 'Test Rate Limit UI');
      await page.click('button:has-text("Générer un post")');
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });
      
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test-ui-message@example.com');
      await page.locator('button:has-text("Envoyez-moi un lien")').click();
      
      // Wait for error message
      await page.waitForSelector('p[role="alert"]', { timeout: 5000 });
      
      // Verify error message is user-friendly
      const errorMessage = await page.locator('p[role="alert"]').textContent();
      expect(errorMessage).toContain('Limite atteinte');
      expect(errorMessage).toContain('1 heure');
      
      // Verify localStorage NOT cleared (persist failed)
      const quizState = await page.evaluate(() => {
        return localStorage.getItem('ice_quiz_state_v1');
      });
      expect(quizState).not.toBeNull();
      
      // Test passes if error message is clear and actionable ✅
      
    } finally {
      await context.close();
    }
  });
});
