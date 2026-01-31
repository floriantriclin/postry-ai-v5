# Phase 0 DevOps - Decision Log
## Story 2.11b (BMA-48) - Backup Setup

**📅 Date:** 27 Janvier 2026 14:20  
**👤 Decision Maker:** Florian (PO)  
**🎯 Context:** Phase 0 Setup avant Story 2.11b implementation

---

## 🎯 Decision

**OPTION 2: Skip Backup + Avancer**

**Rationale:**
- Base de données NON-PRODUCTION
- Contenu peut être effacé sans impact business
- Rollback SQL disponible (`20260127_rollback_archetype.sql`)
- Feature flag permet désactivation instantanée
- Docker non installé → Setup automatique impossible maintenant
- Time-to-value priorisé sur over-engineering

**Approved by:** Florian (PO)  
**Status:** ✅ APPROVED

---

## 📋 Options Évaluées

### Option 1: Backup Manuel Dashboard (3 min)
**Pros:**
- Rapide
- Pas de setup requis

**Cons:**
- Procédure manuelle à chaque fois
- Pas automatisable

**Decision:** ❌ Rejeté (overhead non justifié pour base non-prod)

---

### Option 2: Skip Backup + Avancer ✅
**Pros:**
- Démarrage immédiat Story 2.11b
- Pragmatique pour contexte non-prod
- Rollback SQL disponible
- Feature flag = safety net

**Cons:**
- Pas de backup si rollback nécessaire
- Perte potentielle de quelques posts de test

**Decision:** ✅ **APPROVED**

---

### Option 3: Installer Docker (30 min)
**Pros:**
- Setup permanent
- `npm run db:backup` automatique fonctionnel

**Cons:**
- Délai 30 min pour Story 2.11b
- Non critique pour base non-prod

**Decision:** 📅 FUTURE (voir note Linear ci-dessous)

---

## 🛡️ Risk Mitigation

**Risques identifiés:**

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Data loss si rollback | 🟡 MOYEN | 🟢 FAIBLE | Rollback SQL disponible |
| Migration corrompue | 🟠 ÉLEVÉ | 🟢 FAIBLE | Feature flag + tests staging |
| Backup manuel oublié | 🟢 FAIBLE | 🟡 MOYEN | Base non-prod, pas critique |

**Safety nets en place:**
1. ✅ Rollback SQL: `supabase/migrations/rollback/20260127_rollback_archetype.sql`
2. ✅ Feature flag: `ENABLE_PERSIST_FIRST=false` (désactivation < 1 min)
3. ✅ RUNBOOK d'urgence: `RUNBOOK-EMERGENCY-RESTORE.md`
4. ✅ Base NON-PRODUCTION (contenu peut être recreated)

---

## 📝 Linear Note - Docker Installation (Future Task)

**À créer dans Linear:**

```markdown
# Task: Installer Docker Desktop pour Backup Automatique

## Context
Phase 0 Story 2.11b skipped car Docker non installé.
Script `npm run db:backup` créé mais nécessite Docker.

## Description
Installer Docker Desktop pour permettre backups automatiques via Supabase CLI.

## Acceptance Criteria
- [ ] Docker Desktop installé
- [ ] Docker daemon running
- [ ] `npm run db:backup` fonctionne
- [ ] Test backup + restore réussi
- [ ] Documentation mise à jour

## Priority
P3 LOW (Nice-to-have, pas bloquant)

## Estimation
1h (30 min install + 30 min tests)

## Labels
- devops
- infrastructure
- future-enhancement

## Blocked By
None

## Blocks
None (amélioration future)
```

**Action:** Créer cette note dans Linear après Story 2.11b

---

## ✅ Actions Taken (Phase 0)

- [x] Script backup automatique créé: `scripts/backup-db.mjs`
- [x] Guide backup manuel créé: `scripts/backup-db-manual-guide.md`
- [x] Dossier backups créé: `supabase/backups/`
- [x] RUNBOOK mis à jour: `RUNBOOK-EMERGENCY-RESTORE.md`
- [x] Sprint-status.yaml documenté
- [x] Decision log créé (ce fichier)
- [x] Supabase project linked: `supabase link --project-ref hoomcbsfqunrkeapxbvh`
- [x] PO notifié de la décision

---

## 🚀 Next Steps

**Immédiat:**
1. ✅ Phase 0 complétée (avec skip backup)
2. 🚀 **Démarrer Story 2.11b Phase 1 MAINTENANT**

**Future (après Story 2.11b):**
1. 📝 Créer note Linear: "Installer Docker Desktop"
2. 📅 Planifier installation Docker (Sprint futur)
3. 🧪 Tester `npm run db:backup` après installation

---

## 📊 Impact Analysis

**Impact de skip backup:**

| Aspect | Impact | Justification |
|--------|--------|---------------|
| **Sécurité** | 🟢 ACCEPTABLE | Rollback SQL + feature flag suffisants |
| **Risque Business** | 🟢 NUL | Base non-prod, pas de users réels |
| **Time-to-Market** | ✅ POSITIF | Démarrage immédiat Story 2.11b |
| **Qualité Code** | 🟢 NEUTRAL | Scripts créés, juste pas utilisés |

**Conclusion:** Decision pragmatique et bien mitigée ✅

---

**Créé par:** Bob (Scrum Master)  
**Approved by:** Florian (PO)  
**Date:** 27 Janvier 2026 14:20  
**Story:** 2.11b (BMA-48) Phase 0  
**Status:** ✅ CLOSED - Ready for Phase 1
