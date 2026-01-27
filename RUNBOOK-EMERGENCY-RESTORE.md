# 🚨 RUNBOOK: Emergency Database Restore
## Story 2.11b (BMA-48) - Procédure d'Urgence

**📅 Créé:** 27 Janvier 2026  
**👤 Owner:** DevOps / Tech Lead  
**⚠️ Severity:** P0 CRITICAL  
**⏱️ Temps total:** < 10 minutes  
**🆓 Plan:** Supabase Free (BACKUPS MANUELS UNIQUEMENT)

---

## ⚠️ IMPORTANT: Plan Free - Backup Manuel

**Ce projet utilise Supabase FREE:**
- ❌ Pas de backups automatiques
- ✅ Backups manuels AVANT chaque migration (voir section ci-dessous)
- ✅ Base de données NON-PRODUCTION (contenu peut être effacé)
- ⚠️ Risque accepté: Perte potentielle de données récentes

**Procédure backup manuel OBLIGATOIRE avant migration:**
```bash
# Voir section "Backup Manuel Pre-Migration" ci-dessous
npm run db:backup  # ou export manuel via Supabase CLI
```

---

## 🎯 Quand Utiliser Ce Runbook?

**Utiliser IMMÉDIATEMENT si:**
- ✅ Story 2.11b a causé data loss
- ✅ Migration SQL a corrompu les données `posts`
- ✅ Dashboard affiche erreurs critiques post-déploiement
- ✅ Besoin de revenir à l'état avant Story 2.11b
- ✅ Feature flag `ENABLE_PERSIST_FIRST=true` cause problèmes

**NE PAS utiliser si:**
- ❌ Erreur mineure corrigeable par hotfix
- ❌ Problème isolé à 1-2 utilisateurs
- ❌ Backup manuel récent disponible (< 2h)

---

## ✅ Pré-Requis AVANT de Démarrer

**Vérifications obligatoires:**

1. **Accès & Permissions**
   - [ ] Accès Admin Supabase Dashboard
   - [ ] Accès Vercel Dashboard (pour redeploy)
   - [ ] Credentials `.env` disponibles

2. **Approbations**
   - [ ] Approbation PO obtenue (Florian) ✅
   - [ ] Tech Lead notifié
   - [ ] Équipe Dev informée

3. **Backup Manuel Disponible**
   - [ ] Backup manuel < 24h existe dans `supabase/backups/`
   - [ ] Timestamp backup noté: ______________
   - [ ] Taille backup vérifiée: _______ MB
   - [ ] Vérifier présence fichier: `backup_YYYYMMDD_HHMM.sql`

4. **Communication**
   - [ ] Users notifiés (si downtime prévu)
   - [ ] Monitoring actif (Sentry, logs)

---

## 💾 BACKUP MANUEL PRE-MIGRATION (OBLIGATOIRE)

**⚠️ À EXÉCUTER AVANT CHAQUE MIGRATION SQL**

Cette section est **OBLIGATOIRE** pour le plan Free car pas de backups automatiques.

### Option 1: Via Supabase CLI (Recommandé - 2 min)

```bash
# 1. Installer Supabase CLI si pas déjà fait
npm install -g supabase

# 2. Login Supabase
supabase login

# 3. Créer backup avec timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M)
supabase db dump --db-url "$DATABASE_URL" > supabase/backups/backup_$TIMESTAMP.sql

# 4. Vérifier backup créé
ls -lh supabase/backups/backup_$TIMESTAMP.sql

# 5. Commit backup (optionnel mais recommandé)
git add supabase/backups/backup_$TIMESTAMP.sql
git commit -m "backup: pre-migration Story 2.11b"
```

### Option 2: Via Supabase Dashboard (Alternative - 3 min)

1. **Export SQL**
   - [ ] Aller sur https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   - [ ] Menu: **SQL Editor** → **New Query**
   - [ ] Exécuter: `pg_dump` via custom query
   
2. **Copy/Paste Export**
   - [ ] Copier output SQL complet
   - [ ] Créer fichier: `supabase/backups/backup_YYYYMMDD_HHMM.sql`
   - [ ] Coller contenu
   - [ ] Sauvegarder fichier

### Option 3: Script NPM (Plus Rapide - 30 sec)

```bash
# Ajouter dans package.json (à faire 1 fois):
# "scripts": {
#   "db:backup": "supabase db dump --db-url \"$DATABASE_URL\" > supabase/backups/backup_$(date +%Y%m%d_%H%M).sql"
# }

# Utilisation (avant chaque migration):
npm run db:backup

# Résultat: supabase/backups/backup_20260127_1430.sql créé
```

### ✅ Checklist Backup Pré-Migration

**AVANT de lancer une migration SQL:**
- [ ] Backup manuel créé via option 1, 2 ou 3
- [ ] Fichier existe dans `supabase/backups/`
- [ ] Taille fichier > 10 KB (pas vide)
- [ ] Timestamp dans nom fichier
- [ ] (Optionnel) Backup commité dans Git

**Rétention des backups:**
- Garder 7 derniers backups
- Supprimer backups > 7 jours (économie espace disque)
- Backups importants (pré-migration majeure): garder indéfiniment

---

## 🔥 PROCÉDURE D'URGENCE (< 10 min)

### STEP 1: Désactiver Feature Flag (1 min) 🚨

**Action immédiate:**

```bash
# 1. Ouvrir .env en production (Vercel Dashboard)
# Environment Variables → ENABLE_PERSIST_FIRST

# 2. Changer la valeur
NEXT_PUBLIC_ENABLE_PERSIST_FIRST=false
ENABLE_PERSIST_FIRST=false

# 3. Redéployer (Vercel auto-redeploy)
# Attendre 30-60 secondes pour deployment
```

**Vérification:**
- [ ] Vercel deployment ✅ Success
- [ ] App accessible à https://postry-ai.vercel.app
- [ ] Feature flag OFF confirmé (check browser console)

**⏱️ Temps écoulé:** 1 min

---

### STEP 2: Identifier Backup Manuel à Restore (1 min)

**Plan Free - Backup Manuel:**

1. **Trouver Backup Local**
   - [ ] Ouvrir dossier: `supabase/backups/`
   - [ ] Lister fichiers: `ls -lh supabase/backups/`
   - [ ] Chercher backup AVANT migration Story 2.11b

2. **Sélectionner Backup**
   - [ ] Trouver backup avec timestamp AVANT déploiement
   - [ ] Exemple: `backup_20260127_1430.sql` (27 Jan 14h30)
   - [ ] Noter nom fichier: __________________

3. **Vérifier Intégrité**
   - [ ] Taille du backup normale (> 10 KB)
   - [ ] Ouvrir fichier: premières lignes doivent contenir SQL valide
   - [ ] Vérifier présence: `CREATE TABLE`, `INSERT INTO posts`

**⏱️ Temps écoulé:** 2 min

---

### STEP 3: Restore Database Manuellement (5 min) ⚠️

**⚠️ ATTENTION: Cette opération va REMPLACER la DB actuelle**

**Plan Free - Restore Manuel via SQL Editor:**

1. **Préparer Backup SQL**
   - [ ] Ouvrir fichier backup: `supabase/backups/backup_YYYYMMDD_HHMM.sql`
   - [ ] Copier TOUT le contenu (Ctrl+A, Ctrl+C)
   - [ ] Vérifier taille fichier < 2 MB (limitation SQL Editor)

2. **Supabase SQL Editor**
   - [ ] Aller sur https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   - [ ] Menu: **SQL Editor** → **New Query**
   - [ ] Coller contenu backup SQL
   - [ ] Cliquer **Run** (ou Ctrl+Enter)

3. **Monitoring Restore**
   - [ ] Attendre exécution (1-3 min généralement)
   - [ ] Vérifier message: "Success. No rows returned"
   - [ ] Vérifier aucune erreur SQL dans output

**Alternative si fichier > 2 MB:**
```bash
# Utiliser Supabase CLI (plus rapide)
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@db.hoomcbsfqunrkeapxbvh.supabase.co:5432/postgres"
psql -h db.hoomcbsfqunrkeapxbvh.supabase.co -U postgres -d postgres < supabase/backups/backup_YYYYMMDD_HHMM.sql
```

**⏱️ Temps écoulé:** 7 min

---

### STEP 4: Vérification Post-Restore (2 min)

**Tests de Smoke:**

1. **Test Dashboard**
   ```bash
   # Ouvrir dans browser
   https://postry-ai.vercel.app/dashboard
   
   # Vérifier:
   - [ ] Page charge sans erreur
   - [ ] 10+ posts s'affichent
   - [ ] Aucune erreur console browser
   ```

2. **Test Database**
   ```sql
   -- Supabase Dashboard → SQL Editor
   
   -- Vérifier posts table
   SELECT COUNT(*) FROM public.posts;
   -- Résultat attendu: > 0
   
   -- Vérifier colonnes
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'posts';
   -- Résultat: user_id, email, status présents
   ```

3. **Test Sentry**
   - [ ] Ouvrir Sentry dashboard
   - [ ] Vérifier 0 nouvelles erreurs (5 min)
   - [ ] Confirmer error rate normal

**⏱️ Temps écoulé:** 9 min

---

### STEP 5: Post-Restore Actions (1 min)

**Communication:**

1. **Notifier Équipe**
   ```
   🚨 INCIDENT RESOLVED - Database Restored
   
   Timeline:
   - [HH:MM] Issue detected
   - [HH:MM] Feature flag disabled
   - [HH:MM] Database restored
   - [HH:MM] Verification complete
   
   Status: ✅ App operational
   Downtime: X minutes
   Data loss: [NONE/Estimate]
   
   Next: Incident post-mortem scheduled
   ```

2. **Linear Update**
   - [ ] BMA-48 → Status: "Rolled Back"
   - [ ] Ajouter comment avec timestamp restore
   - [ ] Lier incident report

3. **Monitoring Intensif**
   - [ ] Surveiller error logs (1h)
   - [ ] Vérifier métriques utilisateurs normales
   - [ ] Stand-by pour 2h

**⏱️ Temps total:** 10 min ✅

---

## 📊 Post-Mortem Actions (< 24h)

**Après restore, analyser:**

1. **Root Cause Analysis**
   - [ ] Pourquoi Story 2.11b a échoué?
   - [ ] Quelle étape a causé le problème?
   - [ ] Tests manquants qui auraient pu détecter?

2. **Documentation**
   - [ ] Créer incident report
   - [ ] Documenter timeline exacte
   - [ ] Lessons learned

3. **Prévention Future**
   - [ ] Ajouter tests manquants
   - [ ] Renforcer validation staging
   - [ ] Review process de déploiement

---

## 🔗 Contacts d'Urgence

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| **PO (Florian)** | [SLACK/PHONE] | 24/7 |
| **Tech Lead** | [SLACK/PHONE] | 9h-20h |
| **DevOps** | [SLACK/PHONE] | On-call |
| **Supabase Support** | support@supabase.com | Email 24h |
| **Supabase Discord** | https://discord.supabase.com | Community |

---

## 📋 Checklist Validation du Runbook

**Ce runbook est valide si:**

- [x] Testé au moins 1 fois en staging
- [ ] Temps de restore mesuré < 10 min
- [ ] Backup disponible vérifié
- [ ] Accès Supabase confirmé
- [ ] Communication plan validé
- [ ] Équipe formée sur procédure

---

## 🎯 Success Criteria

**Restore considéré réussi si:**

- ✅ Database restaurée en < 10 min
- ✅ Dashboard fonctionne (10 posts affichés)
- ✅ 0 erreurs Sentry post-restore (1h)
- ✅ Users peuvent créer nouveaux posts
- ✅ Auth flow fonctionne normalement
- ✅ Aucune data loss permanent

---

## 📚 Ressources Complémentaires

**Documentation:**
- Supabase Backups: https://supabase.com/docs/guides/platform/backups
- Supabase PITR: https://supabase.com/docs/guides/platform/point-in-time-recovery

**Scripts:**
- Rollback SQL: `supabase/migrations/rollback/20260127_rollback_archetype.sql`
- Feature Flags: `lib/feature-flags.ts`

**Monitoring:**
- Sentry: [URL_SENTRY]
- Vercel Logs: https://vercel.com/floriantriclin/postry-ai/logs
- Supabase Logs: Dashboard → Logs

---

## 🚀 Alternative: Rollback SQL (Sans Restore DB)

**Si restore DB complet est trop risqué, option alternative:**

```sql
-- Utiliser le script rollback SQL au lieu de restore complet
-- Fichier: supabase/migrations/rollback/20260127_rollback_archetype.sql

-- 1. Désactiver feature flag (voir STEP 1)
-- 2. Exécuter rollback SQL dans Supabase SQL Editor
-- 3. Vérifier avec queries de validation
-- 4. Temps: < 1 min (vs 5 min pour restore)
-- 5. Data loss: NONE (juste schéma)
```

**Avantages:**
- Plus rapide (< 1 min vs 5 min)
- Moins risqué (pas de full restore)
- Rollback ciblé (juste archetype)

**Inconvénients:**
- Ne restore pas les données corrompues
- Seulement pour problèmes de schéma

---

**Créé par:** Bob (Scrum Master)  
**Version:** 1.0  
**Last Updated:** 2026-01-27  
**Testé:** ☐ Local ☐ Staging ☐ Production

---

**🚨 KEEP THIS RUNBOOK ACCESSIBLE 24/7 🚨**
