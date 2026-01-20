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

### 1. Orchestration & Performance
- **AC 1.1 : Pré-chargement Efficace**
  - **Quand** l'interstitiel de la phase 1 est affiché,
  - **Alors** un appel `POST /api/quiz/generate?phase=2` est lancé en arrière-plan pour préparer les questions 7 à 11.
- **AC 1.2 : Raffinement Asynchrone**
  - **Quand** l'utilisateur soumet une réponse (de 7 à 11),
  - **Alors** un appel `POST /api/quiz/refine` est envoyé de manière asynchrone (non-bloquante) pour mettre à jour le profil.
  - **Et** l'interface utilisateur passe immédiatement à la question suivante sans attendre la réponse du serveur.
- **AC 1.3 : Gestion de la Latence du Pré-chargement**
  - **Quand** l'utilisateur clique pour commencer la phase 2 mais que le pré-chargement n'est pas terminé,
  - **Alors** un indicateur de chargement est affiché jusqu'à ce que les données soient disponibles.

### 2. Génération du Profil Augmenté
- **AC 2.1 : Déclenchement du Calcul Final**
  - **Quand** la 11ème et dernière réponse est soumise,
  - **Alors** l'appel à `/refine` est suivi immédiatement d'un appel `POST /api/quiz/profile`.
- **AC 2.2 : Affichage du Résultat Final**
  - **Quand** l'appel à `/profile` réussit,
  - **Alors** les données `label_final` et `definition_longue` sont récupérées et stockées dans l'état du client.
  - **Et** l'indicateur de progression "Précision" passe de 50% à 100%.
- **AC 2.3 : Gestion de l'Attente du Profil**
  - **Quand** l'appel `/profile` est en cours,
  - **Alors** un état de chargement spécifique est affiché à l'utilisateur, indiquant la génération de son profil personnalisé.

## Plan d'Action (Tâches Techniques)

- **Frontend :**
  - [ ] Implémenter la logique de pré-chargement pour la phase 2 dans le `QuizEngine`.
  - [ ] Mettre en place la mécanique "fire-and-forget" pour les appels à `/refine`.
  - [ ] Intégrer l'appel final à `/profile` et gérer l'état de chargement associé.
  - [ ] Assurer la mise à jour de la barre de progression "Précision".
- **Backend :**
  - [ ] (Story 1.8.1) S'assurer que les endpoints `/refine` et `/profile` sont prêts et performants.
- **Tests :**
  - [ ] Mettre à jour les tests d'intégration pour simuler et valider le flux complet (prefetch, refine, profile).
  - [ ] Ajouter des tests unitaires pour la gestion des états de chargement (attente phase 2, attente profil final).

## Assurance Qualité

- **Analyse des Risques :** [Analyse des Risques pour la Story 1.8.2](docs/qa/assessments/1.8.2-risk-20260120.md)
- **Plan de Test :** [Plan de Test pour la Story 1.8.2](docs/qa/assessments/1.8.2-test-plan-20260120.md)
