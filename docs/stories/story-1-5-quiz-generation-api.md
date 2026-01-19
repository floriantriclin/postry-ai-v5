# Story 1.5 : API de Génération de Questions ICE

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./new-story-1-4-ice-core-logic.md)

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

Cette story crée la route Next.js API `app/api/quiz/generate/route.ts`. Cet endpoint sera le point d'entrée pour toutes les demandes de génération de questions. Il devra interagir avec le service Gemini (via `lib/gemini.ts`) et utiliser les prompts formatés du protocole ICE.

- **Route :** `POST /api/quiz/generate`
- **Validation :** Utilisation de Zod pour valider rigoureusement les requêtes entrantes et la structure des réponses du LLM.
- **Dépendances :** Le code de cette story utilisera les fonctions et constantes définies dans la Story 1.4.

## Critères d'Acceptation

### 1. Endpoint et Validation
- [ ] La route `POST /api/quiz/generate` est créée.
- [ ] Un schéma Zod valide le corps de la requête. Il doit accepter :
  - `phase: 1` ou `phase: 2`.
  - `topic: string`.
  - `context` (optionnel) : un objet contenant des informations pour la Phase 2 (`archetypeName`, `archetypeVector`, `targetDimensions`).
- [ ] Si la validation échoue, l'API retourne une erreur 400.

### 2. Génération - Phase 1 (Polarisation)
- [ ] Si `phase: 1` est demandée, l'API envoie à Gemini le super-prompt de la Phase 1 (défini dans `docs/specs/ice_protocol.md`).
- [ ] Le `{{THEME_CHOISI}}` dans le prompt est correctement remplacé par le `topic` de la requête.
- [ ] L'API attend une réponse JSON de Gemini et la valide avec un schéma Zod.
- [ ] L'API retourne un tableau de 6 questions, chacune avec `id`, `dimension`, `option_A`, `option_B`.

### 3. Génération - Phase 2 (Affinage)
- [ ] Si `phase: 2` est demandée, la requête doit contenir le `context` (sinon, erreur 400).
- [ ] L'API envoie à Gemini le super-prompt de la Phase 2.
- [ ] Les variables `{{THEME_CHOISI}}`, `{{NOM_ARCHETYPE}}`, `{{VECTEUR_JSON}}`, et `{{LISTE_DES_5_DIMENSIONS_CIBLES}}` sont correctement remplacées.
- [ ] L'API valide la réponse de Gemini avec Zod.
- [ ] L'API retourne un tableau de 5 questions, chacune avec `id`, `dimension`, `option_A`, `option_B`.

### 4. Sécurité et Performance
- [ ] La clé API Gemini est utilisée exclusivement côté serveur et n'est jamais exposée au client.
- [ ] Le temps de réponse moyen de l'endpoint doit rester sous les 10 secondes.
- [ ] Des logs clairs sont mis en place pour tracer les appels à Gemini et les erreurs éventuelles.
