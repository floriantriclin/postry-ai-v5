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
- **Negotiable:** L'implémentation du calcul vectoriel (client vs serveur) est flexible.
- **Valuable:** Délivre la précision finale promise par le protocole ICE.
- **Estimable:** Complexité réduite par le calcul local et le prefetching.
- **Small:** Un seul sprint pour boucler la logique métier.
- **Testable:** Validé par des tests d'intégration et unitaires.

## Contexte Technique

Cette story complète le flux ICE en intégrant la Phase 2 (questions 7 à 11) et la génération du profil augmenté final. L'architecture a été simplifiée pour utiliser un calcul vectoriel côté client (partage de logique via `lib/ice-logic`), éliminant les latences réseau et les risques de concurrence tout en garantissant la stricte conformité avec le Protocole ICE (Section 3.2).

## Critères d'Acceptation

### 1. Orchestration & Performance
- **AC 1.1 : Pré-chargement Efficace & Sélection des Cibles**
  - **Quand** l'interstitiel de la phase 1 est affiché (Archétype identifié),
  - **Alors** le client détermine les 5 dimensions cibles via `getTargetDimensions` (lib/ice-logic).
  - **Et** un appel `POST /api/quiz/generate` est lancé avec le payload complet (Archetype, Vecteur V6, Target Dimensions) pour préparer les questions 7 à 11.
- **AC 1.2 : Raffinement Local (Client-Side)**
  - **Quand** l'utilisateur soumet une réponse (de 7 à 11),
  - **Alors** le vecteur de style est mis à jour localement via `updateVector` (lib/ice-logic), appliquant la formule `Vnew = Vold + (Cible - Vold) * 0.3`.
  - **Et** l'interface utilisateur passe immédiatement à la question suivante (zéro latence réseau).
- **AC 1.3 : Gestion de la Latence du Pré-chargement**
  - **Quand** l'utilisateur clique pour commencer la phase 2 mais que le pré-chargement n'est pas terminé,
  - **Alors** un indicateur de chargement est affiché jusqu'à ce que les données soient disponibles.

### 2. Génération du Profil Augmenté
- **AC 2.1 : Déclenchement du Calcul Final**
  - **Quand** la 11ème et dernière réponse est soumise,
  - **Alors** un appel unique `POST /api/quiz/profile` est envoyé avec le vecteur final complet (V11) et l'archétype de base.
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
  - [ ] Intégrer la logique de mise à jour vectorielle (`updateVector` depuis `lib/ice-logic`) directement dans le `QuizEngine`.
  - [ ] Intégrer l'appel final à `/profile` avec le vecteur calculé (V11) et gérer l'état de chargement associé.
  - [ ] Assurer la mise à jour de la barre de progression "Précision" (50% -> 100%).
- **Backend :**
  - [ ] (Story 1.8.1) S'assurer que l'endpoint `/profile` est prêt. (L'endpoint `/refine` devient obsolète ou purement utilitaire).
- **Tests :**
  - [ ] Mettre à jour les tests d'intégration pour simuler le flux complet (prefetch, profile).
  - [ ] Ajouter des tests unitaires pour la gestion des états de chargement (attente phase 2, attente profil final).

## Assurance Qualité

- **Analyse des Risques :** [Analyse des Risques pour la Story 1.8.2](docs/qa/assessments/1.8.2-risk-20260120.md)
- **Plan de Test :** [Plan de Test pour la Story 1.8.2](docs/qa/assessments/1.8.2-test-plan-20260120.md)

## Analyse de Compatibilité & Validation

- **Conformité ICE Protocol :** L'utilisation de `lib/ice-logic` garantit que l'algorithme client respecte strictement la Section 3.2 (Formule d'affinage) et Section 3.1 (Sélection des dimensions).
- **Cohérence Epic 1 :** Cette story absorbe la complexité logique initialement prévue dans la Story 1.6 (devenue une story de "Librairie Partagée"), optimisant ainsi la fluidité du tunnel d'acquisition.
