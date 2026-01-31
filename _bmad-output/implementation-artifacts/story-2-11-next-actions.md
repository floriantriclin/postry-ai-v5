# Next Actions - Story 2.11 Split Implementation
## Post Go/No-Go Decision

**Date:** 27 Janvier 2026  
**Status:** ✅ DÉCISION APPROUVÉE - PRÊT POUR EXÉCUTION

---

## 📋 Executive Summary

### Decision Made
✅ **SPLIT Story 2.11 en 2 stories distinctes**

**Vote:** 4.67/5 (Unanimité)

**New Stories:**
1. **Story 2.11b: Architecture Persist-First** (8h, P0 CRITICAL) - PRIORITÉ #1
2. **Story 2.11a: Quick Wins** (2h30, P1 MEDIUM) - PRIORITÉ #2

**Feature Flag:** ✅ OBLIGATOIRE (`ENABLE_PERSIST_FIRST`)

**Timeline:** ✅ DÉMARRER IMMÉDIATEMENT (après setup 4h)

---

## 🚀 Actions Complétées

- [x] ✅ **Meeting Go/No-Go tenu** (60 min)
- [x] ✅ **Votes enregistrés** (tous approuvés)
- [x] ✅ **sprint-status.yaml mis à jour**
  - Story 2-11 marquée `cancelled`
  - Story 2-11a ajoutée (`backlog`)
  - Story 2-11b ajoutée (`backlog`)
- [x] ✅ **Decision Record créé** (`story-2-11-decision-record.md`)
- [x] ✅ **Next Actions document créé** (ce fichier)

---

## ⏭️ Actions À Faire MAINTENANT

### Phase 0: Setup (Aujourd'hui - 4h) 🔴 CRITIQUE

| # | Action | Owner | Deadline | Command/Tool |
|---|--------|-------|----------|--------------|
| 1 | **Créer Linear issue Story 2.11b** | Bob/Florian | +30min | Linear CLI ou Web UI |
| 2 | **Créer Linear issue Story 2.11a** | Bob/Florian | +30min | Linear CLI ou Web UI |
| 3 | **Configurer backup DB automatique** | DevOps | +4h | Supabase Dashboard |
| 4 | **Implémenter feature flag** | Tech Lead | +2h | Code + .env |
| 5 | **Créer script rollback SQL** | Dev | +1h | SQL file |
| 6 | **Créer Linear issue Story 2.12** | Bob/Florian | +15min | Cleanup Job |

---

## 📝 Détails des Linear Issues à Créer

### 1. Story 2.11b: Architecture Persist-First (P0 CRITICAL)

**Title:** `Story 2.11b: Architecture Persist-First - Security & Stability`

**Labels:**
- `epic-2`
- `bug`
- `security`
- `architecture`
- `p0-critical`

**Estimate:** 8 points (8h)

**Priority:** 🔴 P0 CRITICAL

**Description:**
```markdown
# Story 2.11b: Architecture Persist-First

**Type:** Bug Fixes / Security / Architecture  
**Parent Epic:** Epic 2 - Conversion & Identité  
**Priority:** 🔴 P0 CRITICAL  
**Split Decision:** Go/No-Go Meeting 27/01/2026

## 🎯 Objectif

Implémenter l'architecture Persist-First pour résoudre les bugs de sécurité critiques:
- BUG-006 (BMA-45): localStorage sans expiration
- BUG-007 (BMA-46): Email multi-soumission

**Résout automatiquement:**
- BUG-001 (BMA-4): Double appel API
- BUG-004 (BMA-5): Data loss

## 📋 Scope

### Nouveaux Endpoints
- `/api/posts/anonymous` - Persist posts avant auth avec rate limiting IP
- `/api/posts/link-to-user` - Link post pending à user après auth

### Modifications Auth Flow
- `components/feature/auth-modal.tsx`
  - Appeler `/api/posts/anonymous`
  - `localStorage.clear()` immédiat après submit
- `app/auth/confirm/page.tsx`
  - Appeler `/api/posts/link-to-user`
  - Lire `postId` depuis URL params

### Rate Limiting
- Réutiliser `lib/rate-limit.ts` (Story 2.8)
- Limite: 5 posts/heure par IP
- Headers: `X-RateLimit-*`

## ✅ Critères d'Acceptation

- [ ] Feature flag `ENABLE_PERSIST_FIRST` implémenté
- [ ] 2 nouveaux endpoints créés avec validation Zod
- [ ] Tests unitaires >90% coverage
- [ ] Tests E2E exhaustifs (36 tests)
- [ ] Rate limiting vérifié (5 posts/heure)
- [ ] localStorage cleared immédiatement après 200
- [ ] Audit sécurité passé
- [ ] Déploiement progressif: 10% → 50% → 100%
- [ ] Monitoring 48h = 0 erreurs
- [ ] Métriques: Data loss 0%, localStorage clear 100%

## 🧪 Tests Requis

**Tests Unitaires (28 tests):**
- POST /api/posts/anonymous (5 test cases)
- POST /api/posts/link-to-user (3 test cases)
- Rate limiting (2 test cases)
- Flow Persist-First complet (2 test cases)

**Tests E2E (36 tests):**
- localStorage clear après submit (3 scénarios)
- Rate limiting (2 scénarios)
- Flow complet end-to-end (3 scénarios)
- Data preservation on failure (2 scénarios)

## 📂 Fichiers

**À Créer:**
- `app/api/posts/anonymous/route.ts`
- `app/api/posts/link-to-user/route.ts`
- `e2e/acquisition-persist-first.spec.ts`
- `e2e/acquisition-rate-limiting.spec.ts`

**À Modifier:**
- `components/feature/auth-modal.tsx`
- `app/auth/confirm/page.tsx`

**À Supprimer:**
- `app/api/auth/persist-on-login/route.ts` (Obsolète)

## 📊 Estimation

**Durée:** 8h (2 jours)  
**Complexité:** ÉLEVÉE  
**Risque:** 🟠 ÉLEVÉ (mitigé par feature flag)

## 🔗 Ressources

- Story complète: `_bmad-output/implementation-artifacts/story-2-11-epic-2-bug-fixes.md`
- Quality Check: `_bmad-output/implementation-artifacts/story-2-11-quality-check.md`
- Decision Record: `_bmad-output/implementation-artifacts/story-2-11-decision-record.md`
- Linear Issues: BMA-45, BMA-46, BMA-4, BMA-5

## ⚠️ Dependencies

- Story 2.8 (Rate Limiting) ✅ DONE
- Backup DB automatique (Phase 0)
- Feature flag architecture (Phase 0)

## 🚨 Blockers

- Aucun (après Phase 0 setup)
```

**Assignee:** [Dev Lead]  
**Sprint:** Current  
**Project:** postry-ai  
**Team:** BMAD

---

### 2. Story 2.11a: Quick Wins (P1 MEDIUM)

**Title:** `Story 2.11a: Quick Wins - Dashboard & Archetype`

**Labels:**
- `epic-2`
- `bug`
- `ux`
- `p1-medium`

**Estimate:** 2.5 points (2h30)

**Priority:** 🟡 P1 MEDIUM

**Description:**
```markdown
# Story 2.11a: Quick Wins - UX Improvements

**Type:** Bug Fixes / UX  
**Parent Epic:** Epic 2 - Conversion & Identité  
**Priority:** 🟡 P1 MEDIUM  
**Split Decision:** Go/No-Go Meeting 27/01/2026

## 🎯 Objectif

Corriger 2 bugs UX simples et indépendants:
- BUG-003 (BMA-2): Colonne archetype manquante
- BUG-002 (BMA-3): Dashboard crash avec multiple posts

## 📋 Scope

### BUG-003: Migration Archetype
- Créer migration SQL: ajouter colonne `archetype`
- Backfill posts existants
- Afficher archetype dans Dashboard

### BUG-002: Dashboard Robuste
- Retirer `.single()` de `app/dashboard/page.tsx`
- Utiliser array indexing: `.data?.[0]`
- Messages d'erreur distincts (error vs no posts)

## ✅ Critères d'Acceptation

**BUG-003 (Archetype):**
- [ ] Migration SQL créée et testée
- [ ] Backfill réussi (tous posts ont archetype)
- [ ] Dashboard affiche archetype correctement
- [ ] Test E2E archetype display (2 scénarios)

**BUG-002 (Dashboard):**
- [ ] `.single()` retiré (code review)
- [ ] Dashboard stable avec 1, 10, 50+ posts
- [ ] Messages d'erreur distincts
- [ ] Test E2E multiple posts (2 scénarios)

## 🧪 Tests Requis

**Tests Unitaires (8 tests):**
- Migration archetype (3 test cases)
- Dashboard multiple posts (5 test cases)

**Tests E2E (8 tests):**
- Dashboard multiple posts (2 scénarios)
- Archetype display (2 scénarios)
- Regression tests (4 scénarios)

## 📂 Fichiers

**À Créer:**
- `supabase/migrations/20260127000000_add_archetype_to_posts.sql`
- `e2e/dashboard-multiple-posts.spec.ts`
- `e2e/dashboard-archetype-display.spec.ts`

**À Modifier:**
- `app/dashboard/page.tsx`
- `app/dashboard/post-reveal-view.tsx`

## 📊 Estimation

**Durée:** 2h30 (0.5 jour)  
**Complexité:** FAIBLE  
**Risque:** 🟢 FAIBLE

## 🔗 Ressources

- Story complète: `_bmad-output/implementation-artifacts/story-2-11-epic-2-bug-fixes.md`
- Linear Issues: BMA-2, BMA-3

## ⚠️ Dependencies

- Backup DB automatique (Phase 0)

## 📅 Timeline

**Démarrer:** Après Story 2.11b validée en prod  
**OU:** En parallèle si capacité équipe disponible

## 🚨 Blockers

- Aucun (indépendant de Story 2.11b)
```

**Assignee:** [Dev Lead]  
**Sprint:** Current  
**Project:** postry-ai  
**Team:** BMAD

---

### 3. Story 2.12: Cleanup Job Posts Orphelins (Future)

**Title:** `Story 2.12: Cleanup Job - Posts Orphelins`

**Labels:**
- `epic-2`
- `tech-debt`
- `p2-low`

**Estimate:** 3 points (3h)

**Priority:** 🟡 P2 LOW

**Description:**
```markdown
# Story 2.12: Cleanup Job - Posts Orphelins

**Type:** Technical Debt / Automation  
**Parent Epic:** Epic 2 - Conversion & Identité  
**Priority:** 🟡 P2 LOW  
**Created:** Identifié lors Go/No-Go Story 2.11

## 🎯 Objectif

Créer un cleanup job automatique pour supprimer les posts orphelins créés par l'architecture Persist-First.

## 📋 Contexte

L'architecture Persist-First (Story 2.11b) crée des posts avec `status='pending'` avant l'authentification. Si l'utilisateur ne clique jamais sur le magic link, ces posts restent orphelins en DB.

**Impact:**
- Saturation DB à long terme
- Performance dégradée

## 📋 Scope

### Cleanup Job
- Supprimer posts `status='pending'` > 24h
- Scheduled task (cron) OU trigger DB
- Logs de cleanup (combien supprimés)

### Monitoring
- Dashboard: % posts orphelins
- Alerte si > 5%

## ✅ Critères d'Acceptation

- [ ] Cleanup job configuré (cron ou trigger)
- [ ] Logs structurés de cleanup
- [ ] Monitoring dashboard créé
- [ ] Alerte configurée (>5%)
- [ ] Tests du cleanup job

## 📊 Estimation

**Durée:** 3h  
**Complexité:** MOYENNE  
**Risque:** 🟢 FAIBLE

## ⚠️ Dependencies

- Story 2.11b ✅ DONE
- Posts orphelins observés en prod

## 📅 Timeline

**Démarrer:** Après Story 2.11b validée en prod + 1 semaine monitoring
```

**Assignee:** [DevOps ou Dev]  
**Sprint:** Future  
**Project:** postry-ai  
**Team:** BMAD

---

## 🛠️ Technical Setup Tasks

### Task 1: Backup DB Automatique

**Owner:** DevOps (Marc)  
**Deadline:** +4h

**Instructions:**
```bash
# Supabase Dashboard
1. Aller dans Project Settings → Database → Backups
2. Activer "Automatic Backups" (daily)
3. Configurer rétention: 7 jours minimum
4. Tester restore manuellement une fois

# OU via CLI
supabase db backup create --project-ref <project-id>
supabase db backup list
```

**Validation:**
- [ ] Backup automatique activé
- [ ] Test de restore réussi
- [ ] Documentation créée

---

### Task 2: Feature Flag Architecture

**Owner:** Tech Lead (Alex)  
**Deadline:** +2h

**Instructions:**
```typescript
// .env
ENABLE_PERSIST_FIRST=false

// .env.example
ENABLE_PERSIST_FIRST=false

// lib/feature-flags.ts (CREATE)
export const featureFlags = {
  ENABLE_PERSIST_FIRST: process.env.ENABLE_PERSIST_FIRST === 'true'
};

// Usage example
import { featureFlags } from '@/lib/feature-flags';

if (featureFlags.ENABLE_PERSIST_FIRST) {
  // New flow: Persist-First
} else {
  // Old flow: persist-on-login
}
```

**Validation:**
- [ ] File `lib/feature-flags.ts` créé
- [ ] .env et .env.example mis à jour
- [ ] Tests: flag ON et OFF fonctionnent
- [ ] Documentation créée

---

### Task 3: Script Rollback SQL

**Owner:** Dev (Sarah)  
**Deadline:** +1h

**Instructions:**
```sql
-- File: supabase/migrations/rollback/20260127_rollback_archetype.sql

-- Drop index
DROP INDEX IF EXISTS idx_posts_archetype;

-- Drop column
ALTER TABLE public.posts DROP COLUMN IF EXISTS archetype;

-- Verify rollback
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'archetype';
-- Should return 0 rows
```

**Validation:**
- [ ] Script testé en local
- [ ] Documentation de rollback créée
- [ ] Temps de rollback estimé (<1 min)

---

## 📊 Progress Tracking

### Sprint Status

**Epic 2 Status:**
- ✅ Stories 2.1 → 2.8: DONE
- 🔄 Stories 2.9, 2.10: ready-for-dev
- 🚫 Story 2.11: CANCELLED (splitted)
- ⏳ **Story 2.11b: backlog** (À démarrer J+1)
- ⏳ **Story 2.11a: backlog** (À démarrer J+4)

### Timeline Visuelle

```
Aujourd'hui (J+0):
├─ Phase 0 Setup (4h)
│  ├─ Backup DB (Marc - 4h)
│  ├─ Feature flag (Alex - 2h)
│  └─ Rollback SQL (Sarah - 1h)
│
J+1 → J+3:
├─ Story 2.11b - Persist-First (8h)
│  ├─ Endpoints (2h)
│  ├─ Auth flow (1.5h)
│  ├─ Tests E2E (2.5h)
│  └─ Validation (2h)
│
J+4:
├─ Story 2.11a - Quick Wins (2.5h)
│  ├─ Migration SQL (30min)
│  ├─ Dashboard fix (1h)
│  └─ Tests E2E (1h)
│
J+5+:
└─ Story 2.12 - Cleanup Job (3h) [FUTURE]
```

---

## 📞 Communication Plan

### Daily Standups

**Format:** Quick sync (15 min max)

**Questions:**
1. Progress hier?
2. Plan aujourd'hui?
3. Blockers?
4. Besoin d'aide?

**Focus Story 2.11b:**
- J+1: Endpoints créés?
- J+2: Auth flow modifié? Tests passants?
- J+3: Validation staging? Go/No-Go prod?

---

### Review Meeting (J+3)

**Objectif:** Go/No-Go Story 2.11b → Prod

**Agenda:**
1. Démo Persist-First architecture
2. Métriques: 0 erreurs, 0 data loss?
3. Audit sécurité: OK?
4. Décision: Activer feature flag 10%?

**Participants:**
- Florian (PO) - GO/NO-GO décision
- Alex (Tech Lead)
- Sarah (Dev)
- Marc (DevOps)
- Thomas (Security) - Audit report

---

## 🚨 Escalation Path

### Si Blockers

1. **Technique:** → Alex (Tech Lead)
2. **Business:** → Florian (PO)
3. **Infra:** → Marc (DevOps)
4. **Sécurité:** → Thomas (Security)

### Si Dépassement Timeline

**+2h sur estimation:**
- Info Bob (SM) immédiatement
- Réévaluer scope (peut-on simplifier?)

**+1 jour sur timeline:**
- Meeting d'urgence avec Florian (PO)
- Décision: Continuer ou rollback?

---

## ✅ Definition of Done

### Story 2.11b (Persist-First)

- [ ] Code implémenté et reviewed (2 reviewers)
- [ ] Tests unitaires >90% coverage
- [ ] Tests E2E 100% passants (3 runs × 3 browsers)
- [ ] Linter errors = 0
- [ ] Feature flag testé (ON et OFF)
- [ ] Audit sécurité passé
- [ ] Déployé en staging avec flag OFF
- [ ] Feature flag activé 10% → Validation 24h
- [ ] Feature flag activé 50% → Validation 24h
- [ ] Feature flag activé 100% → Validation 48h
- [ ] Monitoring: 0 erreurs, 0 data loss
- [ ] Documentation mise à jour
- [ ] Linear issues BMA-45, BMA-46 → Done
- [ ] Sprint status mis à jour

### Story 2.11a (Quick Wins)

- [ ] Code implémenté et reviewed (1 reviewer)
- [ ] Migration SQL testée (local + staging)
- [ ] Tests E2E passants (3 runs)
- [ ] Linter errors = 0
- [ ] Déployé en prod
- [ ] Monitoring: 0 erreurs
- [ ] Linear issues BMA-2, BMA-3 → Done
- [ ] Sprint status mis à jour

---

## 📚 Resources & Links

### Documents
- ✅ Story 2.11 Original: `story-2-11-epic-2-bug-fixes.md`
- ✅ Quality Check: `story-2-11-quality-check.md`
- ✅ Go/No-Go Meeting: `story-2-11-go-no-go-meeting.md`
- ✅ Decision Record: `story-2-11-decision-record.md`
- ✅ Next Actions: `story-2-11-next-actions.md` (ce fichier)

### Linear
- Original Issue: [BMA-9](https://linear.app/floriantriclin/issue/BMA-9)
- Bugs: BMA-2, BMA-3, BMA-45, BMA-46, BMA-4, BMA-5, BMA-8
- Team: BMAD (362d6776-0634-4830-8e34-b7f08e91dce5)

### Code References
- Rate Limiting: `lib/rate-limit.ts` (Story 2.8)
- Alerting: `lib/alerting.ts` (Story 2.8)
- Supabase: `lib/supabase.ts`, `lib/supabase-admin.ts`

---

## 🎯 Success Metrics

### Business Metrics (Post-Deployment)

| Métrique | Avant | Target | Actuel |
|----------|-------|--------|--------|
| Dashboard crash rate | >10% | 0% | TBD |
| Post duplication | ~5% | 0% | TBD |
| Archetype "Inconnu" | 100% | 0% | TBD |
| Data loss | ~1% | 0% | TBD |
| localStorage security | 🔴 HIGH | 🟢 NONE | TBD |
| Rate limiting blocks/day | N/A | <10 | TBD |
| Posts orphelins | N/A | <1% | TBD |

### Technical Metrics

| Métrique | Target | Actuel |
|----------|--------|--------|
| Test coverage | >85% | TBD |
| E2E success rate | 100% | TBD |
| Linter errors | 0 | TBD |
| API latency P95 | <500ms | TBD |
| Feature flag rollout | 10→50→100% | TBD |

---

**Document créé:** 27 Janvier 2026  
**Owner:** Bob (Scrum Master)  
**Status:** ✅ PRÊT POUR EXÉCUTION  
**Next Update:** Après Phase 0 setup (J+0 EOD)

---

**FIN DU DOCUMENT**
