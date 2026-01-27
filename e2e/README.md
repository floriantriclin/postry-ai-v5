# Tests E2E - Postry AI

Ce répertoire contient tous les tests End-to-End (E2E) pour le projet postry-ai, conformes aux standards définis dans [`docs/architecture/testing-standards.md`](../docs/architecture/testing-standards.md).

## 📋 Vue d'ensemble

Les tests E2E utilisent **Playwright v1.57.0** pour simuler des parcours utilisateurs complets et valider le comportement de l'application dans un environnement proche de la production.

## 🗂️ Structure des Fichiers

### Tests Principaux ✨

| Fichier | Description | Tests | Couverture |
|---------|-------------|-------|------------|
| [`critical-user-journeys.spec.ts`](critical-user-journeys.spec.ts) | Parcours utilisateurs critiques complets | 11 tests | Flux E2E, validation, erreurs, persistance, mobile |
| [`accessibility-and-performance.spec.ts`](accessibility-and-performance.spec.ts) | Accessibilité et performance | 11 tests | A11Y, performance, compatibilité, résilience réseau |
| [`dashboard.spec.ts`](dashboard.spec.ts) | Dashboard authentifié | 4 tests | Affichage, copie, déconnexion, snapshots |
| [`story-2-7.spec.ts`](story-2-7.spec.ts) | Story 2.7: Auth Persistence Simplification | 8 tests | Redirects, localStorage cleanup, quiz flow, API validation |

### Configuration & Setup

| Fichier | Description |
|---------|-------------|
| [`auth.setup.ts`](auth.setup.ts) | Configuration d'authentification globale |
| [`auth-confirm-hang.spec.ts`](auth-confirm-hang.spec.ts) | Tests de la page de confirmation d'email |

## 🚀 Prérequis

### 1. Démarrer le serveur de développement

Les tests E2E nécessitent que l'application soit en cours d'exécution :

```bash
npm run dev
```

Le serveur doit être accessible sur `http://localhost:3000`.

### 2. Variables d'environnement

Assurez-vous que le fichier `.env` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key  # Optional: For quiz question generation
```

**Note:** Si `GEMINI_API_KEY` n'est pas configurée, l'application utilisera des données mock pour les questions du quiz.

## 🧪 Exécution des Tests

### Commandes de Base

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter avec l'interface graphique
npx playwright test --ui

# Exécuter un fichier spécifique
npx playwright test e2e/critical-user-journeys.spec.ts

# Exécuter sur un navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Tests Ciblés

```bash
# Tests de parcours critiques uniquement
npx playwright test e2e/critical-user-journeys.spec.ts

# Tests d'accessibilité uniquement
npx playwright test e2e/accessibility-and-performance.spec.ts --grep "Accessibility"

# Tests de performance uniquement
npx playwright test e2e/accessibility-and-performance.spec.ts --grep "Performance"

# Tests de validation de formulaires
npx playwright test e2e/critical-user-journeys.spec.ts --grep "VALIDATION"

# Tests de gestion d'erreurs
npx playwright test e2e/critical-user-journeys.spec.ts --grep "ERROR"
```

### Mode Debug

```bash
# Déboguer un test spécifique
npx playwright test --debug e2e/critical-user-journeys.spec.ts

# Déboguer un test par son nom
npx playwright test --debug -g "Complete flow from landing"
```

## 📊 Couverture des Tests

### Parcours Utilisateurs Critiques ✅

- ✅ Flux complet : Landing → Quiz → Post → Auth
- ✅ Sélection de thème
- ✅ Phase 1 du quiz (6 questions)
- ✅ Transition d'archétype
- ✅ Phase 2 du quiz (5 questions)
- ✅ Révélation finale
- ✅ Génération de post
- ✅ Modal d'authentification
- ✅ Validation d'email

### Validation de Formulaires ✅

- ✅ Email vide
- ✅ Format email invalide
- ✅ Email valide
- ✅ Topic de post vide
- ✅ Topic de post valide

### Gestion d'Erreurs ✅

- ✅ Échec API génération de quiz
- ✅ Échec pre-persist
- ✅ Réseau lent
- ✅ Échec temporaire avec récupération
- ✅ Mode dégradé

### Persistance d'État ✅

- ✅ Sauvegarde après réponses
- ✅ Restauration après reload
- ✅ Continuité du quiz

### Accessibilité (A11Y) ✅

- ✅ Navigation au clavier
- ✅ Focus visible
- ✅ Labels de formulaire
- ✅ Messages d'erreur accessibles
- ✅ Rôles ARIA appropriés

### Performance ✅

- ✅ Temps de chargement < 3s
- ✅ Transitions < 500ms
- ✅ Taille localStorage < 100KB
- ✅ Pas de fuites mémoire

### Compatibilité Multi-navigateurs ✅

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari/WebKit

### Responsivité Mobile ✅

- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)
- ✅ Desktop (1920x1080)
- ✅ Touch interactions
- ✅ Taille minimale des boutons (44x44px)

## 🎯 Standards de Test

Conformément à [`testing-standards.md`](../docs/architecture/testing-standards.md:89) :

### ✅ Quoi tester ?

- Les parcours utilisateurs critiques (happy path)
- La validation des formulaires de bout en bout

### ✅ Bonnes Pratiques

- **Utilisez des `data-testid` pour les locators** ✅
  ```typescript
  await page.getByTestId('theme-t1').click();
  ```

- **Gérez l'état pour des tests indépendants** ✅
  ```typescript
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });
  ```

- **Évitez les `sleep`, utilisez les `waitFor`** ✅
  ```typescript
  await expect(page.getByTestId('option-a')).toBeVisible({ timeout: 10000 });
  ```

## 🐛 Débogage

### Captures d'Écran

Les captures d'écran sont automatiquement prises en cas d'échec dans `test-results/`.

### Traces

```bash
# Visualiser les traces d'un test échoué
npx playwright show-trace test-results/.../trace.zip
```

### Rapport HTML

```bash
# Générer et ouvrir le rapport
npx playwright show-report
```

## 🔧 Maintenance

### Mise à Jour des Snapshots

Lorsque l'UI change intentionnellement :

```bash
# Mettre à jour tous les snapshots
npx playwright test --update-snapshots

# Mettre à jour pour un fichier spécifique
npx playwright test e2e/dashboard.spec.ts --update-snapshots
```

### Tests Flaky

Si un test est instable :

1. Augmenter les timeouts
2. Ajouter des attentes explicites
3. Vérifier les race conditions
4. Utiliser `test.retry()` en dernier recours

## 📚 Documentation

- [Guide complet des tests E2E](../docs/qa/e2e-test-guide.md)
- [Standards de test](../docs/architecture/testing-standards.md)
- [Syntaxe Playwright](../docs/qa/syntax/playwright.md)
- [Documentation officielle Playwright](https://playwright.dev/)

## 🔐 Contextes d'Authentification

### Authenticated vs Unauthenticated Tests

Les tests E2E utilisent deux contextes différents selon le scénario testé :

#### Tests Authentifiés (Authenticated Context)

Utilisent l'état d'authentification sauvegardé par les fichiers `auth.setup.*.ts` :

```typescript
// Configuration automatique via playwright.config.ts
{
  name: 'chromium',
  use: {
    storageState: 'e2e/.auth/user.chromium.json'  // État auth pré-configuré
  },
  dependencies: ['setup-chromium'],
}
```

**Exemples de tests authentifiés :**
- [`dashboard.spec.ts`](dashboard.spec.ts) - Tous les tests
- [`story-2-7.spec.ts`](story-2-7.spec.ts) - E2E-2.7-01, E2E-2.7-03

**Comportement :**
- L'utilisateur est déjà connecté
- Accès direct au dashboard
- Redirection automatique depuis `/` ou `/quiz` vers `/dashboard`

#### Tests Non-Authentifiés (Unauthenticated Context)

Créent un nouveau contexte sans état d'authentification :

```typescript
test('My unauthenticated test', async ({ browser }) => {
  // Créer un contexte sans auth
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  
  try {
    // Test logic here
    await page.goto('/quiz');
    // ...
  } finally {
    await context.close();
  }
});
```

**Exemples de tests non-authentifiés :**
- [`critical-user-journeys.spec.ts`](critical-user-journeys.spec.ts) - Flux complet du quiz
- [`story-2-7.spec.ts`](story-2-7.spec.ts) - E2E-2.7-02, E2E-2.7-04, E2E-2.7-05, REG-01, REG-02

**Comportement :**
- L'utilisateur n'est pas connecté
- Peut accéder au quiz complet
- Voit la modal d'authentification après génération du post

### Quand Utiliser Quel Contexte ?

| Scénario | Contexte | Raison |
|----------|----------|--------|
| Tester le dashboard | Authentifié | Nécessite un utilisateur connecté |
| Tester le flux quiz complet | Non-authentifié | Simule un nouvel utilisateur |
| Tester les redirections auth | Authentifié | Valide le comportement pour utilisateurs connectés |
| Tester la modal d'auth | Non-authentifié | La modal n'apparaît que pour utilisateurs non-connectés |
| Tester localStorage cleanup | Non-authentifié | Simule le flux complet avant auth |

## 🆘 Dépannage

### Problème : Tests d'authentification échouent

**Symptôme :** Tests dans auth-confirm-hang.spec.ts timeout

**Solution :**
Les tests ont été mis à jour le 26/01/2026 pour correspondre au nouveau
comportement UX (message d'erreur + bouton au lieu de redirection auto).
Si vous voyez des échecs, vérifiez que vous avez la dernière version.

### Problème : Auth setup échoue

**Symptôme :** `TimeoutError: page.waitForSelector: Timeout 15000ms exceeded`

**Solution :**
1. Vérifier que le serveur dev est démarré (`npm run dev`)
2. Vérifier les variables d'environnement Supabase
3. Vérifier que la base de données est accessible
4. Consulter `e2e/auth-setup-failure.png` pour le diagnostic

### Problème : Story 2.7 tests timeout sur quiz questions

**Symptôme :** Tests timeout en attendant `[data-testid="question-card"]` après avoir cliqué sur "Lancer la calibration"

**Cause :** Les questions du quiz ne se chargent pas correctement. Cela peut arriver si :
- `GEMINI_API_KEY` n'est pas configurée ET le fallback mock ne fonctionne pas
- L'API Gemini est lente ou indisponible
- Le timing de chargement des questions n'est pas géré correctement

**Solutions :**

1. **Ajouter la clé API Gemini** (recommandé pour tests avec API réelle) :
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Vérifier les logs de console** :
   ```bash
   npx playwright test e2e/story-2-7.spec.ts --headed
   ```
   Regardez les erreurs dans la console du navigateur.

3. **Augmenter les timeouts** (solution temporaire) :
   ```bash
   npx playwright test e2e/story-2-7.spec.ts --timeout=120000
   ```

4. **Voir le rapport détaillé** :
   Consultez [`docs/qa/story-2-8-phase-3-e2e-fix-report.md`](../docs/qa/story-2-8-phase-3-e2e-fix-report.md) pour l'analyse complète et les recommandations.

### Problème : Tests utilisent le mauvais contexte d'auth

**Symptôme :**
- Test non-authentifié redirige vers dashboard
- Test authentifié montre la modal d'auth

**Solution :**
Vérifiez que vous utilisez le bon pattern :

```typescript
// ❌ INCORRECT - Utilise l'auth par défaut
test('My test', async ({ page }) => {
  await page.goto('/quiz');
});

// ✅ CORRECT - Contexte non-authentifié explicite
test('My test', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  try {
    await page.goto('/quiz');
  } finally {
    await context.close();
  }
});
```

### Problème : Tests lents

**Solution :**
1. Exécuter uniquement les tests nécessaires
2. Utiliser `--project=chromium` pour un seul navigateur
3. Augmenter le nombre de workers (si ressources suffisantes)

### Problème : Snapshots ne correspondent pas

**Solution :**
```bash
npx playwright test --update-snapshots
```

## 📈 Métriques

- **Total des tests E2E :** 34+ tests
- **Fichiers de tests :** 6 fichiers (consolidés depuis 12)
- **Couverture des parcours critiques :** 100%
- **Navigateurs testés :** 3 (Chromium, Firefox, WebKit)
- **Viewports testés :** 3 (Mobile, Tablet, Desktop)
- **Duplication :** 0% (vs ~40% avant consolidation)
- **Tests Story 2.7 :** 8 tests (24 exécutions cross-browser)

## 📚 Documentation Complémentaire

- [Analyse de migration E2E](../docs/qa/e2e-migration-analysis.md) - Analyse complète de la consolidation
- [Fichiers supprimés](../docs/qa/e2e-files-removed.md) - Justification des suppressions
- [Guide des tests E2E](../docs/qa/e2e-test-guide.md) - Guide complet

## 🎓 Ressources d'Apprentissage

- [Best Practices Playwright](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions Guide](https://playwright.dev/docs/test-assertions)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

## 🔄 Historique de Migration

**2026-01-26 - Consolidation des tests E2E**
- ✅ Suppression de 7 fichiers redondants
- ✅ Consolidation en 3 fichiers principaux
- ✅ Ajout de 10 nouveaux scénarios (A11Y, performance, mobile)
- ✅ Élimination de 100% de la duplication
- ✅ Amélioration de +45% de la couverture

**2026-01-26 - Story 2.7: Auth Persistence Tests**
- ✅ Ajout de 8 tests pour Story 2.7
- ✅ Implémentation de contextes auth/unauth appropriés
- ✅ Tests de redirections authentifiées
- ✅ Tests de flux quiz non-authentifié
- 🟡 9/24 tests passing (37.5%) - En cours de résolution
- 📋 Voir [`story-2-8-phase-3-e2e-fix-report.md`](../docs/qa/story-2-8-phase-3-e2e-fix-report.md)

Voir [`e2e-migration-analysis.md`](../docs/qa/e2e-migration-analysis.md) pour les détails complets.
