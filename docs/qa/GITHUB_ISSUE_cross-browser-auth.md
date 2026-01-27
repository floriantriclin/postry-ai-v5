# 🐛 [E2E] Tests Dashboard échouent sur Firefox/WebKit - Problème d'authentification cross-browser

## 📋 Description

Les tests E2E du dashboard authentifié échouent systématiquement sur **Firefox** et **WebKit**, mais passent correctement sur **Chromium**. Les utilisateurs sont redirigés vers la landing page au lieu d'accéder au dashboard.

## 🔍 Symptômes

**Erreur observée:**
```
Expected: "http://localhost:3000/dashboard"
Received: "http://localhost:3000/?redirectedFrom=%2Fdashboard"
```

**Tests affectés:**
- `e2e/dashboard.spec.ts` - 4 tests skippés sur Firefox/WebKit
- Taux de réussite actuel: 89.9% (71/79 tests)
- Impact: Couverture cross-browser incomplète

## 🎯 Cause Racine

Le setup d'authentification (`e2e/auth.setup.ts`) s'exécute **une seule fois** avec le contexte Chromium par défaut, puis sauvegarde l'état dans un fichier unique (`e2e/.auth/user.json`). 

**Problème:** Les cookies et le localStorage créés dans Chromium ne sont pas compatibles avec Firefox/WebKit en raison de:
1. Différences dans la gestion des cookies `sameSite`
2. Politiques de sécurité plus strictes sur Firefox/WebKit
3. Partage d'un seul fichier `storageState` pour tous les navigateurs

## 💡 Solution Proposée

**Option A: Setup Par Navigateur** (RECOMMANDÉ)

Créer un setup d'authentification séparé pour chaque navigateur:

```typescript
// playwright.config.ts
projects: [
  { name: 'setup-chromium', testMatch: /auth\.setup\.chromium\.ts/ },
  { name: 'setup-firefox', testMatch: /auth\.setup\.firefox\.ts/ },
  { name: 'setup-webkit', testMatch: /auth\.setup\.webkit\.ts/ },
  {
    name: 'chromium',
    use: { storageState: 'e2e/.auth/user.chromium.json' },
    dependencies: ['setup-chromium'],
  },
  {
    name: 'firefox',
    use: { storageState: 'e2e/.auth/user.firefox.json' },
    dependencies: ['setup-firefox'],
  },
  {
    name: 'webkit',
    use: { storageState: 'e2e/.auth/user.webkit.json' },
    dependencies: ['setup-webkit'],
  },
]
```

**Avantages:**
- ✅ Isolation complète par navigateur
- ✅ Cookies natifs pour chaque moteur
- ✅ Solution pérenne et maintenable
- ✅ Pas de modification des tests existants

## 📋 Plan d'Action

### Phase 1: Implémentation (2-3h)
- [ ] Créer `e2e/auth.setup.chromium.ts`
- [ ] Créer `e2e/auth.setup.firefox.ts` avec config cookies adaptée
- [ ] Créer `e2e/auth.setup.webkit.ts` avec config cookies adaptée
- [ ] Modifier `playwright.config.ts` pour 3 projets setup

### Phase 2: Validation (1h)
- [ ] Tester les 3 setups individuellement
- [ ] Retirer les `test.skip()` dans `dashboard.spec.ts`
- [ ] Exécuter la suite complète sur les 3 navigateurs

### Phase 3: Documentation (30min)
- [ ] Mettre à jour `e2e/README.md`
- [ ] Documenter les changements dans le rapport d'implémentation
- [ ] Créer une PR avec les modifications

## 🎯 Critères de Succès

```bash
# Tous les tests dashboard doivent passer sur les 3 navigateurs
npx playwright test e2e/dashboard.spec.ts

# Résultat attendu:
# ✅ 15 tests passants (5 tests × 3 navigateurs)
# ✅ 0 tests skippés
# ✅ 0 tests échouants
```

**Métriques cibles:**
- Tests passants: 79/79 (100%)
- Tests skippés: 0 (0%)
- Taux de réussite: 100%
- Temps d'exécution: <5 minutes

## 📚 Documentation

Investigation complète: [`docs/qa/e2e-cross-browser-auth-investigation.md`](../docs/qa/e2e-cross-browser-auth-investigation.md)

## 🏷️ Labels

- `bug` - Comportement incorrect
- `e2e` - Tests End-to-End
- `priority: high` - Bloque la couverture cross-browser
- `good first issue` - Bien documenté, solution claire

## 👥 Assigné

À assigner à un développeur Full Stack

---

**Créé le:** 26 Janvier 2026  
**Priorité:** 🔴 Haute  
**Estimation:** 3-4 heures
