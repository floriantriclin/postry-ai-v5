# Instructions Git pour Story 2-11a

**Date:** 28 Janvier 2026  
**Story:** 2-11a-quick-wins (BMA-49)  
**Statut:** Prêt pour commits Git

---

## ⚠️ Problème Détecté

Un verrou Git (`index.lock`) empêche les commits. Résoudre avant de continuer.

### Solution Rapide

```bash
# Supprimer le verrou (si aucun processus Git n'est actif)
rm .git/index.lock

# OU sous Windows PowerShell
Remove-Item .git/index.lock -Force
```

---

## 📝 Commits à Créer (selon guide Git)

### Commit 1: Fix Dashboard (BUG-002)

```bash
git add app/dashboard/page.tsx
git commit -m "fix(dashboard): resolve crash when user has multiple posts

Remove .single() from Supabase query and use array indexing instead.
Add filter for status='revealed' to only show revealed posts.
Improve error handling to distinguish DB errors from no posts found.

Fixes BMA-3 (BUG-002)"
```

### Commit 2: Feature Archetype Column (BUG-003)

```bash
git add supabase/migrations/20260128235551_add_archetype_to_posts.sql app/api/auth/persist-on-login/route.ts
git commit -m "feat(posts): add archetype column with migration and API update

Add archetype TEXT column to posts table for denormalized access.
Include idempotent backfill from equalizer_settings JSONB.
Update persist-on-login API to save archetype in DB column.

Fixes BMA-2 (BUG-003)"
```

### Commit 3: Tests E2E

```bash
git add e2e/dashboard-multiple-posts.spec.ts e2e/dashboard.spec.ts
git commit -m "test(e2e): add tests for dashboard multiple posts and archetype display

Add comprehensive E2E tests for BUG-002 (multiple posts scenario).
Add E2E test for BUG-003 (archetype display and fallback chain).
Tests cover edge cases: pending posts filtering, performance with 10+ posts.

Related to BMA-49, BMA-2, BMA-3"
```

### Commit 4: Documentation

```bash
git add _bmad-output/implementation-artifacts/2-11a-quick-wins.md _bmad-output/implementation-artifacts/sprint-status.yaml docs/qa/2-11a-test-execution-guide.md
git commit -m "docs(story-2-11a): complete story implementation and QA guide

Mark all tasks as completed in story file.
Update sprint status to 'review'.
Create comprehensive QA test execution guide with manual and automated test instructions.

Story: 2-11a-quick-wins (BMA-49)"
```

---

## 🚀 Push vers Remote

```bash
# Vérifier qu'on est sur dev
git branch

# Push vers dev
git push origin dev
```

---

## 📋 Checklist

- [ ] Résoudre le verrou Git (`rm .git/index.lock`)
- [ ] Créer les 4 commits dans l'ordre
- [ ] Vérifier les messages de commit (conventionnel)
- [ ] Push vers `origin dev`
- [ ] Vérifier que les commits sont sur GitHub

---

**Note:** Ces commits suivent les conventions du guide Git (`docs/git-strategy.md`).
