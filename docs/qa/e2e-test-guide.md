# Guide des Tests E2E - Postry AI

Ce document fournit un guide complet pour l'exécution et la maintenance des tests End-to-End (E2E) du projet postry-ai.

## Vue d'ensemble

Les tests E2E utilisent [Playwright](https://playwright.dev/) pour simuler des parcours utilisateurs complets dans un environnement proche de la production. Ils valident que l'application fonctionne correctement du point de vue de l'utilisateur final.

## Structure des Tests

> **Note:** Les tests E2E ont été consolidés le 2026-01-26. Voir [`e2e-migration-analysis.md`](e2e-migration-analysis.md) pour les détails.

### Tests Principaux ✨

#### 1. Parcours Utilisateurs Critiques
**[`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts)** - 11 tests consolidés
- ✅ Flux complet de landing à génération de post (E2E-JOURNEY-01)
- ✅ Validation de formulaires end-to-end (E2E-VALIDATION-01, E2E-VALIDATION-02)
- ✅ Gestion d'erreurs (E2E-ERROR-01, E2E-ERROR-02)
- ✅ Persistance d'état (E2E-PERSIST-01)
- ✅ Responsivité mobile (E2E-MOBILE-01)

#### 2. Accessibilité et Performance
**[`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts)** - 11 tests
- ✅ Navigation au clavier (E2E-A11Y-01)
- ✅ Compatibilité lecteur d'écran (E2E-A11Y-02)
- ✅ Labels et messages d'erreur (E2E-A11Y-03)
- ✅ Temps de chargement (E2E-PERF-01)
- ✅ Transitions fluides (E2E-PERF-02)
- ✅ Compatibilité multi-navigateurs (E2E-COMPAT-01, E2E-COMPAT-02)
- ✅ Résilience réseau (E2E-NETWORK-01, E2E-NETWORK-02)

#### 3. Dashboard Authentifié
**[`dashboard.spec.ts`](../../e2e/dashboard.spec.ts)** - 4 tests
- ✅ Affichage du post avec transition blur
- ✅ Copie dans le presse-papiers
- ✅ Déconnexion
- ✅ Snapshots visuels

### Configuration & Setup

- **[`auth.setup.ts`](../../e2e/auth.setup.ts)** - Configuration d'authentification globale
- **[`auth-confirm-hang.spec.ts`](../../e2e/auth-confirm-hang.spec.ts)** - Tests de la page de confirmation d'email

## Exécution des Tests

### Commandes Principales

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter les tests en mode UI (interface graphique)
npx playwright test --ui

# Exécuter un fichier de test spécifique
npx playwright test e2e/critical-user-journeys.spec.ts

# Exécuter les tests sur un navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Exécuter les tests en mode debug
npx playwright test --debug

# Générer un rapport HTML
npx playwright show-report
```

### Exécution Ciblée

Pour gagner du temps pendant le développement, exécutez uniquement les tests pertinents :

```bash
# Tests d'un parcours spécifique
npx playwright test -g "Complete flow from landing"

# Tests d'accessibilité uniquement
npx playwright test e2e/accessibility-and-performance.spec.ts -g "Accessibility"

# Tests de performance uniquement
npx playwright test e2e/accessibility-and-performance.spec.ts -g "Performance"
```

## Bonnes Pratiques

### 1. Utilisation des Locators

Selon [`testing-standards.md`](../architecture/testing-standards.md:97), utilisez des `data-testid` pour les locators :

```typescript
// ✅ Bon - Utilise data-testid
await page.getByTestId('theme-t1').click();

// ✅ Bon - Utilise des queries sémantiques
await page.getByRole('button', { name: 'Générer un post' }).click();

// ❌ Éviter - Sélecteurs CSS fragiles
await page.locator('.theme-button-1').click();
```

### 2. Gestion de l'État

Les tests doivent être indépendants :

```typescript
test.beforeEach(async ({ page }) => {
  // Nettoyer l'état
  await page.evaluate(() => localStorage.clear());
  
  // Configurer les mocks
  await page.route('**/api/**', async (route) => {
    // Mock responses
  });
});
```

### 3. Attentes Explicites

Évitez les `sleep`, utilisez les `waitFor` :

```typescript
// ✅ Bon - Attente explicite avec timeout
await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });

// ❌ Éviter - Sleep arbitraire
await page.waitForTimeout(5000);
```

### 4. Mocking des APIs

Mockez les appels API pour des tests stables et rapides :

```typescript
await page.route('**/api/quiz/generate', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' }
    ])
  });
});
```

## Couverture des Tests

### Parcours Utilisateurs Critiques

| Parcours | Fichier de Test | ID Test | Status |
|----------|----------------|---------|--------|
| Flux complet end-to-end | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:115) | E2E-JOURNEY-01 | ✅ |
| Sélection thème + Quiz P1 | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:122) | E2E-JOURNEY-01 | ✅ |
| Transition archétype + P2 | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:139) | E2E-JOURNEY-01 | ✅ |
| Génération de post | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:155) | E2E-JOURNEY-01 | ✅ |
| Modal d'authentification | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:164) | E2E-JOURNEY-01 | ✅ |
| Dashboard authentifié | [`dashboard.spec.ts`](../../e2e/dashboard.spec.ts:11) | - | ✅ |

### Validation de Formulaires

| Formulaire | Test | ID Test | Status |
|------------|------|---------|--------|
| Email vide | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:246) | E2E-VALIDATION-01 | ✅ |
| Email invalide | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:250) | E2E-VALIDATION-01 | ✅ |
| Email valide | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:260) | E2E-VALIDATION-01 | ✅ |
| Topic vide | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:271) | E2E-VALIDATION-02 | ✅ |
| Topic valide | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:275) | E2E-VALIDATION-02 | ✅ |

### Gestion d'Erreurs

| Scénario d'Erreur | Test | ID Test | Status |
|-------------------|------|---------|--------|
| Échec API génération | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:287) | E2E-ERROR-01 | ✅ |
| Échec pre-persist | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:307) | E2E-ERROR-02 | ✅ |
| Réseau lent | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:335) | E2E-NETWORK-01 | ✅ |
| Récupération erreur réseau | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:370) | E2E-NETWORK-02 | ✅ |

### Persistance d'État

| Scénario | Test | ID Test | Status |
|----------|------|---------|--------|
| Sauvegarde après réponses | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:398) | E2E-PERSIST-01 | ✅ |
| Restauration après reload | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:418) | E2E-PERSIST-01 | ✅ |

### Accessibilité (A11Y)

| Aspect A11Y | Test | ID Test | Status |
|-------------|------|---------|--------|
| Navigation clavier | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:15) | E2E-A11Y-01 | ✅ |
| Focus visible | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:40) | E2E-A11Y-01 | ✅ |
| Rôles ARIA | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:57) | E2E-A11Y-02 | ✅ |
| Labels de formulaire | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:76) | E2E-A11Y-03 | ✅ |
| Messages d'erreur accessibles | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:137) | E2E-A11Y-03 | ✅ |

### Performance

| Métrique | Test | ID Test | Cible | Status |
|----------|------|---------|-------|--------|
| Temps de chargement | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:158) | E2E-PERF-01 | < 3s | ✅ |
| Transition questions | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:172) | E2E-PERF-02 | < 500ms | ✅ |
| Taille localStorage | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:208) | E2E-PERF-03 | < 100KB | ✅ |

### Compatibilité

| Aspect | Test | ID Test | Status |
|--------|------|---------|--------|
| Multi-viewports | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:255) | E2E-COMPAT-01 | ✅ |
| Touch interactions | [`accessibility-and-performance.spec.ts`](../../e2e/accessibility-and-performance.spec.ts:284) | E2E-COMPAT-02 | ✅ |
| Mobile (375x667) | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:435) | E2E-MOBILE-01 | ✅ |
| Taille boutons touch | [`critical-user-journeys.spec.ts`](../../e2e/critical-user-journeys.spec.ts:461) | E2E-MOBILE-01 | ✅ |

## Débogage des Tests

### Mode Debug

```bash
# Ouvrir le test en mode debug
npx playwright test --debug e2e/critical-user-journeys.spec.ts
```

### Captures d'Écran

Les captures d'écran sont automatiquement prises en cas d'échec. Pour forcer une capture :

```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Traces

Activer les traces pour une analyse détaillée :

```typescript
// Dans playwright.config.ts
use: {
  trace: 'on-first-retry', // ou 'on', 'retain-on-failure'
}
```

Visualiser les traces :

```bash
npx playwright show-trace trace.zip
```

## Maintenance des Tests

### Mise à Jour des Snapshots

Lorsque l'UI change intentionnellement :

```bash
# Mettre à jour tous les snapshots
npx playwright test --update-snapshots

# Mettre à jour pour un test spécifique
npx playwright test e2e/dashboard.spec.ts --update-snapshots
```

### Gestion des Tests Flaky

Si un test est instable :

1. Augmenter les timeouts si nécessaire
2. Ajouter des attentes explicites
3. Vérifier les race conditions
4. Utiliser `test.retry()` en dernier recours

```typescript
test.describe.configure({ retries: 2 });
```

## CI/CD

Les tests E2E s'exécutent automatiquement dans la CI avec :

- 2 tentatives en cas d'échec
- 1 worker pour éviter les conflits
- Génération de rapports HTML

Configuration dans [`playwright.config.ts`](../../playwright.config.ts:9) :

```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : 2,
```

## Historique et Migration

### Mise à Jour 2026-01-26

**Tests d'authentification refactorisés:**
- ✅ Alignement avec le nouveau comportement UX
- ✅ Tests plus robustes et maintenables
- ✅ Meilleure couverture des cas d'erreur

**Snapshots visuels mis à jour:**
- ✅ Reflet de l'UI actuelle du dashboard
- ✅ Cohérence multi-navigateurs

### Consolidation 2026-01-26

Les tests E2E ont été consolidés pour éliminer la duplication et améliorer la maintenabilité :

- ✅ **7 fichiers supprimés** (redondants)
- ✅ **3 fichiers principaux** conservés
- ✅ **+10 nouveaux scénarios** (A11Y, performance, mobile)
- ✅ **0% de duplication** (vs ~40% avant)
- ✅ **+45% de couverture**

**Documentation:**
- [Analyse de migration](e2e-migration-analysis.md) - Analyse complète de la consolidation
- [Fichiers supprimés](e2e-files-removed.md) - Justification détaillée des suppressions

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Syntaxe Playwright](syntax/playwright.md)
- [Standards de Test](../architecture/testing-standards.md)
- [Best Practices Playwright](https://playwright.dev/docs/best-practices)
- [README E2E](../../e2e/README.md) - Guide rapide

## Support

Pour toute question ou problème avec les tests E2E :

1. Consulter ce guide et le [README E2E](../../e2e/README.md)
2. Vérifier les [standards de test](../architecture/testing-standards.md)
3. Consulter l'[analyse de migration](e2e-migration-analysis.md) pour la traçabilité
4. Examiner les tests existants similaires
5. Consulter la documentation Playwright
