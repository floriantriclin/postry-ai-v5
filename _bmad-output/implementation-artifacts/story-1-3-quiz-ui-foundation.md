# Story 1.3 : Fondation de l'UI du Quiz (Statique)

**Status:** Done
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)

## Description

**En tant que** Visiteur,
**Je veux** pouvoir compléter l'intégralité du parcours du quiz avec des données statiques,
**Afin de** valider la fluidité de l'interface et l'expérience utilisateur (UX) avant l'intégration des services dynamiques.

**Type :** Feature (Frontend Only)
**INVEST:**
- **Independent:** Ne dépend d'aucune autre story de l'Epic 1.
- **Negotiable:** Les détails de l'animation ou du style peuvent être ajustés.
- **Valuable:** Valide le parcours utilisateur principal de l'acquisition.
- **Estimable:** Périmètre limité au frontend et aux données mockées.
- **Small:** Réalisable en un seul sprint.
- **Testable:** Le parcours peut être testé de bout en bout manuellement et via des tests d'intégration.

## Contexte Technique

Cette story a pour but de développer le composant React `QuizEngine` qui gère l'état et l'affichage des 11 questions, des écrans de transition, et de la révélation finale. Elle utilise un fichier de données mockées (`lib/data/mock-quiz.json`) qui simule la structure complète du quiz (Phase 1, Archétype, Phase 2, Profil Augmenté).

- **Framework :** Next.js (App Router)
- **State Management :** `useReducer` pour gérer la machine à états du quiz.
- **Styling :** Tailwind CSS, respectant le design Néo-Brutaliste.
- **Data :**
  - Un fichier `mock-quiz.json` contenant des exemples de questions pour les deux phases et un profil final statique.
  - Un fichier de configuration simple pour les 10 thèmes hardcodés.

## Critères d'Acceptation

### 1. Sélection du Thème
- [x] Une grille de 10 thèmes est affichée, chargée depuis un fichier de configuration simple et facilement modifiable.
- [x] Aucun bouton "Démarrer" n'est présent sous la liste des thèmes.
- [x] Le clic sur une tuile de thème valide immédiatement la sélection et transitionne vers l'écran suivant.

### 2. Consigne (Interstitiel)
- [x] Un écran explicatif s'affiche après la sélection du thème.
- [x] Le texte indique à l'utilisateur qu'il va être soumis à une première série de questions A/B pour déterminer son archétype rédactionnel.
- [x] Un bouton permet de lancer effectivement la phase de questions.

### 3. Phase 1 (Polarisation)
- [x] Le quiz démarre et affiche la première question de la Phase 1 depuis le fichier mock.
- [x] L'utilisateur peut répondre aux 6 questions.
- [x] Un clic sur une réponse (A ou B) passe automatiquement à la question suivante.
- [x] Une barre de progression indique "1/6", "2/6", etc.
- [x] Un bouton "Précédent" permet de revenir en arrière et de modifier sa réponse.

### 4. Transition et Révélation de l'Archétype
- [x] Après la 6ème question, un écran de transition affiche le nom de l'archétype mocké (ex: "Le Stratège").
- [x] Un bouton "Continuer pour affiner" déclenche le passage à la phase suivante.

### 5. Phase 2 (Affinage)
- [x] Le quiz affiche les 5 questions de la Phase 2 depuis le fichier mock.
- [x] La barre de progression indique un pourcentage d'affinage (ex: "Précision: 80%").
- [x] La navigation (Suivant/Précédent) reste fonctionnelle.

### 6. Révélation Finale du Profil Augmenté
- [x] Après la 11ème question, un écran de chargement simulé (2-3 secondes) est affiché.
- [x] L'écran de révélation finale montre le "Label Final" et la "Définition" du profil augmenté mocké.
- [x] Un champ de saisie "De quoi voulez-vous parler ?" et un bouton "Générer un post" sont présents sous le profil révélé.

### 7. Conception et Responsivité
- [x] L'interface est pleinement responsive (mobile-first).
- [x] Le design Néo-Brutaliste (bordures épaisses, pas d'arrondis, typographies contrastées) est respecté sur tous les écrans.

### 8. Qualité et Tests
- [x] Implémentation des outils et pratiques définis dans les standards de test (data-testid, structure de test, etc.).

## Tâches Techniques

### 1. Setup & Data
- [x] Créer le répertoire `lib/data` (Architecture: Shared Logic & Utils).
- [x] Créer `lib/data/themes.json` (10 thèmes hardcodés).
- [x] Créer `lib/data/mock-quiz.json` (Données complètes simulées).

### 2. Architecture & Routing
- [x] Créer la route `app/quiz/page.tsx`.
- [x] Initialiser le composant `components/feature/quiz-engine.tsx` (Client Component).
- [x] Implémenter le `useReducer` pour la machine à états :
  - `THEMES` -> `INSTRUCTIONS` -> `PHASE1` -> `TRANSITION_ARCHETYPE` -> `PHASE2` -> `LOADING` -> `FINAL_REVEAL`.

### 3. Composants UI (Mobile First + Neo-Brutalist)
- [x] `components/feature/quiz/theme-selector.tsx` : Grille de sélection.
- [x] `components/feature/quiz/quiz-interstitial.tsx` : Écran "Consigne".
- [x] `components/feature/quiz/question-card.tsx` : Affichage A/B + Barre de progression (Compatible Phase 1 & 2).
- [x] `components/feature/quiz/archetype-transition.tsx` : Reveal intermédiaire.
- [x] `components/feature/quiz/final-reveal.tsx` : Affichage du profil augmenté (Mocké).

### 4. Intégration & Styles
- [x] Appliquer les classes Tailwind (Bordures noires, ombres dures, typo).
- [x] Vérifier la responsivité (Mobile / Desktop).

## QA & Test Strategy

**Risk Assessment:** [Analysis](docs/qa/assessments/1.3-risk-20260119.md)
**NFR Assessment:** [Report](docs/qa/assessments/1.3-nfr-20260119.md)
**Test Design:** [Test Plan](docs/qa/assessments/1.3-test-design-20260119.md)

### Key Risks Identified
- **TECH-002 (High):** Quiz State Machine Logic Flaws. Complex state transitions in `useReducer` might lead to bugs in navigation.
- **UX-002 (High):** Neo-Brutalist Layout Breakage on Mobile. Hard borders and shadows may overflow on small viewports.

### Testing Priorities
1. **Unit Tests (P0):** Verify `useReducer` logic for all state transitions (Start -> Phase 1 -> Transition -> Phase 2 -> Reveal).
2. **E2E Tests (P0):** Validate the complete user journey from Theme Selection to Final Reveal (Happy Path).
3. **Visual Regression (P1):** Ensure the UI renders correctly on 320px mobile screens without overflow.
