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
- [ ] Des états de chargement "Tech & Brut" (ex: blocs clignotants, curseur `_`, messages `BOOTING_ICE_PROTOCOL...`) sont affichés.
- [ ] L'optimisation "Early Trigger" est implémentée pour minimiser l'attente en Phase 1.
- [ ] L'interface utilise des transitions "Snap" (sèches) et un compteur digital `[ 04 / 11 ]` pour renforcer l'identité visuelle.
- [ ] Le passage entre les étapes est instantané dès le clic sur une option.

### 3. Robustesse et Fallback
- [ ] Un `try/catch` entoure chaque appel API.
- [ ] En cas d'échec d'un appel API, le système bascule sur le `mock-quiz.json` pour ne pas interrompre le parcours utilisateur (Graceful Degradation).
- [ ] Un message d'erreur discret peut être loggué en console pour le débogage, mais ne doit pas être visible par l'utilisateur.

### 4. Qualité du Code
- [ ] Le client API est bien structuré et gère la sérialisation/désérialisation des données.
- [ ] La machine à états (`reducer`) est claire et gère tous les cas de figure (loading, success, error) pour chaque étape du processus.
- [ ] Les dépendances d'effets (`useEffect`) sont correctement gérées pour éviter les appels multiples non désirés.

## Plan d'Action (Tâches)

### 1. Client API & Types
- [ ] Créer [`lib/quiz-api-client.ts`](lib/quiz-api-client.ts) pour centraliser les appels fetch.
- [ ] Définir les interfaces TypeScript pour les payloads et réponses de chaque endpoint (`/generate`, `/archetype`, `/refine`, `/profile`).
- [ ] Implémenter une stratégie de cache simple (mémoire) pour éviter les appels redondants sur un même thème.

### 2. Gestion de l'État & Logique (Reducer)
- [ ] Refactorer `QuizState` pour intégrer les états asynchrones proprement (ex: `status: 'idle' | 'loading' | 'success' | 'error'`).
- [ ] Ajouter les métadonnées dynamiques : `questionsP1`, `questionsP2`, `archetypeData`, `finalProfile`.
- [ ] **Tests Unitaires :** Créer `components/feature/quiz-engine.logic.test.ts` pour valider toutes les transitions d'état du reducer (indépendamment de l'UI).
- [ ] Récupérer le paramètre `theme` depuis l'URL (`useSearchParams`) pour bypasser le `ThemeSelector` si nécessaire.

### 3. Orchestration & Performance
- [ ] **Early Trigger :** Lancer l'appel `/generate` (Phase 1) dès l'entrée en mode `INSTRUCTIONS`.
- [ ] **Smart Loading :** Si l'utilisateur clique sur "C'EST PARTI" avant la fin du chargement P1, afficher le loader "Machine" jusqu'à résolution.
- [ ] **Background Prefetch :** Lancer `/generate` (Phase 2) immédiatement après l'appel `/archetype`, pendant que l'utilisateur lit son profil d'archétype.
- [ ] **Asynchronous Refine :** Appeler `/refine` en Phase 2 de manière non-bloquante (Fire & Forget avec gestion d'erreur silencieuse).
- [ ] **Indicateur de Précision :** Implémenter la logique de progression "Précision : X%" (de 50% à 100%) en Phase 2.

### 4. Expérience "Tech & Brut" (UI/UX)
- [ ] **Zéro Friction :** Supprimer tout délai ou bouton "Suivant". Le clic sur une réponse `QuestionCard` déclenche le `dispatch` immédiat.
- [ ] **Loader "Machine" :** Remplacer le spinner classique par une séquence de blocs monospace clignotants (`animate-pulse`) et des messages système (ex: `CALIBRATING_VECTORS...`).
- [ ] **Transitions Sèches :** Éviter les animations "smooth". Utiliser des transitions de type "Snap" ou des fondus très courts (100ms) pour renforcer le côté brut.
- [ ] **Indicateur de Progression :** Remplacer la barre de progression standard par un compteur digital `[ 04 / 11 ]`.

### 5. Robustesse & Fallback
- [ ] **Graceful Degradation :** En cas d'erreur API (500, Timeout), basculer automatiquement sur `mock-quiz.json` et logger l'incident.
- [ ] **Persistence Locale :** Sauvegarder l'état du quiz dans le `localStorage` pour permettre une reprise après rafraîchissement (Optionnel mais recommandé).

### 6. Validation Finale
- [ ] **E2E Playwright :** Créer `e2e/quiz-flow.spec.ts` simulant un parcours complet (Succès et Fallback).
- [ ] **Audit Accessibilité :** Vérifier les contrastes et la navigation clavier sur les nouveaux éléments dynamiques.

## QA Results

### Review Date: 2026-01-20

### Reviewed By: Quinn (Test Architect)

### Story Readiness Assessment
The story is **Ready for Development**. It provides a high level of technical detail regarding the API orchestration and UX requirements. The inclusion of fallback mechanisms and prefetching strategies shows a mature approach to LLM-integrated frontend development.

### Risk Analysis Summary
- **Primary Risk**: State complexity and race conditions due to background API calls (Prefetch Phase 2, Async Refine).
- **Mitigation Strategy**: Robust unit testing of the `useReducer` logic is mandatory (Task 2.3).
- **Risk Score**: 81/100 (High)

### Compliance Check
- Coding Standards: [✓] (Plan follows current patterns)
- Project Structure: [✓] (Uses `lib/` and `components/feature/`)
- Testing Strategy: [✓] (Unit + E2E planned)
- All ACs Met: [✓] (Requirement set is complete)

### Improvements Checklist
- [ ] Ensure the Reducer handles "Action out of order" for background prefetch.
- [ ] Add explicit 429 (Rate Limit) handling in the API client.
- [ ] **Highly Recommended**: Move Local Persistence (Task 5.2) from optional to required to ensure user session recovery on refresh.

### Gate Status
Gate: **PASS** → [`docs/qa/gates/1.8-full-integration.md`](docs/qa/gates/1.8-full-integration.md)
Risk profile: [`docs/qa/assessments/1.8-risk-20260120.md`](docs/qa/assessments/1.8-risk-20260120.md)
Test design: [`docs/qa/assessments/1.8-test-design-20260120.md`](docs/qa/assessments/1.8-test-design-20260120.md)

### Recommended Status
[✓] Ready for Implementation
