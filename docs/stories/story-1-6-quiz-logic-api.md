# Story 1.6 : API de Calcul d'Archétype et d'Affinage

**Status:** In Progress
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./new-story-1-4-ice-core-logic.md)

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

- **Routes :**
  - `POST /api/quiz/archetype`
  - `POST /api/quiz/refine`
- **Validation :** Zod est utilisé pour valider les payloads des requêtes.
- **Logique :** Les controlleurs de ces routes agissent comme une fine couche d'abstraction au-dessus des fonctions `getClosestArchetype` et `updateVector` de `lib/ice-logic.ts`.

## Critères d'Acceptation

### 1. Endpoint de Détermination d'Archétype (`/api/quiz/archetype`)
- [ ] La route `POST /api/quiz/archetype` est créée.
- [ ] Un schéma Zod valide le corps de la requête, qui doit contenir un tableau de 6 réponses (ex: `['B', 'A', 'B', 'B', 'A', 'A']`).
- [ ] Le service convertit le tableau de réponses en une chaîne binaire à 6 bits (ex: `'101100'`).
- [ ] Le service appelle `getClosestArchetype` (de `lib/ice-logic.ts`) avec la signature binaire.
- [ ] L'API retourne l'objet `Archetype` complet (nom, vecteur de base, etc.) ainsi que les 5 dimensions cibles pour la Phase 2 (calculées via `getTargetDimensions`).

### 2. Endpoint d'Affinage de Vecteur (`/api/quiz/refine`)
- [ ] La route `POST /api/quiz/refine` est créée.
- [ ] Un schéma Zod valide le corps de la requête, qui doit contenir :
  - `currentVector: Vstyle` (le vecteur de style actuel de l'utilisateur).
  - `dimension: string` (la dimension testée par la question).
  - `answer: 'A' | 'B'` (le choix de l'utilisateur).
- [ ] Le service appelle la fonction `updateVector` (de `lib/ice-logic.ts`) avec ces paramètres.
- [ ] L'API retourne le nouvel objet `Vstyle` (le vecteur mis à jour).

### 3. Qualité et Robustesse
- [ ] Les deux endpoints retournent des erreurs 400 en cas de payload invalide.
- [ ] Le code est couvert par des tests d'intégration qui simulent des appels HTTP.
- [ ] La logique métier reste confinée dans `lib/ice-logic.ts` ; les routes ne contiennent que le code de plomberie (validation, appel, réponse).
