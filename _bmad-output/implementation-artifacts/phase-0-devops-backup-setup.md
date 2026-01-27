# Phase 0 Setup - Backup DB Automatique
## Story 2.11b (BMA-48) - DevOps Task

**📅 Date:** 27 Janvier 2026  
**⏰ Durée estimée:** 4h  
**👤 Owner:** DevOps Engineer  
**🎯 Objectif:** Configurer backup automatique Supabase avant implémentation Persist-First

---

## 🎯 Objectif

Avant de démarrer l'implémentation de Story 2.11b (Architecture Persist-First), nous devons garantir qu'un système de backup automatique est en place pour permettre un rollback rapide en cas de problème.

**Critère de succès:**
- ✅ Backups automatiques activés (daily minimum)
- ✅ Rétention 7 jours minimum
- ✅ Restore testé au moins une fois
- ✅ Temps de restore < 5 minutes documenté
- ✅ Procédure d'urgence documentée

---

## 📋 Checklist d'Implémentation

### Étape 1: Activer Backups Automatiques (1h)

**Supabase Dashboard:**

1. **Connexion**
   - [ ] Aller sur https://supabase.com/dashboard
   - [ ] Se connecter au projet `postry-ai`
   - [ ] Organisation: `floriantriclin`

2. **Configuration Backups**
   - [ ] Naviguer vers **Settings** → **Database** → **Backups**
   - [ ] Vérifier le plan actuel (Free/Pro/Team)
   - [ ] Activer **Automated Backups**
   
3. **Paramètres Backups**
   ```
   Fréquence: Daily (minimum)
   Heure préférée: 03:00 UTC (heure creuse)
   Rétention: 7 jours (minimum requis)
   Type: Point-in-Time Recovery (PITR) si disponible
   ```

4. **Notifications**
   - [ ] Activer email notification si backup échoue
   - [ ] Email: [EMAIL_DEVOPS]
   - [ ] Slack webhook: #alerts-infrastructure (optionnel)

---

### Étape 2: Tester Restore (2h)

**⚠️ CRITIQUE: Ne PAS tester sur production !**

**Environnement de test:**

1. **Créer backup manuel de test**
   - [ ] Dashboard → Backups → **Create manual backup**
   - [ ] Nom: `test-restore-story-2.11b-phase0`
   - [ ] Attendre confirmation (1-5 min)

2. **Tester restore en local**
   - [ ] Option 1: Télécharger backup SQL
   - [ ] Option 2: Utiliser Supabase CLI
   
   ```bash
   # Si Supabase CLI disponible
   supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" > backup_test.sql
   
   # Restore en local
   psql -h localhost -U postgres -d postgres < backup_test.sql
   ```

3. **Vérifier intégrité après restore**
   - [ ] Vérifier table `posts` existe
   - [ ] Compter nombre de lignes (doit matcher backup)
   - [ ] Vérifier colonnes: `user_id`, `email`, `status`, `archetype`
   - [ ] Tester query simple: `SELECT * FROM posts LIMIT 10;`

4. **Documenter temps de restore**
   - [ ] Noter temps total: _____ minutes
   - [ ] Taille du backup: _____ MB
   - [ ] Noter toute erreur rencontrée

---

### Étape 3: Configurer Monitoring (30 min)

**Alerts à configurer:**

1. **Backup Failure Alert**
   - [ ] Si backup daily échoue → Email + Slack
   - [ ] Escalation: Après 2 échecs consécutifs → PagerDuty
   
2. **Disk Space Alert**
   - [ ] Si espace DB > 80% → Warning
   - [ ] Si espace DB > 90% → Critical alert
   
3. **Dashboard Supabase**
   - [ ] Ajouter bookmark: Backups page
   - [ ] Vérifier daily que backup a run (jusqu'à stabilisation)

---

### Étape 4: Documentation Procédure d'Urgence (30 min)

**Créer runbook: `RUNBOOK-EMERGENCY-RESTORE.md`**

Contenu minimum requis:

```markdown
# RUNBOOK: Emergency Database Restore
## Story 2.11b (BMA-48)

### Quand utiliser ce runbook?
- Story 2.11b a causé data loss en production
- Migration SQL a corrompu les données
- Besoin de revenir à état avant Story 2.11b

### Pré-requis
- Accès Supabase Dashboard (Admin)
- Backup < 24h disponible
- Approbation PO obtenue (Florian)

### Procédure (Temps total: < 10 min)

1. **Identifier backup à restore** (1 min)
   - Dashboard → Backups
   - Choisir backup AVANT déploiement Story 2.11b
   - Noter timestamp exact

2. **Activer maintenance mode** (1 min)
   - Désactiver feature flag: ENABLE_PERSIST_FIRST=false
   - Redéployer app (Vercel auto-deploy)
   - Afficher page maintenance si possible

3. **Restore database** (5 min)
   - Dashboard → Backups → [Backup sélectionné] → Restore
   - Confirmer avec mot de passe
   - Attendre completion (monitoring logs)

4. **Vérification post-restore** (2 min)
   - Tester Dashboard: /dashboard
   - Vérifier 10 posts s'affichent
   - Vérifier aucune erreur Sentry

5. **Désactiver maintenance** (1 min)
   - Retirer page maintenance
   - Monitoring intensif 1h

### Contacts d'Urgence
- PO (Florian): [PHONE/SLACK]
- Tech Lead: [PHONE/SLACK]  
- Supabase Support: support@supabase.com
```

---

## ✅ Definition of Done - Phase 0 DevOps

**La tâche est complète quand:**

- [x] Backups automatiques activés dans Supabase
- [x] Fréquence: Daily minimum
- [x] Rétention: 7 jours minimum
- [x] Email notifications configurées
- [x] Restore testé avec succès en local (1 fois)
- [x] Temps de restore mesuré et documenté (< 5 min)
- [x] Runbook d'urgence créé et partagé avec équipe
- [x] Screenshots de config Supabase sauvegardés
- [x] Bob (SM) notifié que setup est complet

---

## 🚨 Risks & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Plan Free ne permet pas backups auto | 🔴 BLOQUANT | 🟢 FAIBLE | Upgrade vers plan Pro ($25/mois) |
| Restore échoue en test | 🟠 ÉLEVÉ | 🟡 MOYEN | Contacter Supabase Support |
| Temps restore > 5 min | 🟡 MOYEN | 🟡 MOYEN | Documenter temps réel, ajuster SLA |
| Espace disque insuffisant | 🟠 ÉLEVÉ | 🟢 FAIBLE | Cleanup old backups, upgrade storage |

---

## 📊 Success Metrics

**À mesurer après setup:**

| Métrique | Target | Mesure |
|----------|--------|--------|
| Backup success rate | 100% | Supabase Dashboard |
| Temps de restore (test) | < 5 min | Manuel (chronomètre) |
| Taille backup DB | < 100 MB | Supabase Dashboard |
| Espace disque dispo | > 50% free | Supabase Dashboard |

---

## 📞 Support & Escalation

**Si problème bloquant:**

1. **Supabase Plan Limitations**
   - Contacter Florian (PO) pour upgrade vers Pro
   - Alternative: Backups manuels daily (script cron)

2. **Restore échoue en test**
   - Ouvrir ticket Supabase Support
   - Demander aide sur Discord Supabase
   - Escalation vers Bob (SM) si > 2h sans solution

3. **Manque de compétences SQL/Supabase**
   - Demander aide à Tech Lead
   - Paire programming avec Dev Senior
   - Formation Supabase (1h) si nécessaire

---

## 🎯 Deliverables

**À la fin de cette tâche, livrer:**

1. ✅ **Screenshot Supabase config**
   - Sauvegarder dans `screenshots/phase0-backup-config.png`

2. ✅ **Runbook d'urgence**
   - Créer `RUNBOOK-EMERGENCY-RESTORE.md` (voir template ci-dessus)

3. ✅ **Test report**
   - Document temps de restore mesuré
   - Note toute erreur rencontrée
   - Recommandations pour amélioration

4. ✅ **Notification à Bob (SM)**
   - Slack message: "Phase 0 DevOps Setup ✅ Complete"
   - Partager screenshots + runbook
   - Confirmer prêt pour Story 2.11b implementation

---

## ⏱️ Timeline Détaillée

```
00:00 - 01:00 → Activer backups auto (Supabase Dashboard)
01:00 - 02:00 → Premier backup manuel + attendre completion
02:00 - 03:30 → Tester restore en local + vérifications
03:30 - 04:00 → Créer runbook + documentation + notification
```

**Deadline:** Aujourd'hui avant 17h (impératif pour démarrage Story 2.11b demain)

---

## 📚 Ressources

### Documentation Supabase
- Backups Guide: https://supabase.com/docs/guides/platform/backups
- PITR Guide: https://supabase.com/docs/guides/platform/point-in-time-recovery
- CLI Backup: https://supabase.com/docs/guides/cli/local-development#dumping-and-restoring

### Commandes Utiles

```bash
# Vérifier Supabase CLI installé
supabase --version

# Login Supabase CLI
supabase login

# Link to project
supabase link --project-ref [PROJECT_REF]

# Dump database
supabase db dump -f backup_$(date +%Y%m%d).sql

# Restore database (local)
supabase db reset --db-url "postgresql://..."
```

---

## 🏁 Next Steps Après Completion

Une fois cette tâche **✅ COMPLÉTÉE**:

1. Notifier Bob (SM) sur Slack
2. Partager runbook avec toute l'équipe
3. Ajouter lien backup dashboard dans sprint-status.yaml
4. Story 2.11b (BMA-48) peut démarrer demain matin ! 🚀

---

**Créé par:** Bob (Scrum Master)  
**Pour:** DevOps Team  
**Story:** 2.11b (BMA-48)  
**Priority:** 🔴 P0 CRITICAL  
**Deadline:** Aujourd'hui 17h

---

**BON COURAGE ! Tu as toutes les infos pour réussir. 💪**
