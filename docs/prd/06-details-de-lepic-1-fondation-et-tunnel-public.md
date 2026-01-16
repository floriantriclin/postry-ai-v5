# 06. Détails de l'Epic 1 : Fondation & Tunnel Public (Optimisé INVEST)

### Story 1.1 : Initialisation Socle Technique & Déploiement

**En tant que** Développeur,

**Je veux** déployer une application "Hello World" Next.js 16 sur Vercel avec le setup TypeScript/Tailwind,

**Afin de** valider la chaîne de CI/CD et l'accessibilité publique dès le début.

**Type** : Tech Enabler (Nécessaire pour toute valeur future)

**INVEST Check** :

- **I** : Indépendant de tout fonctionnel.
- **S** : Très petit (Setup + Push).
- **V** : Valeur immédiate (Environnement de prod prêt).
    
    **Critères d'Acceptation** :
    
1. Repo initialisé et accessible.
2. Déploiement Vercel actif sur URL publique.
3. La page d'accueil affiche un titre statique stylisé avec Tailwind.

### Story 1.2 : Landing Page Statique & Navigation

**En tant que** Visiteur,

**Je veux** voir la proposition de valeur et cliquer sur "Démarrer" pour accéder à l'écran de Quiz (vide pour l'instant),

**Afin de** comprendre ce que propose le site et initier le parcours.

**Type** : Feature

**INVEST Check** :

- **I** : Ne dépend pas du backend ou du moteur de quiz.
- **S** : Focus uniquement sur la Home et le routing.
    
    **Critères d'Acceptation** :
    
1. UI Landing Page implémentée (Mobile First).
2. Composant de sélection de thème (Input simple).
3. Clic sur "Démarrer" redirige vers /quiz avec le thème en URL query param.

### Story 1.3 : Moteur de Quiz avec Données Mockées (Frontend Only)

**En tant que** Visiteur,

**Je veux** parcourir les questions du quiz et voir ma progression, même si les questions sont statiques pour l'instant,

**Afin de** valider l'expérience utilisateur et la fluidité de l'interface.

**Type** : Feature

**INVEST Check** :

- **I** : Indépendant du Backend LLM (utilise un fichier JSON mocké).
- **V** : Permet de valider l'UX/UI sans attendre l'API.
    
    **Critères d'Acceptation** :
    
1. Le Quiz charge un set de questions depuis un fichier local.
2. Transition fluide entre les questions.
3. Barre de progression fonctionnelle.
4. À la fin, affiche un écran "En attente de résultat".

### Story 1.4 : API de Génération de Questions (Backend Only)

**En tant que** Développeur (via Postman/Curl),

**Je veux** appeler l'API /api/quiz/generate avec un thème et recevoir un JSON de questions générées par Gemini,

**Afin de** valider la logique de prompt et la structure de données avant l'intégration.

**Type** : Backend API

**INVEST Check** :

- **I** : Indépendant de l'interface utilisateur.
- **V** : Valide la "brique intelligente" du système.
    
    **Critères d'Acceptation** :
    
1. Endpoint API fonctionnel et sécurisé.
2. Prompt Système Gemini implémenté pour générer 6+5 questions.
3. Retourne un JSON valide respectant le schéma attendu par le front.
4. Temps de réponse acceptable (<5s).

### Story 1.5 : Intégration Quiz Dynamique

**En tant que** Visiteur,

**Je veux** que le Quiz affiche désormais les vraies questions générées par l'IA selon mon thème,

**Afin de** vivre l'expérience personnalisée réelle.

**Type** : Integration

**INVEST Check** :

- **I** : Dépend de 1.3 et 1.4, mais livre la valeur combinée.
- **S** : Focus uniquement sur le branchement (Fetch API & State).
    
    **Critères d'Acceptation** :
    
1. Le Frontend appelle l'API 1.4 au lieu du fichier Mock.
2. Gestion des états de chargement (Skeletons/Spinners) pendant la génération.
3. Gestion des erreurs (ex: fallback sur questions statiques si API down).

### Story 1.6 : Saisie du Sujet & Génération de Post Flouté

**En tant que** Visiteur ayant terminé le Quiz,

**Je veux** préciser le sujet ou l'idée clé de mon premier post avant de lancer la génération,

**Afin de** voir un résultat concret sur un sujet qui m'intéresse vraiment, même s'il est flouté.

**Type** : Feature UI + Backend

**INVEST Check** :

- **I** : Indépendant de l'Auth (toujours en mode anonyme).
- **S** : Combine l'input utilisateur et l'appel de génération.
- **V** : Augmente la pertinence du "Teaser" (c'est *mon* sujet, écrit avec *mon* style).
    
    **Critères d'Acceptation** :
    
1. À la fin du quiz, affichage d'un écran intermédiaire "De quoi voulez-vous parler ?".
2. Champ de saisie texte (ex: "L'importance de l'échec", "Mon nouveau job").
3. Bouton "Générer ma signature" qui déclenche l'appel API /api/post/generate avec : le profil quiz + le sujet saisi.
4. Affichage du résultat avec classe CSS blur-sm et overlay "Révéler".
