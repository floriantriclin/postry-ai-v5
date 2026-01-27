# Story 1.8.1 : Infrastructure API & Orchestration Phase 1

**Status:** Done
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)
**Dépendances :** Toutes les stories de 1.3 à 1.7.

## Description

**En tant que** Développeur,
**Je veux** mettre en place le client API et l'orchestration de la première phase du quiz,
**Afin de** transformer l'expérience statique en un flux dynamique capable d'identifier l'archétype de l'utilisateur.

**Type :** Technical / Feature
**INVEST:**
- **Independent:** Pose les bases pour les stories suivantes sans dépendre de la Phase 2.
- **Negotiable:** La structure du client API peut évoluer.
- **Valuable:** Permet de tester le flux réel jusqu'à l'archétype.
- **Estimable:** Périmètre technique bien défini.
- **Small:** Focus sur le client et la Phase 1.
- **Testable:** Validé par des tests unitaires sur le reducer.

## Contexte Technique

Cette story initie la connexion entre le frontend (`QuizEngine`) et les APIs backend. Elle se concentre sur la robustesse de la communication et la gestion des états asynchrones pour la Phase 1 (questions 1 à 6).

## Critères d'Acceptation

### 1. Client API & Types
- [x] Le client API [`lib/quiz-api-client.ts`](lib/quiz-api-client.ts) est créé et centralise les appels `fetch`.
- [x] Les interfaces TypeScript pour les payloads et réponses des endpoints `/generate` (Phase 1) et `/archetype` sont définies.
- [x] Une gestion d'erreur robuste (`try/catch`) est implémentée dans le client.

### 2. Refactorisation de la Gestion d'État
- [x] Le `reducer` de `QuizEngine` gère les états `status: 'idle' | 'loading' | 'success' | 'error'`.
- [x] L'état intègre les données dynamiques : `questionsP1` et `archetypeData`.
- [x] Le passage d'une question à l'autre déclenche les appels API nécessaires au moment opportun.

### 3. Orchestration Phase 1
- [x] Au démarrage (ou via `Early Trigger`), appel à `POST /api/quiz/generate?phase=1`.
- [x] Après la 6ème réponse, appel à `POST /api/quiz/archetype`.
- [x] En cas d'échec API, bascule automatique sur `mock-quiz.json`.

## Plan d'Action (Tâches)

- [x] Créer [`lib/quiz-api-client.ts`](lib/quiz-api-client.ts).
- [x] Mettre à jour [`components/feature/quiz-engine.logic.ts`](components/feature/quiz-engine.logic.ts) pour supporter les états asynchrones.
- [x] Implémenter les appels API dans le composant [`components/feature/quiz-engine.tsx`](components/feature/quiz-engine.tsx).
- [x] **Tests Unitaires :** Créer [`components/feature/quiz-engine.logic.test.ts`](components/feature/quiz-engine.logic.test.ts) pour valider les transitions d'état.

## QA Results

### Risk Assessment (2026-01-20)
- **Score:** 65/100 (CONCERNS)
- **Critical Risk:** TECH-001 - Orchestration failure (blank screen).
- **Recommendation:** Ensure robust error state handling in the reducer and mandatory fallback to mock data.
- **Reference:** [`docs/qa/assessments/1.8.1-risk-20260120.md`](docs/qa/assessments/1.8.1-risk-20260120.md)

### Test Design (2026-01-20)
- **Strategy:** 8 scenarios (4 Unit, 3 Integration, 1 E2E).
- **Focus:** State transitions, API failover logic, and orchestration triggers.
- **Reference:** [`docs/qa/assessments/1.8.1-test-design-20260120.md`](docs/qa/assessments/1.8.1-test-design-20260120.md)

### Gate Status
Gate: PASS → [`docs/qa/gates/1.8.1-api-infra.md`](docs/qa/gates/1.8.1-api-infra.md)
