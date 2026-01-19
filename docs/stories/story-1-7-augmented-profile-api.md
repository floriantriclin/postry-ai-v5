# Story 1.7 : API de Synthèse du Profil Augmenté

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendance :** [Story 1.4 : Logique socle du Protocole ICE (Backend)](./new-story-1-4-ice-core-logic.md)

## Description

**En tant que** Développeur Backend,
**Je veux** créer un endpoint API `POST /api/quiz/profile` qui transforme le vecteur de style final de l'utilisateur en un profil textuel riche et personnalisé,
**Afin de** fournir au frontend le contenu final à "révéler" à l'utilisateur à la fin du quiz.

**Type :** Feature (Backend Only)
**INVEST:**
- **Independent:** Dépends uniquement de la story 1.4. Peut être testée isolément.
- **Negotiable:** Le ton et le style du texte généré peuvent être affinés via le prompt engineering.
- **Valuable:** Génère la récompense finale du quiz, un élément clé de la conversion.
- **Estimable:** Périmètre clair, limité à une seule route API et son prompt.
- **Small:** Réalisable en un seul sprint.
- **Testable:** La sortie peut être validée via des tests (snapshots) ou manuellement.

## Contexte Technique

Cette story crée la dernière route API du tunnel de quiz : `app/api/quiz/profile/route.ts`. Son rôle est de prendre les données numériques finales du quiz et de les traduire en un langage marketing et valorisant pour l'utilisateur, en utilisant un prompt Gemini spécifique.

- **Route :** `POST /api/quiz/profile`
- **Validation :** Zod valide la requête entrante (qui doit contenir le vecteur final et l'archétype de base) et la réponse du LLM.
- **Prompting :** Utilise le super-prompt de "Synthèse du Profil Augmenté" défini dans `docs/specs/ice_protocol.md`.

## Critères d'Acceptation

### 1. Endpoint et Validation
- [ ] La route `POST /api/quiz/profile` est créée.
- [ ] Un schéma Zod valide le corps de la requête. Il doit accepter :
  - `baseArchetype: string` (le nom de l'archétype initial).
  - `finalVector: Vstyle` (le vecteur de style final $V_{11}$).
- [ ] L'API retourne une erreur 400 si la validation du corps de la requête échoue.

### 2. Logique de Synthèse avec Gemini
- [ ] Le service appelle l'API Gemini avec le super-prompt de la Section 4.1 du protocole ICE.
- [ ] Les variables `{{NOM_ARCHETYPE}}` et `{{VECTEUR_V11_JSON}}` sont correctement remplacées dans le prompt.
- [ ] La configuration de la réponse de Gemini est paramétrée pour attendre un JSON.
- [ ] Un schéma Zod est utilisé pour valider la réponse JSON de Gemini, qui doit contenir :
  - `label_final: string`
  - `definition_longue: string`
- [ ] En cas de non-conformité du JSON retourné par le LLM, l'API retourne une erreur 500 contrôlée.

### 3. Réponse de l'API
- [ ] En cas de succès, l'API retourne un objet JSON avec les champs `label_final` et `definition_longue`.
- [ ] La casse des champs (`snake_case`) est conservée telle que spécifiée dans le protocole.

### 4. Sécurité et Performance
- [ ] La clé API Gemini est gérée de manière sécurisée côté serveur.
- [ ] Le temps de réponse de l'endpoint reste sous les 10 secondes.
