# 🚨 RUNBOOK: Emergency Database Restore
## Story 2.11b (BMA-48) - Procédure d'Urgence

**📅 Créé:** 27 Janvier 2026  
**👤 Owner:** DevOps / Tech Lead  
**⚠️ Severity:** P0 CRITICAL  
**⏱️ Temps total:** < 10 minutes

---

## 🎯 Quand Utiliser Ce Runbook?

**Utiliser IMMÉDIATEMENT si:**
- ✅ Story 2.11b a causé data loss en production
- ✅ Migration SQL a corrompu les données `posts`
- ✅ Dashboard affiche erreurs critiques post-déploiement
- ✅ Besoin de revenir à l'état avant Story 2.11b
- ✅ Feature flag `ENABLE_PERSIST_FIRST=true` cause problèmes

**NE PAS utiliser si:**
- ❌ Erreur mineure corrigeable par hotfix
- ❌ Problème isolé à 1-2 utilisateurs
- ❌ Backup disponible < 1h (attendre résolution)

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

3. **Backup Disponible**
   - [ ] Backup < 24h existe dans Supabase
   - [ ] Timestamp backup noté: ______________
   - [ ] Taille backup vérifiée: _______ MB

4. **Communication**
   - [ ] Users notifiés (si downtime prévu)
   - [ ] Monitoring actif (Sentry, logs)

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

### STEP 2: Identifier Backup à Restore (1 min)

**Supabase Dashboard:**

1. **Naviguer vers Backups**
   - [ ] https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   - [ ] Settings → Database → Backups

2. **Sélectionner Backup**
   - [ ] Trouver backup AVANT déploiement Story 2.11b
   - [ ] Vérifier timestamp: Doit être < dernière migration
   - [ ] Noter backup ID: __________________

3. **Vérifier Intégrité**
   - [ ] Taille du backup normal (< 100 MB)
   - [ ] Status: ✅ Completed
   - [ ] No errors in backup logs

**⏱️ Temps écoulé:** 2 min

---

### STEP 3: Restore Database (5 min) ⚠️

**⚠️ ATTENTION: Cette opération va REMPLACER la DB actuelle**

**Supabase Dashboard:**

1. **Initier Restore**
   - [ ] Cliquer sur backup sélectionné
   - [ ] Bouton **Restore**
   - [ ] Confirmer avec mot de passe Admin

2. **Monitoring Restore**
   - [ ] Popup de progression apparaît
   - [ ] Attendre completion (2-4 min généralement)
   - [ ] Vérifier "Restore completed successfully"

3. **Logs Monitoring**
   - [ ] Ouvrir onglet Logs (pendant restore)
   - [ ] Vérifier aucune erreur SQL
   - [ ] Confirmer tables restaurées

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
