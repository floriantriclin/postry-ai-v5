# 🧪 ROLLBACK SQL - Test Guide
## Story 2.11b (BMA-48) - Dev Task

**📅 Date:** 27 Janvier 2026  
**⏰ Durée:** 30 minutes  
**👤 Owner:** Dev Team  
**🎯 Objectif:** Valider que le rollback SQL fonctionne correctement

---

## 📋 Test Checklist

### Pré-Requis
- [ ] Docker Desktop installé et démarré
- [ ] Supabase CLI installé (v2.67.1+)
- [ ] Script: `supabase/migrations/rollback/20260127_rollback_archetype.sql`

---

## 🧪 PROCÉDURE DE TEST (30 min)

### Phase 1: Setup Local DB (5 min)

```bash
# 1. Démarrer Supabase local
supabase start

# 2. Vérifier que containers sont actifs
supabase status

# Expected output:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**Vérification:**
- [ ] Containers actifs (supabase_db, supabase_api, etc.)
- [ ] Port 54322 accessible
- [ ] Aucune erreur dans logs

---

### Phase 2: Appliquer Forward Migration (5 min)

**Simuler l'état APRÈS Story 2.11b:**

```bash
# Appliquer migration qui ajoute archetype
supabase db reset

# Vérifier que migration est appliquée
supabase migration list

# Expected: 
# - 20260123000000_update_posts_schema_and_trigger.sql ✅
```

**Vérifier schéma:**

```sql
# Dans Supabase Studio (http://127.0.0.1:54323)
# Ou via psql:

psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

-- Vérifier colonnes posts
\d posts

-- Expected columns:
-- id, content, poem, archetype, status, email, user_id, created_at
```

**Checklist:**
- [ ] Migration appliquée ✅
- [ ] Colonne `email` existe
- [ ] Colonne `status` existe  
- [ ] Trigger `on_auth_user_created_link_posts` existe

---

### Phase 3: Exécuter Rollback SQL (10 min)

```bash
# Option 1: Via psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -f supabase/migrations/rollback/20260127_rollback_archetype.sql

# Option 2: Via Supabase Studio
# - Ouvrir SQL Editor
# - Copier contenu du fichier rollback
# - Exécuter
```

**Monitoring pendant exécution:**

- [ ] Transaction commence (BEGIN)
- [ ] Chaque NOTICE affiché:
  - `Column archetype dropped successfully` OU
  - `Column archetype does not exist - skipping`
- [ ] UPDATE posts exécuté (rows affected: X)
- [ ] DROP TRIGGER exécuté
- [ ] DROP FUNCTION exécuté
- [ ] Transaction commit (COMMIT)
- [ ] Aucune erreur SQL

**Temps d'exécution mesuré:** _____ secondes (target: < 30s)

---

### Phase 4: Validation Post-Rollback (10 min)

**Vérifications obligatoires:**

```sql
-- 1. Vérifier schéma posts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'posts'
ORDER BY ordinal_position;

-- Expected:
-- ✅ email column exists
-- ✅ status column exists
-- ✅ archetype column DOES NOT exist
-- ✅ user_id nullable (DROP NOT NULL)

-- 2. Vérifier trigger n'existe plus
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_link_posts';
-- Expected: 0

-- 3. Vérifier function n'existe plus
SELECT COUNT(*) FROM pg_proc 
WHERE proname = 'handle_new_user_post_linking';
-- Expected: 0

-- 4. Vérifier posts data integrity
SELECT COUNT(*) FROM public.posts;
-- Expected: Same count as before rollback

-- 5. Vérifier status field reset
SELECT status, COUNT(*) FROM public.posts GROUP BY status;
-- Expected: All 'pending' (no 'revealed')
```

**Checklist:**
- [ ] Colonne `archetype` supprimée ✅
- [ ] Trigger supprimé ✅
- [ ] Function supprimée ✅
- [ ] Nombre de posts inchangé ✅
- [ ] Status reset à 'pending' ✅

---

### Phase 5: Test de Ré-Application (Bonus - 5 min)

**Vérifier que rollback est idempotent:**

```bash
# Ré-exécuter le même rollback script
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -f supabase/migrations/rollback/20260127_rollback_archetype.sql

# Expected:
# - Aucune erreur
# - Messages "does not exist - skipping"
# - Transaction commit OK
```

**Vérification:**
- [ ] Script ré-exécuté sans erreur ✅
- [ ] Schéma inchangé (toujours sans archetype)
- [ ] Aucune data loss

---

## ✅ Definition of Done

**Test considéré réussi si:**

- [x] Rollback script s'exécute sans erreur
- [x] Temps d'exécution < 30 secondes
- [x] Colonne archetype supprimée
- [x] Trigger + function supprimés
- [x] Data integrity préservée (COUNT posts inchangé)
- [x] Script est idempotent (peut run 2x sans erreur)
- [x] Documentation temps exécution réel
- [x] Screenshot résultats sauvegardé
- [x] Bob (SM) notifié ✅

---

## 📊 Test Report Template

**À remplir après test:**

```markdown
## Rollback SQL Test Report
**Date:** 2026-01-27
**Tester:** [NOM]
**Environment:** Local Supabase

### Résultats

| Métrique | Target | Actual | Status |
|----------|--------|--------|--------|
| Execution time | < 30s | ___s | ☐ ✅ ☐ ❌ |
| Errors | 0 | ___ | ☐ ✅ ☐ ❌ |
| Archetype dropped | Yes | ___ | ☐ ✅ ☐ ❌ |
| Trigger dropped | Yes | ___ | ☐ ✅ ☐ ❌ |
| Function dropped | Yes | ___ | ☐ ✅ ☐ ❌ |
| Data loss | None | ___ | ☐ ✅ ☐ ❌ |
| Idempotent | Yes | ___ | ☐ ✅ ☐ ❌ |

### Problèmes Rencontrés
[Si aucun, écrire "NONE"]

### Recommandations
[Améliorations suggérées]

### Approved for Production?
☐ YES ☐ NO (raison: _____________)
```

---

## 🚀 Next Steps Après Test

**Si test ✅ RÉUSSI:**
1. Sauvegarder test report dans `_bmad-output/implementation-artifacts/`
2. Notifier Bob (SM): "Rollback SQL ✅ testé et validé"
3. Commit script dans repo
4. Story 2.11b peut démarrer demain ! 🚀

**Si test ❌ ÉCHOUÉ:**
1. Noter erreurs exactes
2. Demander aide à Tech Lead
3. Corriger script
4. Re-tester jusqu'à succès

---

**Créé par:** Bob (Scrum Master)  
**Pour:** Dev Team  
**Deadline:** Aujourd'hui 17h
