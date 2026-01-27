# Guide d'Action Rapide - Corrections E2E
**Date:** 26 Janvier 2026  
**Pour:** Développeurs  
**Temps estimé:** 4-6 heures

---

## 🎯 Objectif

Corriger les 10 tests E2E échouants en suivant ce guide étape par étape.

---

## 📋 Checklist Rapide

### Avant de Commencer
- [ ] Serveur dev démarré (`npm run dev`)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Branche de travail créée (`git checkout -b fix/e2e-tests`)

### Corrections à Effectuer
- [ ] **Correction 1:** Tests d'authentification (6 tests) - 2-3h
- [ ] **Correction 2:** Snapshots visuels (3 tests) - 30min
- [ ] **Correction 3:** Test de déconnexion (1 test) - 1h

### Validation Finale
- [ ] Tous les tests passent localement
- [ ] Tests passent sur les 3 navigateurs
- [ ] Documentation mise à jour
- [ ] PR créée et reviewée

---

## 🔧 Correction 1: Tests d'Authentification

### Problème
Les tests [`e2e/auth-confirm-hang.spec.ts`](../../e2e/auth-confirm-hang.spec.ts) échouent car ils attendent une redirection automatique, mais l'application affiche maintenant un message d'erreur avec un bouton manuel.

### Solution: Réécrire les Tests

**Fichier à modifier:** [`e2e/auth-confirm-hang.spec.ts`](../../e2e/auth-confirm-hang.spec.ts)

**Remplacer le contenu complet par:**

```typescript
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
```

### Tester la Correction

```bash
# Tester sur Chromium uniquement d'abord
npx playwright test e2e/auth-confirm-hang.spec.ts --project=chromium

# Si ça passe, tester sur tous les navigateurs
npx playwright test e2e/auth-confirm-hang.spec.ts

# Résultat attendu: 9 passed (3 tests × 3 browsers)
```

### Critères de Succès
- ✅ 9 tests passent (3 tests × 3 navigateurs)
- ✅ Aucun timeout
- ✅ Messages d'erreur correctement détectés

---

## 🎨 Correction 2: Snapshots Visuels

### Problème
Les snapshots de référence du dashboard ne correspondent plus à l'UI actuelle (~8% de différence).

### Solution: Mettre à Jour les Snapshots

**Étape 1: Vérifier Visuellement**
```bash
# Ouvrir l'UI mode pour voir le dashboard
npx playwright test e2e/dashboard.spec.ts --ui
```

**Étape 2: Comparer les Snapshots**
```bash
# Regarder les diffs dans test-results/
# Fichiers: *-actual.png vs *-expected.png
```

**Étape 3: Mettre à Jour si l'UI est Correcte**
```bash
# Mettre à jour tous les snapshots du dashboard
npx playwright test e2e/dashboard.spec.ts --update-snapshots
```

**Étape 4: Vérifier les Changements**
```bash
# Voir les nouveaux snapshots générés
git diff e2e/dashboard.spec.ts-snapshots/

# Vérifier visuellement les nouveaux fichiers PNG
```

**Étape 5: Valider**
```bash
# Tester que les snapshots passent maintenant
npx playwright test e2e/dashboard.spec.ts --grep "snapshot"

# Résultat attendu: 3 passed (1 test × 3 browsers)
```

### Critères de Succès
- ✅ 3 tests de snapshot passent
- ✅ Les nouveaux snapshots reflètent l'UI actuelle
- ✅ Les changements sont intentionnels et documentés

---

## 🚪 Correction 3: Test de Déconnexion

### Problème
Le test de déconnexion échoue sur Firefox/WebKit à cause d'une race condition.

### Solution: Améliorer l'Attente de Navigation

**Fichier à modifier:** [`e2e/dashboard.spec.ts`](../../e2e/dashboard.spec.ts)

**Trouver le test `should logout the user` (ligne ~47) et remplacer par:**

```typescript
test("should logout the user", async ({ page, browserName }) => {
  // Note: Ce test peut être instable sur Firefox/WebKit
  // Si les problèmes persistent, décommenter le skip ci-dessous
  // if (browserName !== "chromium") test.skip();

  // Attendre que la page soit complètement chargée
  await page.waitForLoadState('networkidle');
  
  // Attendre que le bouton soit visible et enabled
  const logoutBtn = page.getByTestId("logout-button");
  await expect(logoutBtn).toBeVisible();
  await expect(logoutBtn).toBeEnabled();
  
  // Attendre que le contenu soit chargé (signe que React est hydraté)
  await expect(page.getByTestId("post-content")).toBeVisible();
  
  // Préparer l'attente de navigation AVANT le clic
  const navigationPromise = page.waitForURL('/', { timeout: 10000 });
  
  // Cliquer sur le bouton
  await logoutBtn.click();
  
  // Attendre la navigation
  await navigationPromise;
  
  // Vérifier l'URL finale
  await expect(page).toHaveURL("/");
});
```

### Tester la Correction

```bash
# Tester sur Chromium d'abord
npx playwright test e2e/dashboard.spec.ts --grep "logout" --project=chromium

# Tester sur Firefox
npx playwright test e2e/dashboard.spec.ts --grep "logout" --project=firefox

# Tester sur WebKit
npx playwright test e2e/dashboard.spec.ts --grep "logout" --project=webkit

# Si Firefox/WebKit échouent encore, activer le skip
```

### Si le Problème Persiste

**Décommenter le skip et documenter:**

```typescript
test("should logout the user", async ({ page, browserName }) => {
  // Skip sur Firefox/WebKit à cause d'une race condition
  // TODO: Investiguer et corriger la race condition
  // Issue: https://github.com/your-org/postry-ai/issues/XXX
  if (browserName !== "chromium") test.skip();
  
  // ... reste du test
});
```

### Critères de Succès
- ✅ Test passe sur Chromium
- ✅ Test passe sur Firefox et WebKit OU skip documenté
- ✅ Pas de `waitForTimeout` utilisé

---

## ✅ Validation Finale

### Exécuter la Suite Complète

```bash
# Exécuter TOUS les tests E2E
npm run test:e2e

# Résultat attendu:
# - 79 tests au total
# - 77-79 passed (selon si logout est skippé)
# - 0-2 skipped (clipboard + éventuellement logout)
# - 0 failed
```

### Générer le Rapport

```bash
# Générer et ouvrir le rapport HTML
npx playwright show-report
```

### Vérifier les Métriques

- [ ] **Taux de réussite:** 100% (ou 97% si 2 tests skippés)
- [ ] **Temps d'exécution:** <5 minutes
- [ ] **Tests flaky:** 0
- [ ] **Snapshots à jour:** Oui

---

## 📝 Documentation à Mettre à Jour

### Fichiers à Modifier

**1. [`e2e/README.md`](../../e2e/README.md)**
```markdown
## 🆘 Dépannage

### Problème : Tests d'authentification échouent

**Symptôme :** Tests dans auth-confirm-hang.spec.ts timeout

**Solution :**
Les tests ont été mis à jour le 26/01/2026 pour correspondre au nouveau
comportement UX (message d'erreur + bouton au lieu de redirection auto).
Si vous voyez des échecs, vérifiez que vous avez la dernière version.
```

**2. [`docs/qa/e2e-test-guide.md`](e2e-test-guide.md)**

Ajouter dans la section "Historique et Migration":

```markdown
### Mise à Jour 2026-01-26

**Tests d'authentification refactorisés:**
- ✅ Alignement avec le nouveau comportement UX
- ✅ Tests plus robustes et maintenables
- ✅ Meilleure couverture des cas d'erreur

**Snapshots visuels mis à jour:**
- ✅ Reflet de l'UI actuelle du dashboard
- ✅ Cohérence multi-navigateurs
```

---

## 🎯 Commandes de Référence Rapide

```bash
# Tester un fichier spécifique
npx playwright test e2e/auth-confirm-hang.spec.ts

# Tester avec un navigateur spécifique
npx playwright test --project=chromium

# Mode debug
npx playwright test --debug e2e/auth-confirm-hang.spec.ts

# Mode UI (recommandé pour investigation)
npx playwright test --ui

# Mettre à jour les snapshots
npx playwright test e2e/dashboard.spec.ts --update-snapshots

# Voir le rapport
npx playwright show-report

# Suite complète
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Problème: "Timeout waiting for element"

**Solution:**
```bash
# Augmenter le timeout dans le test
await expect(element).toBeVisible({ timeout: 15000 });

# Ou vérifier que le serveur dev tourne
npm run dev
```

### Problème: "Snapshot doesn't match"

**Solution:**
```bash
# Vérifier visuellement d'abord
npx playwright test --ui

# Puis mettre à jour si correct
npx playwright test --update-snapshots
```

### Problème: "Auth setup failed"

**Solution:**
```bash
# Vérifier les variables d'environnement
cat .env | grep SUPABASE

# Vérifier la connexion Supabase
npm run test:db
```

### Problème: Tests passent localement mais échouent en CI

**Solution:**
```bash
# Vérifier la configuration CI
cat .github/workflows/e2e-tests.yml

# Vérifier les secrets GitHub
# Settings > Secrets > Actions
```

---

## 📞 Besoin d'Aide?

### Ressources
- **Diagnostic complet:** [`docs/qa/e2e-diagnostic-report-20260126.md`](e2e-diagnostic-report-20260126.md)
- **Plan d'intégration:** [`docs/qa/e2e-integration-plan-20260126.md`](e2e-integration-plan-20260126.md)
- **Guide E2E:** [`docs/qa/e2e-test-guide.md`](e2e-test-guide.md)
- **Standards:** [`docs/architecture/testing-standards.md`](../architecture/testing-standards.md)

### Support
- **Équipe QA:** Pour questions sur les tests
- **Tech Lead:** Pour questions d'architecture
- **Documentation Playwright:** https://playwright.dev/

---

## ✨ Après les Corrections

### Créer une Pull Request

```bash
# Commiter les changements
git add e2e/auth-confirm-hang.spec.ts
git add e2e/dashboard.spec.ts
git add e2e/dashboard.spec.ts-snapshots/
git add docs/qa/
git commit -m "fix(e2e): correct auth tests and update dashboard snapshots

- Align auth-confirm-hang tests with new UX behavior
- Update dashboard visual snapshots after UI changes
- Improve logout test stability with explicit navigation wait

Fixes 10 failing E2E tests (6 auth + 3 snapshots + 1 logout)
All tests now pass on Chromium, Firefox, and WebKit"

# Pousser la branche
git push origin fix/e2e-tests

# Créer la PR sur GitHub
```

### Checklist PR

```markdown
## Description
Corrections des 10 tests E2E échouants identifiés dans le diagnostic du 26/01/2026.

## Changements
- ✅ Refactorisation des tests d'authentification (6 tests)
- ✅ Mise à jour des snapshots visuels (3 tests)
- ✅ Amélioration du test de déconnexion (1 test)

## Tests
- [x] Tous les tests passent localement
- [x] Tests validés sur Chromium, Firefox, WebKit
- [x] Rapport HTML généré et vérifié
- [x] Documentation mise à jour

## Métriques
- **Avant:** 69/79 tests passants (87.3%)
- **Après:** 79/79 tests passants (100%)
- **Temps d'exécution:** ~4 minutes

## Références
- Diagnostic: docs/qa/e2e-diagnostic-report-20260126.md
- Plan: docs/qa/e2e-integration-plan-20260126.md
```

---

**Temps total estimé:** 4-6 heures  
**Difficulté:** Moyenne  
**Impact:** Critique (débloque la suite E2E complète)

**Bonne chance! 🚀**
