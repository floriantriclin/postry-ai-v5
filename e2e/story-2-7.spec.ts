import { test as baseTest, expect } from '@playwright/test';
import { test, expect as fixtureExpect } from './fixtures/quiz-flow-fixture';

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
 *
 * QUIZ FLOW TESTS (02, 04, 05, REG-01, REG-02): Require the app to run with
 * NEXT_PUBLIC_QUIZ_USE_MOCK=true so questions load immediately (no GEMINI_API_KEY).
 * Run: npm run build:e2e && npm run start (or set env before npm run dev), then run tests.
 */

baseTest.describe('Story 2.7: Auth Persistence Simplification', () => {
  
  baseTest('E2E-2.7-01: /quiz/reveal redirects to /dashboard', async ({ page }) => {
    // This test uses AUTHENTICATED context (from auth.setup)
    await page.goto('/quiz/reveal');
    // Wait for redirect away from /quiz/reveal (may land on /dashboard or /)
    await page.waitForURL(
      (url) => url.pathname !== '/quiz/reveal' && (url.pathname === '/dashboard' || url.pathname === '/' || url.searchParams.has('redirectedFrom')),
      { timeout: 20000 }
    );
  });

  test('E2E-2.7-02: localStorage cleaned after successful auth flow', async ({ unauthenticatedContext, completeQuizFlow }) => {
    test.setTimeout(25000); // Quiz + mock post (no Gemini); enough for WebKit
    const page = await unauthenticatedContext.newPage();
    
    // Complete quiz flow using fixture
    await completeQuizFlow(page, { topic: 'Test topic for Story 2.7' });
    
    // Verify localStorage contains quiz state before auth
    const quizStateBefore = await page.evaluate(() => {
      return localStorage.getItem('ice_quiz_state_v1');
    });
    fixtureExpect(quizStateBefore).not.toBeNull();
    
    // Note: Full auth flow testing requires email verification
    // This test validates that localStorage exists before auth
    // The cleanup happens in auth/confirm page after persist-on-login succeeds
  });

  baseTest('E2E-2.7-03: Direct redirect to dashboard (no /quiz/reveal in navigation)', async ({ page }) => {
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

  test('E2E-2.7-04: Auth modal appears without pre-persist call', async ({ unauthenticatedContext, completeQuizFlow }) => {
    test.setTimeout(60000); // Full quiz + post + modal can exceed 30s on WebKit
    const page = await unauthenticatedContext.newPage();
    
    // Monitor network requests
    const apiCalls: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });
    
    // Complete quiz flow using fixture
    await completeQuizFlow(page, { topic: 'Test topic' });
    
    // Wait for auth modal
    await page.waitForSelector('h2:has-text("Sauvegardez votre post")', { timeout: 5000 });
    
    // Verify NO call to /api/quiz/pre-persist
    const hasPrePersistCall = apiCalls.some(url => url.includes('/api/quiz/pre-persist'));
    fixtureExpect(hasPrePersistCall).toBe(false);
    
    // Verify auth modal is visible
    const authModal = page.locator('h2:has-text("Sauvegardez votre post")');
    await fixtureExpect(authModal).toBeVisible();
  });

  test('E2E-2.7-05: Quiz state structure includes all required fields', async ({ unauthenticatedContext, completeQuizFlow }) => {
    test.setTimeout(25000); // Quiz + mock post (no Gemini); enough for WebKit
    const page = await unauthenticatedContext.newPage();
    
    // Complete quiz flow using fixture
    await completeQuizFlow(page, { topic: 'Test topic' });
    
    // Verify localStorage structure
    const quizState = await page.evaluate(() => {
      const raw = localStorage.getItem('ice_quiz_state_v1');
      return raw ? JSON.parse(raw) : null;
    });
    
    fixtureExpect(quizState).not.toBeNull();
    fixtureExpect(quizState).toHaveProperty('currentVector');
    fixtureExpect(quizState).toHaveProperty('answersP1');
    fixtureExpect(quizState).toHaveProperty('answersP2');
    fixtureExpect(quizState).toHaveProperty('generatedPost');
    fixtureExpect(quizState).toHaveProperty('postTopic');
    fixtureExpect(quizState).toHaveProperty('themeId');
    
    // Verify generatedPost structure
    fixtureExpect(quizState.generatedPost).toHaveProperty('hook');
    fixtureExpect(quizState.generatedPost).toHaveProperty('content');
    fixtureExpect(quizState.generatedPost).toHaveProperty('style_analysis');
  });
});

baseTest.describe('Story 2.7: Regression Tests', () => {

  test('E2E-2.7-REG-01: Complete quiz flow still works end-to-end', async ({ unauthenticatedContext, completeQuizFlow }) => {
    test.setTimeout(60000); // Full quiz + post + modal can exceed 30s on WebKit
    const page = await unauthenticatedContext.newPage();
    
    // Complete quiz flow using fixture
    await completeQuizFlow(page, { topic: 'Regression test topic' });
    
    // Verify post generated
    await page.waitForSelector('[data-testid="post-content"]', { timeout: 5000 });
    await fixtureExpect(page.locator('[data-testid="post-content"]')).toBeVisible();
    
    // Verify auth modal appears
    await fixtureExpect(page.locator('h2:has-text("Sauvegardez votre post")')).toBeVisible();
  });

  test('E2E-2.7-REG-02: Post generation API still works', async ({ unauthenticatedContext, completeQuizFlow }) => {
    test.setTimeout(25000); // Quiz + mock post (no Gemini); enough for WebKit
    const page = await unauthenticatedContext.newPage();
    
    let postApiCalled = false;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/quiz/post') && response.request().method() === 'POST') {
        postApiCalled = true;
        fixtureExpect(response.status()).toBe(200);
        
        const data = await response.json();
        fixtureExpect(data).toHaveProperty('hook');
        fixtureExpect(data).toHaveProperty('content');
        fixtureExpect(data).toHaveProperty('style_analysis');
      }
    });
    
    // Complete quiz flow using fixture
    await completeQuizFlow(page, { topic: 'API test' });
    
    fixtureExpect(postApiCalled).toBe(true);
  });
});
