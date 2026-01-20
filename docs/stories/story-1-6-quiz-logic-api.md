# Story 1.6 : API de Calcul d'Archétype et d'Affinage

**Status:** Done
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./story-1-4-ice-core-logic.md)

## Description

**En tant que** Développeur Backend,
**Je veux** implémenter les endpoints API qui traitent les réponses de l'utilisateur pour calculer son archétype initial et affiner son vecteur de style,
**Afin de** permettre au frontend de piloter la logique du quiz de manière interactive et conforme au protocole ICE.

**Type :** Feature (Backend Only)
**INVEST:**
- **Independent:** Dépends uniquement de la story 1.4. Peut être testée unitairement.
- **Negotiable:** La structure des réponses API peut être ajustée en accord avec le frontend.
- **Valuable:** Fournit le mécanisme de calcul en temps réel, essentiel à la personnalisation.
- **Estimable:** Périmètre bien défini de deux routes API.
- **Small:** Réalisable en un seul sprint.
- **Testable:** Chaque endpoint peut être testé avec des jeux de données d'entrée/sortie précis.

## Contexte Technique

Cette story crée deux routes API distinctes mais logiquement liées, qui utilisent directement les fonctions de la bibliothèque ICE (Story 1.4).

- **Routes (Next.js App Router) :**
  - `POST /api/quiz/archetype` : Calcul de l'archétype initial après Phase 1.
  - `POST /api/quiz/refine` : Mise à jour du vecteur après chaque question de Phase 2.
- **Validation :** Schémas Zod (définis dans `lib/ice-constants.ts` et `lib/types.ts`) pour valider les payloads.
- **Logique :** Les controllers de ces routes agissent comme une fine couche d'abstraction au-dessus des fonctions `getClosestArchetype`, `getTargetDimensions` et `updateVector` de `lib/ice-logic.ts`.

## Critères d'Acceptation

### 1. Endpoint de Détermination d'Archétype (`/api/quiz/archetype`)
- [x] La route `POST /api/quiz/archetype` est créée.
- [x] **Validation (TECH-001)** : Un schéma Zod valide le corps de la requête : `{ answers: Record<DimensionCode, 'A' | 'B'> }`. Doit contenir exactement les 6 dimensions définies dans `ICE_PHASE1_DIMENSIONS_ORDER`.
- [x] **Intégrité (DATA-001)** : Le service convertit l'objet de réponses en une chaîne binaire à 6 bits (A='0', B='1') en suivant l'ordre strict de `ICE_PHASE1_DIMENSIONS_ORDER` (ex: `'101100'`). *Correction SM : Utilisation d'un objet pour garantir l'indépendance de l'ordre côté frontend.*
- [x] Le service appelle `getClosestArchetype` (de `lib/ice-logic.ts`) avec la signature binaire.
- [x] L'API retourne un JSON contenant l'objet `archetype` (type `Archetype`) et un tableau `targetDimensions` (type `DimensionCode[]`) pour la Phase 2 (via `getTargetDimensions`).

### 2. Endpoint d'Affinage de Vecteur (`/api/quiz/refine`)
- [x] La route `POST /api/quiz/refine` est créée.
- [x] **Validation (TECH-001/BUS-001)** : Un schéma Zod valide le corps de la requête :
  - `currentVector: number[]` (validé via `vstyleSchema`).
  - `dimension: DimensionCode` (doit être l'un des 9 codes valides).
  - `answer: 'A' | 'B'` (le choix de l'utilisateur).
- [x] **Calcul (LOGIC-001)** : Le service appelle la fonction `updateVector` (de `lib/ice-logic.ts`) qui applique la force d'attraction de 0.3 et arrondit le résultat.
- [x] L'API retourne le nouveau vecteur `Vstyle` mis à jour.

### 3. Qualité et Robustesse
- [x] Les deux endpoints retournent des erreurs 400 avec un message structuré (ex: via `ZodError`) en cas de payload invalide.
- [x] Le code est couvert par des tests d'intégration (Vitest) qui simulent des appels HTTP via `NextRequest`.
- [x] La logique métier reste confinée dans `lib/ice-logic.ts` ; les routes ne contiennent que le code de plomberie (validation Zod, appel service, formatage réponse).

## QA Results

### Test Execution Report (2026-01-20)
- **Status**: ✅ All tests passed (Verification by QA)
- **Test Suite**: `app/api/quiz/logic.test.ts`
- **Results**:
  - `POST /api/quiz/archetype` : 4/4 passed (Validation, Binary conversion, Archetype calculation, Proximity logic)
  - `POST /api/quiz/refine` : 4/4 passed (Validation, Vector update logic, Multi-dimension handling)

### Risk Profile (2026-01-20)
- **Overall Score**: 32/100 (Medium-High Risk)
- **Critical Risks**: 1 (Phase 1 Dimension Order Desynchronization)
- **High Risks**: 2 (Payload Validation, Client-Side Vector Corruption)
- **Report**: [`1.6-risk-20260120.md`](docs/qa/assessments/1.6-risk-20260120.md)

### Test Design (2026-01-20)
- **Total Scenarios**: 9
- **Priority**: 3 P0, 5 P1, 1 P2
- **Document**: [`1.6-test-design-20260120.md`](docs/qa/assessments/1.6-test-design-20260120.md)

### Quality Gate
- **Status**: ✅ PASSED (2026-01-20)
- **Report**: [`1.6-quiz-logic-api.md`](docs/qa/gates/1.6-quiz-logic-api.md)

**Key Recommendations (Updated with SM Review)**:
- **Mitigated**: The API now accepts an object keyed by `DimensionCode` to prevent order desynchronization (DATA-001).
- Implement strict Zod validation for the answers object (6 required keys, values A/B) (TECH-001).
- Monitor archetype assignment distribution to detect logic drifts.
