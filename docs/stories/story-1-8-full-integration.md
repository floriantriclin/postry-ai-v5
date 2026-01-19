# Story 1.8 : Intégration Complète du Quiz Dynamique (Frontend)

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendances :** Toutes les stories de 1.3 à 1.7.

## Description

**En tant que** Visiteur,
**Je veux** vivre l'expérience complète et dynamique du quiz, depuis la génération des questions basées sur mon thème jusqu'à la révélation de mon profil unique,
**Afin de** découvrir mon identité rédactionnelle de manière fluide, personnalisée et engageante.

**Type :** Feature (Frontend + Integration)
**INVEST:**
- **Independent:** Peut être démarrée une fois que les APIs sont disponibles et mockées/stables.
- **Negotiable:** Les styles des animations de chargement peuvent être affinés.
- **Valuable:** C'est la story qui livre la valeur finale de l'Epic 1 à l'utilisateur.
- **Estimable:** Périmètre clair, centré sur la gestion des appels API et des états dans le `QuizEngine`.
- **Small:** Réalisable en un seul sprint.
- **Testable:** Le parcours complet peut être testé de bout en bout (E2E).

## Contexte Technique

Cette story a pour but de transformer le `QuizEngine` statique (Story 1.3) en une application dynamique connectée. Elle orchestrera la séquence complexe d'appels API pour suivre le flux défini par le protocole ICE.

- **Composant Principal :** `QuizEngine`
- **Client API :** Création d'un client API simple (`lib/quiz-api-client.ts`) pour encapsuler les appels `fetch` aux endpoints du quiz.
- **Gestion d'état :** Le `useReducer` existant sera étendu pour gérer les états de chargement (`isLoadingPhase1`, `isLoadingPhase2`, etc.) et les données dynamiques.

## Critères d'Acceptation

### 1. Orchestration du Flux de Données
- [ ] Au démarrage du quiz, un appel est fait à `POST /api/quiz/generate` (avec `phase: 1`) pour récupérer les 6 premières questions.
- [ ] Après la 6ème réponse, un appel est fait à `POST /api/quiz/archetype` pour envoyer les réponses et récupérer l'archétype.
- [ ] Pendant l'affichage de l'archétype, un appel est fait en arrière-plan à `POST /api/quiz/generate` (avec `phase: 2` et le contexte de l'archétype) pour récupérer les 5 questions suivantes.
- [ ] Après *chaque* réponse de la Phase 2 (questions 7 à 11), un appel est fait à `POST /api/quiz/refine` pour mettre à jour le vecteur de style de l'utilisateur.
- [ ] Après la 11ème réponse, un appel est fait à `POST /api/quiz/profile` avec le vecteur final pour récupérer le profil augmenté.
- [ ] Les données du profil (`label_final`, `definition_longue`) sont affichées à l'utilisateur.

### 2. Gestion de l'Expérience Utilisateur (UX)
- [ ] Des états de chargement "Tech & Brut" (ex: blocs clignotants, curseur `_`) sont affichés pendant les appels API bloquants (chargement initial, calcul final).
- [ ] L'optimisation "Early Trigger" est implémentée : la génération de la Phase 1 est lancée en arrière-plan dès l'écran de consignes qui précède le quiz.
- [ ] Le passage entre les étapes (Phase 1 -> Révélation Archétype -> Phase 2 -> Révélation Finale) est fluide et sans interruption visible pour l'utilisateur.

### 3. Robustesse et Fallback
- [ ] Un `try/catch` entoure chaque appel API.
- [ ] En cas d'échec d'un appel API, le système bascule sur le `mock-quiz.json` pour ne pas interrompre le parcours utilisateur (Graceful Degradation).
- [ ] Un message d'erreur discret peut être loggué en console pour le débogage, mais ne doit pas être visible par l'utilisateur.

### 4. Qualité du Code
- [ ] Le client API est bien structuré et gère la sérialisation/désérialisation des données.
- [ ] La machine à états (`reducer`) est claire et gère tous les cas de figure (loading, success, error) pour chaque étape du processus.
- [ ] Les dépendances d'effets (`useEffect`) sont correctement gérées pour éviter les appels multiples non désirés.
