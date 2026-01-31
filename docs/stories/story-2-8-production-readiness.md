# Story 2.8 : Production Readiness - Rate Limiting & Monitoring

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)  
**Type:** Technical Debt / Production Readiness / Security  
**Référence:** [`plans/story-2-7-merge-action-plan.md`](../../plans/story-2-7-merge-action-plan.md) - Phase 4  
**Référence PO:** [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md)  
**Date de Création:** 26 Janvier 2026 17:00 UTC  
**Statut:** ✅ **APPROVED FOR PRODUCTION** (HIGH PRIORITY 100% | TOTAL 67%)
**Date Validation PO:** 26 Janvier 2026 22:19 UTC
**Décision PO:** ✅ DÉPLOYER EN PRODUCTION avec follow-up stories
**Prêt pour Production:** ✅ OUI (HIGH PRIORITY items complets)

---

## 📋 Description

**En tant que** Product Owner,  
**Je veux** que l'endpoint persist-on-login soit protégé et monitoré,  
**Afin d'** assurer la sécurité et la fiabilité en production.

---

## 🎯 Contexte

Story 2.7 a été **complétée avec succès** et mergée dans `dev` (commit `9e7acca`). Cependant, les reviews QA et Architecture ont identifié des améliorations critiques pour la production:

### Vulnérabilités Identifiées
- **V4.3 (MOYEN):** Pas de rate limiting → Risque DoS/enumeration
- **R3.3 (HAUTE):** Pas d'alerting → Détection erreurs retardée
- **Tests E2E:** 17/24 échecs (liés à authenticated state)

### Décision Product Owner
**Stratégie:** STAGING ONLY + Story 2.8

1. ✅ **Déployer Story 2.7 en STAGING** (environnement contrôlé)
2. 📋 **Créer Story 2.8** (cette story) - Production readiness
3. 🚀 **Déployer en PRODUCTION** après Story 2.8

**Référence:** [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md)

---

## ✅ Critères d'Acceptation

### AC1: Rate Limiting ✅
**Priorité:** 🔴 HAUTE (Requis avant production)

- [ ] Endpoint `/api/auth/persist-on-login` protégé par rate limiting
- [ ] Limite: 10 requêtes par minute par IP
- [ ] Réponse 429 (Too Many Requests) si limite dépassée
- [ ] Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` présents
- [ ] Cleanup automatique des entrées expirées (éviter memory leak)
- [ ] Tests unitaires pour rate limiting

**Fichiers à créer:**
- `lib/rate-limit.ts` - Utilitaire rate limiting
- `lib/rate-limit.test.ts` - Tests unitaires

**Fichiers à modifier:**
- `app/api/auth/persist-on-login/route.ts` - Intégrer rate limiting

---

### AC2: Alerting System ✅
**Priorité:** 🔴 HAUTE (Requis avant production)

- [ ] Système d'alerting configuré (Sentry/Email/Slack)
- [ ] Alertes envoyées pour erreurs critiques:
  - Database errors
  - Authentication failures
  - Validation errors (taux > 5%)
  - Exceptions non gérées
- [ ] Logs structurés avec contexte complet (userId, postId, error)
- [ ] Alertes testées en staging
- [ ] Documentation alerting créée

**Fichiers à créer:**
- `lib/alerting.ts` - Système d'alerting
- `lib/alerting.test.ts` - Tests unitaires
- `docs/operations/alerting-guide.md` - Documentation

**Fichiers à modifier:**
- `app/api/auth/persist-on-login/route.ts` - Intégrer alerting

---

### AC3: Tests E2E Fixes ✅
**Priorité:** 🟡 MOYENNE (Qualité)

- [ ] 24/24 tests E2E passent (actuellement 7/24)
- [ ] Tests cross-browser fonctionnent (Chromium, Firefox, WebKit)
- [ ] Tests authenticated state corrigés
- [ ] Tests unauthenticated context ajoutés si nécessaire
- [ ] Documentation tests E2E mise à jour

**Fichiers à modifier:**
- `e2e/story-2-7.spec.ts` - Corriger tests échouants
- `e2e/README.md` - Documenter corrections

**Problèmes identifiés:**
- Tests E2E-2.7-02, E2E-2.7-04, E2E-2.7-05 échouent (authenticated state)
- Tests E2E-2.7-REG-01, E2E-2.7-REG-02 échouent (authenticated state)

---

### AC4: Tests Unitaires Endpoint ✅
**Priorité:** 🟡 MOYENNE (Qualité)

- [ ] Tests unitaires pour `/api/auth/persist-on-login`
- [ ] Coverage > 80% pour le nouveau code
- [ ] Tests pour tous les cas d'erreur:
  - User non authentifié (401)
  - Validation échoue (400)
  - Email mismatch (403)
  - Database error (500)
  - Succès (200)
- [ ] Tests pour rate limiting
- [ ] Tests pour alerting

**Fichiers à créer:**
- `app/api/auth/persist-on-login/route.test.ts` - Tests unitaires

---

### AC5: Documentation Production ✅
**Priorité:** 🟡 MOYENNE (Opérations)

- [ ] Guide de déploiement production créé
- [ ] Documentation rate limiting ajoutée
- [ ] Documentation alerting complétée
- [ ] Runbook incidents créé
- [ ] Métriques de monitoring documentées

**Fichiers à créer:**
- `docs/operations/production-deployment-guide.md`
- `docs/operations/rate-limiting-guide.md`
- `docs/operations/incident-runbook.md`
- `docs/operations/monitoring-metrics.md`

---

## 📅 Plan d'Exécution

### Phase 1: Rate Limiting (2h) - 🔴 HAUTE PRIORITÉ

#### Étape 1.1: Créer Utilitaire Rate Limiting (1h)
**Responsable:** Full Stack Developer  
**Fichier:** `lib/rate-limit.ts`

**Tâches:**
- [ ] Créer fonction `rateLimit(req, limit, windowMs)`
- [ ] Implémenter Map in-memory pour tracking
- [ ] Ajouter cleanup automatique (setInterval)
- [ ] Gérer extraction IP (x-forwarded-for, x-real-ip)
- [ ] Retourner headers `X-RateLimit-*`
- [ ] Tests unitaires

**Critères d'acceptation:**
- [ ] Fonction rate limit fonctionne
- [ ] Cleanup automatique actif
- [ ] Headers présents dans réponse
- [ ] Tests unitaires passent

---

#### Étape 1.2: Intégrer Rate Limiting (1h)
**Responsable:** Full Stack Developer  
**Fichier:** `app/api/auth/persist-on-login/route.ts`

**Tâches:**
- [ ] Importer `rateLimit` de `lib/rate-limit`
- [ ] Appeler rate limit au début de POST handler
- [ ] Retourner 429 si limite dépassée
- [ ] Ajouter headers rate limit à toutes les réponses
- [ ] Tester manuellement (10+ requêtes rapides)

**Critères d'acceptation:**
- [ ] Rate limiting actif
- [ ] 429 retourné après 10 requêtes/min
- [ ] Headers présents
- [ ] Tests manuels validés

---

### Phase 2: Alerting (1h) - 🔴 HAUTE PRIORITÉ

#### Étape 2.1: Créer Système Alerting (30min)
**Responsable:** Full Stack Developer  
**Fichier:** `lib/alerting.ts`

**Tâches:**
- [ ] Créer fonction `sendAlert(type, error, context)`
- [ ] Implémenter intégration (Sentry/Email/Slack)
- [ ] Ajouter rate limiting des alertes (éviter spam)
- [ ] Logs structurés JSON
- [ ] Tests unitaires

**Critères d'acceptation:**
- [ ] Fonction sendAlert fonctionne
- [ ] Intégration configurée
- [ ] Rate limiting alertes actif
- [ ] Tests unitaires passent

---

#### Étape 2.2: Intégrer Alerting (30min)
**Responsable:** Full Stack Developer  
**Fichier:** `app/api/auth/persist-on-login/route.ts`

**Tâches:**
- [ ] Importer `sendAlert` de `lib/alerting`
- [ ] Ajouter alertes pour erreurs critiques:
  - Database errors
  - Authentication failures
  - Exceptions non gérées
- [ ] Tester en staging
- [ ] Documenter configuration

**Critères d'acceptation:**
- [ ] Alerting actif
- [ ] Alertes envoyées pour erreurs critiques
- [ ] Tests staging validés
- [ ] Documentation créée

---

### Phase 3: Tests E2E Fixes (2h) - 🟡 MOYENNE PRIORITÉ

#### Étape 3.1: Corriger Tests Authenticated State (1h30)
**Responsable:** Test Architect & Quality Advisor  
**Fichier:** `e2e/story-2-7.spec.ts`

**Tâches:**
- [ ] Analyser échecs tests E2E (17/24)
- [ ] Corriger tests authenticated state:
  - E2E-2.7-02: localStorage cleaned
  - E2E-2.7-04: Auth modal appears
  - E2E-2.7-05: Quiz state structure
  - E2E-2.7-REG-01: Complete quiz flow
  - E2E-2.7-REG-02: Post generation API
- [ ] Utiliser unauthenticated context si nécessaire
- [ ] Démarrer sur `/quiz` au lieu de `/` si nécessaire
- [ ] Valider sur 3 navigateurs

**Critères d'acceptation:**
- [ ] 24/24 tests E2E passent
- [ ] Tests cross-browser fonctionnent
- [ ] Documentation mise à jour

---

#### Étape 3.2: Documentation Tests (30min)
**Responsable:** Test Architect & Quality Advisor  
**Fichier:** `e2e/README.md`

**Tâches:**
- [ ] Documenter corrections apportées
- [ ] Expliquer authenticated vs unauthenticated context
- [ ] Ajouter guide troubleshooting
- [ ] Mettre à jour exemples

**Critères d'acceptation:**
- [ ] Documentation complète
- [ ] Exemples clairs
- [ ] Guide troubleshooting ajouté

---

### Phase 4: Tests Unitaires (2h) - 🟡 MOYENNE PRIORITÉ

#### Étape 4.1: Tests Unitaires Endpoint (1h30)
**Responsable:** Full Stack Developer  
**Fichier:** `app/api/auth/persist-on-login/route.test.ts`

**Tâches:**
- [ ] Créer fichier de tests
- [ ] Tester cas d'erreur:
  - 401: User non authentifié
  - 400: Validation échoue
  - 403: Email mismatch
  - 500: Database error
- [ ] Tester cas de succès (200)
- [ ] Tester rate limiting
- [ ] Tester alerting
- [ ] Vérifier coverage > 80%

**Critères d'acceptation:**
- [ ] Tous les cas testés
- [ ] Coverage > 80%
- [ ] Tests passent

---

#### Étape 4.2: Tests Rate Limiting & Alerting (30min)
**Responsable:** Full Stack Developer  
**Fichiers:** `lib/rate-limit.test.ts`, `lib/alerting.test.ts`

**Tâches:**
- [ ] Tests rate limiting:
  - 10 requêtes passent
  - 11ème requête bloquée
  - Reset après window
- [ ] Tests alerting:
  - Alerte envoyée pour erreur
  - Rate limiting alertes fonctionne
  - Logs structurés corrects

**Critères d'acceptation:**
- [ ] Tests rate limiting passent
- [ ] Tests alerting passent
- [ ] Coverage > 80%

---

### Phase 5: Documentation (1h) - 🟡 MOYENNE PRIORITÉ

#### Étape 5.1: Documentation Opérationnelle (1h)
**Responsable:** Full Stack Developer + Product Manager  
**Fichiers:** `docs/operations/*.md`

**Tâches:**
- [ ] Créer guide déploiement production
- [ ] Documenter rate limiting (configuration, monitoring)
- [ ] Documenter alerting (configuration, channels)
- [ ] Créer runbook incidents
- [ ] Documenter métriques monitoring

**Critères d'acceptation:**
- [ ] Tous les documents créés
- [ ] Guides complets et clairs
- [ ] Runbook actionnable
- [ ] Métriques documentées

---

## 📊 Effort Estimé

| Phase | Tâches | Effort | Priorité |
|-------|--------|--------|----------|
| **Phase 1: Rate Limiting** | 2 étapes | 2h | 🔴 HAUTE |
| **Phase 2: Alerting** | 2 étapes | 1h | 🔴 HAUTE |
| **Phase 3: Tests E2E** | 2 étapes | 2h | 🟡 MOYENNE |
| **Phase 4: Tests Unitaires** | 2 étapes | 2h | 🟡 MOYENNE |
| **Phase 5: Documentation** | 1 étape | 1h | 🟡 MOYENNE |
| **TOTAL** | **9 étapes** | **8h** | **1 jour** |

### Priorités
- **🔴 HAUTE (3h):** Rate limiting + Alerting (requis avant production)
- **🟡 MOYENNE (5h):** Tests + Documentation (qualité et opérations)

---

## ⚠️ Risques & Mitigation

### Risque 1: Rate Limiting In-Memory
**Probabilité:** Moyenne (40%)  
**Impact:** Moyen (5/10)  
**Score:** 2.0

**Description:**
- Rate limiting in-memory ne fonctionne pas avec multiple instances
- Pas de persistance entre redémarrages

**Mitigation:**
- ✅ Acceptable pour single-instance deployment
- 📋 Documenter limitation
- 🔄 Migrer vers Redis si scaling nécessaire

---

### Risque 2: Alerting Spam
**Probabilité:** Moyenne (30%)  
**Impact:** Faible (3/10)  
**Score:** 0.9

**Description:**
- Trop d'alertes peuvent noyer les vraies erreurs
- Fatigue d'alerte de l'équipe

**Mitigation:**
- ✅ Rate limiting des alertes (1 alerte/5min par type)
- ✅ Seuils configurables
- ✅ Grouping des erreurs similaires

---

### Risque 3: Tests E2E Complexes
**Probabilité:** Élevée (60%)  
**Impact:** Faible (2/10)  
**Score:** 1.2

**Description:**
- Tests authenticated state difficiles à corriger
- Peut nécessiter refactoring tests

**Mitigation:**
- ✅ Utiliser unauthenticated context
- ✅ Démarrer sur `/quiz` au lieu de `/`
- ✅ Documentation troubleshooting

---

## 📚 Documentation Associée

### Documents de Référence
- [`plans/story-2-7-merge-action-plan.md`](../../plans/story-2-7-merge-action-plan.md) - Phase 4 originale
- [`plans/story-2-7-security-architecture-review.md`](../../plans/story-2-7-security-architecture-review.md) - Recommandations Architect
- [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md) - Décision PO
- [`docs/qa/story-2-7-implementation-verification-report.md`](../qa/story-2-7-implementation-verification-report.md) - QA Report

### Stories Liées
- [`story-2-7-auth-persistence-simplification.md`](story-2-7-auth-persistence-simplification.md) - Story parente (✅ complétée)

### Documents à Créer
- [ ] `docs/operations/production-deployment-guide.md`
- [ ] `docs/operations/rate-limiting-guide.md`
- [ ] `docs/operations/alerting-guide.md`
- [ ] `docs/operations/incident-runbook.md`
- [ ] `docs/operations/monitoring-metrics.md`

---

## 👥 Responsabilités

### Product Manager (BMad PM)
- ✅ Validation de la décision (STAGING ONLY + Story 2.8)
- [ ] Validation critères de succès
- [ ] Go/No-Go production après Story 2.8

### Architect (BMad Architect)
- ✅ Recommandations fournies (Architecture Review)
- [ ] Review implémentation rate limiting
- [ ] Review implémentation alerting

### Full Stack Developer (BMad Dev)
- [ ] Implémentation rate limiting
- [ ] Implémentation alerting
- [ ] Tests unitaires
- [ ] Documentation technique

### Test Architect & QA (BMad QA)
- [ ] Correction tests E2E
- [ ] Validation tests
- [ ] Documentation tests

### Scrum Master (BMad SM)
- [x] Création de la story
- [ ] Coordination équipe
- [ ] Suivi avancement

---

## 🚀 Prochaines Étapes

### Immédiat (26 Janvier)
1. [x] Créer Story 2.8 - ✅ COMPLÉTÉ
2. [ ] Valider story avec équipe
3. [ ] Assigner à Full Stack Developer
4. [ ] Planifier dans sprint courant

### Cette Semaine (27-30 Janvier)
1. [ ] **27 Jan:** Implémenter rate limiting (Dev) - 2h
2. [ ] **27 Jan:** Implémenter alerting (Dev) - 1h
3. [ ] **28 Jan:** Corriger tests E2E (QA) - 2h
4. [ ] **29 Jan:** Tests unitaires (Dev) - 2h
5. [ ] **30 Jan:** Documentation (Dev + PM) - 1h
6. [ ] **30 Jan:** Validation finale (PM)
7. [ ] **30 Jan:** Déploiement production (Story 2.7 + 2.8)

---

## 📝 Notes Techniques

### Dépendances
- **Pré-requis:** Story 2.7 complétée et mergée dans `dev` ✅
- **Bloquants:** Aucun
- **Risques:** Voir section Gestion des Risques

### Estimation
- **Complexité:** Moyenne
- **Effort:** 8h (1 jour)
- **Priorité:** 🔴 HAUTE (requis avant production)

### Métriques de Succès
| Métrique | Avant | Cible | Mesure |
|----------|-------|-------|--------|
| Rate limiting | ❌ Absent | ✅ 10 req/min | Tests manuels |
| Alerting | ❌ Absent | ✅ Actif | Tests staging |
| Tests E2E | 7/24 (29%) | 24/24 (100%) | Playwright |
| Coverage endpoint | 0% | > 80% | Vitest |

---

## 📞 Contacts & Support

| Rôle | Responsable | Disponibilité |
|------|-------------|---------------|
| **Product Manager** | BMad PM | ✅ 27-30 Jan |
| **Architect** | BMad Architect | ✅ Sur demande |
| **Full Stack Dev** | BMad Dev | ✅ 27-30 Jan |
| **Test Architect** | BMad QA | ✅ 28-29 Jan |
| **Scrum Master** | BMad SM | ✅ 27-30 Jan |

**Questions?** Ping @bmad-pm ou voir [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md)

---

**Créé par:** Scrum Master (BMad SM)
**Date de création:** 26 Janvier 2026 17:00 UTC
**Dernière mise à jour:** 26 Janvier 2026 22:30 UTC
**Statut:** ✅ **APPROVED FOR PRODUCTION** (HIGH PRIORITY 100% | TOTAL 67%)
**Date Validation PO:** 26 Janvier 2026 22:19 UTC
**PO Decision:** ✅ DÉPLOYER EN PRODUCTION avec follow-up stories
**Référence PO:** [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md)
**Rapport Progression:** [`plans/story-2-8-sm-progress-report.md`](../../plans/story-2-8-sm-progress-report.md)
**E2E Analysis:** [`docs/qa/story-2-8-phase-3-e2e-fix-report.md`](../qa/story-2-8-phase-3-e2e-fix-report.md)
**Synthèse Complète:** [`docs/stories/STORIES-2-7-2-8-SYNTHESE-COMPLETE.md`](STORIES-2-7-2-8-SYNTHESE-COMPLETE.md)

---

## 🎯 Critères de Validation Finale

### Avant Déploiement Production
- [ ] Rate limiting actif et testé
- [ ] Alerting configuré et testé
- [ ] 24/24 tests E2E passent
- [ ] Coverage > 80% pour nouveau code
- [ ] Documentation opérationnelle complète
- [ ] Tests manuels en staging validés
- [ ] Validation PM obtenue
- [ ] Go/No-Go production: ⏳ EN ATTENTE

### Après Déploiement Production
- [ ] Monitoring 24h actif
- [ ] Aucune alerte critique
- [ ] Rate limiting fonctionne
- [ ] Métriques dans les normes
- [ ] Aucune plainte utilisateur
