# Story 1.7 : API de Synthèse du Profil Augmenté

**Status:** Completed
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./story-1-4-ice-core-logic.md)

## Description

**En tant que** Développeur Backend,
**Je veux** implémenter l'endpoint API `POST /api/quiz/profile` qui transforme le vecteur de style final de l'utilisateur en un profil textuel riche et personnalisé,
**Afin de** fournir au frontend le contenu final à "révéler" à l'utilisateur à la fin du quiz, créant ainsi la récompense émotionnelle du tunnel.

**Type :** Feature (Backend Only)
**INVEST:**
- **Independent:** Dépends de la story 1.4 et 1.6 pour les types et la logique de vecteur.
- **Negotiable:** Le ton et le style du texte généré peuvent être affinés via le prompt engineering.
- **Valuable:** Génère la récompense finale du quiz, un élément clé de la conversion.
- **Estimable:** Périmètre clair, limité à une seule route API et son prompt.
- **Small:** Réalisable rapidement.
- **Testable:** La sortie peut être validée via des tests d'intégration et de validation Zod.

## Contexte Technique

Cette story finalise la suite d'APIs du tunnel de quiz en implémentant `app/api/quiz/profile/route.ts`. Cet endpoint utilise Gemini pour transformer les données quantitatives (Vstyle) en une identité qualitative de marque personnelle.

- **Route :** `POST /api/quiz/profile`
- **Validation :** Utilisation de `vstyleSchema` pour le vecteur et validation stricte de la réponse LLM.
- **Prompting :** Application du super-prompt de "Synthèse du Profil Augmenté" (Section 4.1 du `docs/specs/ice_protocol.md`).

## Critères d'Acceptation

### 1. Endpoint et Validation
- [x] La route `POST /api/quiz/profile` est créée.
- [x] Un schéma Zod valide le corps de la requête :
  - `baseArchetype: string` (Nom de l'archétype, ex: "Le Stratège").
  - `finalVector: number[]` (Le vecteur $V_{11}$ validé via `vstyleSchema` de `lib/ice-constants.ts:339`).
- [x] L'API retourne une erreur 400 avec les détails de validation en cas d'échec.

### 2. Logique de Synthèse avec Gemini
- [x] Le service utilise le modèle `gemini-2.5-flash` via `lib/gemini.ts`.
- [x] Le contenu généré doit impérativement être en **Français**.
- [x] Le prompt est construit en remplaçant :
  - `{{NOM_ARCHETYPE}}` par `baseArchetype`.
  - `{{VECTEUR_V11_JSON}}` par le vecteur formaté en objet JSON associant chaque dimension via `ICE_VECTOR_ORDER` et `ICE_DIMENSIONS`.
  - **Optimisation** : Inclure un "Drift Hint" dans le prompt basé sur le calcul backend de la plus grande dérive par rapport au vecteur de base de l'archétype.
- [x] **Robustesse (TECH-001)** : Utilisation de `cleanJsonResponse` pour traiter la réponse du LLM.
- [x] **Retry Strategy** : Application de la même stratégie de retry que pour la Story 1.5 (3 tentatives total).
- [x] Un schéma Zod valide la réponse JSON de Gemini :
  - `label_final: string` (ex: "Le Stratège Lumineux").
  - `definition_longue: string` (Plage acceptée : 45 à 75 mots, cible prompt 50-60).
- [x] En cas d'échec de parsing après retries, l'API retourne une erreur 502 contrôlée.

### 3. Qualité et Performance
- [x] Le temps de réponse de l'endpoint reste sous les 12 secondes (cible < 10s).
- [x] L'API inclut des logs structurés en cas d'erreur.
- [x] **Observabilité** : Log du payload complet (input/output) en environnement non-prod pour faciliter le debugging des hallucinations.
- [x] Le code est couvert par des tests d'intégration (Vitest) simulant des succès et des échecs LLM.

### 4. Observabilité (Gap Story 1.5/1.6)
- [x] Implémenter le support du `correlationId` dans les logs de cette route pour assurer la traçabilité.

## Stratégie de Test (QA)
- **Tests Unitaires** :
  - Validation du mapping du vecteur vers le format attendu par le prompt.
  - Validation du calcul de la "dérive la plus marquée" (Drift Hint).
- **Tests d'Intégration** :
  - Mock de Gemini pour tester le flux nominal et les cas d'erreur (JSON corrompu, timeout).
  - Test spécifique sur les "Vecteurs Extrêmes" (<15 ou >85) pour vérifier la mise en avant dans la définition.
- **Validation Manuelle** : Vérification de la pertinence de la synthèse pour 3 profils types.

## QA Results (2026-01-20)

### Risk Analysis Summary
- **Risk Score**: 79/100 (Moderate Risk)
- **Primary Concerns**:
    - **TECH-001**: Potential LLM formatting errors or word count non-compliance.
    - **PERF-001**: Latency spikes during LLM synthesis (target < 12s).
    - **BUS-001**: Ensuring content quality provides the intended "emotional reward".

### Recommendations
- **Must Fix**: Strict Zod validation on Gemini output with a 3-retry strategy.
- **Testing**: Prioritize integration tests with mocked malformed JSON to verify resilience.
- **Observability**: Ensure `correlationId` is logged for all LLM calls to facilitate debugging of "hallucinated" responses.

Full Risk Profile: [docs/qa/assessments/1.7-risk-20260120.md](docs/qa/assessments/1.7-risk-20260120.md)
Test Design Matrix: [docs/qa/assessments/1.7-test-design-20260120.md](docs/qa/assessments/1.7-test-design-20260120.md)
Test Execution Report: [docs/qa/reports/1.7-test-execution-20260120.md](docs/qa/reports/1.7-test-execution-20260120.md)
