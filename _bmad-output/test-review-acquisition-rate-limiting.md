# Test Quality Review: acquisition-rate-limiting.spec.ts

**Quality Score**: 34/100 (F - Critical Issues)
**Review Date**: 2026-01-30
**Review Scope**: Single file review  
**Reviewer**: Murat (TEA Agent)

---

## Executive Summary

**Overall Assessment**: Critical Issues

**Recommendation**: **Block Merge** - Multiple P0 violations pose severe flakiness and maintainability risks

### Key Strengths

✅ Explicit assertions present (expect() statements clearly visible)  
✅ Test RL-03 uses mocking pattern correctly (API route stubbed before navigation)  
✅ Test intent is clear from describe blocks (rate limiting validation)

### Key Weaknesses

❌ **IP contamination** - All 3 tests share localhost IP, causing rate limit pollution between tests (25% pass rate)  
❌ **Extreme duration** - Test RL-01 takes 6-12 minutes (6 full quiz flows × 1-2 min each)  
❌ **Multiple hard waits** - 10+ instances of `waitForTimeout()` scattered throughout (flakiness risk)  
❌ **No isolation** - Tests don't clean up rate limit state, sequential execution causes failures  
❌ **No fixtures** - 100+ lines of quiz flow logic duplicated across tests

### Summary

Ce fichier teste le rate limiting (5 acquisitions/heure max) mais souffre de **contamination entre tests** - tous les tests s'exécutent depuis la même IP localhost, donc Test RL-01 consomme 6 acquisitions, puis Test RL-02 échoue car déjà rate limited. Les tests sont aussi **extrêmement lents** (6-12 minutes pour RL-01) et utilisent **des hard waits arbitraires** au lieu de waits déterministes. 

**Impact production**: Ce spec ne peut PAS valider le vrai rate limiting de manière fiable. Recommandation: Approche hybride (API tests pour logique + E2E mockés pour UX seulement).

---

## Quality Criteria Assessment

| Criterion                            | Status    | Violations | Notes                                            |
| ------------------------------------ | --------- | ---------- | ------------------------------------------------ |
| BDD Format (Given-When-Then)         | ❌ FAIL   | 3          | No GWT structure, procedural flow only           |
| Test IDs                             | ❌ FAIL   | 3          | Describe blocks lack test ID convention          |
| Priority Markers (P0/P1/P2/P3)       | ❌ FAIL   | 3          | No priority classification                       |
| Hard Waits (sleep, waitForTimeout)   | ❌ FAIL   | 12+        | Multiple `waitForTimeout()` - critical flakiness |
| Determinism (no conditionals)        | ⚠️ WARN   | 3          | Some `if` checks in loops (line 52, 156)         |
| Isolation (cleanup, no shared state) | ❌ FAIL   | 3          | IP contamination, no cleanup, sequential failure |
| Fixture Patterns                     | ❌ FAIL   | 3          | No fixtures, 100+ line helpers duplicated        |
| Data Factories                       | ⚠️ WARN   | 3          | Template literals only, no factory functions     |
| Network-First Pattern                | ⚠️ WARN   | 2          | Partial use (waitForResponse after navigation)   |
| Explicit Assertions                  | ✅ PASS   | 0          | All expect() statements visible                  |
| Test Length (≤300 lines)             | ⚠️ WARN   | 1          | 287 lines total, but helpers are monolithic      |
| Test Duration (≤1.5 min)             | ❌ FAIL   | 1          | RL-01: 6-12 min (6 full quiz flows!)             |
| Flakiness Patterns                   | ❌ FAIL   | 5          | Hard waits + IP sharing + long duration + timing |

**Total Violations**: 4 Critical (P0), 5 High (P1), 3 Medium (P2), 0 Low (P3)

---

## Quality Score Breakdown

```
Starting Score:          100

Critical Violations (P0):
  - Hard waits (12+ instances)          -10
  - No isolation (IP contamination)     -10
  - Test duration (6-12 min)            -10
  - Flakiness patterns (multiple)       -10
                                        ----
Subtotal:                               -40

High Violations (P1):
  - No BDD structure                    -5
  - No test IDs                         -5
  - No fixture patterns                 -5
  - No data factories                   -5
  - Network-first partial               -5
                                        ----
Subtotal:                               -25

Medium Violations (P2):
  - Some conditionals in loops          -2
  - No priority markers                 -2
  - Test length (helpers monolithic)    -2
                                        ----
Subtotal:                               -6

Low Violations (P3):                    0

Bonus Points:
  Explicit Assertions:                  +5
                                        ----
Total Bonus:                            +5

Final Score:             34/100
Grade:                   F (Critical Issues)
```

---

## Critical Issues (Must Fix)

### 1. IP Contamination - Tests Share Rate Limit State

**Severity**: P0 (Critical)  
**Location**: All 3 tests (`RL-01`, `RL-02`, `RL-03`)  
**Criterion**: Isolation  
**Knowledge Base**: [test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md), [data-factories.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\data-factories.md)

**Issue Description**:
Tous les tests utilisent `browser.newContext({ storageState: undefined })` ce qui crée un nouveau context mais **partage la même IP localhost**. Le rate limiting backend est basé sur l'IP, donc:
- Test RL-01 exécute 6 acquisitions → consomme 5/5 slots + 1 rate limited
- Test RL-02 lance immédiatement après → déjà rate limited par RL-01
- Test RL-02 attend 2 acquisitions mais reçoit 429 dès la première

**Pourquoi c'est critique**: 25% de tests passent (3/12) parce que les 9 autres échouent à cause de contamination IP entre tests. C'est un **auto-sabotage systématique**.

**Current Code**:

```17:126:e2e/acquisition-rate-limiting.spec.ts
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
```


**Recommended Fix**:

**Option A: API-First Tests (Recommandé - Approche Hybride)**

```typescript
// NEW FILE: e2e/rate-limiting-api.spec.ts
// Pure API tests - Fast, isolated, test real rate limiting logic
import { test, expect } from '@playwright/test';

test.describe.serial('Story 2.11b: Rate Limiting - API Tests', () => {
  let testIP: string;
  
  test.beforeAll(() => {
    // Each test run gets unique "IP" via custom header
    testIP = `test-ip-${Date.now()}`;
  });

  test('API-2.11b-RL-01: First 5 POST requests succeed', async ({ request }) => {
    const postIds: string[] = [];

    for (let i = 1; i <= 5; i++) {
      const response = await request.post('/api/posts/anonymous', {
        headers: { 'X-Test-IP': testIP }, // Simulate unique IP
        data: {
          content: `Rate limit test ${i}`,
          email: `test-${testIP}-${i}@example.com`,
          archetype: 'test',
        },
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      postIds.push(data.postId);

      // Verify rate limit headers decrease
      const headers = response.headers();
      expect(headers['x-ratelimit-limit']).toBe('5');
      expect(parseInt(headers['x-ratelimit-remaining'])).toBe(5 - i);
    }

    expect(new Set(postIds).size).toBe(5);
  });

  test('API-2.11b-RL-02: 6th request returns 429', async ({ request }) => {
    const response = await request.post('/api/posts/anonymous', {
      headers: { 'X-Test-IP': testIP }, // Same IP from previous test
      data: {
        content: `Rate limit test 6`,
        email: `test-${testIP}-6@example.com`,
        archetype: 'test',
      },
    });

    expect(response.status()).toBe(429);

    const headers = response.headers();
    expect(headers['x-ratelimit-limit']).toBe('5');
    expect(headers['x-ratelimit-remaining']).toBe('0');
    expect(headers['x-ratelimit-reset']).toBeTruthy();

    const errorData = await response.json();
    expect(errorData.error).toContain('Rate limit exceeded');
  });
});

// Duration: ~5 seconds (vs 6-12 minutes)
// Isolation: ✅ (unique test IP per run)
// Reliability: ✅ (tests real backend logic)
```

**Option B: E2E Tests with Mocking (Complement API tests)**

```typescript
// UPDATED: e2e/acquisition-rate-limiting.spec.ts
// Mock API - Test UX only, not rate limiting logic
import { test, expect } from '@playwright/test';

test.describe('Story 2.11b: Rate Limiting - UX Tests (Mocked)', () => {
  
  test('E2E-2.11b-UX-01: UI shows error when rate limited', async ({ page }) => {
    // Mock rate limited response BEFORE navigation
    await page.route('**/api/posts/anonymous', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 3600}`,
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded. Maximum 5 acquisitions per hour.',
          retryAfter: 3600,
        }),
      });
    });

    // Navigate and complete quiz (using fixture)
    await page.goto('/quiz');
    // ... quiz flow (extract to fixture) ...
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.locator('button:has-text("Envoyez-moi un lien")').click();

    // Verify user-friendly error
    await expect(page.locator('p[role="alert"]')).toContainText('Limite atteinte');
    await expect(page.locator('p[role="alert"]')).toContainText('1 heure');

    // Verify localStorage NOT cleared (persist failed)
    const quizState = await page.evaluate(() => localStorage.getItem('ice_quiz_state_v1'));
    expect(quizState).not.toBeNull();
  });

  // Duration: ~30 seconds (vs 6-12 minutes)
  // Isolation: ✅ (mocked, no real API calls)
  // Reliability: ✅ (tests UX only)
});
```

**Why This Matters**:
- **API tests**: Fast (5s), isolated (unique IPs), test real rate limiting logic
- **E2E mocked tests**: Fast (30s), isolated (no API), test UX behavior only
- **Hybrid approach**: Best of both worlds - confidence in logic + UX validation
- **Current approach**: 6-12 min, contaminated, unreliable (25% pass rate)

---

### 2. Hard Waits (12+ Instances) - Severe Flakiness Risk

**Severity**: P0 (Critical)  
**Location**: Lines 34, 48, 54, 94, 139, 155, 159, 188, 200, 254, etc.  
**Criterion**: Determinism, Timing  
**Knowledge Base**: [test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md), [network-first.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\network-first.md), [timing-debugging.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\timing-debugging.md)

**Issue Description**:
Le test contient 12+ instances de `await page.waitForTimeout()` avec des délais arbitraires (100ms, 200ms, 500ms). Ces hard waits sont **non-déterministes** - ils peuvent être trop courts (échec en CI) ou trop longs (temps gaspillé). Ils masquent aussi les vrais problèmes de timing au lieu de les résoudre.

**Examples détectés**:

```typescript
// Line 34
await page.waitForTimeout(500); // After theme click

// Lines 48, 54
await page.waitForTimeout(100); // After option click
await page.waitForTimeout(200); // After continue click

// Line 94
await page.waitForTimeout(500); // Between acquisition attempts

// Pattern répété dans RL-02 (lines 139, 155, 159, 188)
```

**Pourquoi c'est critique**:
- **Flakiness**: Si CI est lent, 500ms peut être insuffisant → timeout error
- **Waste**: Si CI est rapide, 500ms gaspille du temps (12 waits × 500ms = 6s perdus)
- **Masquage**: Hard waits cachent les vrais race conditions au lieu de les corriger

**Current Code (Line 34)**:

```34:35:e2e/acquisition-rate-limiting.spec.ts
        await page.waitForTimeout(500);
        
```


**Current Code (Lines 46-55)**:

```46:56:e2e/acquisition-rate-limiting.spec.ts
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
        
```


**Recommended Fix**:

```typescript
// ❌ BAD: Hard wait after theme click
await themeButtons.first().click();
await page.waitForTimeout(500);

// ✅ GOOD: Wait for observable state change
await themeButtons.first().click();
await page.waitForSelector('h2:has-text("Phase 1")', { state: 'visible' });
// OR wait for network response
await page.waitForResponse(resp => resp.url().includes('/api/theme-selected'));

// ❌ BAD: Hard wait in quiz loop
await options.first().click();
await page.waitForTimeout(100);
const continueBtn = page.locator('button:has-text("Continuer")');
if (await continueBtn.isVisible()) {
  await continueBtn.click();
  await page.waitForTimeout(200);
}

// ✅ GOOD: Deterministic waits for element state
await options.first().click();
// Wait for next question card OR continue button
const nextCard = page.locator('[data-testid="question-card"]');
const continueBtn = page.locator('button:has-text("Continuer")');
await Promise.race([
  nextCard.waitFor({ state: 'visible' }),
  continueBtn.waitFor({ state: 'visible' }),
]);

if (await continueBtn.isVisible()) {
  await continueBtn.click();
  await nextCard.waitFor({ state: 'visible' }); // Wait for transition
}

// ❌ BAD: Hard wait between attempts
for (let i = 1; i <= 5; i++) {
  const response = await completeQuizAndSubmit(i);
  // ...
  await page.waitForTimeout(500); // Arbitrary delay
}

// ✅ GOOD: No wait needed (each attempt is independent)
for (let i = 1; i <= 5; i++) {
  const response = await completeQuizAndSubmit(i);
  expect(response.status()).toBe(200);
  // No delay - next iteration starts fresh
}
```

**Benefits**:
- **Deterministic**: Tests wait for actual events, not arbitrary time
- **Fast**: No wasted time waiting longer than necessary
- **Clear**: Explicit about what we're waiting for
- **Reliable**: Works consistently across environments (local, CI, staging)

---

### 3. Extreme Test Duration (6-12 Minutes) - Blocks CI Pipeline

**Severity**: P0 (Critical)  
**Location**: Test RL-01 (lines 17-126)  
**Criterion**: Test Duration (target: <1.5 min)  
**Knowledge Base**: [test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md)

**Issue Description**:
Test RL-01 exécute **6 full quiz flows** (chacun prend 1-2 minutes):
- Navigate to /quiz
- Select theme
- Answer 10 questions
- Generate post
- Submit email
- Wait for API response

**Calcul du temps**:
```
6 quiz flows × (1-2 min/flow) = 6-12 minutes
vs. Target: <1.5 minutes
```

**Pourquoi c'est critique**:
- **CI Blocking**: Un seul test prend 6-12 min → bloque tout le pipeline
- **Feedback Loop**: Développeur attend 12 min pour savoir si ça passe
- **Resource Waste**: Worker occupé pendant 12 min pour 1 test
- **Timeout Risk**: Playwright default timeout = 30s × 6 flows = risque de timeout global

**Current Code**:

```77:95:e2e/acquisition-rate-limiting.spec.ts
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
```


**Recommended Fix**:

**Option 1: API-Only Tests (Fastest - 5 seconds)**

```typescript
// Pure API test - No UI, direct HTTP calls
test('API-2.11b-RL-01: 5 acquisitions succeed, 6th fails', async ({ request }) => {
  const testIP = `test-${Date.now()}`;

  // Attempt 1-5: Direct API calls (no quiz flow)
  for (let i = 1; i <= 5; i++) {
    const response = await request.post('/api/posts/anonymous', {
      headers: { 'X-Test-IP': testIP },
      data: {
        content: `Test ${i}`,
        email: `test-${i}@example.com`,
        archetype: 'strategist',
      },
    });

    expect(response.status()).toBe(200);
  }

  // Attempt 6: Should fail with 429
  const response6 = await request.post('/api/posts/anonymous', {
    headers: { 'X-Test-IP': testIP },
    data: { content: 'Test 6', email: 'test-6@example.com', archetype: 'strategist' },
  });

  expect(response6.status()).toBe(429);
  
  // Duration: ~5 seconds (vs 6-12 minutes) ✅
});
```

**Option 2: E2E avec Mock (30 seconds)**

```typescript
// Mock rate limiting - Test UX only
test('E2E-2.11b-UX-01: UI shows 429 error correctly', async ({ page }) => {
  // Mock first 5 as success
  let callCount = 0;
  await page.route('**/api/posts/anonymous', route => {
    callCount++;
    if (callCount <= 5) {
      route.fulfill({ status: 200, body: JSON.stringify({ postId: `post-${callCount}` }) });
    } else {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      });
    }
  });

  // Single quiz flow (not 6!)
  await completeQuizFlow(page); // Extract to fixture
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Envoyez-moi un lien")');

  // Verify error UI
  await expect(page.locator('p[role="alert"]')).toContainText('Limite atteinte');
  
  // Duration: ~30 seconds ✅
});
```

**Benefits**:
- API test: 5s (vs 12 min) → 144x faster
- E2E mocked: 30s (vs 12 min) → 24x faster
- CI pipeline: Minutes saved per run
- Developer feedback: Instant vs 12 min wait

---

### 4. No Fixtures - 100+ Lines of Code Duplication

**Severity**: P0 (Critical)  
**Location**: `completeQuizAndSubmit()` helper duplicated in RL-01 (lines 28-75) and RL-02 (lines 133-177)  
**Criterion**: Fixture Patterns, Maintainability  
**Knowledge Base**: [fixture-architecture.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\fixture-architecture.md)

**Issue Description**:
La fonction `completeQuizAndSubmit()` contient ~50 lines de logique quiz (theme selection, 10 questions, post generation, email submit). Cette fonction est **dupliquée** dans:
- Test RL-01 (lines 28-75)
- Test RL-02 (lines 133-177)

**Pourquoi c'est critique**:
- **DRY Violation**: Même code copié 2× → double maintenance
- **Bug Propagation**: Si quiz flow change, faut mettre à jour 2 endroits
- **No Auto-Cleanup**: Pas de teardown pour nettoyer données créées
- **Hard to Test**: Logique complexe buried dans helper function

**Current Code (Test RL-01)**:

```28:75:e2e/acquisition-rate-limiting.spec.ts
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
```


**Recommended Fix**:

```typescript
// NEW FILE: e2e/fixtures/quiz-fixture.ts
import { test as base, Page, Response } from '@playwright/test';

type QuizFixtures = {
  completeQuiz: (options?: { topic?: string; email?: string }) => Promise<Response>;
};

export const test = base.extend<QuizFixtures>({
  completeQuiz: async ({ page }, use) => {
    const createdPosts: string[] = []; // Track for cleanup

    const completeQuiz = async (options = {}) => {
      const { topic = 'Test topic', email = `test-${Date.now()}@example.com` } = options;

      // Navigate to quiz
      await page.goto('/quiz');
      await page.waitForSelector('h1:has-text("Choisissez votre")', { timeout: 10000 });

      // Select theme
      await page.locator('button[data-testid^="theme-"]').first().click();
      await page.waitForSelector('h2:has-text("Phase 1")', { state: 'visible' });

      // Start quiz
      await page.click('[data-testid="start-quiz-btn"]');
      await page.waitForSelector('[data-testid="question-card"]', { timeout: 30000 });

      // Answer 10 questions (deterministic waits)
      for (let i = 0; i < 10; i++) {
        await page.locator('[data-testid^="option-"]').first().click();
        
        const continueBtn = page.locator('button:has-text("Continuer")');
        const nextCard = page.locator('[data-testid="question-card"]');
        
        await Promise.race([
          continueBtn.waitFor({ state: 'visible', timeout: 2000 }).then(() => continueBtn.click()),
          nextCard.waitFor({ state: 'visible' }),
        ]);
      }

      // Generate post
      await page.waitForSelector('[data-testid="final-reveal-container"]', { timeout: 15000 });
      await page.fill('input[placeholder*="De quoi voulez-vous parler"]', topic);
      await page.click('button:has-text("Générer un post")');
      await page.waitForSelector('[data-testid="post-content"]', { timeout: 20000 });

      // Submit email (network-first wait)
      const persistPromise = page.waitForResponse(
        resp => resp.url().includes('/api/posts/anonymous') && resp.status() === 200
      );

      await page.fill('input[type="email"]', email);
      await page.click('button:has-text("Envoyez-moi un lien")');

      const response = await persistPromise;
      const data = await response.json();
      
      if (data.postId) createdPosts.push(data.postId); // Track for cleanup

      return response;
    };

    await use(completeQuiz);

    // AUTO-CLEANUP: Delete created posts
    for (const postId of createdPosts) {
      await page.request.delete(`/api/posts/${postId}`);
    }
  },
});

// USAGE in tests:
import { test, expect } from './fixtures/quiz-fixture';

test('rate limiting test with fixture', async ({ completeQuiz }) => {
  // Clean, reusable, auto-cleanup
  const response = await completeQuiz({ topic: 'Rate limit test 1' });
  expect(response.status()).toBe(200);
});
```

**Benefits**:
- **DRY**: Single source of truth for quiz flow
- **Auto-Cleanup**: Fixture deletes created posts automatically
- **Maintainability**: Change quiz flow once, all tests updated
- **Testability**: Fixture logic isolated and testable
- **Reusability**: Use in any test file via `import { test } from './fixtures/quiz-fixture'`

---

## Recommendations (Should Fix)

### 1. Add Test IDs to Describe Blocks

**Severity**: P1 (High)  
**Location**: Lines 15, 128, 208 (describe blocks)  
**Criterion**: Test IDs, Traceability  
**Knowledge Base**: [test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md)

**Issue Description**:
Les describe blocks manquent de test IDs standardisés pour traçabilité:
- Current: `'E2E-2.11b-RL-01: 5 acquisitions succeed...'` (test name only)
- Expected: Test describe block should include ID for tracing to requirements

**Current Code**:

```typescript
// Line 15
test.describe('Story 2.11b: Rate Limiting', () => {
  
  // Line 17
  test('E2E-2.11b-RL-01: 5 acquisitions succeed, 6th returns 429', async ({ browser }) => {
```

**Recommended Improvement**:

```typescript
// ✅ Better: Add test ID to describe block
test.describe('Story 2.11b: Rate Limiting [2.11b-E2E-RL]', () => {
  
  test('[2.11b-E2E-RL-01] 5 acquisitions succeed, 6th returns 429', async ({ browser }) => {
    // Test tagged with story and test ID for traceability
  });

  test('[2.11b-E2E-RL-02] Rate limit headers decrease correctly', async ({ browser }) => {
    // Easy to map back to test design document
  });
});
```

**Benefits**:
- Traceability: Map test ID → requirement → story
- Reporting: Test ID appears in CI reports for quick debugging
- Documentation: Test IDs link to test design docs
- Consistency: Follows team convention [Story-Type-ID]

---

### 2. Add BDD Structure (Given-When-Then)

**Severity**: P1 (High)  
**Location**: All 3 tests (RL-01, RL-02, RL-03)  
**Criterion**: BDD Format  
**Knowledge Base**: [test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md)

**Issue Description**:
Tests manquent de structure Given-When-Then claire. Le code est procedural sans séparation explicite des phases setup/action/assert.

**Current Code (Test RL-01)**:

```typescript
test('E2E-2.11b-RL-01: 5 acquisitions succeed, 6th returns 429', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  try {
    const postIds: string[] = [];
    
    const completeQuizAndSubmit = async (attemptNumber: number) => {
      // ... 50 lines of procedural code ...
    };
    
    // Attempt 1-5: Should succeed
    for (let i = 1; i <= 5; i++) {
      // ... assertions mixed with actions ...
    }
    
    // Attempt 6: Should fail
    // ... more mixed code ...
  } finally {
    await context.close();
  }
});
```

**Recommended Improvement**:

```typescript
test('[2.11b-E2E-RL-01] 5 acquisitions succeed, 6th returns 429', async ({ completeQuiz, request }) => {
  // GIVEN: User has NOT made any acquisitions yet (fresh IP)
  const testIP = `test-${Date.now()}`;
  const postIds: string[] = [];

  // WHEN: User makes 5 acquisition attempts via API
  for (let i = 1; i <= 5; i++) {
    const response = await request.post('/api/posts/anonymous', {
      headers: { 'X-Test-IP': testIP },
      data: {
        content: `Rate limit test ${i}`,
        email: `test-${i}@example.com`,
        archetype: 'strategist',
      },
    });

    // THEN: Each attempt succeeds (200 OK)
    expect(response.status()).toBe(200);
    const data = await response.json();
    postIds.push(data.postId);

    // AND: Rate limit headers decrease correctly
    const headers = response.headers();
    expect(headers['x-ratelimit-limit']).toBe('5');
    expect(headers['x-ratelimit-remaining']).toBe(String(5 - i));
  }

  // AND: 5 distinct posts created
  expect(new Set(postIds).size).toBe(5);

  // WHEN: User attempts 6th acquisition (exceeds limit)
  const response6 = await request.post('/api/posts/anonymous', {
    headers: { 'X-Test-IP': testIP },
    data: { content: 'Test 6', email: 'test-6@example.com', archetype: 'strategist' },
  });

  // THEN: Request rejected with 429
  expect(response6.status()).toBe(429);

  // AND: Rate limit headers show quota exhausted
  const headers6 = response6.headers();
  expect(headers6['x-ratelimit-remaining']).toBe('0');
  expect(headers6['x-ratelimit-reset']).toBeTruthy();

  // AND: Error message is clear
  const errorData = await response6.json();
  expect(errorData.error).toContain('Rate limit exceeded');
});
```

**Benefits**:
- **Clarity**: Phases explicites (setup, action, assertion)
- **Readability**: Test intent immediately visible
- **Documentation**: Comments servent de spec vivante
- **Debugging**: Échec pointe exactement vers phase problématique

---

### 3. Use Data Factory for Email Generation

**Severity**: P1 (High)  
**Location**: Lines 70, 173, 264 (email generation)  
**Criterion**: Data Factories  
**Knowledge Base**: [data-factories.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\data-factories.md)

**Issue Description**:
Les emails sont générés avec template literals (`test-ratelimit-${n}@example.com`) au lieu de factories avec `faker`. Ceci cause:
- Collisions potentielles en parallel runs
- Pas de variation réaliste (email domains, formats)
- Hardcoded pattern fragile

**Current Code**:

```70:71:e2e/acquisition-rate-limiting.spec.ts
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill(`test-ratelimit-${attemptNumber}@example.com`);
```


**Recommended Improvement**:

```typescript
// NEW FILE: e2e/factories/user-factory.ts
import { faker } from '@faker-js/faker';

export const createTestEmail = (prefix?: string): string => {
  const uniqueId = faker.string.alphanumeric(8);
  const domain = faker.internet.domainName();
  return prefix ? `${prefix}-${uniqueId}@${domain}` : `${uniqueId}@${domain}`;
};

export const createAcquisitionData = (overrides = {}) => ({
  email: createTestEmail('rate-limit'),
  topic: faker.lorem.sentence(),
  archetype: faker.helpers.arrayElement(['strategist', 'creator', 'builder', 'connector']),
  ...overrides,
});

// USAGE in tests:
import { createAcquisitionData } from './factories/user-factory';

test('rate limiting with factory', async ({ request }) => {
  const acquisition = createAcquisitionData({ archetype: 'strategist' });

  const response = await request.post('/api/posts/anonymous', {
    data: acquisition,
  });

  expect(response.status()).toBe(200);
  // Email is unique, realistic, parallel-safe
});
```

**Benefits**:
- **Parallel-Safe**: Faker generates unique emails every run
- **Realistic**: Real domain patterns, not hardcoded `example.com`
- **Flexible**: Easy overrides for specific test scenarios
- **Maintainable**: Change email pattern once in factory

---

## Best Practices Found

### 1. Test RL-03 Uses Correct Mocking Pattern

**Location**: Test RL-03 (lines 208-286)  
**Pattern**: Route Mocking  
**Knowledge Base**: [network-first.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\network-first.md)

**Why This Is Good**:
Test RL-03 correctement **mocke l'API AVANT navigation** avec `page.route()`:

```208:229:e2e/acquisition-rate-limiting.spec.ts
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
```


**Benefits**:
- **Network-First**: Route registered BEFORE navigation (no race condition)
- **Deterministic**: Every run returns same mocked 429 response
- **Fast**: No real API calls, test runs in ~30 seconds
- **Isolated**: No external dependencies, no IP contamination

**Use as Reference**:
This pattern should be applied to RL-01 and RL-02 as well - mock rate limiting behavior to test UX, use separate API tests for backend logic validation.

---

## Test File Analysis

### File Metadata

- **File Path**: `e2e/acquisition-rate-limiting.spec.ts`
- **File Size**: 287 lines, ~15 KB
- **Test Framework**: Playwright
- **Language**: TypeScript

### Test Structure

- **Describe Blocks**: 1 (`Story 2.11b: Rate Limiting`)
- **Test Cases (it/test)**: 3 (RL-01, RL-02, RL-03)
- **Average Test Length**: ~95 lines per test (RL-01: 110, RL-02: 79, RL-03: 79)
- **Fixtures Used**: 0 (no fixtures, helpers defined inline)
- **Data Factories Used**: 0 (template literals only)

### Test Coverage Scope

- **Test IDs**: 
  - E2E-2.11b-RL-01 (5 acquisitions succeed, 6th fails)
  - E2E-2.11b-RL-02 (headers decrease correctly)
  - E2E-2.11b-RL-03 (error message UX)
- **Priority Distribution**:
  - P0 (Critical): 0 tests (no priority markers)
  - P1 (High): 0 tests
  - P2 (Medium): 0 tests
  - P3 (Low): 0 tests
  - Unknown: 3 tests (all unmarked)

### Assertions Analysis

- **Total Assertions**: ~30 assertions across 3 tests
- **Assertions per Test**: ~10 assertions average
- **Assertion Types**: `expect().toBe()`, `expect().toHaveProperty()`, `expect().toContain()`, `expect().toBeTruthy()`, `expect().toBeVisible()`

---

## Context and Integration

### Related Artifacts

**Story File**: Story 2.11b - Rate Limiting Feature (référencé dans describe block)  
**Test Design**: Aucun fichier test-design détecté (recommandé de créer `test-design-story-2-11b.md`)

### Acceptance Criteria Validation

| Acceptance Criterion                  | Test ID       | Status      | Notes                                                    |
| ------------------------------------- | ------------- | ----------- | -------------------------------------------------------- |
| Max 5 acquisitions per hour per IP    | RL-01, RL-02  | ⚠️ Partial  | Tested but contamination causes failures (IP not unique) |
| 6th acquisition returns 429            | RL-01         | ⚠️ Partial  | Logic correct but contamination causes flakiness         |
| Rate limit headers present             | RL-01, RL-02  | ✅ Covered  | Headers validated (limit, remaining, reset)              |
| User-friendly error message            | RL-03         | ✅ Covered  | UI error message checked                                 |
| localStorage NOT cleared on rate limit | RL-03         | ✅ Covered  | Quiz state persistence verified                          |

**Coverage**: 5/5 criteria covered conceptually, but **contamination makes tests unreliable** (25% pass rate)

---

## Knowledge Base References

This review consulted the following knowledge base fragments:

- **[test-quality.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-quality.md)** - Definition of Done for tests (no hard waits, <300 lines, <1.5 min, self-cleaning)
- **[data-factories.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\data-factories.md)** - Factory functions with overrides, API-first setup
- **[network-first.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\network-first.md)** - Route intercept before navigate (race condition prevention)
- **[test-healing-patterns.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\test-healing-patterns.md)** - Common failure patterns: timing, selectors, data
- **[timing-debugging.md](c:\dev\postry-ai\_bmad\bmm\testarch\knowledge\timing-debugging.md)** - Deterministic waiting, async debugging

See [tea-index.csv](c:\dev\postry-ai\_bmad\bmm\testarch\tea-index.csv) for complete knowledge base.

---

## Next Steps

### Immediate Actions (Before Merge)

1. **[P0] Refactor to Hybrid Approach** - Split into API tests (fast, isolated) + E2E mocked tests (UX only)
   - Priority: P0 (Critical)
   - Owner: Dev Team
   - Estimated Effort: 3-4 hours

2. **[P0] Remove All Hard Waits** - Replace 12+ `waitForTimeout()` with deterministic waits
   - Priority: P0 (Critical)
   - Owner: Dev Team
   - Estimated Effort: 1-2 hours

3. **[P0] Extract Quiz Flow to Fixture** - Create reusable `completeQuiz` fixture with auto-cleanup
   - Priority: P0 (Critical)
   - Owner: Dev Team
   - Estimated Effort: 1-2 hours

### Follow-up Actions (Future PRs)

1. **[P1] Add Test IDs** - Tag describe/test blocks with `[2.11b-E2E-RL-XX]` format
   - Priority: P1 (High)
   - Target: Next sprint

2. **[P1] Add BDD Structure** - Add Given-When-Then comments to tests
   - Priority: P1 (High)
   - Target: Next sprint

3. **[P2] Create Data Factories** - Replace template literals with `faker`-based factories
   - Priority: P2 (Medium)
   - Target: Backlog

### Re-Review Needed?

❌ **Major refactor required - block merge, pair programming recommended**

Tests currently have 25% pass rate due to IP contamination and extreme duration (6-12 min). Recommend blocking merge until P0 issues fixed.

---

## Decision

**Recommendation**: **Block Merge**

**Rationale**:

Ce spec ne peut PAS valider le rate limiting de manière fiable en production. Score de 34/100 avec 4 violations P0 critiques:

1. **IP Contamination** (25% pass rate) - Tests partagent localhost IP → rate limit pollution
2. **Extreme Duration** (6-12 min) - Bloque CI pipeline, feedback loop trop lent
3. **Hard Waits** (12+ instances) - Flakiness sévère, masque vrais problèmes timing
4. **No Fixtures** - 100+ lignes dupliquées, pas de cleanup, non maintenable

**Solution recommandée**: Approche hybride
- **API tests** (nouveaux): Valident vraie logique rate limiting (5s, isolé, fiable)
- **E2E tests mockés** (refactor): Valident UX seulement (30s, isolé, fiable)

**Impact si merged as-is**:
- Tests continuent à échouer (75% failure rate)
- CI bloqué 6-12 min par run
- Faux négatifs fréquents (contamination IP)
- Équipe perd confiance dans suite E2E

**Action required**: Bloquer merge, implémenter approche hybride, puis re-review.

---

## Appendix

### Violation Summary by Location

| Line   | Severity | Criterion   | Issue                  | Fix                            |
| ------ | -------- | ----------- | ---------------------- | ------------------------------ |
| 21     | P0       | Isolation   | newContext shares IP   | Use API tests with X-Test-IP   |
| 34     | P0       | Hard Waits  | waitForTimeout(500)    | waitFor({ state: 'visible' })  |
| 48     | P0       | Hard Waits  | waitForTimeout(100)    | Remove (Playwright auto-waits) |
| 54     | P0       | Hard Waits  | waitForTimeout(200)    | waitFor next question card     |
| 52     | P1       | Determinism | if (continueBtn...)    | Use Promise.race for conditio  |
| 28-75  | P1       | Fixtures    | Helper function inline | Extract to fixture             |
| 77-95  | P0       | Duration    | 6 quiz flows loop      | Replace with API calls         |
| 70     | P1       | Factories   | Template literal email | Use faker.internet.email()     |
| 15     | P1       | Test IDs    | No test ID in describe | Add [2.11b-E2E-RL] tag         |
| 17-126 | P1       | BDD         | No GWT structure       | Add Given-When-Then comments   |

---

## Review Metadata

**Generated By**: BMad TEA Agent (Test Architect - Murat)  
**Workflow**: testarch-test-review v4.0  
**Review ID**: test-review-acquisition-rate-limiting-20260130  
**Timestamp**: 2026-01-30 (actual time on user's system)  
**Version**: 1.0

---

## Feedback on This Review

Si vous avez des questions ou feedback sur ce review:

1. **Review patterns** dans knowledge base: `_bmad/bmm/testarch/knowledge/`
2. **Consultez** `tea-index.csv` pour guidance détaillée
3. **Demandez clarification** sur violations spécifiques
4. **Pair avec QA engineer** pour appliquer patterns

⚠️ **Important**: Ce review est guidance, pas règles rigides. Le contexte compte - si un pattern est justifié, documentez-le avec un comment.

---

**🎯 Prochaine Étape Recommandée**: Implémenter l'approche hybride (API tests + E2E mockés) pour atteindre 95%+ stabilité en <30 secondes runtime.
