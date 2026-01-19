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
  - `lib/ice-constants.ts`: contiendra les 9 dimensions, les 16 archétypes avec leurs vecteurs de base et leurs signatures binaires.
  - `lib/ice-logic.ts`: contiendra les fonctions de calcul pures.
- **Tests :** Une suite de tests unitaires (`lib/ice-protocol.spec.ts`) devra être créée pour valider chaque fonction.

## Critères d'Acceptation

### 1. Constantes et Structures de Données (`lib/ice-constants.ts`)
- [ ] Le référentiel des 9 dimensions (CAD, DEN, ...) est défini.
- [ ] La matrice complète des 16 archétypes est intégrée, incluant leur nom, signature binaire et vecteur de base $V_{base}$.
- [ ] Des types TypeScript (`type` ou `interface`) sont créés pour `Archetype`, `Vstyle` (vecteur de 9 nombres), et `BinarySignature`.

### 2. Algorithmes de Calcul (`lib/ice-logic.ts`)
- [ ] Une fonction `getClosestArchetype(userSignature: string): Archetype` est implémentée.
  - [ ] Elle calcule la **Distance de Hamming** entre la signature de l'utilisateur et celle de chaque archétype.
  - [ ] Elle retourne l'archétype le plus proche. En cas d'égalité, le premier trouvé est retourné.
- [ ] Une fonction `updateVector(currentVector: Vstyle, dimension: string, choice: 'A' | 'B'): Vstyle` est implémentée.
  - [ ] Elle applique la formule d'affinage : $V_{nouveau} = V_{actuel} + (Cible - V_{actuel}) \times 0.3$.
  - [ ] `choice 'A'` correspond à une `Cible` de 0, `choice 'B'` à une `Cible` de 100.
- [ ] Une fonction `getTargetDimensions(archetypeVector: Vstyle): string[]` est implémentée.
  - [ ] Elle retourne les 5 dimensions à tester en Phase 2 :
    1. Les 3 non-testées en Phase 1 (STR, INF, ANC).
    2. Les 2 dont la valeur dans `archetypeVector` est la plus proche de 50.

### 3. Validation par les Tests (`lib/ice-protocol.spec.ts`)
- [ ] Les tests unitaires (Vitest) sont écrits pour `lib/ice-logic.ts`.
- [ ] `getClosestArchetype` est testé avec des signatures exactes et des signatures à 1 ou 2 bits de différence.
- [ ] `updateVector` est testé pour vérifier la justesse du calcul d'affinage.
- [ ] `getTargetDimensions` est testé pour s'assurer qu'elle sélectionne les bonnes dimensions cibles.

### 4. Qualité du Code
- [ ] Le code est entièrement typé (TypeScript strict).
- [ ] Les fonctions sont pures (pas d'effets de bord) pour faciliter les tests.
- [ ] Le code est documenté (JSDoc).
