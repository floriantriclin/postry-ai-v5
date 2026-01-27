# Story 2.10 : Unit Tests & Operational Documentation

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)  
**Type:** Technical Debt / Quality Improvement / Documentation  
**Référence:** [`docs/RECAP-CE-QUI-RESTE-A-FAIRE.md`](../RECAP-CE-QUI-RESTE-A-FAIRE.md) - Story 2.10  
**Référence Story 2.8:** [`story-2-8-production-readiness.md`](story-2-8-production-readiness.md)  
**Date de Création:** 26 Janvier 2026 23:11 UTC  
**Statut:** 📋 **PLANIFIÉE** (Post-Production)  
**Priorité:** 🟡 MOYENNE

---

## 📋 Description

**En tant que** Full Stack Developer,  
**Je veux** compléter les tests unitaires de l'endpoint persist-on-login et créer la documentation opérationnelle,  
**Afin d'** assurer la maintenabilité et faciliter les opérations en production.

---

## 🎯 Contexte

Story 2.8 a été déployée en production avec les items HIGH PRIORITY complets (rate limiting + alerting), mais les tests unitaires de l'endpoint et la documentation opérationnelle n'ont pas été complétés.

### Situation Actuelle
- **Tests Unitaires Endpoint:** 0% (non démarrés)
- **Documentation Opérationnelle:** 0% (non démarrée)
- **Priorité:** MOYENNE (post-production)

### Référence
- **Décision PO:** [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md)
- **Synthèse Complète:** [`STORIES-2-7-2-8-SYNTHESE-COMPLETE.md`](STORIES-2-7-2-8-SYNTHESE-COMPLETE.md)

---

## ✅ Critères d'Acceptation

### AC1: Tests Unitaires Endpoint ✅
**Priorité:** 🔴 HAUTE

- [ ] Fichier de tests créé: `app/api/auth/persist-on-login/route.test.ts`
- [ ] Coverage > 80% pour l'endpoint
- [ ] Tests pour tous les cas d'erreur:
  - 401: User non authentifié
  - 400: Validation échoue (Zod)
  - 403: Email mismatch
  - 500: Database error
  - 429: Rate limiting
- [ ] Tests pour cas de succès (200)
- [ ] Tests pour intégration rate limiting
- [ ] Tests pour intégration alerting
- [ ] Tous les tests passent

**Fichier à créer:**
- `app/api/auth/persist-on-login/route.test.ts` - Suite de tests complète

---

### AC2: Documentation Production Deployment ✅
**Priorité:** 🟡 MOYENNE

- [ ] Guide de déploiement production créé
- [ ] Checklist pré-déploiement
- [ ] Checklist post-déploiement
- [ ] Procédure de rollback
- [ ] Configuration variables d'environnement
- [ ] Vérifications de santé

**Fichier à créer:**
- `docs/operations/production-deployment-guide.md`

**Contenu:**
- Prérequis déploiement
- Étapes détaillées
- Vérifications à chaque étape
- Procédure de rollback
- Contacts d'urgence

---

### AC3: Documentation Rate Limiting ✅
**Priorité:** 🟡 MOYENNE

- [ ] Guide rate limiting créé
- [ ] Configuration expliquée
- [ ] Monitoring rate limiting
- [ ] Ajustement des limites
- [ ] Troubleshooting

**Fichier à créer:**
- `docs/operations/rate-limiting-guide.md`

**Contenu:**
- Fonctionnement rate limiting
- Configuration actuelle (10 req/min)
- Headers X-RateLimit-*
- Monitoring et métriques
- Ajustement des limites
- Cas d'usage et exemples

---

### AC4: Documentation Alerting ✅
**Priorité:** 🟡 MOYENNE

- [ ] Guide alerting créé
- [ ] Configuration channels (Sentry/Slack/Email)
- [ ] Types d'alertes
- [ ] Niveaux de sévérité
- [ ] Gestion des alertes

**Fichier à créer:**
- `docs/operations/alerting-guide.md`

**Contenu:**
- Architecture alerting system
- Configuration channels
- Types d'alertes (database, auth, validation, exceptions)
- Niveaux de sévérité (INFO, WARNING, ERROR, CRITICAL)
- Rate limiting des alertes
- Procédures de réponse

---

### AC5: Incident Runbook ✅
**Priorité:** 🟡 MOYENNE

- [ ] Runbook incidents créé
- [ ] Procédures pour chaque type d'incident
- [ ] Escalation paths
- [ ] Contacts d'urgence
- [ ] Post-mortem template

**Fichier à créer:**
- `docs/operations/incident-runbook.md`

**Contenu:**
- Classification incidents (P0, P1, P2, P3)
- Procédures par type:
  - Authentication failures
  - Database errors
  - Rate limiting issues
  - Performance degradation
  - Data integrity issues
- Escalation paths
- Communication templates
- Post-mortem template

---

### AC6: Monitoring Metrics ✅
**Priorité:** 🟡 MOYENNE

- [ ] Documentation métriques créée
- [ ] Métriques clés définies
- [ ] Seuils d'alerte configurés
- [ ] Dashboards recommandés
- [ ] Interprétation des métriques

**Fichier à créer:**
- `docs/operations/monitoring-metrics.md`

**Contenu:**
- Métriques clés:
  - Taux de succès auth (> 95%)
  - Temps auth → dashboard (< 2s)
  - Taux d'erreur global (< 0.1%)
  - Posts orphelins (0)
  - Rate limiting 429 (< 1%)
- Seuils d'alerte
- Dashboards recommandés
- Interprétation et actions

---

## 📅 Plan d'Exécution

### Phase 1: Tests Unitaires Endpoint (2h)

#### Étape 1.1: Setup Tests (30 min)
**Responsable:** Full Stack Developer

**Tâches:**
- [ ] Créer `app/api/auth/persist-on-login/route.test.ts`
- [ ] Configurer mocks (Supabase, Database)
- [ ] Configurer test environment
- [ ] Créer helpers de test

**Critères d'acceptation:**
- [ ] Fichier de tests créé
- [ ] Mocks configurés
- [ ] Environment de test prêt

---

#### Étape 1.2: Tests Cas d'Erreur (1h)
**Responsable:** Full Stack Developer

**Tâches:**
- [ ] Test 401: User non authentifié
  ```typescript
  it('should return 401 if user not authenticated', async () => {
    // Mock: getUser returns null
    // Expect: 401 response
    // Expect: Alert sent
  });
  ```

- [ ] Test 400: Validation échoue
  ```typescript
  it('should return 400 if validation fails', async () => {
    // Mock: Invalid request body
    // Expect: 400 response
    // Expect: Zod error details
  });
  ```

- [ ] Test 403: Email mismatch
  ```typescript
  it('should return 403 if email mismatch', async () => {
    // Mock: User email ≠ request email
    // Expect: 403 response
    // Expect: Alert sent
  });
  ```

- [ ] Test 500: Database error
  ```typescript
  it('should return 500 if database error', async () => {
    // Mock: Database throws error
    // Expect: 500 response
    // Expect: Alert sent
  });
  ```

- [ ] Test 429: Rate limiting
  ```typescript
  it('should return 429 if rate limit exceeded', async () => {
    // Mock: Rate limit exceeded
    // Expect: 429 response
    // Expect: X-RateLimit-* headers
  });
  ```

**Critères d'acceptation:**
- [ ] Tous les tests d'erreur passent
- [ ] Alerting vérifié pour chaque cas
- [ ] Coverage > 60%

---

#### Étape 1.3: Tests Cas de Succès (30 min)
**Responsable:** Full Stack Developer

**Tâches:**
- [ ] Test 200: Succès complet
  ```typescript
  it('should return 200 and create post on success', async () => {
    // Mock: Valid request, authenticated user
    // Expect: 200 response
    // Expect: Post created with status='revealed'
    // Expect: postId returned
  });
  ```

- [ ] Test intégration rate limiting
  ```typescript
  it('should include rate limit headers on success', async () => {
    // Mock: Valid request
    // Expect: X-RateLimit-Limit header
    // Expect: X-RateLimit-Remaining header
    // Expect: X-RateLimit-Reset header
  });
  ```

- [ ] Test intégration alerting
  ```typescript
  it('should not send alerts on success', async () => {
    // Mock: Valid request
    // Expect: No alerts sent
    // Expect: Logs structured correctly
  });
  ```

**Critères d'acceptation:**
- [ ] Tests de succès passent
- [ ] Coverage > 80%
- [ ] Intégrations validées

---

### Phase 2: Documentation Production (1h)

#### Étape 2.1: Production Deployment Guide (30 min)
**Responsable:** Full Stack Developer

**Tâches:**
- [ ] Créer `docs/operations/production-deployment-guide.md`
- [ ] Documenter prérequis
- [ ] Documenter étapes déploiement
- [ ] Documenter vérifications
- [ ] Documenter rollback

**Critères d'acceptation:**
- [ ] Guide complet et clair
- [ ] Checklists incluses
- [ ] Procédure de rollback détaillée

---

#### Étape 2.2: Rate Limiting & Alerting Guides (30 min)
**Responsable:** Full Stack Developer

**Tâches:**
- [ ] Créer `docs/operations/rate-limiting-guide.md`
- [ ] Créer `docs/operations/alerting-guide.md`
- [ ] Documenter configuration
- [ ] Documenter monitoring
- [ ] Ajouter exemples

**Critères d'acceptation:**
- [ ] Guides complets
- [ ] Configuration documentée
- [ ] Exemples clairs

---

### Phase 3: Documentation Opérationnelle (1h)

#### Étape 3.1: Incident Runbook (30 min)
**Responsable:** Full Stack Developer + Product Manager

**Tâches:**
- [ ] Créer `docs/operations/incident-runbook.md`
- [ ] Définir classification incidents
- [ ] Documenter procédures
- [ ] Définir escalation paths
- [ ] Créer templates

**Critères d'acceptation:**
- [ ] Runbook complet
- [ ] Procédures claires
- [ ] Templates inclus

---

#### Étape 3.2: Monitoring Metrics (30 min)
**Responsable:** Full Stack Developer + Product Manager

**Tâches:**
- [ ] Créer `docs/operations/monitoring-metrics.md`
- [ ] Définir métriques clés
- [ ] Définir seuils d'alerte
- [ ] Recommander dashboards
- [ ] Documenter interprétation

**Critères d'acceptation:**
- [ ] Métriques documentées
- [ ] Seuils définis
- [ ] Dashboards recommandés

---

## 📊 Effort Estimé

| Phase | Tâches | Effort | Priorité |
|-------|--------|--------|----------|
| **Phase 1: Tests Unitaires** | 3 étapes | 2h | 🔴 HAUTE |
| **Phase 2: Doc Production** | 2 étapes | 1h | 🟡 MOYENNE |
| **Phase 3: Doc Opérationnelle** | 2 étapes | 1h | 🟡 MOYENNE |
| **TOTAL** | **7 étapes** | **4h** | **1 jour** |

### Priorités
- **🔴 HAUTE (2h):** Tests unitaires endpoint
- **🟡 MOYENNE (2h):** Documentation opérationnelle

---

## ⚠️ Risques & Mitigation

### Risque 1: Complexité Mocking
**Probabilité:** Moyenne (40%)  
**Impact:** Moyen (5/10)  
**Score:** 2.0

**Description:**
- Mocking Supabase et Database peut être complexe
- Tests peuvent être fragiles

**Mitigation:**
- ✅ Utiliser helpers de test existants
- ✅ Isoler logique business
- ✅ Tests focused sur comportement, pas implémentation
- ✅ Documentation des mocks

---

### Risque 2: Documentation Obsolète
**Probabilité:** Faible (20%)  
**Impact:** Faible (3/10)  
**Score:** 0.6

**Description:**
- Documentation peut devenir obsolète rapidement
- Maintenance nécessaire

**Mitigation:**
- ✅ Lier documentation au code
- ✅ Reviews régulières
- ✅ Versioning de la documentation
- ✅ Ownership clair

---

### Risque 3: Coverage Insuffisant
**Probabilité:** Faible (20%)  
**Impact:** Moyen (4/10)  
**Score:** 0.8

**Description:**
- Difficile d'atteindre 80% coverage
- Edge cases nombreux

**Mitigation:**
- ✅ Focus sur cas critiques d'abord
- ✅ Tests d'intégration complémentaires
- ✅ E2E tests couvrent flux complets
- ✅ Qualité > métrique

---

## 📚 Documentation Associée

### Documents de Référence
- [`docs/RECAP-CE-QUI-RESTE-A-FAIRE.md`](../RECAP-CE-QUI-RESTE-A-FAIRE.md) - Plan d'actions global
- [`story-2-8-production-readiness.md`](story-2-8-production-readiness.md) - Story parente
- [`plans/story-2-8-po-decision.md`](../../plans/story-2-8-po-decision.md) - Décision PO
- [`STORIES-2-7-2-8-SYNTHESE-COMPLETE.md`](STORIES-2-7-2-8-SYNTHESE-COMPLETE.md) - Synthèse complète

### Stories Liées
- [`story-2-7-auth-persistence-simplification.md`](story-2-7-auth-persistence-simplification.md) - Story 2.7 (✅ complétée)
- [`story-2-8-production-readiness.md`](story-2-8-production-readiness.md) - Story 2.8 (✅ complétée)
- [`story-2-9-e2e-test-completion.md`](story-2-9-e2e-test-completion.md) - Story 2.9 (📋 planifiée)

### Code Clés
- [`app/api/auth/persist-on-login/route.ts`](../../app/api/auth/persist-on-login/route.ts) - Endpoint à tester
- [`lib/rate-limit.ts`](../../lib/rate-limit.ts) - Rate limiting (24 tests ✅)
- [`lib/alerting.ts`](../../lib/alerting.ts) - Alerting (27 tests ✅)

---

## 👥 Responsabilités

### Full Stack Developer (BMad Dev)
- [ ] Création tests unitaires endpoint
- [ ] Documentation technique
- [ ] Validation coverage
- [ ] Review documentation

### Product Manager (BMad PM)
- [ ] Collaboration incident runbook
- [ ] Collaboration monitoring metrics
- [ ] Validation documentation opérationnelle
- [ ] Approval final

### Scrum Master (BMad SM)
- [x] Création de la story
- [ ] Coordination équipe
- [ ] Suivi avancement
- [ ] Reporting

---

## 🚀 Prochaines Étapes

### Immédiat (Post-Production)
1. [ ] Valider story avec équipe
2. [ ] Assigner à Full Stack Developer
3. [ ] Planifier dans prochain sprint
4. [ ] Estimer effort final

### Sprint Suivant (29-30 Janvier)
1. [ ] **Phase 1:** Tests Unitaires Endpoint (2h)
2. [ ] **Phase 2:** Documentation Production (1h)
3. [ ] **Phase 3:** Documentation Opérationnelle (1h)
4. [ ] **Validation finale:** Product Manager

---

## 📝 Notes Techniques

### Dépendances
- **Pré-requis:** Story 2.8 déployée en production ✅
- **Bloquants:** Aucun
- **Risques:** Voir section Gestion des Risques

### Estimation
- **Complexité:** Moyenne
- **Effort:** 4h (1 jour)
- **Priorité:** 🟡 MOYENNE (post-production)

### Métriques de Succès
| Métrique | Avant | Cible | Mesure |
|----------|-------|-------|--------|
| Coverage endpoint | 0% | > 80% | Vitest |
| Tests unitaires | 0 | > 15 | Vitest |
| Documentation | 0 docs | 5 docs | Review |
| Runbook incidents | ❌ Absent | ✅ Complet | Review |

---

## 📞 Contacts & Support

| Rôle | Responsable | Disponibilité |
|------|-------------|---------------|
| **Full Stack Dev** | BMad Dev | ✅ Sprint suivant |
| **Product Manager** | BMad PM | ✅ Sprint suivant |
| **Scrum Master** | BMad SM | ✅ Disponible |

**Questions?** Ping @bmad-sm ou voir [`docs/RECAP-CE-QUI-RESTE-A-FAIRE.md`](../RECAP-CE-QUI-RESTE-A-FAIRE.md)

---

## 🎯 Critères de Validation Finale

### Avant Clôture Story
- [ ] Tests unitaires endpoint créés et passants
- [ ] Coverage > 80% pour endpoint
- [ ] Tous les cas d'erreur testés
- [ ] 5 documents opérationnels créés:
  - [ ] `docs/operations/production-deployment-guide.md`
  - [ ] `docs/operations/rate-limiting-guide.md`
  - [ ] `docs/operations/alerting-guide.md`
  - [ ] `docs/operations/incident-runbook.md`
  - [ ] `docs/operations/monitoring-metrics.md`
- [ ] Documentation complète et claire
- [ ] Validation Product Manager obtenue

### Après Clôture Story
- [ ] Tests exécutés dans CI/CD
- [ ] Documentation accessible à l'équipe
- [ ] Runbook utilisé en cas d'incident
- [ ] Métriques monitorées en production

---

**Créé par:** Scrum Master (BMad SM)  
**Date de création:** 26 Janvier 2026 23:11 UTC  
**Dernière mise à jour:** 26 Janvier 2026 23:11 UTC  
**Statut:** 📋 **PLANIFIÉE** (Post-Production)  
**Priorité:** 🟡 MOYENNE  
**Sprint:** Prochain sprint (après déploiement production)  
**Effort Estimé:** 4h (1 jour)

---

## 🎯 Définition de "Done"

Cette story sera considérée comme **DONE** quand:

1. ✅ **Tests:**
   - Tests unitaires endpoint créés
   - Coverage > 80%
   - Tous les tests passent
   - Intégrations validées

2. ✅ **Documentation:**
   - 5 documents opérationnels créés
   - Guides complets et clairs
   - Runbook actionnable
   - Métriques documentées

3. ✅ **Validation:**
   - Product Manager approuve
   - Documentation accessible
   - Équipe formée

4. ✅ **Déploiement:**
   - Tests intégrés dans CI/CD
   - Documentation publiée
   - Équipe informée

---

**Bonne chance pour l'implémentation! 📚**
