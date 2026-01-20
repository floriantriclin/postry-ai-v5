# Story 1.8.2 : Orchestration Phase 2 & Profil Augmenté

**Status:** Ready
**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](docs/epics/epic-1-acquisition.md)
**Dépendances :** [Story 1.8.1](docs/stories/story-1-8-1-api-infrastructure-phase-1.md).

## Description

**En tant que** Visiteur,
**Je veux** que mes réponses de la seconde phase affinent mon profil en temps réel,
**Afin d'** obtenir un résultat d'identité rédactionnelle ultra-personnalisé et précis.

**Type :** Feature / Integration
**INVEST:**
- **Independent:** Se concentre sur la seconde moitié du flux ICE.
- **Negotiable:** La gestion du "Fire & Forget" pour `/refine` peut être ajustée.
- **Valuable:** Délivre la précision finale promise par le protocole ICE.
- **Estimable:** Complexité centrée sur le prefetching et les appels asynchrones.
- **Small:** Un seul sprint pour boucler la logique métier.
- **Testable:** Validé par des tests d'intégration et unitaires.

## Contexte Technique

Cette story complète le flux ICE en intégrant la Phase 2 (questions 7 à 11) et la génération du profil augmenté final. L'accent est mis sur la performance perçue via le prefetching.

## Critères d'Acceptation

### 1. Orchestration Phase 2 (Performance)
- [ ] **Background Prefetch :** Lancement de `POST /api/quiz/generate?phase=2` immédiatement après la récupération de l'archétype, pendant la lecture de l'interstitiel.
- [ ] **Asynchronous Refine :** Après chaque réponse (7-11), appel à `POST /api/quiz/refine` pour mettre à jour le vecteur de style (non-bloquant).
- [ ] Gestion des "race conditions" si le prefetch n'est pas terminé quand l'utilisateur veut commencer la Phase 2.

### 2. Profil Final
- [ ] Après la 11ème réponse, appel à `POST /api/quiz/profile`.
- [ ] Récupération et stockage des données `label_final` et `definition_longue`.
- [ ] Mise à jour de l'indicateur de progression "Précision" (de 50% à 100%).

## Plan d'Action (Tâches)

- [ ] Implémenter le prefetching de la Phase 2 dans `QuizEngine`.
- [ ] Ajouter la logique d'appel asynchrone pour `/refine` (Fire & Forget).
- [ ] Intégrer l'appel final à `/profile` après la question 11.
- [ ] Gérer l'état de chargement spécifique pour la génération du profil final.
- [ ] Mettre à jour les tests unitaires du reducer pour couvrir ces nouvelles transitions.
