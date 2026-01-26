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
```

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

- **Total des tests E2E :** 26+ tests
- **Fichiers de tests :** 5 fichiers (consolidés depuis 12)
- **Couverture des parcours critiques :** 100%
- **Navigateurs testés :** 3 (Chromium, Firefox, WebKit)
- **Viewports testés :** 3 (Mobile, Tablet, Desktop)
- **Duplication :** 0% (vs ~40% avant consolidation)

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

Voir [`e2e-migration-analysis.md`](../docs/qa/e2e-migration-analysis.md) pour les détails complets.
