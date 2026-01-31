# Linear Task - Docker Desktop Installation

**📝 À créer dans Linear après Story 2.11b**

---

## Task Details

**Title:** Installer Docker Desktop pour Backup DB Automatique

**Team:** BMAD  
**Project:** postry-ai  
**Priority:** P3 LOW (Nice-to-have)  
**Estimation:** 1h  
**Labels:** `devops`, `infrastructure`, `future-enhancement`, `technical-debt`

---

## Description

### Context

Lors de la Phase 0 de Story 2.11b (BMA-48), nous avons créé un script de backup automatique (`npm run db:backup`) utilisant Supabase CLI. Cependant, Supabase CLI nécessite Docker Desktop pour fonctionner.

**Décision prise (27/01/2026):**
- Skip backup automatique
- Avancer avec Story 2.11b sans backup
- Installer Docker plus tard (cette task)

**Fichiers concernés:**
- `scripts/backup-db.mjs` - Script prêt mais non fonctionnel sans Docker
- `scripts/backup-db-manual-guide.md` - Guide backup manuel alternatif
- `RUNBOOK-EMERGENCY-RESTORE.md` - Procédure d'urgence

---

## Objective

Installer Docker Desktop pour permettre l'utilisation du script de backup automatique créé lors de Phase 0.

---

## Acceptance Criteria

### Must Have
- [ ] Docker Desktop installé sur machine de dev
- [ ] Docker daemon running et accessible
- [ ] `npm run db:backup` s'exécute sans erreur
- [ ] Backup généré dans `supabase/backups/backup_YYYYMMDD_HHMMSS.sql`
- [ ] Taille backup > 10 KB (contient réellement des données)

### Nice to Have
- [ ] Test restore réussi depuis backup
- [ ] Documentation mise à jour (README section DevOps)
- [ ] Script ajouté dans CI/CD (optionnel)

---

## Steps to Implement

### Step 1: Installation Docker Desktop (15 min)

1. **Télécharger Docker Desktop**
   - URL: https://www.docker.com/products/docker-desktop/
   - Version: Latest stable (Windows)

2. **Installer**
   - Exécuter installer
   - Choisir: "Use WSL 2 based engine" (recommandé)
   - Redémarrer Windows si demandé

3. **Vérifier installation**
   ```bash
   docker --version
   # Devrait afficher: Docker version 24.x.x
   ```

### Step 2: Configuration (5 min)

1. **Démarrer Docker Desktop**
   - Attendre que daemon soit running
   - Icône Docker verte dans system tray

2. **Vérifier Supabase CLI**
   ```bash
   supabase --version
   # Devrait afficher: v2.72.7 ou supérieur
   ```

3. **Vérifier project linked**
   ```bash
   cd c:/dev/postry-ai
   supabase link --project-ref hoomcbsfqunrkeapxbvh
   # Devrait afficher: Finished supabase link
   ```

### Step 3: Test Backup (5 min)

1. **Premier backup**
   ```bash
   npm run db:backup
   ```

2. **Vérifier output**
   - [ ] Backup créé: `supabase/backups/backup_YYYYMMDD_HHMMSS.sql`
   - [ ] Taille > 10 KB
   - [ ] Aucune erreur dans console

3. **Tester cleanup automatique**
   ```bash
   # Créer 8 backups
   for i in {1..8}; do npm run db:backup; sleep 2; done
   
   # Vérifier seulement 7 gardés
   ls supabase/backups/ | wc -l
   # Devrait afficher: 7
   ```

### Step 4: Test Restore (10 min)

1. **Créer backup de test**
   ```bash
   npm run db:backup
   # Noter le nom du fichier créé
   ```

2. **Tester restore (optionnel - environnement test uniquement)**
   ```bash
   # NE PAS faire en production !
   supabase db reset --db-url "$DATABASE_URL"
   psql -h db.hoomcbsfqunrkeapxbvh.supabase.co \
        -U postgres \
        -d postgres \
        < supabase/backups/backup_YYYYMMDD_HHMMSS.sql
   ```

3. **Vérifier données après restore**
   - Dashboard → SQL Editor
   - `SELECT COUNT(*) FROM posts;`
   - Nombre doit matcher avant restore

### Step 5: Documentation (5 min)

1. **Mettre à jour README.md**
   - Ajouter section "DevOps - Database Backup"
   - Documenter `npm run db:backup`

2. **Mettre à jour sprint-status.yaml**
   - Retirer note "Docker à installer"
   - Ajouter note "Docker installé ✅"

---

## Testing Checklist

- [ ] Docker Desktop installé et running
- [ ] `docker --version` fonctionne
- [ ] `supabase --version` fonctionne
- [ ] `npm run db:backup` crée un fichier
- [ ] Backup contient du SQL valide
- [ ] Cleanup automatique fonctionne (garde 7 derniers)
- [ ] (Optionnel) Restore testé avec succès

---

## Resources

### Documentation
- Docker Desktop: https://docs.docker.com/desktop/
- Supabase CLI: https://supabase.com/docs/guides/cli
- Backup Guide: `scripts/backup-db-manual-guide.md`

### Scripts
- Backup script: `scripts/backup-db.mjs`
- Package.json: `"db:backup": "node scripts/backup-db.mjs"`

### Related Files
- RUNBOOK: `RUNBOOK-EMERGENCY-RESTORE.md`
- Decision log: `_bmad-output/implementation-artifacts/phase-0-devops-decision-log.md`

---

## Risks & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Docker consomme beaucoup RAM | 🟡 MOYEN | 🟠 ÉLEVÉ | Configurer limite RAM (Settings) |
| Docker échoue à démarrer | 🟠 ÉLEVÉ | 🟢 FAIBLE | Vérifier WSL2, redémarrer Windows |
| Backup échoue malgré Docker | 🟡 MOYEN | 🟢 FAIBLE | Fallback: backup manuel Dashboard |

---

## Future Enhancements (Optionnel)

1. **Automatisation CI/CD**
   - Ajouter backup automatique avant chaque deploy
   - GitHub Actions: backup pre-migration

2. **Monitoring**
   - Slack notification si backup échoue
   - Cron job daily backup automatique

3. **Retention Policy**
   - Upload backups vers S3/Cloud Storage
   - Garder backups long-terme (30 jours)

---

## Success Metrics

**Cette task est complète quand:**

1. ✅ `npm run db:backup` fonctionne sans erreur
2. ✅ Backup généré contient données valides
3. ✅ Cleanup automatique fonctionne
4. ✅ Documentation mise à jour
5. ✅ Tested at least once successfully

**Time Investment:** ~1h  
**Value Delivered:** Backup automatique fonctionnel + peace of mind

---

**Créé par:** Bob (Scrum Master)  
**Date:** 27 Janvier 2026  
**Context:** Phase 0 Story 2.11b (BMA-48)  
**Status:** 📝 Draft - À créer dans Linear après Story 2.11b

---

## Quick Copy/Paste pour Linear

```markdown
**Title:** Installer Docker Desktop pour Backup DB Automatique

**Description:**
Setup Docker Desktop pour permettre `npm run db:backup` (Supabase CLI).
Script prêt mais nécessite Docker.

**AC:**
- Docker installé et running
- `npm run db:backup` fonctionne
- Backup généré avec données valides

**Priority:** P3 LOW  
**Estimation:** 1h  
**Labels:** devops, infrastructure, future-enhancement
```
