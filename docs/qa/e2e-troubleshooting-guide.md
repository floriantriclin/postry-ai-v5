# Guide de dépannage des tests E2E

**Dernière mise à jour:** 29 Janvier 2026  
**Contexte:** Story 2.9 – E2E Test Completion (mock fallback sans GEMINI_API_KEY)

## Vue d'ensemble

Ce guide décrit les problèmes courants des tests E2E Playwright et comment les résoudre, en particulier le mode **mock-only** pour exécuter les tests sans clé API Gemini.

---

## 1. Quiz : les questions ne se chargent pas après "Lancer la calibration"

### Symptômes

- Timeout en attendant `[data-testid="question-card"]` (30–45 s)
- Le bouton "Lancer la calibration" est cliqué mais l’écran reste sur le loader
- Tous les tests de flux quiz non authentifié échouent

### Cause

Sans `GEMINI_API_KEY`, l’appel API échoue et le fallback mock est appliqué **après** le timeout réseau. Les tests cliquent sur "Lancer" avant que `questionsP1` soit rempli.

### Solution recommandée : mode mock-only (sans appel API)

Pour les E2E (local et CI), utilisez le flag **`NEXT_PUBLIC_QUIZ_USE_MOCK=true`** afin que le quiz n’appelle jamais l’API et utilise immédiatement les données mock.

#### En local

**Option A – Build dédié E2E puis lancer les tests :**

```bash
# 1. Build avec mock-only (les questions sont disponibles sans délai)
set NEXT_PUBLIC_QUIZ_USE_MOCK=true
npm run build

# 2. Démarrer le serveur
npm run start

# 3. Dans un autre terminal : lancer Playwright
npx playwright test
```

**Option B – Dev server (Next.js injecte les variables au build) :**

```bash
# Démarrer le dev server avec le flag
set NEXT_PUBLIC_QUIZ_USE_MOCK=true
npm run dev
# Puis dans un autre terminal :
npx playwright test
```

Sous Linux/macOS, remplacer `set VAR=value` par `export VAR=value`.

#### En CI (GitHub Actions)

Le workflow `.github/workflows/e2e-tests.yml` définit déjà `NEXT_PUBLIC_QUIZ_USE_MOCK: 'true'` pour le build. Aucune `GEMINI_API_KEY` n’est requise pour les E2E.

### Comportement technique

- Si `NEXT_PUBLIC_QUIZ_USE_MOCK === 'true'` :
  - Aucun appel à `/api/quiz/generate`, `/api/quiz/archetype`, `/api/quiz/profile` pour le quiz
  - **Aucun appel à Gemini pour la génération de post** : `POST /api/quiz/post` retourne immédiatement un post mock (pas de `GEMINI_API_KEY` requise)
  - Le reducer reçoit immédiatement les actions `*_ERROR` avec `fallback` (données de `lib/data/mock-quiz.json`)
  - Les questions P1/P2, l’archétype et le profil sont disponibles sans délai
- Si le flag n’est pas défini : comportement inchangé (appel API puis fallback en cas d’erreur).

---

## 2. Auth setup échoue (Timeout 15 s)

### Symptômes

- `TimeoutError: page.waitForSelector: Timeout 15000ms exceeded` dans `auth.setup.*.ts`
- Les tests dépendant de l’auth (ex. dashboard) échouent

### Solutions

1. Vérifier que le serveur tourne sur `http://localhost:3000`.
2. Vérifier les variables d’environnement Supabase :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. En CI, configurer les secrets GitHub : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Consulter `e2e/auth-setup-failure.png` (ou les artefacts) en cas d’échec pour voir l’écran au moment du timeout.

---

## 3. Timeout sur l’écran « final reveal » (Story 2-7, WebKit/Firefox)

### Symptômes

- `TimeoutError: waiting for locator('[data-testid="final-reveal-container"]') to be visible`
- Tests concernés : **E2E-2.7-04** (Auth modal without pre-persist), **E2E-2.7-REG-01** (Complete quiz flow), parfois d’autres flux quiz jusqu’au final reveal.
- Plus fréquent sur **WebKit**, possible sur Firefox.

### Cause

Après les 11 réponses au quiz (6 P1 + 5 P2), la transition vers l’écran « final reveal » peut prendre plus de 15 s sur certains moteurs (layout/animations). Un timeout trop court provoque des échecs intermittents.

### Solution appliquée (Story 2-7)

- **Timeout** pour `[data-testid="final-reveal-container"]` : **30 s** (au lieu de 15 s) dans `e2e/story-2-7.spec.ts`.
- **Attente courte** (500 ms) après la boucle des 11 questions, avant d’attendre le final reveal, pour laisser la transition UI s’effectuer (réduit la flakiness WebKit).

Si un timeout réapparaît, vérifier que le mock expose bien 11 questions (`lib/data/mock-quiz.json` : 6 en phase1 + 5 en phase2) et que les boucles dans le spec sont `i < 11`.

---

## 4. Tests lents ou timeouts intermittents

### Bonnes pratiques

- Privilégier `waitForSelector`, `expect(...).toBeVisible()`, `waitForFunction` plutôt que `page.waitForTimeout()`.
- Utiliser des `data-testid` stables pour les locators.
- Pour débugger : `npx playwright test --headed --debug` ou `npx playwright test e2e/story-2-7.spec.ts --trace on`.

### Timeouts par défaut

- Test : 30 s (configurable dans `playwright.config.ts`).
- Pour un fichier ou un test précis : `--timeout=60000`.

---

## 5. Contexte authentifié vs non authentifié

### Règle

- **Dashboard, redirect après login :** utiliser le contexte authentifié (storageState des setup).
- **Flux quiz complet, modal d’auth après génération du post :** utiliser un contexte **non** authentifié.

### Pattern pour un test non authentifié

```typescript
test('Quiz flow without auth', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  try {
    await page.goto('/quiz');
    // ...
  } finally {
    await context.close();
  }
});
```

Si vous utilisez `{ page }` sans créer de contexte, le test hérite du storageState du projet (souvent authentifié).

---

## 6. Rapport et artefacts

- Rapport HTML : `npx playwright show-report` (après une exécution avec `--reporter=html`).
- Traces : `npx playwright show-trace test-results/.../trace.zip`.
- En CI, le workflow E2E uploade l’artefact `playwright-report` (conservé 7 jours).

---

## 7. Références

- [e2e/README.md](../../e2e/README.md) – structure des tests, commandes, variables d’environnement
- [story-2-8-phase-3-e2e-fix-report.md](story-2-8-phase-3-e2e-fix-report.md) – analyse des 15 tests en échec et cause (timing fallback)
- [Story 2.9](../../_bmad-output/implementation-artifacts/story-2-9-e2e-test-completion.md) – objectif 24/24 tests avec mock-only
