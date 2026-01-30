# Stratégie Git / GitHub - Postry AI

**Date de création:** 28 Janvier 2026  
**Validé par:** Florian (PO/Dev Lead)  
**Dernière mise à jour:** 28 Janvier 2026  
**Statut:** ✅ ACTIF - À suivre par toute l'équipe

---

## 🎯 Principes Fondamentaux

### Règles ABSOLUES

1. **Branche `main` est PROTÉGÉE** - Rien n'est mergé sur `main` sans validation explicite de Florian (PO)
2. **Branche `dev` est la branche de développement principale** - Tous les développements se font sur `dev`
3. **Branches `features/xxx` sont optionnelles** - Pour features complexes nécessitant isolation
4. **Responsabilité Git:** Le développeur (Amelia) gère la stratégie git **avant, pendant et après** le développement

---

## 🌳 Structure des Branches

### Branches Principales

| Branche | Usage | Protection | Merge Policy |
|---------|-------|------------|--------------|
| `main` | Production / Beta testeurs | 🔒 **PROTÉGÉE** | Validation explicite PO uniquement |
| `dev` | Développement principal | ✅ Active | Merge libre depuis features |
| `features/xxx` | Features isolées (optionnel) | ✅ Active | Merge vers `dev` après validation |

### Conventions de Nommage

**Branches features:**
- Format: `features/2-11a-quick-wins` ou `features/bma-49-dashboard-fix`
- Basées sur: Story ID ou Linear Issue ID
- Exemples:
  - `features/2-11a-quick-wins`
  - `features/bma-49-dashboard-fix`
  - `features/epic-3-post-history`

---

## 🔄 Workflow Standard

### Workflow pour Story Standard

```bash
# 1. S'assurer d'être à jour sur dev
git checkout dev
git pull origin dev

# 2. Créer branche feature (optionnel - peut travailler directement sur dev)
git checkout -b features/2-11a-quick-wins

# 3. Développer et commiter régulièrement
git add .
git commit -m "feat: fix dashboard multiple posts bug"
git commit -m "feat: add archetype column migration"

# 4. Push vers remote
git push origin features/2-11a-quick-wins

# 5. Après validation locale, merge vers dev
git checkout dev
git merge features/2-11a-quick-wins
git push origin dev

# 6. Merge vers main UNIQUEMENT après validation explicite de Florian
# (À faire manuellement après discussion avec PO)
```

### Workflow Simplifié (Développement Direct sur Dev)

Pour stories simples ou développement solo:

```bash
# 1. S'assurer d'être à jour
git checkout dev
git pull origin dev

# 2. Développer directement sur dev
# ... faire les changements ...

# 3. Commiter et push
git add .
git commit -m "feat: description de la feature"
git push origin dev

# 4. Merge vers main après validation PO
# (À faire manuellement)
```

---

## 📝 Conventions de Commit

### Format Conventionnel

Suivre [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nouvelle feature
- `fix:` - Correction de bug
- `docs:` - Documentation
- `refactor:` - Refactoring de code
- `test:` - Ajout/modification de tests
- `chore:` - Maintenance (dependencies, config, etc.)
- `style:` - Formatage de code (pas de changement fonctionnel)

### Exemples

```bash
feat: add archetype column to posts table
fix: resolve dashboard crash with multiple posts
docs: update git strategy documentation
refactor: extract dashboard query logic to helper
test: add E2E test for dashboard multiple posts
chore: update dependencies
```

### Format Complet Recommandé

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

**Exemple:**
```bash
fix(dashboard): resolve crash when user has multiple posts

Remove .single() from Supabase query and use array indexing instead.
Add filter for status='revealed' to only show revealed posts.

Fixes BMA-3 (BUG-002)
```

---

## 🚀 Déploiement & Merge vers Main

### Processus de Merge vers Main

**⚠️ CRITIQUE:** La branche `main` est **PROTÉGÉE**. Aucun merge automatique n'est autorisé.

**Étapes obligatoires:**

1. **Développement complet sur `dev`**
   - Tous les tests passent
   - Code review effectué (si applicable)
   - Validation locale réussie

2. **Demande de merge vers `main`**
   - Créer une Pull Request (PR) `dev` → `main`
   - Inclure description complète des changements
   - Mentionner les Linear Issues concernées
   - Attendre validation explicite de Florian (PO)

3. **Validation PO**
   - Florian valide explicitement le merge
   - Merge effectué manuellement ou après approbation PR

4. **Post-merge**
   - Vérifier que le déploiement automatique fonctionne
   - Monitorer les erreurs potentielles

### Exemple de PR Description

```markdown
## Description
Fix dashboard crash when user has multiple posts and add archetype column.

## Changements
- Remove `.single()` from dashboard query
- Add `archetype` column to posts table with migration
- Update persist-on-login API to save archetype
- Add E2E tests for multiple posts scenario

## Linear Issues
- BMA-49 (Story 2-11a)
- BMA-2 (BUG-003)
- BMA-3 (BUG-002)

## Tests
- ✅ E2E tests pass
- ✅ Migration tested locally
- ✅ Manual testing completed

## Checklist
- [ ] Code reviewed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Ready for PO validation
```

---

## 🔧 Responsabilités par Rôle

### Developer (Amelia)

**Responsabilité:** Gère la stratégie git **avant, pendant et après** le développement

**Avant développement:**
- Créer branche appropriée (`dev` ou `features/xxx`)
- S'assurer d'être à jour avec `dev`
- Vérifier l'état du repository

**Pendant développement:**
- Commiter régulièrement avec messages conventionnels
- Push vers remote régulièrement
- Gérer les conflits si nécessaire

**Après développement:**
- S'assurer que tous les tests passent
- Créer PR vers `dev` si branche feature utilisée
- Merge vers `dev` après validation
- Préparer PR vers `main` et attendre validation PO

### Scrum Master (Bob)

**Responsabilité:** Documenter et communiquer la stratégie git

- Maintenir ce document à jour
- S'assurer que toute l'équipe connaît la stratégie
- Clarifier les questions sur le workflow git

### Product Owner (Florian)

**Responsabilité:** Valider les merges vers `main`

- Examiner les PRs `dev` → `main`
- Valider explicitement avant merge
- Gérer les déploiements en production

---

## 🛡️ Protection des Branches

### Configuration GitHub (Recommandée)

**Branche `main`:**
- ✅ Require pull request reviews (1 approver minimum: Florian)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Branche `dev`:**
- ✅ Require pull request reviews (optionnel)
- ✅ Require status checks to pass before merging
- ✅ Allow force pushes (pour corrections rapides)

---

## 📊 Workflow Visuel

```
┌─────────┐
│  main   │ ← PROTÉGÉE (validation PO requise)
└────┬────┘
     │
     │ Merge après validation PO
     │
┌────▼────┐
│   dev   │ ← Développement principal
└────┬────┘
     │
     │ Merge après développement
     │
┌────▼────────────┐
│ features/xxx    │ ← Optionnel (isolation)
└─────────────────┘
```

---

## ⚠️ Situations Spéciales

### Hotfix Urgent

Si un bug critique nécessite un fix immédiat sur `main`:

1. Créer branche `hotfix/xxx` depuis `main`
2. Fixer le bug
3. Tester rapidement
4. Merge vers `main` avec validation PO
5. Merge vers `dev` pour synchroniser

### Conflits de Merge

**Si conflit lors du merge vers `dev`:**
- Résoudre les conflits localement
- Tester que tout fonctionne
- Push la résolution

**Si conflit lors du merge vers `main`:**
- Informer Florian (PO)
- Résoudre avec validation PO
- Tester exhaustivement avant merge

### Rollback

**Si problème détecté après merge vers `main`:**
- Créer branche `hotfix/rollback-xxx`
- Revert le commit problématique
- Tester le rollback
- Merge avec validation PO

---

## 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) (référence, adapté pour notre workflow)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

## ✅ Checklist pour Développeur

Avant de commencer une story:
- [ ] Être à jour sur `dev`: `git pull origin dev`
- [ ] Créer branche si nécessaire: `git checkout -b features/xxx`
- [ ] Vérifier l'état: `git status`

Pendant le développement:
- [ ] Commiter régulièrement avec messages conventionnels
- [ ] Push vers remote régulièrement
- [ ] Résoudre les conflits si nécessaire

Après le développement:
- [ ] Tous les tests passent
- [ ] Code review effectué (si applicable)
- [ ] Merge vers `dev` effectué
- [ ] PR vers `main` créée et validée par PO
- [ ] Merge vers `main` effectué après validation

---

**Dernière mise à jour:** 28 Janvier 2026  
**Prochaine révision:** À réviser si changement de stratégie ou ajout de nouvelles règles
