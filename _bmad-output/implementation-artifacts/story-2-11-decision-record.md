# Decision Record - Story 2.11 Split
## Go/No-Go Meeting - Epic 2 Bug Fixes

**Date:** 27 Janvier 2026  
**Meeting ID:** Story-2.11-GoNoGo-001  
**Facilitateur:** Bob (Scrum Master)  
**Type:** Architecture Decision Record (ADR)

---

## 📊 Context

### Situation
- **5 bugs critiques** identifiés dans Epic 2
- **Changement architectural majeur:** Architecture Persist-First
- **Story originale:** 2.11 regroupant tous les bugs (10h30)
- **Quality Check:** 984 lignes, 12 risques, 72 tests identifiés

### Problem Statement
Faut-il implémenter tous les bugs en une seule story (risque élevé, 10h30) ou splitter en 2 stories distinctes (risques séparés, 12h30) ?

---

## 🎯 Decision

### ✅ DÉCISION FINALE : OPTION B - SPLIT EN 2 STORIES

**Vote:** 4.67/5 (Unanimité)

**Décision approuvée:**
- ✅ **Story 2.11a: Quick Wins** (BUG-002 Dashboard, BUG-003 Archetype)
  - Durée: 2h30
  - Risque: 🟢 FAIBLE
  - Priorité: 🟡 P1 MEDIUM

- ✅ **Story 2.11b: Architecture Persist-First** (BUG-006, BUG-007)
  - Durée: 8h
  - Risque: 🟠 ÉLEVÉ (mitigé par feature flag)
  - Priorité: 🔴 P0 CRITICAL (Sécurité)

---

## 🗳️ Votes Détaillés

### Vote 1: Splitter la Story?

| Participant | Vote | Role | Justification |
|-------------|------|------|---------------|
| Florian | 5/5 | Product Owner | Priorité sécurité + risques mieux gérés |
| Alex | 5/5 | Tech Lead | Changement architectural mérite sa story |
| Sarah | 5/5 | Lead Developer | Tests plus simples, risques séparés |
| Marc | 4/5 | DevOps | 2 déploiements mais beaucoup plus sûr |
| Julie | 5/5 | QA Lead | Testing focalisé, debug facilité |
| Thomas | 4/5 | Security Lead | Audit sécurité possible pendant Quick Wins |

**Moyenne:** 4.67/5 ✅ **ACCEPTÉ (seuil: 3.5)**

---

### Vote 2: Feature Flag Obligatoire?

| Participant | Vote | Justification |
|-------------|------|---------------|
| Florian | 5/5 | Sécurité maximale, zéro risque inacceptable |
| Alex | 5/5 | Déploiement progressif 10%→50%→100% |
| Marc | 5/5 | Rollback instantané sans redéployer |
| Sarah | 4/5 | Bonne pratique pour changement majeur |
| Thomas | 5/5 | Permet de couper rapidement si problème |

**Moyenne:** 4.8/5 ✅ **FEATURE FLAG OBLIGATOIRE**

---

### Vote 3: Timeline?

| Participant | Vote | Justification |
|-------------|------|---------------|
| Florian | 5/5 Immédiat | GO pour démarrer maintenant |
| Sarah | 5/5 Immédiat | Prête à commencer, contexte chaud |
| Alex | 4/5 Immédiat | Besoin 4h setup (backup DB, feature flag) |
| Thomas | 4/5 Immédiat | Audit sécurité avant prod 2.11b |
| Marc | 3/5 48h Review | Préfère préparer infra correctement |

**Moyenne:** 4.2/5 ✅ **DÉMARRER IMMÉDIATEMENT (avec setup préalable)**

---

## 📋 Rationale

### Pourquoi Option B (Split) ?

#### Arguments Quantitatifs
- **Score pondéré:** Option B (83%) vs Option A (58%)
- **Critères gagnés:** 6/7 critères en faveur du split
- **Risque business:** Option B = 7/10 vs Option A = 3/10

#### Arguments Qualitatifs

**1. Priorité Business (Florian - PO):**
- Priorité #1 = **Sécurité** (BUG-006 localStorage critical)
- Quick Wins peuvent attendre
- Epic 3 peut être retardé sans problème

**2. Risques Techniques:**
- **Option A:** Risque 🔴 ÉLEVÉ concentré (tout ou rien)
- **Option B:** Risques 🟡 MOYEN séparés (rollback par story)
- Migration SQL + Persist-First + Tests = trop de complexité

**3. Testing Strategy:**
- **Option A:** 72 tests d'un coup, nombreuses dépendances
- **Option B:** Testing focalisé par story, debug facilité

**4. Rollback Plan:**
- **Option A:** Rollback complexe (migration SQL déjà appliquée)
- **Option B:** Rollback simple par story + feature flag

**5. Time to Market:**
- Quick Wins déployables indépendamment (mais pas priorité)
- Persist-First nécessite validation extensive (audit sécurité)

---

## 🎯 Consequences

### Positive Consequences

1. ✅ **Risques séparés et gérables**
   - Quick Wins (🟢 faible) indépendants de Persist-First (🟠 élevé)
   - Échec de l'un n'impacte pas l'autre

2. ✅ **Rollback simplifié**
   - Feature flag permet rollback instantané Persist-First
   - Quick Wins rollback = simple migration SQL reverse

3. ✅ **Testing focalisé**
   - 72 tests séparés en 2 suites
   - Debug facilité par story

4. ✅ **Déploiement progressif**
   - Feature flag: 10% → 50% → 100% traffic
   - Validation en prod par étapes

5. ✅ **Audit sécurité possible**
   - Persist-First peut avoir audit approfondi
   - Quick Wins déjà en prod pendant audit

### Negative Consequences

1. ⚠️ **2 cycles de déploiement**
   - Overhead coordination PO/SM
   - Mitigation: Communication renforcée

2. ⚠️ **Durée totale légèrement plus longue**
   - 10h30 → 12h30 (+2h overhead)
   - Mitigation: Acceptable pour PO, sécurité prioritaire

3. ⚠️ **Epic 3 retardé d'1 jour**
   - Impact business négligeable (confirmé par PO)

---

## 📊 Comparison Matrix

| Critère | Poids | Option A | Option B | Gagnant |
|---------|-------|----------|----------|---------|
| Risque business | 🔴 x5 | 3/10 | 7/10 | **B** |
| Time to market | 🟠 x3 | 6/10 | 9/10 | **B** |
| Complexité | 🟡 x2 | 5/10 | 7/10 | **B** |
| Effort total | 🟡 x2 | 8/10 | 7/10 | **A** |
| Rollback | 🟠 x3 | 4/10 | 9/10 | **B** |
| Testing | 🟡 x2 | 3/10 | 8/10 | **B** |
| Coordination | 🟢 x1 | 8/10 | 5/10 | **A** |

**Score Total:** Option B = 141/170 (83%) ✅

---

## 🚨 Risques Acceptés

### Risques Conscients (Approuvés par PO)

| ID | Risque | Impact | Probabilité | Mitigation | Owner |
|----|--------|--------|-------------|------------|-------|
| **R3** | Posts orphelins saturent DB | 🟠 ÉLEVÉ | 🟠 ÉLEVÉ | Story 2.12 Cleanup Job | Florian |
| **R4** | Race condition localStorage | 🟡 MOYEN | 🟡 MOYEN | 36 tests E2E | Sarah |
| **R10** | Performance dégradée (2 API calls) | 🟡 MOYEN | 🟢 FAIBLE | Load testing | Alex |
| **R11** | Overhead coordination (2 stories) | 🟡 MOYEN | 🟢 FAIBLE | Communication SM/PO | Bob |

### Risques Mitigés

| ID | Risque | Mitigation | Status |
|----|--------|------------|--------|
| **R1** | Migration SQL échoue | Backup DB auto + Rollback script | ✅ Planifié |
| **R2** | Suppression endpoint casse flow | Feature flag + Tests E2E | ✅ Planifié |
| **R5** | Rate limiting trop strict | Monitoring + Ajustement rapide | ✅ Planifié |

---

## 📝 Implementation Plan

### Phase 0: Setup (Aujourd'hui - 4h)

| Action | Owner | Deadline | Priority |
|--------|-------|----------|----------|
| Créer Linear issues (2.11a, 2.11b) | Bob | +30min | P0 |
| Backup DB automatique | Marc | +4h | P0 |
| Feature flag `ENABLE_PERSIST_FIRST` | Alex | +2h | P0 |
| Script rollback SQL | Sarah | +1h | P0 |
| Update sprint-status.yaml | Bob | +10min | P0 |

### Phase 1: Story 2.11b - Persist-First (J+1 → J+3)

**Priorité:** 🔴 P0 CRITICAL (Sécurité)  
**Durée:** 8h (2 jours)  
**Bugs:** BMA-45, BMA-46 (résout aussi BMA-4, BMA-5)

**Composants:**
- 2 nouveaux endpoints: `/api/posts/anonymous`, `/api/posts/link-to-user`
- Modification auth flow: `auth-modal.tsx`, `auth/confirm/page.tsx`
- Rate limiting IP (réutilise `lib/rate-limit.ts` de Story 2.8)
- Tests E2E exhaustifs (36 tests)

**Validation:**
- Feature flag activé progressivement (10% → 50% → 100%)
- Audit sécurité par Thomas avant 100%
- Monitoring 48h post-déploiement

### Phase 2: Story 2.11a - Quick Wins (J+4)

**Priorité:** 🟡 P1 MEDIUM (UX)  
**Durée:** 2h30 (0.5 jour)  
**Bugs:** BMA-2, BMA-3

**Composants:**
- Migration SQL: Ajouter colonne `archetype`
- Fix Dashboard: Retirer `.single()`
- Tests E2E: 8 tests

**Validation:**
- Tests E2E passants (3 runs)
- Déploiement standard

### Phase 3 (BONUS): Cross-Browser (Si temps)

**Priorité:** 🟢 P2 LOW  
**Durée:** 3h  
**Bug:** BMA-8

---

## 🔑 Key Decisions

### Decision 1: Ordre d'Implémentation

**CHANGEMENT vs Plan Initial:**

**Plan Initial (Quality Check):**
1. Quick Wins (BUG-002, BUG-003)
2. Persist-First (BUG-006, BUG-007)

**Plan Final (Basé sur Priorité PO):**
1. **Persist-First (BUG-006, BUG-007)** ← Priorité Sécurité
2. Quick Wins (BUG-002, BUG-003)

**Rationale:** Florian (PO) a clairement indiqué que **sécurité = priorité #1**. localStorage sans expiration = risque critique inacceptable.

---

### Decision 2: Feature Flag Architecture

**Décision:** `ENABLE_PERSIST_FIRST` obligatoire

**Implementation:**
```typescript
// .env
ENABLE_PERSIST_FIRST=false // Default OFF en prod

// Déploiement progressif:
// 1. Deploy code avec flag OFF
// 2. Activer 10% traffic (monitoring)
// 3. Activer 50% traffic (validation)
// 4. Activer 100% traffic (rollout complet)
```

**Rollback:** Désactiver flag = rollback instantané sans redéployer

---

### Decision 3: Story 2.12 - Cleanup Job

**Contexte:** Architecture Persist-First crée posts orphelins (`status='pending'`)

**Décision:** Créer Story 2.12 séparée

**Scope:**
- Cleanup job automatique: supprimer posts `pending` > 24h
- Scheduled task (cron) ou trigger DB
- Monitoring: % posts orphelins

**Timeline:** Après Story 2.11b validée en prod

---

## ✅ Approval & Signatures

### Participants & Votes

| Participant | Role | Vote Split | Vote Flag | Vote Timeline | Status |
|-------------|------|-----------|-----------|---------------|--------|
| **Florian** | Product Owner | 5/5 | 5/5 | 5/5 | ✅ Approuvé |
| **Alex** | Tech Lead | 5/5 | 5/5 | 4/5 | ✅ Approuvé |
| **Sarah** | Lead Developer | 5/5 | 4/5 | 5/5 | ✅ Approuvé |
| **Marc** | DevOps | 4/5 | 5/5 | 3/5 | ✅ Approuvé |
| **Julie** | QA Lead | 5/5 | N/A | N/A | ✅ Approuvé |
| **Thomas** | Security Lead | 4/5 | 5/5 | 4/5 | ✅ Approuvé |

### Formal Approval

**Approuvé par:**

- [x] **Florian (Product Owner)** - Signature digitale 27/01/2026
  - Accepte risques: R3, R4, R10, R11
  - Priorité sécurité confirmée
  - Epic 3 peut attendre

- [x] **Alex (Tech Lead)** - Validation technique 27/01/2026
  - Faisabilité technique confirmée
  - Feature flag architecture OK
  - Rollback plan validé

- [x] **Sarah (Lead Developer)** - Engagement livraison 27/01/2026
  - S'engage sur 2.11b (8h) + 2.11a (2h30)
  - Prête à démarrer demain

- [x] **Marc (DevOps)** - Capacité déploiement 27/01/2026
  - 2 cycles de déploiement OK
  - Backup DB ready en 4h
  - Monitoring dashboards J+1

---

## 📎 Related Documents

### Primary Documents
1. **Story 2.11 (Original)** - `story-2-11-epic-2-bug-fixes.md` (601 lignes)
2. **Quality Check** - `story-2-11-quality-check.md` (984 lignes)
3. **Go/No-Go Meeting Agenda** - `story-2-11-go-no-go-meeting.md` (470 lignes)

### Supporting Documents
4. Sprint Status - `sprint-status.yaml`
5. Story 2.7 Context - `story-2-7-auth-persistence-simplification.md`
6. Story 2.8 Context - `story-2-8-production-readiness.md`

### Linear Issues
- **Original:** [BMA-9](https://linear.app/floriantriclin/issue/BMA-9) - Story 2.11 (CANCELLED)
- **New:** BMA-XX - Story 2.11b (Persist-First) - À créer
- **New:** BMA-XX - Story 2.11a (Quick Wins) - À créer
- **Bugs:** BMA-2, BMA-3, BMA-45, BMA-46, BMA-8, BMA-4, BMA-5

---

## 🎯 Success Criteria

### Meeting Success Criteria (Achieved ✅)

- [x] Décision claire prise (Option B - Split)
- [x] Timeline validée (Démarrer immédiatement après setup 4h)
- [x] Responsabilités assignées (Actions avec owners et deadlines)
- [x] Risques acceptés documentés (4 risques conscients)
- [x] Plan d'action avec next steps clairs
- [x] Toutes les approbations obtenues (6/6 participants)

### Implementation Success Criteria (To Achieve)

**Story 2.11b (Persist-First):**
- [ ] Feature flag implémenté et testé
- [ ] 2 nouveaux endpoints créés avec tests unitaires (>90%)
- [ ] Auth flow modifié avec tests E2E (36 tests)
- [ ] Rate limiting vérifié (5 posts/heure par IP)
- [ ] Audit sécurité passé
- [ ] Déploiement progressif validé (10% → 50% → 100%)
- [ ] Monitoring 48h = 0 erreurs
- [ ] Métriques: localStorage clear 100%, data loss 0%

**Story 2.11a (Quick Wins):**
- [ ] Migration SQL appliquée (dev, staging, prod)
- [ ] Dashboard robuste (test avec 50+ posts)
- [ ] Tests E2E passants (3 runs consécutifs)
- [ ] Archetype affiché correctement (100% des posts)

---

## 📊 Metrics & KPIs

### Pre-Implementation (Baseline)

| Métrique | Valeur Actuelle |
|----------|-----------------|
| Dashboard crash rate | >10% (si 2+ posts) |
| Post duplication | ~5% (race condition) |
| Archetype "Inconnu" | 100% |
| Data loss | ~1% |
| localStorage security risk | 🔴 HIGH |

### Post-Implementation (Targets)

| Métrique | Target | Mesure |
|----------|--------|--------|
| Dashboard crash rate | 0% | Sentry errors |
| Post duplication | 0% | DB query |
| Archetype "Inconnu" | 0% | DB query |
| Data loss | 0% | User reports |
| localStorage security | 🟢 NONE | Audit |
| Rate limiting blocks/day | <10 | Logs |
| Posts orphelins | <1% | DB query |
| API latency P95 | <500ms | Vercel Analytics |

---

## 🔄 Review & Retrospective

### Next Review Meeting

**Date:** J+3 (après implémentation 2.11b)  
**Objectif:** Review progress Story 2.11b & Go/No-Go pour 2.11a  
**Participants:** Même équipe core

**Agenda:**
1. Démo Story 2.11b (Persist-First)
2. Métriques validation (0 erreurs, 0 data loss)
3. Feedback audit sécurité
4. Décision Go/No-Go pour Story 2.11a
5. Ajustements si nécessaire

### Retrospective Topics

**Questions à explorer:**
- Le split a-t-il réduit les risques comme prévu ?
- Le feature flag a-t-il été utile ?
- La coordination 2 stories était-elle gérable ?
- Que faire différemment pour Story 2.12 (Cleanup Job) ?

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 27/01/2026 | Decision initiale - Split en 2 stories | Bob (SM) |
| 27/01/2026 | Votes & approbations enregistrés | Bob (SM) |
| 27/01/2026 | Sprint-status.yaml updated | Bob (SM) |
| 27/01/2026 | Linear issues à créer (pending) | Bob (SM) |

---

**Document Status:** ✅ FINALISÉ & APPROUVÉ  
**Date de création:** 27 Janvier 2026  
**Dernière mise à jour:** 27 Janvier 2026  
**Version:** 1.0  
**Archivage:** `_bmad-output/implementation-artifacts/story-2-11-decision-record.md`

---

**FIN DU DECISION RECORD**
