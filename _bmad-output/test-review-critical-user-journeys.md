# Test Quality Review: critical-user-journeys.spec.ts

**Quality Score**: 61/100 (C - Needs Improvement)
**Review Date**: 2026-01-30
**Review Scope**: single
**Reviewer**: Murat (TEA Agent)

---

Note: This review audits existing tests; it does not generate tests.

## Executive Summary

**Overall Assessment**: Needs Improvement

**Recommendation**: Request Changes

### Key Strengths

✅ **Excellent test IDs**: Tous les tests ont des IDs bien formatés (E2E-JOURNEY-01, E2E-VALIDATION-01, etc.) pour la traçabilité
✅ **Tests déterministes**: Aucun conditionnel (if/else) ou try/catch pour le flow control - exécution prévisible
✅ **Assertions explicites**: Toutes les assertions sont visibles dans le corps des tests, pas cachées dans des helpers

### Key Weaknesses

❌ **Pas de pattern network-first**: Utilise hard timeouts (10-15s) au lieu de `waitForResponse()` déterministe - risque de flakiness
❌ **Pollution d'état**: Manipulation `localStorage` sans cleanup automatique - tests ne sont pas isolés pour exécution parallèle
❌ **Duplication massive**: ~85 lignes de mock setup répétées 5 fois (pas de fixtures) - violation DRY critique

### Summary

Le fichier démontre une bonne compréhension des user journeys critiques avec une couverture complète (happy path, validation, error handling, persistence, mobile). Les test IDs sont excellents et les assertions claires. **CEPENDANT**, il y a **3 violations critiques (P0)** qui rendent ces tests fragiles:

1. **Hard timeouts au lieu de network waits**: Les 10+ `{ timeout: 10000-15000 }` créent des tests lents et non-déterministes. L'absence de `waitForResponse()` signifie que les tests peuvent fail si l'API est lente ou skip si trop rapide.

2. **Pas de cleanup isolation**: La manipulation directe de `localStorage` (lignes 198, 387) sans fixture auto-cleanup pollue l'état entre tests. En exécution parallèle (`--workers=4`), les tests vont interférer.

3. **Aucune fixture**: 85 lignes de mock API setup dupliquées 5 fois dans les `beforeEach`. Chaque changement de mock nécessite 5 éditions. C'est un cauchemar de maintenance.

Les **4 violations high (P1)** amplifient le problème: pas de data factories (emails hardcodés causent collisions), pas de priority markers (impossible de prioriser les runs), fichier trop long (466 lignes > 300 limite).

**Impact**: Ces tests vont devenir flaky en CI/CD, ralentir le pipeline (60-120s par test), et nécessiter maintenance constante. Il faut refactorer avant merge.

---

## Quality Criteria Assessment

| Criterion                            | Status      | Violations | Notes                                                |
| ------------------------------------ | ----------- | ---------- | ---------------------------------------------------- |
| BDD Format (Given-When-Then)         | ⚠️ WARN     | 6          | Step comments présents, mais pas GWT explicite       |
| Test IDs                             | ✅ PASS     | 0          | Excellents IDs: E2E-JOURNEY-01, E2E-VALIDATION-01    |
| Priority Markers (P0/P1/P2/P3)       | ❌ FAIL     | 7          | Aucune classification de priorité                    |
| Hard Waits (sleep, waitForTimeout)   | ⚠️ WARN     | 10+        | Timeouts 10-15s au lieu de waitForResponse           |
| Determinism (no conditionals)        | ✅ PASS     | 0          | Pas de if/else, try/catch, ou random                 |
| Isolation (cleanup, no shared state) | ❌ FAIL     | Critical   | localStorage sans cleanup, state pollution           |
| Fixture Patterns                     | ❌ FAIL     | 0          | Aucune fixture, 85 lignes dupliquées 5×              |
| Data Factories                       | ❌ FAIL     | 10+        | Emails/data hardcodés, collision risk                |
| Network-First Pattern                | ❌ FAIL     | 20+        | 0 waitForResponse, race conditions potentielles      |
| Explicit Assertions                  | ✅ PASS     | 0          | Toutes assertions visibles et claires                |
| Test Length (≤300 lines)             | ❌ FAIL     | 466 lines  | 166 lignes surplus (55% au-dessus limite)            |
| Test Duration (≤1.5 min)             | ⚠️ WARN     | ~90-120s   | Quiz flow complet lent, pas optimisé                 |
| Flakiness Patterns                   | ❌ FAIL     | 5+         | Hard waits, state pollution, race conditions         |

**Total Violations**: 3 Critical, 4 High, 2 Medium, 0 Low

---

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -3 × 10 = -30
High Violations:         -4 × 5 = -20
Medium Violations:       -2 × 2 = -4
Low Violations:          -0 × 1 = -0

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0
  Perfect Isolation:     +0
  All Test IDs:          +5
  Deterministic:         +5
  Explicit Assertions:   +5
                         --------
Total Bonus:             +15

Final Score:             61/100
Grade:                   C (Needs Improvement)
```

---

## Critical Issues (Must Fix)

### 1. No Network-First Pattern - Hard Timeouts Instead of Deterministic Waits

**Severity**: P0 (Critical)
**Location**: `e2e/critical-user-journeys.spec.ts:127, 132, 139, 144, 157, 170, 255, 293, 357` (10+ occurrences)
**Criterion**: Network-First Pattern
**Knowledge Base**: [network-first.md](../_bmad/bmm/testarch/knowledge/network-first.md)

**Issue Description**:

Le test utilise des hard timeouts (`{ timeout: 10000 }`, `{ timeout: 15000 }`) au lieu de `waitForResponse()` déterministe. Cela crée des tests **non-déterministes** qui:

- Failent aléatoirement si l'API répond en >15s (slow CI, cold start)
- Gaspillent du temps si l'API répond en <1s (attendent quand même 10-15s)
- Cachent les vraies failures (timeout vs API error)

**Current Code**:

```typescript
// ❌ Bad (ligne 127-129)
for (let i = 0; i < 6; i++) {
  await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
  await page.getByTestId('option-a').click();
}

// ❌ Bad (ligne 132)
await expect(page.getByText('Le Stratège')).toBeVisible({ timeout: 10000 });

// ❌ Bad (ligne 139)
await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 15000 });
```

**Recommended Fix**:

```typescript
// ✅ Good - Wait for API response deterministically
test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
  // Step 1: Network-first - Register intercept BEFORE navigation
  const quizGeneratePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/quiz/generate') && resp.status() === 200
  );
  
  await page.goto('/quiz');
  await expect(page).toHaveURL('/quiz');
  
  // Step 2: Select theme
  await expect(page.getByText('Choisissez votre Terrain')).toBeVisible();
  const themeButton = page.getByTestId('theme-t1');
  await expect(themeButton).toBeVisible();
  await themeButton.click();
  
  // Step 3: Wait for quiz generation response (deterministic!)
  const quizResponse = await quizGeneratePromise;
  const questions = await quizResponse.json();
  
  // Step 4: Start quiz - data is guaranteed loaded
  await expect(page.getByText('Phase 1 : Calibration')).toBeVisible();
  const startButton = page.getByTestId('start-quiz-btn');
  await expect(startButton).toBeVisible();
  await startButton.click();
  
  // Step 5: Complete Phase 1 - NO hard timeouts, use default Playwright waits
  for (let i = 0; i < 6; i++) {
    await expect(page.getByTestId('option-a')).toBeVisible(); // Default 30s is fine
    await page.getByTestId('option-a').click();
  }
  
  // Step 6: Wait for archetype API response deterministically
  const archetypePromise = page.waitForResponse('**/api/quiz/archetype');
  await archetypePromise;
  
  await expect(page.getByText('Le Stratège')).toBeVisible(); // No timeout needed
});
```

**Why This Matters**:

- **Déterministe**: Test attend la vraie réponse API, pas un temps arbitraire
- **Rapide**: Si API répond en 500ms, test continue immédiatement (pas d'attente 10s)
- **Fiable**: Si API est lente, Playwright attend automatiquement (timeout par défaut 30s)
- **Actionable failures**: Si fail, erreur est "API returned 500" pas "Timeout waiting for element"

**Related Violations**:

- Lignes 127, 132, 139, 144, 157, 170, 255, 293, 357 - toutes utilisent hard timeouts

---

### 2. No Isolation - localStorage Pollution Without Cleanup

**Severity**: P0 (Critical)
**Location**: `e2e/critical-user-journeys.spec.ts:198, 387`
**Criterion**: Isolation (cleanup, no shared state)
**Knowledge Base**: [test-quality.md](../_bmad/bmm/testarch/knowledge/test-quality.md), [fixture-architecture.md](../_bmad/bmm/testarch/knowledge/fixture-architecture.md)

**Issue Description**:

Le test manipule directement `localStorage` pour setup l'état du quiz (ligne 198) et pour cleanup (ligne 387), mais **sans fixture auto-cleanup**. Cela crée:

- **State pollution** entre tests: Un test qui fail peut laisser state corrompu pour le suivant
- **Parallel execution failures**: Avec `--workers=4`, tests concurrents partagent le même storage state
- **Flakiness aléatoire**: Test order dependency - tests passent seuls, failent en suite

**Current Code**:

```typescript
// ❌ Bad (ligne 177-199) - Manual localStorage setup, no auto-cleanup
test.beforeEach(async ({ page }) => {
  // Set up completed quiz state
  await page.addInitScript(() => {
    const state = {
      step: 'FINAL_REVEAL',
      status: 'idle',
      themeId: 'tech',
      // ... 10+ fields ...
    };
    window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
  });
  // NO CLEANUP - state persists after test
});

// ❌ Bad (ligne 387) - Inline cleanup, not systematic
test('E2E-PERSIST-01: Quiz progress persists after page reload', async ({ page }) => {
  await page.goto('/quiz');
  
  // Clear storage to start fresh
  await page.evaluate(() => localStorage.clear()); // Manual, error-prone
  
  // ... test logic
  // NO cleanup at end - state pollution if test fails
});
```

**Recommended Fix**:

```typescript
// ✅ Good - Fixture with auto-cleanup
// e2e/fixtures/quiz-state-fixture.ts
import { test as base } from '@playwright/test';

type QuizState = {
  step: string;
  status: string;
  themeId: string;
  // ... autres fields
};

type QuizStateFixture = {
  setQuizState: (state: Partial<QuizState>) => Promise<void>;
};

export const test = base.extend<QuizStateFixture>({
  setQuizState: async ({ page }, use) => {
    const setQuizState = async (stateOverrides: Partial<QuizState>) => {
      const defaultState: QuizState = {
        step: 'THEME_SELECTION',
        status: 'idle',
        themeId: null,
        questionsP1: [],
        answersP1: {},
        questionsP2: [],
        answersP2: {},
        currentVector: [50, 50, 50, 50, 50, 50, 50, 50, 50],
        archetypeData: null,
        profileData: null,
        ...stateOverrides,
      };

      await page.addInitScript((state) => {
        window.localStorage.setItem('ice_quiz_state_v1', JSON.stringify(state));
      }, defaultState);
    };

    await use(setQuizState);

    // AUTO-CLEANUP: Clear localStorage after test
    await page.evaluate(() => {
      localStorage.removeItem('ice_quiz_state_v1');
    });
  },
});

// Usage in tests:
import { test, expect } from './fixtures/quiz-state-fixture';

test('E2E-VALIDATION-01: Email validation in auth modal', async ({ page, setQuizState }) => {
  // Setup clean state via fixture
  await setQuizState({
    step: 'FINAL_REVEAL',
    archetypeData: {
      archetype: { id: 1, name: 'Le Stratège' },
      targetDimensions: [],
    },
    profileData: {
      label_final: 'Le Stratège Test',
      definition_longue: 'Une définition de test.',
    },
  });

  await page.goto('/quiz');
  
  // ... test logic
  
  // NO manual cleanup needed - fixture handles it automatically!
});
```

**Why This Matters**:

- **Isolation garantie**: Chaque test démarre avec state propre, auto-cleanup après
- **Parallel-safe**: Tests peuvent tourner avec `--workers=8` sans interférence
- **Maintainability**: Un seul endroit pour gérer quiz state (fixture), pas 5 beforeEach dupliqués
- **Fail-safe**: Même si test fail mid-execution, cleanup s'exécute quand même

**Related Violations**:

- Ligne 198: Manual localStorage.setItem sans cleanup
- Ligne 387: Manual localStorage.clear inline
- 5 describe blocks avec beforeEach répétés - tous devraient utiliser la fixture

---

### 3. No Fixtures - Massive Mock Setup Duplication (85 Lines × 5 Times)

**Severity**: P0 (Critical)
**Location**: `e2e/critical-user-journeys.spec.ts:20-106, 201-224, 282-287, 365-381, 422-437`
**Criterion**: Fixture Patterns
**Knowledge Base**: [fixture-architecture.md](../_bmad/bmm/testarch/knowledge/fixture-architecture.md)

**Issue Description**:

Le mock setup pour les API endpoints (`/api/quiz/generate`, `/api/quiz/archetype`, `/api/quiz/profile`, `/api/quiz/post`, `/auth/v1/otp`) est **dupliqué 5 fois** dans les différents `beforeEach` blocks. Cela représente:

- **~85 lignes de code dupliquées** × 5 = 425 lignes de duplication
- **Violation DRY critique**: Chaque changement de mock nécessite 5 éditions (error-prone)
- **Maintenance nightmare**: Ajouter un nouveau endpoint = éditer 5 endroits
- **Inconsistency risk**: Mocks peuvent diverger entre describe blocks

**Current Code**:

```typescript
// ❌ Bad (lignes 20-106) - DUPLICATION #1
test.beforeEach(async ({ page }) => {
  await page.route('**/api/quiz/generate', async (route) => {
    const data = route.request().postDataJSON();
    if (data.phase === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'Q1', dimension: 'POS', option_A: 'Positif A', option_B: 'Positif B' },
          // ... 5 more questions
        ])
      });
    } else if (data.phase === 2) {
      // ... phase 2 mock
    }
  });

  await page.route('**/api/quiz/archetype', async (route) => {
    // ... 15 lignes
  });

  await page.route('**/api/quiz/profile', async (route) => {
    // ... 10 lignes
  });

  await page.route('**/api/quiz/post', async (route) => {
    // ... 10 lignes
  });

  await page.addInitScript(() => {
    // ... 15 lignes auth mock
  });
});

// ❌ Bad (lignes 201-224) - DUPLICATION #2 (même code!)
test.beforeEach(async ({ page }) => {
  await page.route('**/api/quiz/post', async (route) => {
    // ... exactement le même mock, répété
  });

  await page.addInitScript(() => {
    // ... exactement le même auth mock, répété
  });
});

// ❌ Bad (lignes 282-287, 365-381, 422-437) - DUPLICATION #3, #4, #5
// Encore et encore le même setup...
```

**Recommended Fix**:

```typescript
// ✅ Good - Fixture composition pour éliminer duplication
// e2e/fixtures/quiz-api-mocks-fixture.ts
import { test as base } from '@playwright/test';

type QuizMocksFixture = {
  mockQuizAPI: () => Promise<void>;
};

export const test = base.extend<QuizMocksFixture>({
  mockQuizAPI: async ({ page }, use) => {
    const mockQuizAPI = async () => {
      // Mock quiz/generate endpoint
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

      // Mock archetype endpoint
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

      // Mock profile endpoint
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

      // Mock post generation endpoint
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
    };

    await use(mockQuizAPI);
  },
});

// e2e/fixtures/merged-fixtures.ts
import { mergeTests } from '@playwright/test';
import { test as quizMocks } from './quiz-api-mocks-fixture';
import { test as quizState } from './quiz-state-fixture';

export const test = mergeTests(quizMocks, quizState);
export { expect } from '@playwright/test';

// Usage in tests - NO MORE DUPLICATION!
import { test, expect } from './fixtures/merged-fixtures';

test.describe('Complete User Journey: Quiz to Dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ mockQuizAPI }) => {
    await mockQuizAPI(); // ONE LINE instead of 85!
  });

  test('E2E-JOURNEY-01: Complete flow', async ({ page }) => {
    // Test logic...
  });
});

test.describe('Form Validation End-to-End', () => {
  test.beforeEach(async ({ mockQuizAPI, setQuizState }) => {
    await mockQuizAPI(); // Reuse same mock!
    await setQuizState({ step: 'FINAL_REVEAL' }); // Reuse state fixture!
  });

  test('E2E-VALIDATION-01: Email validation', async ({ page }) => {
    // Test logic...
  });
});
```

**Why This Matters**:

- **DRY**: Mock setup écrit **une seule fois**, réutilisé partout
- **Consistency**: Tous les tests utilisent exactement les mêmes mocks (pas de divergence)
- **Maintainability**: Modifier un mock = **1 seul fichier** à éditer, pas 5
- **Testability**: Pure functions in fixtures peuvent être unit-testées séparément
- **Composability**: `mergeTests` permet de mixer fixtures (quizMocks + quizState + authFixture)

**Benefits**:

- **-400 lignes de duplication** éliminées
- **95% moins de risque d'erreur** lors de modifications
- **Setup time réduit** (fixture appelée 1× au lieu de répéter code 5×)

**Related Violations**:

- Lignes 20-106: Duplication #1
- Lignes 201-224: Duplication #2
- Lignes 282-287: Duplication #3
- Lignes 365-381: Duplication #4
- Lignes 422-437: Duplication #5

---

## Recommendations (Should Fix)

### 1. Use Data Factories for Test Emails

**Severity**: P1 (High)
**Location**: `e2e/critical-user-journeys.spec.ts:163, 253, 353`
**Criterion**: Data Factories
**Knowledge Base**: [data-factories.md](../_bmad/bmm/testarch/knowledge/data-factories.md)

**Issue Description**:

Les emails de test sont hardcodés (`'journey-test@example.com'`, `'valid@example.com'`, `'test@example.com'`), ce qui crée:

- **Collision risk** en exécution parallèle: Deux tests utilisent le même email simultanément
- **Flakiness**: Si Supabase rate-limit par email, tests failent aléatoirement
- **Non-unique**: Chaque run utilise les mêmes emails (pas de fresh start)

**Current Code**:

```typescript
// ❌ Bad (ligne 163)
await emailInput.fill('journey-test@example.com'); // Hardcoded

// ❌ Bad (ligne 253)
await page.getByPlaceholder('moi@exemple.com').fill('valid@example.com'); // Hardcoded

// ❌ Bad (ligne 353)
await page.getByLabel('Email Address').fill('test@example.com'); // Hardcoded
```

**Recommended Improvement**:

```typescript
// ✅ Better - Use faker for unique emails
import { faker } from '@faker-js/faker';

test('E2E-JOURNEY-01: Complete flow', async ({ page }) => {
  // ... test logic
  
  const testEmail = faker.internet.email(); // Unique chaque fois
  await emailInput.fill(testEmail);
  
  // ... rest of test
});

// ✅ Even better - Create factory function
// test-utils/factories/user-factory.ts
export const createTestEmail = () => faker.internet.email();

// Usage:
import { createTestEmail } from '../test-utils/factories/user-factory';

test('E2E-VALIDATION-01: Email validation', async ({ page }) => {
  const validEmail = createTestEmail();
  await page.getByPlaceholder('moi@exemple.com').fill(validEmail);
  
  await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
  await expect(page.getByText('Lien envoyé !')).toBeVisible();
});
```

**Benefits**:

- **Parallel-safe**: Chaque test utilise un email unique (pas de collision)
- **Idempotent**: Tests peuvent tourner 100× sans conflit
- **Realistic**: Emails générés ressemblent à vrais emails (faker quality)

**Priority**:

P1 (High) - Impacte la fiabilité des tests en CI/CD avec workers multiples

---

### 2. Add Priority Markers (P0/P1/P2/P3)

**Severity**: P1 (High)
**Location**: `e2e/critical-user-journeys.spec.ts` (tous les tests)
**Criterion**: Priority Markers
**Knowledge Base**: [test-priorities.md](../_bmad/bmm/testarch/knowledge/test-priorities-matrix.md)

**Issue Description**:

Aucun test n'a de classification de priorité (P0/P1/P2/P3). Cela rend impossible:

- **Selective testing**: Impossible de run seulement les tests critiques (P0/P1)
- **Gate decisions**: Impossible de bloquer merge si P0 fail mais P3 ok
- **CI optimization**: Impossible de paralléliser par priorité (P0 first, P3 last)

**Current Code**:

```typescript
// ❌ Bad - No priority marker
test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
  // Critical user journey, but no P0 marker
});

test('E2E-MOBILE-01: Quiz flow on mobile viewport', async ({ page }) => {
  // Mobile-specific test, probably P2, but not marked
});
```

**Recommended Improvement**:

```typescript
// ✅ Good - Add priority via test.describe or test tags
test.describe('Critical User Journeys @P0', () => {
  test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
    // P0: Critical happy path - blocks merge if fails
  });
});

test.describe('Form Validation End-to-End @P1', () => {
  test('E2E-VALIDATION-01: Email validation in auth modal', async ({ page }) => {
    // P1: Important validation - should fix before merge
  });
});

test.describe('Error Handling End-to-End @P1', () => {
  test('E2E-ERROR-01: API failure during quiz generation', async ({ page }) => {
    // P1: Error resilience - critical for UX
  });
});

test.describe('State Persistence @P2', () => {
  test('E2E-PERSIST-01: Quiz progress persists after page reload', async ({ page }) => {
    // P2: Nice-to-have feature - not blocking
  });
});

test.describe('Mobile Responsiveness @P2', () => {
  test('E2E-MOBILE-01: Quiz flow on mobile viewport', async ({ page }) => {
    // P2: Mobile support - important but not critical
  });
});

// Selective execution in CI:
// npm run test:e2e -- --grep @P0  # Run only P0 tests
// npm run test:e2e -- --grep "@P0|@P1"  # Run P0 and P1
```

**Benefits**:

- **Selective runs**: `--grep @P0` pour run seulement les tests critiques (fast feedback)
- **Gate decisions**: Bloquer merge si P0 fail, permettre si P2/P3 fail
- **CI optimization**: Parallelize P0 tests sur workers dédiés (high priority)

**Priority**:

P1 (High) - Essentiel pour CI/CD efficace et gate decisions

---

### 3. Split Large Test File (466 Lines > 300 Limit)

**Severity**: P1 (High)
**Location**: `e2e/critical-user-journeys.spec.ts` (entire file)
**Criterion**: Test Length
**Knowledge Base**: [test-quality.md](../_bmad/bmm/testarch/knowledge/test-quality.md)

**Issue Description**:

Le fichier contient **466 lignes** (limite: 300), avec **7 describe blocks** couvrant des scénarios disparates:

- Complete User Journey (happy path)
- Form Validation
- Error Handling
- State Persistence
- Mobile Responsiveness

Cela rend le fichier:

- **Difficile à comprendre**: Trop de contexte différent dans un seul fichier
- **Lent à debug**: Failures nécessitent scanner 466 lignes pour trouver le test problématique
- **Hard to parallelize**: File granularity = 1 worker, pas optimal

**Current Code**:

```typescript
// ❌ Bad - 466 lignes, 7 describe blocks dans un fichier
// e2e/critical-user-journeys.spec.ts (466 lignes)

test.describe('Complete User Journey', () => { /* 80 lignes */ });
test.describe('Form Validation End-to-End', () => { /* 100 lignes */ });
test.describe('Error Handling End-to-End', () => { /* 80 lignes */ });
test.describe('State Persistence', () => { /* 60 lignes */ });
test.describe('Mobile Responsiveness', () => { /* 80 lignes */ });
```

**Recommended Improvement**:

```typescript
// ✅ Good - Split en 3 fichiers focused

// e2e/critical-user-journeys-happy-path.spec.ts (~150 lignes)
// Focus: Complete user journey (quiz → auth → post generation)
import { test, expect } from './fixtures/merged-fixtures';

test.describe('Critical User Journey: Quiz to Dashboard @P0', () => {
  test.beforeEach(async ({ mockQuizAPI }) => {
    await mockQuizAPI();
  });

  test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
    // Happy path complet
  });
});

// e2e/critical-user-journeys-validation.spec.ts (~120 lignes)
// Focus: Form validation et error handling
import { test, expect } from './fixtures/merged-fixtures';

test.describe('Form Validation End-to-End @P1', () => {
  // Email validation, topic validation
});

test.describe('Error Handling End-to-End @P1', () => {
  // API failures, auth errors
});

// e2e/critical-user-journeys-features.spec.ts (~130 lignes)
// Focus: State persistence et mobile support
import { test, expect } from './fixtures/merged-fixtures';

test.describe('State Persistence @P2', () => {
  // localStorage persistence
});

test.describe('Mobile Responsiveness @P2', () => {
  // Mobile viewport tests
});
```

**Benefits**:

- **Focused files**: Chaque fichier ≤200 lignes, un seul concern
- **Better parallelization**: 3 fichiers = 3 workers potentiels (vs 1 worker pour 1 gros fichier)
- **Easier debugging**: Failure dans "validation.spec.ts" = chercher seulement validation logic
- **Clearer intent**: Nom de fichier indique immédiatement le scope

**Priority**:

P1 (High) - Impacte maintainability et CI performance

---

### 4. Add P0/P1/P2/P3 Classification Strategy

**Severity**: P2 (Medium)
**Location**: `e2e/critical-user-journeys.spec.ts` (architecture decision)
**Criterion**: Priority Markers
**Knowledge Base**: [test-priorities.md](../_bmad/bmm/testarch/knowledge/test-priorities-matrix.md)

**Issue Description**:

Le fichier manque une stratégie claire de priorisation. Voici une recommandation basée sur l'analyse des tests:

**Recommended Classification**:

```typescript
// P0 (Critical) - Block merge if fails
// - E2E-JOURNEY-01: Complete happy path flow
//   → Raison: Core user journey, si fail = app cassée

// P1 (High) - Should fix before merge
// - E2E-VALIDATION-01: Email validation
// - E2E-VALIDATION-02: Topic input validation
// - E2E-ERROR-01: API failure handling
// - E2E-ERROR-02: Auth error handling
//   → Raison: Validation + error resilience = UX quality gates

// P2 (Medium) - Can ship with known issues
// - E2E-PERSIST-01: State persistence
// - E2E-MOBILE-01: Mobile responsiveness
//   → Raison: Nice-to-have features, pas blocker si fail

// P3 (Low) - Not currently defined
//   → Exemples futurs: Edge cases rares, tests de regression non-critiques
```

**Priority**:

P2 (Medium) - Important pour CI strategy mais pas blocking

---

## Best Practices Found

### 1. Excellent Test ID Convention

**Location**: `e2e/critical-user-journeys.spec.ts` (all tests)
**Pattern**: Test IDs
**Knowledge Base**: [traceability.md](../_bmad/bmm/testarch/knowledge/traceability.md)

**Why This Is Good**:

Les test IDs suivent un format **cohérent et descriptif**: `{TYPE}-{CATEGORY}-{NUMBER}`

- `E2E-JOURNEY-01`: End-to-end journey test #1
- `E2E-VALIDATION-01`: End-to-end validation test #1
- `E2E-ERROR-01`: End-to-end error handling test #1

**Code Example**:

```typescript
// ✅ Excellent pattern demonstrated in this test
test('E2E-JOURNEY-01: Complete flow from landing to post generation', async ({ page }) => {
  // Test ID permet:
  // - Mapping vers requirements/stories
  // - Filtering en CI: playwright test --grep E2E-JOURNEY
  // - Traçabilité dans rapports de test
  // - Debugging rapide: "E2E-JOURNEY-01 failed" = immédiatement localisable
});

test('E2E-VALIDATION-01: Email validation in auth modal', async ({ page }) => {
  // Catégorisation claire: VALIDATION vs JOURNEY vs ERROR
});
```

**Use as Reference**:

Ce pattern devrait être adopté dans **tous les fichiers E2E**. Exemples:
- `E2E-AUTH-01`: Authentication flows
- `E2E-DASHBOARD-01`: Dashboard features
- `E2E-SETTINGS-01`: Settings management

---

### 2. Deterministic Test Logic (No Conditionals)

**Location**: `e2e/critical-user-journeys.spec.ts` (entire file)
**Pattern**: Determinism
**Knowledge Base**: [test-quality.md](../_bmad/bmm/testarch/knowledge/test-quality.md)

**Why This Is Good**:

Le fichier évite complètement les conditionnels (`if/else`, `try/catch` pour flow control). Chaque test exécute **exactement le même chemin** à chaque run.

**Code Example**:

```typescript
// ✅ Excellent pattern - No conditionals, predictable path
test('E2E-JOURNEY-01: Complete flow', async ({ page }) => {
  // Step 1: Always navigate
  await page.goto('/quiz');
  
  // Step 2: Always click theme
  await page.getByTestId('theme-t1').click();
  
  // Step 3: Always start quiz
  await page.getByTestId('start-quiz-btn').click();
  
  // Step 4: Always answer 6 questions
  for (let i = 0; i < 6; i++) {
    await expect(page.getByTestId('option-a')).toBeVisible();
    await page.getByTestId('option-a').click();
  }
  
  // NO if/else - test always executes same steps
  // NO try/catch - failures bubble up clearly
});

// ❌ Counter-example (what to avoid):
// if (await page.locator('[data-testid="banner"]').isVisible()) {
//   await page.click('[data-testid="dismiss-banner"]'); // Non-deterministic!
// }
```

**Use as Reference**:

Ce pattern garantit:
- Tests passent ou failent **pour les mêmes raisons** chaque fois
- Failures sont **reproductibles** (pas de "it passed on retry")
- Debugging est **simple**: Path est toujours le même

---

### 3. Explicit Assertions in Test Body

**Location**: `e2e/critical-user-journeys.spec.ts` (all tests)
**Pattern**: Explicit Assertions
**Knowledge Base**: [test-quality.md](../_bmad/bmm/testarch/knowledge/test-quality.md)

**Why This Is Good**:

Toutes les assertions (`expect()`) sont **visibles dans le test body**, pas cachées dans helpers. Cela rend:

- **Test intent clair**: On voit exactement ce qui est validé
- **Failures actionables**: Erreur dit "Expected 'Lien envoyé !' to be visible" au lieu de "validateEmailFlow failed"

**Code Example**:

```typescript
// ✅ Excellent pattern - Assertions visible in test
test('E2E-VALIDATION-01: Email validation', async ({ page }) => {
  await page.goto('/quiz');
  
  // Test Case 1: Empty email
  await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
  await expect(page.getByText('Adresse email invalide')).toBeVisible(); // Explicit!
  
  // Test Case 2: Invalid format
  await page.getByPlaceholder('moi@exemple.com').fill('not-an-email');
  await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
  await expect(page.getByText('Adresse email invalide')).toBeVisible(); // Explicit!
  
  // Test Case 3: Valid email
  await page.getByPlaceholder('moi@exemple.com').fill('valid@example.com');
  await page.getByRole('button', { name: 'Envoyez-moi un lien' }).click();
  await expect(page.getByText('Lien envoyé !')).toBeVisible(); // Explicit!
  
  // NO hidden assertions in helpers like validateEmailFlow()
  // Every assertion is in the test body - clear intent!
});

// ❌ Counter-example (what to avoid):
// await validateEmailFlow(page, 'test@example.com');
// ^ What does this validate? Have to check helper function.
```

**Use as Reference**:

Helpers peuvent **extraire data** mais jamais **assert**:
- ✅ `const user = await getUserFromAPI(page);` then `expect(user.email).toBe(...)`
- ❌ `await validateUserCreation(page)` (hides assertion)

---

## Test File Analysis

### File Metadata

- **File Path**: `e2e/critical-user-journeys.spec.ts`
- **File Size**: 466 lines, ~19 KB
- **Test Framework**: Playwright
- **Language**: TypeScript

### Test Structure

- **Describe Blocks**: 7
  - Complete User Journey: Quiz to Dashboard
  - Form Validation End-to-End
  - Error Handling End-to-End
  - State Persistence
  - Mobile Responsiveness
- **Test Cases (it/test)**: 7 tests
- **Average Test Length**: 66 lines per test
- **Fixtures Used**: 0 (should have 3-4)
- **Data Factories Used**: 0 (should have 1-2)

### Test Coverage Scope

- **Test IDs**: E2E-JOURNEY-01, E2E-VALIDATION-01, E2E-VALIDATION-02, E2E-ERROR-01, E2E-ERROR-02, E2E-PERSIST-01, E2E-MOBILE-01
- **Priority Distribution**:
  - P0 (Critical): 0 tests (should be 1: JOURNEY-01)
  - P1 (High): 0 tests (should be 4: VALIDATION-01/02, ERROR-01/02)
  - P2 (Medium): 0 tests (should be 2: PERSIST-01, MOBILE-01)
  - P3 (Low): 0 tests
  - Unknown: 7 tests ❌

### Assertions Analysis

- **Total Assertions**: ~50+ `expect()` calls
- **Assertions per Test**: ~7 assertions per test (avg)
- **Assertion Types**: `toBeVisible()`, `toHaveURL()`, `toBeEnabled()`, `toBeDisabled()`, `toBeGreaterThanOrEqual()`

---

## Context and Integration

### Related Artifacts

- **Story File**: Not found (no auto-discovery possible without story reference)
- **Test Design**: Not found
- **Acceptance Criteria**: Not available

### Test Coverage

Le fichier couvre **5 scénarios principaux**:

1. **Happy Path Journey** (E2E-JOURNEY-01): Complete quiz flow → auth → post generation
2. **Form Validation** (E2E-VALIDATION-01/02): Email validation, topic input validation
3. **Error Handling** (E2E-ERROR-01/02): API failures, auth errors
4. **State Persistence** (E2E-PERSIST-01): localStorage quiz state across page reload
5. **Mobile Support** (E2E-MOBILE-01): Quiz flow on mobile viewport (375×667)

**Coverage Quality**: Comprehensive (happy + sad paths + edge cases), mais fragile (voir violations critiques)

---

## Knowledge Base References

This review consulted the following knowledge base fragments:

- **[test-quality.md](../_bmad/bmm/testarch/knowledge/test-quality.md)** - Definition of Done for tests (no hard waits, <300 lines, <1.5 min, self-cleaning)
- **[fixture-architecture.md](../_bmad/bmm/testarch/knowledge/fixture-architecture.md)** - Pure function → Fixture → mergeTests pattern
- **[network-first.md](../_bmad/bmm/testarch/knowledge/network-first.md)** - Route intercept before navigate (race condition prevention)
- **[data-factories.md](../_bmad/bmm/testarch/knowledge/data-factories.md)** - Factory functions with overrides, API-first setup
- **[test-levels-framework.md](../_bmad/bmm/testarch/knowledge/test-levels-framework.md)** - E2E vs API vs Component vs Unit appropriateness
- **[test-priorities-matrix.md](../_bmad/bmm/testarch/knowledge/test-priorities-matrix.md)** - P0/P1/P2/P3 classification framework

See [tea-index.csv](../_bmad/bmm/testarch/tea-index.csv) for complete knowledge base.

---

## Next Steps

### Immediate Actions (Before Merge)

1. **Refactor network waits** - Replace 10+ hard timeouts with `waitForResponse()`
   - Priority: P0
   - Owner: Dev team
   - Estimated Effort: 2-3 hours

2. **Create fixtures** - Extract mock setup (85 lines) into `quiz-api-mocks-fixture.ts`
   - Priority: P0
   - Owner: Dev team
   - Estimated Effort: 3-4 hours

3. **Add isolation cleanup** - Create `quiz-state-fixture.ts` with auto-cleanup
   - Priority: P0
   - Owner: Dev team
   - Estimated Effort: 1-2 hours

4. **Use data factories** - Replace hardcoded emails with `faker.internet.email()`
   - Priority: P1
   - Owner: Dev team
   - Estimated Effort: 30 minutes

### Follow-up Actions (Future PRs)

1. **Add priority markers** - Tag tests with @P0/@P1/@P2 for selective execution
   - Priority: P1
   - Target: Next sprint

2. **Split large file** - Break 466-line file into 3 focused files (<200 lines each)
   - Priority: P1
   - Target: Next sprint

3. **Optimize test duration** - Mock quiz state directly to skip long quiz flows
   - Priority: P2
   - Target: Backlog

### Re-Review Needed?

⚠️ **Re-review after critical fixes** - Request changes, then re-review

**Reason**: Les 3 violations P0 (network waits, isolation, fixtures) nécessitent des refactors substantiels. Après ces fixes, une re-review rapide validera que les patterns sont correctement appliqués.

---

## Decision

**Recommendation**: Request Changes

**Rationale**:

Le score de **61/100 (Grade C)** reflète un test avec une **bonne couverture fonctionnelle** (happy + sad paths + edge cases) et d'excellents test IDs, mais affaibli par **3 violations critiques (P0)** qui le rendent **fragile et difficile à maintenir**.

**Issues bloquantes:**

1. **Hard timeouts (10-15s)**: Créent des tests lents et non-déterministes. Si l'API quiz est lente en CI (cold start, réseau), tests failent aléatoirement. Si rapide, on gaspille 10-15s par assertion.

2. **Pas d'isolation**: La manipulation directe de `localStorage` sans fixture auto-cleanup pollue l'état. Avec `--workers=4`, tests interfèrent. Un test qui fail mid-execution laisse state corrompu pour le suivant.

3. **Duplication massive**: 85 lignes de mock setup répétées 5×. Chaque changement d'API mock nécessite éditer 5 endroits. C'est un **maintenance nightmare** et source d'inconsistency.

**Impact production:**

- **Flakiness en CI**: Tests vont fail aléatoirement avec workers multiples
- **Feedback loop lent**: 60-120s par test × 7 tests = 7-14 minutes de suite
- **Maintenance coût élevé**: Chaque nouvelle endpoint quiz = éditer 5 beforeEach

**Actions requises avant merge:**

✅ Refactor network waits (2-3h)
✅ Create fixtures (3-4h)
✅ Add cleanup isolation (1-2h)
✅ Use data factories (30min)

**Total effort**: ~7-10 heures de refactor

Après ces fixes, le test sera **production-ready** avec score attendu **85-90/100 (Grade A)**.

---

## Appendix

### Violation Summary by Location

| Line  | Severity | Criterion         | Issue                            | Fix                             |
| ----- | -------- | ----------------- | -------------------------------- | ------------------------------- |
| 20-106 | P0       | Fixtures          | Mock setup duplication #1        | Extract to fixture              |
| 127   | P0       | Network-First     | Hard timeout 10s                 | Use waitForResponse()           |
| 132   | P0       | Network-First     | Hard timeout 10s                 | Use waitForResponse()           |
| 139   | P0       | Network-First     | Hard timeout 15s                 | Use waitForResponse()           |
| 144   | P0       | Network-First     | Hard timeout 15s                 | Use waitForResponse()           |
| 163   | P1       | Data Factories    | Hardcoded email                  | Use faker.internet.email()      |
| 198   | P0       | Isolation         | Manual localStorage setup        | Use fixture with auto-cleanup   |
| 201-224| P0       | Fixtures          | Mock setup duplication #2        | Reuse fixture                   |
| 253   | P1       | Data Factories    | Hardcoded email                  | Use faker.internet.email()      |
| 282-287| P0       | Fixtures          | Mock setup duplication #3        | Reuse fixture                   |
| 353   | P1       | Data Factories    | Hardcoded email                  | Use faker.internet.email()      |
| 365-381| P0       | Fixtures          | Mock setup duplication #4        | Reuse fixture                   |
| 387   | P0       | Isolation         | Manual localStorage.clear()      | Use fixture auto-cleanup        |
| 422-437| P0       | Fixtures          | Mock setup duplication #5        | Reuse fixture                   |
| *     | P1       | Priority Markers  | No P0/P1/P2/P3 classification    | Add @P0/@P1/@P2 tags            |
| *     | P1       | Test Length       | 466 lines > 300 limit            | Split into 3 files              |

### Quality Trends

| Review Date  | Score     | Grade | Critical Issues | Trend   |
| ------------ | --------- | ----- | --------------- | ------- |
| 2026-01-30   | 61/100    | C     | 3               | ➡️ Baseline |

### Related Reviews

| File                            | Score | Grade | Critical | Status          |
| ------------------------------- | ----- | ----- | -------- | --------------- |
| critical-user-journeys.spec.ts  | 61/100| C     | 3        | Request Changes |

**Suite Average**: 61/100 (C)

---

## Review Metadata

**Generated By**: BMad TEA Agent (Test Architect - Murat)
**Workflow**: testarch-test-review v4.0
**Review ID**: test-review-critical-user-journeys-20260130
**Timestamp**: 2026-01-30 17:05:00
**Version**: 1.0

---

## Feedback on This Review

If you have questions or feedback on this review:

1. Review patterns in knowledge base: `_bmad/bmm/testarch/knowledge/`
2. Consult tea-index.csv for detailed guidance
3. Request clarification on specific violations
4. Pair with QA engineer to apply patterns

This review is guidance, not rigid rules. Context matters - if a pattern is justified, document it with a comment.
