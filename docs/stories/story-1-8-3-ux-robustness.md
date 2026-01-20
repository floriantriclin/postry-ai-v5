# Story 1.8.3 : Expérience "Tech & Brut" & Robustesse

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendances :** [Story 1.8.2](docs/stories/story-1-8-2-phase-2-augmentation.md).

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
- [ ] **Loader "Machine" :** Remplacement des spinners par des séquences monospace clignotantes et messages système (`BOOTING_ICE_PROTOCOL...`).
- [ ] **Transitions Sèches :** Transitions de type "Snap" ou fondus ultra-courts (100ms).
- [ ] **Compteur Digital :** Remplacement de la barre de progression par un compteur type `[ 04 / 11 ]`.
- [ ] **Zéro Friction :** Suppression des boutons "Suivant", validation immédiate au clic sur une réponse.

### 2. Robustesse & Persistance
- [ ] **Persistance Locale :** Sauvegarde automatique de l'état dans `localStorage` pour permettre la reprise après rafraîchissement.
- [ ] **Graceful Degradation :** Validation finale de la bascule sur le mock en cas de coupure réseau ou erreur 500.

### 3. Validation Finale
- [ ] **E2E Playwright :** Création de `e2e/quiz-flow.spec.ts` simulant un parcours complet avec succès et avec erreurs API.
- [ ] **Audit Accessibilité :** Vérification des contrastes et de la navigation clavier sur les nouveaux éléments.

## Plan d'Action (Tâches)

- [ ] Créer le composant `LoaderMachine` et l'intégrer aux états de chargement.
- [ ] Implémenter le compteur digital et ajuster les transitions CSS.
- [ ] Ajouter le hook de persistance `localStorage` dans `QuizEngine`.
- [ ] Écrire et valider les tests E2E avec Playwright.
- [ ] Effectuer une revue d'accessibilité.
