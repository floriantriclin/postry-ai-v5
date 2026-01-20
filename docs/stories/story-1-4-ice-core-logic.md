# Story 1.4 : Logique socle du Protocole ICE (Backend)

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)

## Description

**En tant que** Développeur Backend,
**Je veux** implémenter la bibliothèque de base du protocole ICE (v3.1) en tant que module serveur réutilisable,
**Afin de** disposer d'une base de code stable, testée et unique pour toutes les opérations de calcul de profilage.

**Type :** Technical Story (Backend Only)
**INVEST:**
- **Independent:** Ne dépend que de la spécification du protocole ICE.
- **Negotiable:** Les détails d'implémentation (noms de fonctions, etc.) peuvent être adaptés.
- **Valuable:** Facteur de vélocité majeur pour les stories suivantes et garant de la cohérence du profilage.
- **Estimable:** Périmètre clair, limité à la logique pure sans exposition API.
- **Small:** Réalisable en un seul sprint.
- **Testable:** La logique peut être entièrement couverte par des tests unitaires.

## Contexte Technique

Cette story a pour but de créer le "cœur" du moteur ICE. Elle ne doit exposer aucune route API. L'objectif est de centraliser toutes les données et les algorithmes définis dans `docs/specs/ice_protocol.md` dans des fichiers dédiés (ex: `lib/ice-constants.ts`, `lib/ice-logic.ts`).

- **Fichiers Clés :**
  - `lib/ice-constants.ts`: contiendra les 9 dimensions, les 15 archétypes avec leurs vecteurs de base et leurs signatures binaires.
  - `lib/ice-logic.ts`: contiendra les fonctions de calcul pures.
- **Tests :** Une suite de tests unitaires (`lib/ice-protocol.spec.ts`) devra être créée pour valider chaque fonction.

## Critères d'Acceptation

### 1. Constantes et Structures de Données (`lib/ice-constants.ts`)
- [ ] Le référentiel des 9 dimensions (CAD, DEN, ...) est défini.
- [ ] Les constantes d'ordre sont définies pour garantir la cohérence des échanges de données :
  - [ ] `PHASE_1_ORDER` : [POS, TEM, DEN, PRI, CAD, REG] (Ordre des questions et de la signature binaire).
  - [ ] `VECTOR_ORDER` : [CAD, DEN, STR, POS, TEM, REG, INF, PRI, ANC] (Ordre des valeurs dans le tableau `Vstyle`).
- [ ] La matrice complète des 15 archétypes est intégrée, incluant leur nom, signature binaire et vecteur de base $V_{base}$.
- [ ] Des types TypeScript (`type` ou `interface`) sont créés pour `Archetype`, `Vstyle` (vecteur de 9 nombres), et `BinarySignature`.
- [ ] Des schémas Zod sont créés pour `Vstyle` et `BinarySignature` afin de garantir la validation des données runtime (Standard Tech Stack).

### 2. Algorithmes de Calcul (`lib/ice-logic.ts`)
- [ ] Une fonction `getClosestArchetype(userSignature: string): Archetype` est implémentée.
  - [ ] Elle calcule la **Distance de Hamming** entre la signature de l'utilisateur et celle de chaque archétype.
  - [ ] Elle retourne l'archétype le plus proche. En cas d'égalité, le premier trouvé dans la liste `ICE_ARCHETYPES` est retourné (Comportement déterministe).
- [ ] Une fonction `updateVector(currentVector: Vstyle, dimension: string, choice: 'A' | 'B'): Vstyle` est implémentée.
  - [ ] Elle applique la formule d'affinage : $V_{nouveau} = V_{actuel} + (Cible - V_{actuel}) \times 0.3$.
  - [ ] `choice 'A'` correspond à une `Cible` de 0, `choice 'B'` à une `Cible` de 100.
  - [ ] **Règle d'arrondi :** Le résultat du calcul doit être arrondi à l'entier le plus proche (`Math.round`).
- [ ] Une fonction `getTargetDimensions(archetypeVector: Vstyle): string[]` est implémentée.
  - [ ] Elle retourne les 5 dimensions à tester en Phase 2 :
    1. Les 3 non-testées en Phase 1 (STR, INF, ANC).
    2. Les 2 dont la valeur dans `archetypeVector` est la plus proche de 50.
    3. **Règle de départage (Tie-Breaking)** : En cas d'égalité stricte (ex: deux dimensions à distance 10 de 50), sélectionner les dimensions selon leur ordre d'apparition en Phase 1 (`PHASE_1_ORDER`).

### 3. Validation par les Tests (`lib/ice-protocol.spec.ts`)
- [ ] Les tests unitaires (Vitest) sont écrits pour `lib/ice-logic.ts`.
- [ ] Se référer au plan de test : `docs/qa/assessments/1.4-test-design-20260119.md`.
- [ ] `getClosestArchetype` est testé avec des signatures exactes et des signatures à 1 ou 2 bits de différence.
- [ ] `updateVector` est testé pour vérifier la justesse du calcul d'affinage et l'arrondi.
- [ ] `getTargetDimensions` est testé pour s'assurer qu'elle sélectionne les bonnes dimensions cibles, y compris dans les cas d'égalité.
- [ ] Les schémas Zod sont testés (valeurs valides vs invalides).

### 4. Qualité du Code
- [ ] Le code est entièrement typé (TypeScript strict).
- [ ] Les fonctions sont pures (pas d'effets de bord) pour faciliter les tests.
- [ ] Le code est documenté (JSDoc).

## QA & Documentation Link
- **Risk Assessment:** `docs/qa/assessments/1.4-risk-20260119.md`
- **Test Design:** `docs/qa/assessments/1.4-test-design-20260119.md`
