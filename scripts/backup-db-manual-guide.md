# 📦 Backup Manuel - Guide Pas-à-Pas
## Story 2.11b (BMA-48) - Plan Supabase Free

**⚠️ Supabase CLI nécessite Docker qui n'est pas disponible.**

**Solution alternative : Backup manuel via Supabase Dashboard (5 min)**

---

## 🎯 Procédure Complète

### Option A: Export SQL via Dashboard (Recommandé - 3 min)

1. **Ouvrir Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   - Menu: **SQL Editor**

2. **Créer backup complet**
   
   Copier-coller ce script SQL dans l'éditeur:
   
   ```sql
   -- BACKUP COMPLET - Story 2.11b
   -- Date: 2026-01-27
   
   -- Backup table posts (données + structure)
   COPY (
     SELECT * FROM public.posts
   ) TO STDOUT WITH CSV HEADER;
   ```
   
   Puis:
   - Cliquer **Run** (Ctrl+Enter)
   - Copier le résultat CSV
   - Sauvegarder dans: `supabase/backups/backup_manual_20260127.csv`

3. **Backup structure (schéma SQL)**
   
   SQL Editor → **New Query** → Coller:
   
   ```sql
   -- Structure table posts
   SELECT 
     table_name,
     column_name,
     data_type,
     character_maximum_length,
     is_nullable,
     column_default
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'posts'
   ORDER BY ordinal_position;
   ```
   
   Sauvegarder le résultat dans: `supabase/backups/schema_20260127.txt`

---

### Option B: pg_dump via psql (Si installé - 5 min)

Si `psql` est installé localement:

```bash
# 1. Construire l'URL de connexion
# Format: postgresql://postgres:[PASSWORD]@db.hoomcbsfqunrkeapxbvh.supabase.co:5432/postgres

# 2. Obtenir le mot de passe DB
# Dashboard → Settings → Database → Database password (afficher)

# 3. Exécuter pg_dump
pg_dump \
  -h db.hoomcbsfqunrkeapxbvh.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase/backups/backup_20260127.sql

# Entrer le mot de passe quand demandé
```

---

### Option C: Installer Docker (Pour CLI automatique - Setup 30 min)

Si tu veux que `npm run db:backup` fonctionne:

1. **Installer Docker Desktop**
   - URL: https://www.docker.com/products/docker-desktop/
   - Télécharger + Installer
   - Redémarrer Windows

2. **Tester**
   ```bash
   docker --version
   npm run db:backup
   ```

---

## ✅ Vérification Post-Backup

**Quel que soit la méthode choisie:**

- [ ] Fichier backup créé dans `supabase/backups/`
- [ ] Taille > 1 KB (pas vide)
- [ ] Timestamp dans le nom du fichier
- [ ] Contenu contient des données `posts`

---

## 📌 Recommandation Finale

**Pour Story 2.11b (aujourd'hui):**

✅ **Option A (Export Dashboard CSV)** - Le plus rapide et fiable
- Pas de setup requis
- Fonctionne toujours
- 3 minutes chrono

❌ **Option C (Docker)** - À éviter pour l'instant
- Setup long (30 min)
- Non critique pour cette story
- On peut le faire plus tard si besoin

---

## 🚀 Next Steps Après Backup

Une fois le backup manuel fait:

1. ✅ Sauvegarder fichier dans `supabase/backups/`
2. ✅ Optionnel: Commit dans Git
3. 🚀 **Démarrer Story 2.11b Phase 1**

---

**Créé par:** Bob (SM)  
**Story:** 2.11b (BMA-48) Phase 0  
**Date:** 27 Janvier 2026
