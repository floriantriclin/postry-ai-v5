# Investigation - Authentification Cross-Browser E2E
**Date:** 26 Janvier 2026  
**Auteur:** Test Architect & Quality Advisor  
**Priorité:** 🔴 Critique  
**Status:** 🔍 En Investigation

---

## 🎯 Problème Identifié

### Symptôme
Les tests dashboard authentifiés échouent sur **Firefox** et **WebKit**, mais passent sur **Chromium**.

**Erreur observée:**
```
Expected: "http://localhost:3000/dashboard"
Received: "http://localhost:3000/?redirectedFrom=%2Fdashboard"
```

**Impact:**
- 4 tests skippés sur Firefox/WebKit
- Taux de réussite limité à 89.9% au lieu de 95%+
- Couverture cross-browser incomplète

---

## 🔍 Analyse Technique

### Configuration Actuelle

#### [`playwright.config.ts`](../../playwright.config.ts)
```typescript
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: authFile },
    dependencies: ['setup'],
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], storageState: authFile },
    dependencies: ['setup'],
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], storageState: authFile },
    dependencies: ['setup'],
  },
]
```

**Observation:** Tous les navigateurs utilisent le **même fichier** `storageState` (`e2e/.auth/user.json`).

#### [`e2e/auth.setup.ts`](../../e2e/auth.setup.ts)
Le setup d'authentification:
1. Crée une session Supabase
2. Sauvegarde les cookies et localStorage
3. Sauvegarde l'état dans `e2e/.auth/user.json`
4. **Problème:** Le setup s'exécute une seule fois avec le navigateur par défaut (Chromium)

### Cause Racine Identifiée

**Le problème est architectural:**

1. **Setup unique:** Le projet `setup` s'exécute **une seule fois** avant tous les autres projets
2. **Contexte Chromium:** Le setup utilise implicitement le contexte Chromium
3. **Incompatibilité cross-browser:** Les cookies/localStorage créés dans Chromium ne sont pas compatibles avec Firefox/WebKit
4. **Partage de fichier:** Tous les navigateurs tentent d'utiliser le même `storageState` file

**Spécificités des navigateurs:**
- **Chromium:** Gère les cookies Supabase avec `sameSite: 'Lax'`
- **Firefox:** Plus strict sur les cookies cross-origin
- **WebKit:** Encore plus strict, bloque certains cookies tiers

---

## 💡 Solutions Proposées

### Option A: Setup Par Navigateur (RECOMMANDÉ) ✅

**Principe:** Créer un setup d'authentification séparé pour chaque navigateur.

**Implémentation:**

#### 1. Créer des fichiers de setup spécifiques
```typescript
// e2e/auth.setup.chromium.ts
import { test as setup, chromium } from "@playwright/test";
// ... code d'auth
await page.context().storageState({ path: 'e2e/.auth/user.chromium.json' });

// e2e/auth.setup.firefox.ts
import { test as setup, firefox } from "@playwright/test";
// ... code d'auth
await page.context().storageState({ path: 'e2e/.auth/user.firefox.json' });

// e2e/auth.setup.webkit.ts
import { test as setup, webkit } from "@playwright/test";
// ... code d'auth
await page.context().storageState({ path: 'e2e/.auth/user.webkit.json' });
```

#### 2. Modifier `playwright.config.ts`
```typescript
projects: [
  { name: 'setup-chromium', testMatch: /auth\.setup\.chromium\.ts/ },
  { name: 'setup-firefox', testMatch: /auth\.setup\.firefox\.ts/ },
  { name: 'setup-webkit', testMatch: /auth\.setup\.webkit\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.chromium.json' },
    dependencies: ['setup-chromium'],
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/user.firefox.json' },
    dependencies: ['setup-firefox'],
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], storageState: 'e2e/.auth/user.webkit.json' },
    dependencies: ['setup-webkit'],
  },
]
```

**Avantages:**
- ✅ Isolation complète par navigateur
- ✅ Cookies natifs pour chaque moteur
- ✅ Pas de modification des tests existants
- ✅ Solution pérenne et maintenable

**Inconvénients:**
- ⚠️ Setup s'exécute 3 fois (temps d'exécution +2-3s)
- ⚠️ 3 fichiers de setup à maintenir
- ⚠️ 3 fichiers storageState générés

**Estimation:** 2-3 heures d'implémentation

---

### Option B: Setup Dynamique avec Détection de Navigateur

**Principe:** Un seul setup qui détecte le navigateur et adapte la configuration.

**Implémentation:**
```typescript
// e2e/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page, browserName }) => {
  // ... code d'auth commun
  
  // Adapter les cookies selon le navigateur
  const cookieConfig = {
    chromium: { sameSite: 'Lax' as const },
    firefox: { sameSite: 'Strict' as const },
    webkit: { sameSite: 'None' as const, secure: true }
  };
  
  const config = cookieConfig[browserName] || cookieConfig.chromium;
  
  await page.context().addCookies([
    { 
      name: cookieName, 
      value: token, 
      domain: 'localhost', 
      path: '/', 
      httpOnly: false, 
      ...config
    }
  ]);
  
  // Sauvegarder avec nom spécifique
  await page.context().storageState({ 
    path: `e2e/.auth/user.${browserName}.json` 
  });
});
```

**Avantages:**
- ✅ Un seul fichier de setup
- ✅ Configuration adaptée par navigateur
- ✅ Maintenance simplifiée

**Inconvénients:**
- ❌ Plus complexe à déboguer
- ❌ Nécessite toujours 3 exécutions du setup
- ❌ Risque de régression si un navigateur change

**Estimation:** 3-4 heures d'implémentation

---

### Option C: Utiliser l'API Supabase Directement (Alternative)

**Principe:** Ne pas utiliser de cookies, mais injecter directement le token dans localStorage.

**Implémentation:**
```typescript
// Dans chaque test
test.beforeEach(async ({ page }) => {
  // Créer une session via API
  const { data: { session } } = await supabaseClient.auth.signInWithPassword(testUser);
  
  // Injecter directement dans le navigateur
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('sb-auth-token', JSON.stringify(token));
  }, session);
  
  await page.goto('/dashboard');
});
```

**Avantages:**
- ✅ Pas de dépendance au storageState
- ✅ Fonctionne sur tous les navigateurs
- ✅ Plus simple conceptuellement

**Inconvénients:**
- ❌ Code dupliqué dans chaque test
- ❌ Temps d'exécution augmenté (auth par test)
- ❌ Moins proche du comportement utilisateur réel

**Estimation:** 1-2 heures d'implémentation

---

## 🎯 Recommandation

### **Option A: Setup Par Navigateur** ✅

**Justification:**
1. **Isolation maximale:** Chaque navigateur a son propre contexte d'authentification
2. **Pérennité:** Solution robuste qui survivra aux évolutions des navigateurs
3. **Maintenabilité:** Code clair et séparé par navigateur
4. **Performance acceptable:** +2-3s sur le temps total est négligeable
5. **Conformité:** Respecte les best practices Playwright

**Plan d'implémentation:**
1. Créer `auth.setup.chromium.ts` (copie de l'actuel)
2. Créer `auth.setup.firefox.ts` (avec adaptations cookies)
3. Créer `auth.setup.webkit.ts` (avec adaptations cookies)
4. Modifier `playwright.config.ts`
5. Retirer les `test.skip()` dans `dashboard.spec.ts`
6. Valider sur les 3 navigateurs

---

## 📋 Plan d'Action Détaillé

### Phase 1: Préparation (30 min)
- [ ] Créer une branche `fix/cross-browser-auth`
- [ ] Sauvegarder les fichiers actuels
- [ ] Documenter l'état actuel des tests

### Phase 2: Implémentation (2h)
- [ ] Créer `e2e/auth.setup.chromium.ts`
- [ ] Créer `e2e/auth.setup.firefox.ts` avec config cookies adaptée
- [ ] Créer `e2e/auth.setup.webkit.ts` avec config cookies adaptée
- [ ] Modifier `playwright.config.ts` pour 3 projets setup
- [ ] Ajouter `.auth/*.json` au `.gitignore` si nécessaire

### Phase 3: Validation (1h)
- [ ] Tester le setup Chromium: `npx playwright test --project=setup-chromium`
- [ ] Tester le setup Firefox: `npx playwright test --project=setup-firefox`
- [ ] Tester le setup WebKit: `npx playwright test --project=setup-webkit`
- [ ] Vérifier que 3 fichiers storageState sont créés

### Phase 4: Réactivation des Tests (30 min)
- [ ] Retirer les `test.skip()` dans `dashboard.spec.ts` lignes 11-13
- [ ] Retirer le skip clipboard ligne 42
- [ ] Exécuter la suite complète: `npm run test:e2e`

### Phase 5: Validation Finale (30 min)
- [ ] Vérifier 79/79 tests passants
- [ ] Vérifier temps d'exécution <5 min
- [ ] Générer le rapport HTML
- [ ] Créer une PR avec documentation

---

## 🧪 Tests de Validation

### Critères de Succès
```bash
# Tous les setups doivent passer
npx playwright test --project=setup-chromium
npx playwright test --project=setup-firefox
npx playwright test --project=setup-webkit

# Tous les tests dashboard doivent passer sur les 3 navigateurs
npx playwright test e2e/dashboard.spec.ts

# Résultat attendu:
# ✅ 15 tests passants (5 tests × 3 navigateurs)
# ✅ 0 tests skippés
# ✅ 0 tests échouants
```

### Métriques Cibles
- **Tests passants:** 79/79 (100%)
- **Tests skippés:** 0 (0%)
- **Taux de réussite:** 100%
- **Temps d'exécution:** <5 minutes
- **Stabilité:** 0 tests flaky sur 10 exécutions

---

## 📚 Références

### Documentation Playwright
- [Storage State](https://playwright.dev/docs/auth#reuse-authentication-state)
- [Projects](https://playwright.dev/docs/test-projects)
- [Dependencies](https://playwright.dev/docs/test-projects#dependencies)

### Documentation Supabase
- [Auth Cookies](https://supabase.com/docs/guides/auth/server-side/cookies)
- [Session Management](https://supabase.com/docs/guides/auth/sessions)

### Fichiers Concernés
- [`playwright.config.ts`](../../playwright.config.ts)
- [`e2e/auth.setup.ts`](../../e2e/auth.setup.ts)
- [`e2e/dashboard.spec.ts`](../../e2e/dashboard.spec.ts)

---

## 🔄 Historique

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Investigation initiale et documentation | Test Architect |
| 2026-01-26 | Identification de la cause racine | Test Architect |
| 2026-01-26 | Proposition de solutions | Test Architect |

---

**Prochaine étape:** Créer une issue GitHub et commencer l'implémentation de l'Option A.
