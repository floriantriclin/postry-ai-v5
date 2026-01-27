# Story 1.8.3 : Expérience "Tech & Brut" & Robustesse

**Status:** Completed (2026-01-20)
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)
**Dépendances :** [Story 1.8.2](story-1-8-2-phase-2-augmentation.md).

## Description

**En tant que** Visiteur,
**Je veux** une interface réactive, immersive et fiable,
**Afin de** rester engagé dans le processus de découverte sans friction technique visible.

**Type :** UI / UX / Robustness
**INVEST:**
- **Independent:** Peut être finalisée une fois que la logique de données est stable.
- **Negotiable:** Les détails des animations et messages de logs.
- **Valuable:** Donne l'identité visuelle finale et garantit la continuité du service.
- **Estimable:** Travail de polissage CSS/Animations et intégration `localStorage`.
- **Small:** Un seul sprint.
- **Testable:** Validé par des tests E2E Playwright.

## Contexte Technique

Cette story se concentre sur l'aspect "Feel" de l'application (Identité "Tech & Brut") et sur la fiabilité de la session utilisateur (Persistance).

## Critères d'Acceptation

### 1. Identité Visuelle "Tech & Brut"
- [x] **Loader "Machine" :** Remplacement des spinners actuels (Tailwind `animate-spin`) par un composant `LoaderMachine` affichant des séquences monospace clignotantes et messages système (`BOOTING_ICE_PROTOCOL...`, `CALIBRATING_VECTORS...`).
- [x] **Transitions Sèches :** Transitions de type "Snap" ou fondus ultra-courts (100ms) entre les questions.
- [x] **Compteur Digital :** Mise à jour de `QuestionCard` pour afficher un compteur type `[ 04 / 11 ]` (monospace brackets).
- [x] **Zéro Friction :** Validation immédiate au clic sur une réponse (déjà partiellement en place, à confirmer sur mobile).

### 2. Robustesse & Persistance
- [x] **Persistance Locale :** Création d'un hook `useQuizPersistence` pour sauvegarder l'état du reducer dans `localStorage` et permettre la reprise après rafraîchissement (F5).
- [x] **Feedback Mode Dégradé :** Styliser le "Toast" d'erreur actuel (rouge générique) pour qu'il s'intègre à l'identité "Tech" (ex: bordure orange clignotante, police mono).

### 3. Validation Finale
- [x] **E2E Playwright :** Enrichissement de `e2e/quiz-phase-2.spec.ts` ou création de `e2e/quiz-robustness.spec.ts` pour tester spécifiquement la persistance (reload) et les fallbacks API.
- [x] **Audit Accessibilité :** Vérification des contrastes (notamment sur le thème sombre/brut) et de la navigation clavier.

## Plan d'Action (Tâches)

- [x] **UI/UX :** Créer le composant `components/ui/loader-machine.tsx` et l'intégrer dans `QuizEngine` et `QuizInterstitial` en remplacement des spinners.
- [x] **UI/UX :** Styliser le compteur de `QuestionCard` et le Toast d'erreur (Mode Dégradé) pour coller à l'esthétique Brut.
- [x] **Logic :** Créer le hook `hooks/use-quiz-persistence.ts` et l'intégrer dans `QuizEngine` pour hydrater le state initial.
- [x] **QA :** Écrire un test E2E dédié à la robustesse (`e2e/quiz-robustness.spec.ts`) vérifiant la reprise après reload.
- [x] **QA :** Vérifier manuellement ou via test auto le déclenchement visuel du mode dégradé.

## Documentation QA
- [Analyse des Risques](../qa/assessments/1.8.3-risk-20260120.md)
- [Plan de Tests](../qa/assessments/1.8.3-test-plan-20260120.md)
