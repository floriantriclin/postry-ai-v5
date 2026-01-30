# Statut Git & Linear - Story 2-11a

**Date:** 28 Janvier 2026  
**Story:** 2-11a-quick-wins (BMA-49)

---

## ⚠️ Problème Git Détecté

Un verrou Git (`index.lock`) persiste et empêche les commits. Cela indique qu'un autre processus Git est actif (peut-être Cursor ou un autre outil).

**Solution:** Fermer tous les processus Git actifs, puis exécuter:
```bash
Remove-Item .git/index.lock -Force
```

---

## 📝 Commits Git à Créer (après résolution du verrou)

### Commit 1: Fix Dashboard
```bash
git add app/dashboard/page.tsx
git commit -m "fix(dashboard): resolve crash when user has multiple posts

Remove .single() from Supabase query and use array indexing instead.
Add filter for status='revealed' to only show revealed posts.
Improve error handling to distinguish DB errors from no posts found.

Fixes BMA-3 (BUG-002)"
```

### Commit 2: Feature Archetype
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
git add _bmad-output/implementation-artifacts/2-11a-quick-wins.md _bmad-output/implementation-artifacts/sprint-status.yaml docs/qa/2-11a-test-execution-guide.md _bmad-output/implementation-artifacts/2-11a-git-commits-instructions.md
git commit -m "docs(story-2-11a): complete story implementation and QA guide

Mark all tasks as completed in story file.
Update sprint status to 'review'.
Create comprehensive QA test execution guide with manual and automated test instructions.

Story: 2-11a-quick-wins (BMA-49)"
```

### Push vers dev
```bash
git push origin dev
```

---

## 🔄 Mise à Jour Linear Requise

**Issue:** BMA-49  
**URL:** https://linear.app/floriantriclin/issue/BMA-49

### Statut à mettre à jour
- **Nouveau statut:** In Review

### Description à mettre à jour

```markdown
Story 2-11a: Quick Wins - Dashboard & Archetype Fixes

Corrige deux bugs critiques identifiés dans Epic 2:

**BUG-002:** Dashboard crash avec multiple posts
- Retiré .single() de la requête Supabase
- Ajouté filtre status='revealed'
- Amélioré gestion d'erreur

**BUG-003:** Colonne archetype manquante
- Migration SQL créée avec backfill
- API persist-on-login mise à jour
- Fallback chain vérifiée

**Implémentation complète:**
- ✅ Tous les AC satisfaits
- ✅ Tests E2E créés
- ✅ Migration SQL prête
- ✅ Guide QA disponible

**Fichier story complet:** `_bmad-output/implementation-artifacts/2-11a-quick-wins.md`
**Guide QA:** `docs/qa/2-11a-test-execution-guide.md`

**Statut:** Review (prêt pour tests QA)
```

---

## ✅ Actions Complétées

- ✅ Story complétée avec tous les AC satisfaits
- ✅ Tests E2E créés
- ✅ Migration SQL créée
- ✅ Guide QA créé
- ✅ Sprint status mis à jour
- ✅ Documentation complète

## ⏳ Actions en Attente

- ⏳ Résoudre verrou Git
- ⏳ Créer commits Git
- ⏳ Push vers dev
- ⏳ Mettre à jour Linear (statut + description)

---

**Note:** Les outils MCP Linear nécessitent une configuration spécifique. Si la mise à jour automatique échoue, mettre à jour manuellement via l'interface Linear.
