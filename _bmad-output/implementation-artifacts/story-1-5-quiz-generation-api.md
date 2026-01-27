# Story 1.5 : API de Génération de Questions ICE

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./story-1-4-ice-core-logic.md)

## Description

**En tant que** Développeur Backend,
**Je veux** exposer un endpoint API `POST /api/quiz/generate` qui génère des questions de quiz en stricte conformité avec le protocole ICE,
**Afin de** fournir au frontend les questions nécessaires pour les deux phases du quiz de manière dynamique et contextuelle.

**Type :** Feature (Backend Only)
**INVEST:**
- **Independent:** Peut être développée et testée avec des outils comme Postman ou des tests d'intégration, une fois la story 1.4 terminée.
- **Negotiable:** Le format exact du payload de la requête peut être discuté avec l'équipe frontend.
- **Valuable:** Permet la génération dynamique de contenu, qui est au cœur de la proposition de valeur.
- **Estimable:** Périmètre clair, limité à une seule route API et sa logique associée.
- **Small:** Réalisable en un seul sprint.
- **Testable:** La validité de la sortie peut être vérifiée via des tests automatisés.

## Contexte Technique

Cette story crée la route Next.js API [`app/api/quiz/generate/route.ts`](app/api/quiz/generate/route.ts). Cet endpoint sera le point d'entrée pour toutes les demandes de génération de questions. Il devra interagir avec le service Gemini (via [`lib/gemini.ts`](lib/gemini.ts)) et utiliser les prompts formatés du protocole ICE ([`docs/specs/ice_protocol.md`](docs/specs/ice_protocol.md)).

- **Route :** `POST /api/quiz/generate`
- **Validation :** Utilisation de Zod pour valider rigoureusement les requêtes entrantes et la structure des réponses du LLM.
- **Dépendances :** Utilisation des types et constantes de [`lib/ice-constants.ts`](lib/ice-constants.ts) et [`lib/ice-logic.ts`](lib/ice-logic.ts).

### Structure des données (Zod)

**Requête :**
```typescript
{
  phase: 1 | 2,
  topic: string,
  context?: {
    archetypeName: string,
    archetypeVector: Vstyle, // number[9], cf lib/ice-constants.ts
    targetDimensions: DimensionCode[] // 5 dimensions, cf lib/ice-constants.ts
  }
}
```

**Réponse attendue de Gemini (et renvoyée par l'API) :**
```typescript
Array<{
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7' | 'Q8' | 'Q9' | 'Q10' | 'Q11',
  dimension: DimensionCode,
  option_A: string,
  option_B: string
}>
```

## Critères d'Acceptation

### 1. Endpoint et Validation
- [x] La route `POST /api/quiz/generate` est créée.
- [x] Un schéma Zod valide le corps de la requête selon la structure définie ci-dessus.
- [x] **Sécurité (SEC-001)** : Le `topic` est nettoyé pour prévenir l'injection de prompts (stripping des instructions LLM courantes).
- [x] Si la validation échoue, l'API retourne une erreur 400 avec un message explicite.
- [x] Le service [`lib/gemini.ts`](lib/gemini.ts) est créé pour encapsuler l'appel à l'API Google Generative AI (modèle `gemini-2.5-flash`).

### 2. Génération - Phase 1 (Polarisation)
- [x] Si `phase: 1` est demandée, l'API appelle Gemini en utilisant le `system_instruction` et le prompt utilisateur de la Phase 1 (cf [`docs/specs/ice_protocol.md`](docs/specs/ice_protocol.md)).
- [x] Le placeholder `{{THEME_CHOISI}}` dans le prompt est remplacé par le `topic`.
- [x] **Validation (DATA-001)** : L'API valide la réponse JSON de Gemini avec Zod (vérification des `id` de Q1 à Q6 et des codes de dimensions exacts).
- [x] L'API retourne le tableau de 6 questions formaté.

### 3. Génération - Phase 2 (Affinage)
- [x] Si `phase: 2` est demandée, la requête doit contenir le `context` (sinon, erreur 400).
- [x] L'API appelle Gemini en utilisant le `system_instruction` et le prompt utilisateur de la Phase 2.
- [x] Les variables `{{THEME_CHOISI}}`, `{{NOM_ARCHETYPE}}`, `{{VECTEUR_JSON}}` (mappé en objet pour le prompt), et `{{LISTE_DES_5_DIMENSIONS_CIBLES}}` sont correctement remplacées.
- [x] **Validation (DATA-001)** : L'API valide la réponse JSON de Gemini avec Zod (vérification des `id` de Q7 à Q11 et des codes de dimensions).
- [x] L'API retourne le tableau de 5 questions formaté.

### 4. Sécurité, Robustesse et Performance
- [x] **Sécurité (SEC-002)** : La clé API Gemini (`GEMINI_API_KEY`) est utilisée exclusivement côté serveur via `process.env`.
- [x] **Robustesse (TECH-001)** : L'API gère les instabilités du LLM :
  - [x] Utilisation d'une fonction utilitaire `cleanJsonResponse` pour extraire le JSON même si entouré de texte ou de markdown.
  - [x] Stratégie de **retry** : 2 tentatives supplémentaires (total 3 essais) en cas d'erreur de parsing ou d'erreur 5xx de Gemini.
  - [x] Retourne une erreur 502 (Bad Gateway) avec un payload JSON d'erreur standardisé si Gemini échoue après retries.
- [x] **Performance (PERF-001)** : Le temps de réponse moyen (incluant retries) doit rester sous les 10 secondes. Un timeout de 15s est configuré côté serveur.
- [ ] **Observabilité** : Logs structurés via `console.error` incluant le `correlationId` (si disponible) et le payload brut de Gemini en cas d'échec de parsing.

## Stratégie de Test (QA Architect)

### 1. Tests Unitaires (Vitest)
- [x] **Logic de Nettoyage** : Tester `cleanJsonResponse` avec :
  - [x] JSON pur.
  - [x] JSON avec markdown ` ```json ... ``` `.
  - [x] JSON avec texte avant/après.
  - [x] JSON invalide (doit lever une erreur explicite).
- [x] **Sanitisation** : Tester la fonction de nettoyage du `topic` avec des payloads d'injection connus.

### 2. Tests d'Intégration (Vitest)
- [x] **Mocage Gemini** : Utiliser `msw` ou des mocks manuels pour simuler les réponses de l'API Google.
- [x] **Workflow Phase 1 & 2** : Vérifier que les bons prompts sont générés selon la phase demandée.
- [x] **Scénarios de Retry** : Simuler un échec au premier appel, puis un succès au second, et vérifier que l'API renvoie 200.

### 3. Tests de Robustesse & Contrat (Risk-Based)
- [x] **Fuzzing de réponse LLM** : Envoyer des réponses Gemini avec des dimensions erronées ou des IDs manquants et vérifier que l'API rejette correctement via Zod (422/502).
- [x] **Timeout Testing** : Simuler une latence de 20s de Gemini et vérifier que l'API renvoie un timeout propre.

### 4. Tests Manuels de Qualité
- [ ] **Revue de Pertinence (BUS-001)** : Générer des questions pour 3 thèmes radicalement différents (ex: "Cuisine", "Blockchain", "Psychologie") et valider manuellement la cohérence avec le protocole ICE.

## QA Results

### Risk Profile (2026-01-20)
- **Overall Score**: 39/100 (High Risk)
- **Critical Risks**: 1 (Gemini Response Format Inconsistency)
- **High Risks**: 3 (Prompt Injection, Data Inconsistency, Question Quality)
- **Report**: [`1.5-risk-20260120.md`](docs/qa/assessments/1.5-risk-20260120.md)

**Key Recommendations**:
- Must implement robust JSON cleaning for LLM responses (TECH-001).
- Must add prompt injection sanitization for user-provided topics (SEC-001).
- Monitor LLM response quality and format error rates closely.

### Test Design (2026-01-20)
- **Total Scenarios**: 15
- **Priority**: 7 P0, 7 P1, 1 P2
- **Document**: [`1.5-test-design-20260120.md`](docs/qa/assessments/1.5-test-design-20260120.md)

### Requirements Traceability (2026-01-20)
- **Coverage**: 92% Full, 0% Partial, 8% None
- **Total Requirements**: 12
- **Document**: [`1.5-trace-20260120.md`](docs/qa/assessments/1.5-trace-20260120.md)

### Non-Functional Requirements (2026-01-20)
- **Status**: PARTIAL PASS (Observability Gaps)
- **Document**: [`1.5-nfr-20260120.md`](docs/qa/assessments/1.5-nfr-20260120.md)
- **Trace matrix**: docs/qa/assessments/1.5-trace-20260120.md

**Key Gaps**:
- Missing `correlationId` and tests for structured logging.

---

## Dev Agent Record

**Agent Model Used:** gemini-3-flash-preview

### Debug Log
- 2026-01-20: Validated current implementation against Traceability Matrix.
- 2026-01-20: Ran Vitest suite (21 tests passed).
- 2026-01-20: Identified missing `correlationId` implementation in `app/api/quiz/generate/route.ts` as noted in QA assessment.

### Completion Notes
- All core functional requirements (Phase 1/2 generation, sanitization, Zod validation) are implemented and tested.
- Robustness features (retry, JSON cleaning, error handling) are implemented and tested.
- Observability (Structured Logs with `correlationId`) remains pending.

### File List
- [`app/api/quiz/generate/route.ts`](app/api/quiz/generate/route.ts)
- [`app/api/quiz/generate/route.test.ts`](app/api/quiz/generate/route.test.ts)
- [`lib/gemini.ts`](lib/gemini.ts)
- [`lib/gemini.test.ts`](lib/gemini.test.ts)

### Change Log
- 2026-01-20: Updated acceptance criteria status checkboxes.
- 2026-01-20: Added Dev Agent Record section.
- 2026-01-20: Fixed file path discrepancy (moved from /api/quiz to /api/quiz/generate).
