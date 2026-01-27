# 11. Testing Strategy

## Vision Globale

La stratégie de tests de **postry.ai** vise à garantir la **fiabilité**, la **maintenabilité** et la **rapidité de déploiement** en couvrant trois niveaux :

1. **Unit Tests** : Logique métier isolée (vitesse maximale)
2. **Integration Tests** : Interactions API/DB (confiance dans les contrats)
3. **E2E Tests** : Parcours utilisateur critiques (validation end-to-end)

**Philosophie** : "Write tests, not too many, mostly integration." — Inspiré de Kent C. Dodds

---

## 1. Tests Unitaires (Unit Tests)

### Outils

- **Framework** : [Vitest](https://vitest.dev/) (rapide, compatible Vite/Next.js)
- **Mocking** : `vi.mock()` de Vitest
- **Assertions** : `expect()` standard

### Couverture Cible

| Type de Code | Couverture Minimale | Priorité |
|--------------|---------------------|----------|
| **Protocole ICE** (logique pure) | **100%** | 🔴 CRITIQUE |
| Logique métier (calcul crédits, parsing) | **>80%** | 🟠 HAUTE |
| Utils et helpers | **>60%** | 🟡 MOYENNE |
| Composants React (stateless) | **>40%** | 🟢 BASSE |

### Scope des Tests Unitaires

#### ✅ À Tester en Unitaire

- **Protocole ICE** (`lib/ice/`) :
  - `getClosestArchetype(vector)`
  - `updateVector(currentVector, answer)`
  - `getTargetDimensions(archetype, phase)`
- **Calcul de crédits** :
  - Décompte correct (génération = -1, régénération = 0)
  - Logique de paywall (>= 5 posts)
- **Validation Zod** :
  - Schémas de validation (email, quiz answers, etc.)
- **Parsing et transformations** :
  - Extraction texte CV
  - Formatting du post (sauts de ligne LinkedIn)

#### ❌ À NE PAS Tester en Unitaire

- Composants React complexes avec state (préférer E2E)
- API Routes complètes (préférer Integration Tests)
- UI styling (validation manuelle + screenshots tests)

### Exemple de Test Unitaire

```typescript
// __tests__/lib/ice/archetype.test.ts
import { describe, it, expect } from 'vitest';
import { getClosestArchetype } from '@/lib/ice/archetype';

describe('getClosestArchetype', () => {
  it('should return Le Stratège for high formality and logic', () => {
    const vector = {
      formality: 8,
      logic_emotion: 7,
      directness: 6,
      // ... autres dimensions
    };
    
    const result = getClosestArchetype(vector);
    
    expect(result.name).toBe('Le Stratège');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  it('should handle edge case with all neutral values', () => {
    const neutralVector = {
      formality: 5,
      logic_emotion: 5,
      directness: 5,
      // ...
    };
    
    const result = getClosestArchetype(neutralVector);
    
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
```

---

## 2. Tests d'Intégration (Integration Tests)

### Outils

- **Framework** : Vitest (même stack que unitaire)
- **DB Test** : Supabase Local (via Docker) ou Test Database
- **Mocks** : LLM mockés (éviter les coûts API en test)

### Scope des Tests d'Intégration

#### ✅ À Tester en Intégration

- **API Routes** :
  - `POST /api/quiz/generate` : Génération de questions
  - `POST /api/quiz/post` : Génération de post
  - `POST /api/auth/persist-on-login` : Persistance du post
  - `POST /api/post/regenerate` : Régénération avec Equalizer
- **Workflows Complets** :
  - Quiz → Profil → Génération Post
  - Auth → Persist → Dashboard
  - Upload CV → Parsing → Génération avec contexte

### Exemple de Test d'Intégration

```typescript
// __tests__/api/quiz/post.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { POST } from '@/app/api/quiz/post/route';

describe('POST /api/quiz/post', () => {
  beforeAll(() => {
    // Mock Gemini API
    vi.mock('@google/generative-ai', () => ({
      generateContent: vi.fn().mockResolvedValue({
        hook: 'Test hook',
        content: 'Test content',
        cta: 'Test CTA'
      })
    }));
  });

  it('should generate a post with valid ICE vector', async () => {
    const request = new Request('http://localhost:3000/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify({
        theme: 'Leadership en startup',
        vector: { formality: 7, logic_emotion: 6, /* ... */ },
        profile: { label_final: 'Le Stratège', /* ... */ }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.post).toHaveProperty('hook');
    expect(data.post).toHaveProperty('content');
    expect(data.post).toHaveProperty('cta');
  });

  it('should return 400 if vector is missing', async () => {
    const request = new Request('http://localhost:3000/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify({ theme: 'Test' }) // Missing vector
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

---

## 3. Tests End-to-End (E2E Tests)

### Outils

- **Framework** : [Playwright](https://playwright.dev/)
- **Browsers** : Chromium, Firefox, WebKit (Safari)
- **CI** : GitHub Actions ou Vercel CI

### Scénarios Critiques à Couvrir

| # | Scénario | Priorité | Epic |
|---|----------|----------|------|
| **E2E-01** | Quiz complet → Post flouté → Email → Révélation | 🔴 CRITIQUE | 1-2 |
| **E2E-02** | Login utilisateur existant → Dashboard | 🔴 CRITIQUE | 2 |
| **E2E-03** | Génération → Equalizer → Régénération | 🟠 HAUTE | 3 |
| **E2E-04** | Upload CV → Génération avec contexte | 🟠 HAUTE | 4 |
| **E2E-05** | 5 posts → Paywall → Paiement → Déblocage | 🔴 CRITIQUE | 4 |
| **E2E-06** | Historique des posts → Navigation | 🟡 MOYENNE | 3 |

### Exemple de Test E2E (Scénario Critique)

```typescript
// e2e/quiz-to-reveal.spec.ts
import { test, expect } from '@playwright/test';

test('User completes quiz, sees blurred post, and reveals via email', async ({ page }) => {
  // 1. Landing Page → Start Quiz
  await page.goto('/');
  await page.fill('input[name="theme"]', 'Leadership en startup');
  await page.click('button:has-text("Démarrer")');

  // 2. Complete Quiz (Phase 1 + 2)
  for (let i = 0; i < 9; i++) { // 9 questions total
    await page.waitForSelector('[data-testid="quiz-question"]');
    await page.click('[data-testid="answer-option"]:first-child');
    await page.click('button:has-text("Suivant")');
  }

  // 3. See Blurred Post
  await page.waitForSelector('[data-testid="blurred-post"]');
  await expect(page.locator('[data-testid="blurred-post"]')).toHaveClass(/blur/);

  // 4. Submit Email
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Révéler")');

  // 5. Confirmation Message
  await expect(page.locator('text=Lien envoyé')).toBeVisible();

  // 6. Simulate Magic Link Click (mock auth callback)
  await page.goto('/auth/confirm?token=mock_token');

  // 7. Dashboard with Revealed Post
  await page.waitForURL('/dashboard', { timeout: 10000 });
  await expect(page.locator('[data-testid="post-content"]')).not.toHaveClass(/blur/);
  await expect(page.locator('[data-testid="post-content"]')).toContainText('Leadership');
});
```

### Anti-Flakiness Strategy

Pour éviter les tests E2E instables :

1. **Attentes explicites** : Toujours utiliser `waitForSelector()` au lieu de `sleep()`
2. **Test Isolation** : Chaque test crée son propre user (email unique)
3. **Retry Policy** : 3 tentatives max en CI (via `playwright.config.ts`)
4. **Cleanup** : Nettoyer la DB test entre chaque run

```typescript
// playwright.config.ts
export default {
  retries: process.env.CI ? 3 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
};
```

---

## 4. Tests Spécifiques par Epic

### Epic 1 : Fondation & Tunnel Public

- ✅ **Unit** : Protocole ICE (100%)
- ✅ **Integration** : API génération questions + posts
- ✅ **E2E** : Quiz complet → Post flouté

### Epic 2 : Conversion & Identité

- ✅ **Unit** : Validation email, parsing localStorage
- ✅ **Integration** : API `persist-on-login`, workflow auth
- ✅ **E2E** : Email → Magic Link → Dashboard
- 🔴 **Regression Tests** : Bugs BUG-001 à BUG-004 (voir `docs/bug-fixes-epic-2-critical.md`)

### Epic 3 : Dashboard & Personnalisation

- ✅ **Unit** : Logique Equalizer (mapping sliders → vector)
- ✅ **Integration** : API régénération
- ✅ **E2E** : Equalizer → Régénération → Update post

### Epic 4 : Intelligence d'Expertise

- ✅ **Unit** : Parsing CV, extraction texte
- ✅ **Integration** : RAG injection dans génération
- ✅ **E2E** : Upload CV → Génération avec contexte + Paywall → Paiement

---

## 5. CI/CD Integration

### Pipeline GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

### Règles de Merge

- ❌ **Bloquer le merge** si :
  - Tests unitaires échouent
  - Linter errors > 0
  - E2E critiques (E2E-01, E2E-02, E2E-05) échouent
- ⚠️ **Warning (merge autorisé)** si :
  - Tests E2E non-critiques échouent (à investiguer)
  - Couverture < 80% (rappel mais pas bloquant)

---

## 6. Outils et Ressources

### Commandes NPM

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Dashboards

- **Coverage Report** : `npm run test:coverage` → `coverage/index.html`
- **Playwright Report** : `npx playwright show-report`

---

## 7. Responsabilités

| Rôle | Responsabilité |
|------|----------------|
| **Développeur** | Écrire unit tests + integration tests pour ses stories |
| **QA/Testeur** | Écrire et maintenir les tests E2E critiques |
| **Tech Lead** | Reviewer la couverture et maintenir la stratégie |
| **PO** | Valider que les scénarios E2E couvrent les user stories |

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
