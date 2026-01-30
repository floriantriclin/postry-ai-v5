# Guide d'Exécution des Tests - Story 2.11a: Quick Wins

**Date:** 28 Janvier 2026  
**Story:** 2-11a-quick-wins  
**Linear:** BMA-49  
**Type:** Bug Fixes (BUG-002 Dashboard, BUG-003 Archetype)  
**Statut Story:** review (prêt pour tests QA)

---

## 📋 Vue d'Ensemble

Cette story corrige deux bugs critiques :
- **BUG-002:** Dashboard crash avec multiple posts
- **BUG-003:** Colonne archetype manquante (affichage "Archetype Inconnu")

**Tests à exécuter:**
- Tests E2E automatisés (Playwright)
- Tests manuels de validation
- Vérification migration SQL

---

## 🔧 Prérequis

### Environnement de Test

1. **Variables d'environnement requises:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<votre-url-supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<votre-service-role-key>
   ```

2. **Base de données:**
   - Migration SQL doit être appliquée : `supabase/migrations/20260128235551_add_archetype_to_posts.sql`
   - Vérifier que la colonne `archetype` existe : `SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'archetype';`

3. **Dépendances:**
   ```bash
   npm install
   ```

---

## 🧪 Tests E2E Automatisés

### Fichiers de Tests

1. **`e2e/dashboard-multiple-posts.spec.ts`** - Tests BUG-002
2. **`e2e/dashboard.spec.ts`** - Test BUG-003 (archetype display)

### Exécution des Tests

#### Option 1: Tous les tests de la story
```bash
npm test -- e2e/dashboard-multiple-posts.spec.ts e2e/dashboard.spec.ts --reporter=list
```

#### Option 2: Tests individuels
```bash
# Test BUG-002 uniquement
npm test -- e2e/dashboard-multiple-posts.spec.ts --reporter=list

# Test BUG-003 uniquement (test "should display archetype correctly")
npm test -- e2e/dashboard.spec.ts -g "should display archetype correctly" --reporter=list
```

#### Option 3: Mode UI (recommandé pour debug)
```bash
npx playwright test e2e/dashboard-multiple-posts.spec.ts --ui
```

### Scénarios de Tests Automatisés

#### BUG-002: Dashboard Multiple Posts

| Test ID | Description | Critère de Réussite |
|---------|------------|---------------------|
| `2-11a-E2E-001` | Dashboard avec 2+ posts révélés | Le post le plus récent s'affiche, pas de crash |
| `2-11a-E2E-002` | Dashboard avec posts `status='pending'` | Posts pending ne s'affichent pas |
| `2-11a-E2E-003` | Performance avec 10+ posts | Dashboard charge en < 5 secondes |

**Détails:**
- Crée 2 posts avec timestamps différents
- Vérifie que le post le plus récent (`created_at` DESC) s'affiche
- Vérifie qu'aucune erreur Supabase ne se produit
- Teste avec 12 posts pour valider les performances

#### BUG-003: Affichage Archetype

| Test ID | Description | Critère de Réussite |
|---------|------------|---------------------|
| `2-11a-E2E-004` | Archetype depuis colonne DB | Archetype s'affiche correctement (pas "Archetype Inconnu") |
| `2-11a-E2E-005` | Fallback si colonne NULL | Fallback vers `meta.archetype.name` fonctionne |

**Détails:**
- Crée un post avec `archetype` dans la colonne DB
- Vérifie l'affichage "Tone: [archetype]"
- Teste le fallback si colonne NULL

---

## ✋ Tests Manuels

### Checklist de Validation Manuelle

#### BUG-002: Dashboard Multiple Posts

- [ ] **Setup:** Créer 2+ posts pour le même utilisateur via l'API ou directement en DB
  ```sql
  -- Exemple SQL pour créer 2 posts de test
  INSERT INTO posts (user_id, email, status, theme, content, created_at)
  VALUES 
    ('<user-id>', 'test@example.com', 'revealed', 'Post Ancien', 'Contenu ancien', '2025-01-01'),
    ('<user-id>', 'test@example.com', 'revealed', 'Post Récent', 'Contenu récent', NOW());
  ```

- [ ] **Test 1:** Naviguer vers `/dashboard`
  - ✅ Le post le plus récent s'affiche (par `created_at` DESC)
  - ✅ Aucune erreur dans la console navigateur
  - ✅ Aucune erreur dans les logs Supabase

- [ ] **Test 2:** Créer un post avec `status='pending'`
  ```sql
  INSERT INTO posts (user_id, email, status, theme, content)
  VALUES ('<user-id>', 'test@example.com', 'pending', 'Post Pending', 'Ne devrait pas apparaître');
  ```
  - ✅ Le post pending ne s'affiche PAS sur le dashboard
  - ✅ Seuls les posts `status='revealed'` sont visibles

- [ ] **Test 3:** Tester avec 10+ posts
  - ✅ Le dashboard charge rapidement (< 5 secondes)
  - ✅ Le post le plus récent s'affiche toujours
  - ✅ Aucun problème de performance

#### BUG-003: Affichage Archetype

- [ ] **Test 1:** Vérifier migration SQL appliquée
  ```sql
  -- Vérifier que la colonne existe
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'posts' AND column_name = 'archetype';
  -- Résultat attendu: archetype | text | YES
  ```

- [ ] **Test 2:** Vérifier backfill des posts existants
  ```sql
  -- Compter les posts avec archetype rempli
  SELECT COUNT(*) FROM posts WHERE archetype IS NOT NULL;
  -- Devrait correspondre aux posts ayant equalizer_settings->archetype->name
  ```

- [ ] **Test 3:** Créer un nouveau post via API `persist-on-login`
  - ✅ Le post créé a `archetype` rempli dans la colonne DB
  - ✅ L'archetype s'affiche sur le dashboard (pas "Archetype Inconnu")

- [ ] **Test 4:** Vérifier affichage sur dashboard
  - ✅ "Tone: [nom archetype]" s'affiche correctement
  - ✅ Pas de "Archetype Inconnu" si archetype existe

- [ ] **Test 5:** Tester fallback chain
  - ✅ Si `post.archetype` NULL → utilise `meta.archetype.name`
  - ✅ Si `meta.archetype.name` NULL → affiche "Archetype Inconnu"

---

## 🗄️ Vérification Migration SQL

### Étape 1: Appliquer la Migration

```bash
# Via Supabase CLI (si configuré)
supabase migration up

# Ou via Supabase Dashboard SQL Editor
# Copier le contenu de: supabase/migrations/20260128235551_add_archetype_to_posts.sql
```

### Étape 2: Vérifier la Migration

```sql
-- 1. Vérifier que la colonne existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'archetype';

-- Résultat attendu:
-- column_name | data_type | is_nullable
-- archetype   | text      | YES

-- 2. Vérifier le backfill
SELECT 
  COUNT(*) as total_posts,
  COUNT(archetype) as posts_with_archetype,
  COUNT(*) FILTER (WHERE archetype IS NOT NULL) as backfilled_count
FROM posts;

-- 3. Vérifier un exemple de backfill
SELECT 
  id,
  theme,
  archetype,
  equalizer_settings->'archetype'->>'name' as json_archetype
FROM posts
WHERE archetype IS NOT NULL
LIMIT 5;

-- Vérifier que archetype correspond à json_archetype
```

### Étape 3: Vérifier Idempotence

```sql
-- Relancer le backfill (devrait être idempotent)
UPDATE public.posts
SET archetype = (
  CASE 
    WHEN equalizer_settings IS NOT NULL 
      AND equalizer_settings::jsonb ? 'archetype'
      AND equalizer_settings::jsonb->'archetype' IS NOT NULL
      AND equalizer_settings::jsonb->'archetype'->>'name' IS NOT NULL
    THEN equalizer_settings::jsonb->'archetype'->>'name'
    ELSE NULL
  END
)
WHERE archetype IS NULL;

-- Vérifier qu'aucun doublon n'a été créé
-- (devrait retourner 0 lignes modifiées si déjà backfilled)
```

---

## 📊 Critères d'Acceptation - Validation

### BUG-002: Dashboard Multiple Posts

| AC | Description | Test | Statut |
|----|-------------|------|--------|
| #1 | Dashboard ne crash plus avec 2+ posts | E2E + Manuel | ⬜ |
| #2 | Dashboard affiche le post le plus récent | E2E + Manuel | ⬜ |
| #3 | Seuls les posts `status='revealed'` affichés | E2E + Manuel | ⬜ |
| #4 | Messages d'erreur distincts (DB vs no posts) | Manuel | ⬜ |
| #5 | Test E2E valide comportement 2+ posts | E2E | ⬜ |

### BUG-003: Colonne Archetype

| AC | Description | Test | Statut |
|----|-------------|------|--------|
| #1 | Migration SQL créée et appliquée | SQL | ⬜ |
| #2 | Backfill des posts existants | SQL | ⬜ |
| #3 | API `persist-on-login` enregistre archetype | Manuel | ⬜ |
| #4 | Dashboard affiche le vrai archetype | E2E + Manuel | ⬜ |
| #5 | Fallback chain respectée | E2E + Manuel | ⬜ |
| #6 | Test E2E valide affichage archetype | E2E | ⬜ |

---

## 🐛 Dépannage

### Problème: Tests E2E échouent avec "User not authenticated"

**Solution:**
```bash
# Régénérer l'état d'authentification
npx playwright test --project=setup
```

### Problème: Migration SQL échoue

**Vérifications:**
1. Vérifier que vous êtes connecté à la bonne base de données
2. Vérifier que la colonne n'existe pas déjà: `SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'archetype';`
3. Si la colonne existe déjà, la migration utilisera `ADD COLUMN IF NOT EXISTS` (safe)

### Problème: Archetype ne s'affiche pas

**Vérifications:**
1. Vérifier que la colonne DB est remplie: `SELECT id, archetype FROM posts WHERE id = '<post-id>';`
2. Vérifier les logs navigateur pour erreurs JavaScript
3. Vérifier le fallback chain dans `post-reveal-view.tsx` ligne 50

### Problème: Dashboard crash toujours avec multiple posts

**Vérifications:**
1. Vérifier que `.single()` a bien été retiré dans `app/dashboard/page.tsx`
2. Vérifier que le filtre `.eq("status", "revealed")` est présent
3. Vérifier les logs Supabase pour erreurs de requête

---

## 📝 Rapport de Test

### Template de Rapport

```markdown
# Rapport de Test - Story 2.11a

**Date:** [DATE]
**Testeur:** [NOM]
**Environnement:** [STAGING/PRODUCTION]

## Résultats Tests E2E

| Test ID | Résultat | Notes |
|---------|----------|-------|
| 2-11a-E2E-001 | ✅/❌ | |
| 2-11a-E2E-002 | ✅/❌ | |
| 2-11a-E2E-003 | ✅/❌ | |
| 2-11a-E2E-004 | ✅/❌ | |
| 2-11a-E2E-005 | ✅/❌ | |

## Résultats Tests Manuels

### BUG-002
- [ ] Test 1: Multiple posts - ✅/❌
- [ ] Test 2: Posts pending filtrés - ✅/❌
- [ ] Test 3: Performance 10+ posts - ✅/❌

### BUG-003
- [ ] Migration SQL appliquée - ✅/❌
- [ ] Backfill vérifié - ✅/❌
- [ ] Affichage archetype - ✅/❌
- [ ] Fallback chain - ✅/❌

## Issues Découvertes

[Liste des bugs/améliorations découverts]

## Recommandation

✅ **APPROUVÉ** - Prêt pour production  
⚠️ **APPROUVÉ AVEC RÉSERVES** - [Détails]  
❌ **REJETÉ** - [Raison]

## Signatures

**Testeur:** _______________  
**Date:** _______________
```

---

## 🔗 Références

- **Story:** `_bmad-output/implementation-artifacts/2-11a-quick-wins.md`
- **Migration SQL:** `supabase/migrations/20260128235551_add_archetype_to_posts.sql`
- **Tests E2E:** `e2e/dashboard-multiple-posts.spec.ts`, `e2e/dashboard.spec.ts`
- **Code modifié:** `app/dashboard/page.tsx`, `app/api/auth/persist-on-login/route.ts`
- **Linear Issue:** https://linear.app/floriantriclin/issue/BMA-49

---

**Créé par:** Amelia (Developer)  
**Date:** 28 Janvier 2026  
**Version:** 1.0
