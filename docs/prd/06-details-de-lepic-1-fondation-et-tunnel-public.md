# 06. Détails de l'Epic 1 : Fondation & Tunnel Public (Acquisition)

### Story 1.1 : Initialisation Socle Technique & Déploiement
**En tant que** Développeur,
**Je veux** déployer une application "Hello World" Next.js 16 sur Vercel avec le setup TypeScript/Tailwind,
**Afin de** valider la chaîne de CI/CD et l'accessibilité publique dès le début.

**Critères d'Acceptation** :
1. Repo initialisé et accessible.
2. Déploiement Vercel actif sur URL publique.
3. La page d'accueil affiche un titre statique stylisé avec Tailwind.

### Story 1.2 : Landing Page Statique & Navigation
**En tant que** Visiteur,
**Je veux** voir la proposition de valeur et cliquer sur "Démarrer" pour accéder à l'écran de Quiz,
**Afin de** comprendre ce que propose le site et initier le parcours.

**Critères d'Acceptation** :
1. UI Landing Page implémentée (Mobile First).
2. Composant de sélection de thème (Input simple).
3. Clic sur "Démarrer" redirige vers /quiz avec le thème en URL query param.

### Story 1.3 : Fondation de l'UI du Quiz (Statique)
**En tant que** Visiteur,
**Je veux** parcourir les questions du quiz et voir ma progression avec des données mockées,
**Afin de** valider l'expérience utilisateur et la fluidité de l'interface.

**Critères d'Acceptation** :
1. Le Quiz charge un set de questions depuis un fichier local.
2. Transition fluide entre les questions.
3. Barre de progression fonctionnelle.

### Story 1.4 : Logique socle du Protocole ICE (Backend)
**En tant que** Développeur,
**Je veux** une bibliothèque de fonctions pures implémentant le protocole ICE (Calcul d'archétype, mise à jour de vecteur, etc.),
**Afin de** garantir une logique métier déterministe et testable.

**Critères d'Acceptation** :
1. Fonctions `getClosestArchetype`, `updateVector` et `getTargetDimensions` implémentées.
2. Couverture de tests unitaires à 100% sur cette logique.

### Story 1.5 : API de Génération de Questions ICE
**En tant que** Système,
**Je veux** appeler Gemini pour générer des questions basées sur le thème de l'utilisateur,
**Afin de** personnaliser le contenu du quiz dynamiquement.

**Critères d'Acceptation** :
1. Endpoint `POST /api/quiz/generate` fonctionnel.
2. Gestion des phases 1 (polarisation) et 2 (affinage).
3. Robustesse aux erreurs du LLM (retries, validation Zod).

### Story 1.6 : API de Calcul d'Archétype et d'Affinage
**En tant que** Système,
**Je veux** des endpoints pour traiter les réponses de l'utilisateur en temps réel,
**Afin de** piloter l'évolution du profil de l'utilisateur durant le quiz.

**Critères d'Acceptation** :
1. Endpoints `POST /api/quiz/archetype` et `POST /api/quiz/refine` fonctionnels.
2. Validation rigoureuse des entrées/sorties.

### Story 1.7 : API de Synthèse du Profil Augmenté
**En tant que** Visiteur,
**Je veux** recevoir une description textuelle riche de mon profil à la fin du quiz,
**Afin de** comprendre ma valeur ajoutée rédactionnelle.

**Critères d'Acceptation** :
1. Endpoint `POST /api/quiz/profile` fonctionnel.
2. Génération de `label_final` et `definition_longue` via Gemini.

### Story 1.8 : Intégration Complète du Quiz Dynamique
**En tant que** Visiteur,
**Je veux** vivre l'expérience complète et dynamique du quiz sans interruption,
**Afin de** découvrir mon identité rédactionnelle réelle.

**Critères d'Acceptation** :
1. Orchestration complète des appels API 1.5 à 1.7.
2. Gestion des états de chargement et fallbacks.
3. Expérience fluide de bout en bout.
