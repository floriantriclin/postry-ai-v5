---
title: Product Requirements Document - postry.ai
version: 4.0
date: 2026-01-27
status: Complete
confidentiality: Internal / Strict
---

# Product Requirements Document (PRD)
## postry.ai - Plateforme IA-Miroir pour LinkedIn

**Version** : 4.0  
**Date** : 27/01/2026  
**Confidentialité** : Interne / Strict  
**Objet** : Document des Exigences Produit Complet

---

## Table des Matières

1. [Objectifs et Contexte](#01-objectifs-et-contexte)
2. [Exigences](#02-exigences)
3. [Objectifs de Design de l'Interface Utilisateur](#03-objectifs-de-design-de-linterface-utilisateur)
4. [Hypothèses Techniques](#04-hypotheses-techniques)
5. [Liste des Epics](#05-liste-des-epics)
6. [Détails de l'Epic 1 : Fondation & Tunnel Public](#06-détails-de-lepic-1--fondation--tunnel-public)
7. [Détails de l'Epic 2 : Conversion & Identité](#07-détails-de-lepic-2--conversion--identité)
8. [Détails de l'Epic 3 : Dashboard & Personnalisation](#08-détails-de-lepic-3--dashboard--personnalisation)
9. [Détails de l'Epic 4 : Intelligence d'Expertise](#09-détails-de-lepic-4--intelligence-dexpertise)
10. [Definition of Done](#10-definition-of-done)
11. [Testing Strategy](#11-testing-strategy)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Analytics & KPIs](#13-analytics--kpis)
14. [Security & Compliance](#14-security--compliance)
15. [Deployment & Rollout](#15-deployment--rollout)

---



---

# 01 OBJECTIFS ET CONTEXTE

# 01. Objectifs et Contexte

### Objectifs

- **Acquisition** : Atteindre un Taux de Complétion du Quiz > 65% et un Taux de Révélation ("Reveal Rate") > 30% (Conversion du Lead Magnet).
- **Engagement** : Inciter > 40% des utilisateurs à uploader un CV (Ancre de Valeur) et > 50% à utiliser l'Equalizer de Style.
- **Monétisation** : Convertir > 5% des utilisateurs atteignant la limite des 5 posts ("Paywall Hit") en abonnés Premium.
- **Différenciation** : Établir la "Rugosité" et l'"IA-Miroir" comme proposition de valeur principale, en opposition à la "lisseur" des outils d'IA génériques.
- **Simplicité** : Délivrer un tunnel "Product-Led Growth" où la valeur est prouvée *avant* la création de compte ou le paiement.

### Contexte (Background)

**postry.ai** s'attaque au "Déficit de Fidélité Textuelle" sur LinkedIn. Les outils d'IA actuels produisent un contenu générique et "lisse" qui échoue à capturer le style unique d'un individu ou sa réalité professionnelle spécifique. Cela crée une déconnexion entre l'identité réelle de l'utilisateur et sa persona numérique.

La solution est une plateforme **"IA-Miroir"**. Au lieu d'inventer une voix, elle cartographie l'"Archétype" de l'utilisateur via un quiz psychologique et ancre le contenu dans son expérience réelle (via analyse CV). Le MVP se concentre sur un tunnel de "Preuve Floutée" (Blurred Proof) : les utilisateurs génèrent un post gratuitement, voient un aperçu flouté pour valider que la structure et le style correspondent à leur intention, et échangent leur email pour révéler le texte. Ce modèle "Essayer avant d'acheter/s'inscrire" réduit la friction et prouve la valeur immédiatement.

### 1.3 Journal des Modifications (Change Log)

| **Date** | **Version** | **Description** | **Auteur** |
| --- | --- | --- | --- |
| 08/01/2026 | v1.0 | Création initiale | John (PM) |
| 10/01/2026 | v1.1 | Pivot vers la stratégie "Zéro Friction" et intégration des métriques de fidélité. | John (PM) |
| **13/01/2026** | **v2.0** | **Mise à jour majeure (Alignement Brief v5.1)** : Intégration des protocoles ICE (9 dimensions), RME (Ontologie) et ALE (Nudge). Pivot "Rugosité". | **John (PM)** |
| 14/01/2026 | v2.1 | **Création du workspace `packages/shared-types`** | FTR |
| 14/01/2026 | v2.2 | Ajout de la story 1.6 pour sécuriser la fondation de données | FTR |
| 14/01/2026 | v2.3 | **Story 3.0 : Spike Technique - Moteur Radar (POC)** | FTR |
| 15/01/2026 | v3.0 | Refonte complète / simplification | FTR |
| **27/01/2026** | **v4.0** | **Enrichissement opérationnel majeur** : Ajout de 6 nouvelles sections (DoD, Testing Strategy, Error Handling, Analytics & KPIs, Security & Compliance, Deployment & Rollout). Structure shardée optimisée + script de génération document complet. | **Bob (Scrum Master)** |


---

# 02 EXIGENCES

# 02. Exigences

### Exigences Fonctionnelles (FR)

- **FR1 (Moteur de Quiz)** : Le système doit présenter un parcours de découverte composé de questions de "Mapping" et d'"Affinement", générées dynamiquement par un LLM pour cerner l'archétype de l'utilisateur.
- **FR2 (Génération et Aperçu Flouté)** : À partir du thème saisi par l'utilisateur et de ses réponses, le système génère un post. Pour les visiteurs non connectés, ce résultat s'affiche immédiatement dans un état "Flouté" (structure visible mais texte illisible) afin de susciter l'intérêt.
- **FR3 (Gate de Conversion)** : Le système doit exiger la saisie d'un email valide (vérifié via OTP ou Magic Link) pour "déflouter" le contenu, révéler le texte final et créer le compte utilisateur.
- **FR4 (Equalizer de Style)** : Le Dashboard met à disposition des curseurs de réglage (ex : Ton, Longueur, Densité). Une fois les ajustements souhaités effectués, le système permet de régénérer le post pour refléter ces nouvelles nuances.
- **FR5 (Ancre CV / RAG)** : Le système doit permettre aux utilisateurs connectés d'uploader un CV (PDF/TXT). Le moteur analyse ce document pour extraire les expériences clés et injecter les faits pertinents dans la génération (RAG léger).
- **FR6 (Système de Crédits)** : Le système gère un compteur visible appliquant une limite stricte de 5 générations gratuites, bloquant toute création supplémentaire au-delà (Hard Paywall).
- **FR7 (Paiement)** : Une intégration Stripe Checkout permet la souscription à l'offre Premium pour débloquer l'usage illimité.

### Exigences Non-Fonctionnelles (NFR)

- **NFR1 (Performance)** : Le chargement des étapes du quiz doit s'effectuer en moins de 10 secondes. La génération complète d'un post doit s'exécuter en moins de 15 secondes pour garantir une expérience fluide.
- **NFR2 (Sécurité des Données)** : Les CV, accessibles uniquement aux utilisateurs identifiés, sont des données sensibles et doivent être chiffrés au repos.
- **NFR3 (Gestion de Session)** : Les données de session des visiteurs anonymes (réponses au quiz, thème) doivent être purgées automatiquement après 24h d'inactivité.
- **NFR4 (Expérience Mobile)** : L'ensemble du parcours utilisateur (du Quiz au Dashboard) doit être conçu en priorité pour mobile ("Mobile First").
- **NFR5 (Architecture Stateless)** : L'orchestration LLM privilégie une approche "Stateless" pour supporter la charge sans nécessiter de fine-tuning par utilisateur.

### Exigences de Compatibilité (CR)

- **CR1** : Le format de sortie du texte doit respecter strictement les contraintes de mise en forme LinkedIn (sauts de ligne, listes, caractères spéciaux).


---

# 03 OBJECTIFS DE DESIGN DE LINTERFACE UTILISATEUR

# 03. Objectifs de Design de l'Interface Utilisateur

### Vision UX Globale

L'expérience doit être celle d'une **"Découverte Ludique"** plutôt que celle d'un outil de productivité complexe. L'interface masque la complexité de l'IA derrière des interactions simples et fluides. Le maître-mot est la **"Révélation"** : faire progresser l'utilisateur d'un état de curiosité (Quiz) à un état de satisfaction (Révélation du post), avec une transition visuelle marquante ("Wow effect") lors du défloutage.

### Paradigmes d'Interaction Clés

- **Navigation Linéaire (Tunnel)** : Pour la phase d'acquisition, pas de menu complexe, l'utilisateur est guidé étape par étape.
- **Retour Haptique/Visuel** : Les curseurs de l'"Equalizer" doivent offrir une sensation de contrôle direct et physique sur le texte.
- **Feedback Immédiat** : Le flou du "Blurred Proof" doit laisser deviner la structure (paragraphes, listes) pour prouver que le travail est fait, sans donner la valeur textuelle.

### Écrans et Vues Cœurs

1. **Landing "Suspense"** : Minimaliste, centrée sur le sélecteur de thème pour lancer le quiz immédiatement.
2. **Interface de Quiz** : Questions une par une, avec barre de progression gamifiée.
3. **Vue "Blurred Preview"** : Le post généré mais flouté, avec le formulaire de capture email en superposition (overlay) ou en dessous.
4. **Dashboard Utilisateur** : Vue claire du post final (déflouté), zone de "Dropzone" pour le CV, et panneau latéral ou inférieur pour l'"Equalizer".
5. **Paywall "Choc"** : Une modal bloquante mais élégante qui apparaît à la 6ème tentative.

### Accessibilité

- **Niveau** : WCAG AA (Standard pour assurer la lisibilité et le contraste, notamment sur mobile).

### Branding

- **Style** : "Tech & Brut". Une esthétique qui reflète la promesse de "Rugosité". Typographie forte, contrastes élevés (Noir/Blanc/Accent), évitant le style "Corporate Blue" trop lisse de LinkedIn. Usage possible de textures légères (papier, grain) pour évoquer l'écriture humaine.

### Appareils et Plateformes Cibles

- **Priorité** : **Mobile First** (Web Responsive). La majorité des utilisateurs découvriront l'outil via un lien sur mobile. L'interface desktop est une adaptation de la version mobile, pas l'inverse.


---

# 04 HYPOTHESES TECHNIQUES

# 04. Hypothèses Techniques

### Structure du Repository

- **Monorepo** : Recommandé pour maintenir la cohérence entre le Frontend (Next.js) et les fonctions Backend/API dans un seul dépôt, facilitant le déploiement et le partage de types.

### Architecture de Service

- **Full-Stack Serverless** : Architecture basée sur **Next.js** (hébergé sur Vercel).
    - **Frontend** : React/Next.js pour l'expérience SPA fluide et le rendu hybride.
    - **Backend** : API Routes (Next.js) ou Serverless Functions pour l'orchestration des appels LLM et la gestion métier.
    - **Base de Données** : PostgreSQL (Supabase) pour les profils utilisateurs et l'historique, plus adapté aux données relationnelles que du NoSQL ici.
    - **LLM** : Orchestration "Stateless" via API (Gemini) avec gestion dynamique des prompts systèmes.

### Exigences de Test

- **Unit + Integration** :
    - Tests Unitaires pour la logique métier critique (calcul des crédits, parsing CV).
    - Tests d'Intégration pour le flux critique (Quiz -> Génération -> Auth).
    - Pas de tests E2E lourds pour le MVP pour garder de la vélocité.

### Hypothèses et Requêtes Techniques Supplémentaires

- **Framework Web** : Next.js (16.x).
- **Langage** : TypeScript (Strict mode) pour la robustesse.
- **Styling** : Tailwind CSS pour la rapidité de développement et la cohérence du design system.
- **Auth** : Authentification sans mot de passe ("Magic Link" / OTP) obligatoire pour réduire la friction.
- **Stockage Fichiers** : Stockage objet (Supabase Storage) sécurisé pour les CVs, avec politiques d'expiration automatique pour les fichiers temporaires si nécessaire.
- **Orchestration LLM** : Utilisation de modèles performants et rapides (ex: Gemini 2.5 flash ou Claude 3 Haiku) pour garantir les temps de réponse <15s tout en maîtrisant les coûts.
- **Paiement** : Stripe Checkout en mode hébergé pour minimiser le code de gestion des paiements et assurer la conformité PCI.


---

# 05 LISTE DES EPICS

# 05. Liste des Epics

1. **Epic 1 : Fondation & Tunnel Public (Acquisition)**
    
    *Objectif : Mettre en place l'infrastructure Next.js/Supabase, déployer la Landing Page, et implémenter le moteur de Quiz public avec génération "Floutée" (sans Auth).*
    
    *Valeur : Permet de tester immédiatement l'intérêt (Lead Magnet) et la performance du LLM sans barrière à l'entrée.*
    
    *   [Epic 1 : Fondation & Tunnel Public (Acquisition)](./06-details-de-lepic-1-fondation-et-tunnel-public.md)
    
2. **Epic 2 : Conversion & Identité (Révélation)**
    
    *Objectif : Implémenter le système d'authentification "Magic Link", la création de compte, et la mécanique de "Révélation" (défloutage) du post.*
    
    *Valeur : Transforme les visiteurs curieux en utilisateurs inscrits (Lead Capture) et livre la promesse de valeur.*
    
    *   [Epic 2 : Conversion & Identité (Révélation)](./07-details-de-lepic-2-conversion-et-identite.md)
    
3. **Epic 3 : Dashboard & Personnalisation (Engagement)**
    
    *Objectif : Développer le Dashboard utilisateur, l'Equalizer de Style (régénération) et l'historique des posts.*
    
    *Valeur : Fidélise l'utilisateur en lui donnant le contrôle sur sa "Rugosité" et transforme l'outil en un assistant récurrent.*
    
    *   [Epic 3 : Dashboard & Personnalisation (Engagement)](./08-details-de-lepic-3-dashboard-et-personnalisation.md)
    
4. **Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)**
    
    *Objectif : Intégrer l'upload et le parsing de CV (RAG), l'injection de faits dans la génération, et le système de quota/Paiement Stripe.*
    
    *Valeur : Délivre la différenciation majeure (Expertise réelle) et active le modèle économique.*
    
    *   [Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)](./09-details-de-lepic-4-intelligence-dexpertise.md)


---

# 06 DETAILS DE LEPIC 1 FONDATION ET TUNNEL PUBLIC

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

### Story 1.9 : API de Génération du Post Initial (Pivot)
**En tant que** Visiteur ayant découvert son profil augmenté,
**Je veux** générer un premier post LinkedIn concret sur un sujet de mon choix en utilisant mon style unique (ICE),
**Afin de** valider immédiatement la promesse de valeur (créer du contenu qui me ressemble) avant de m'inscrire.

**Critères d'Acceptation** :
1. Endpoint `POST /api/quiz/post` fonctionnel et sécurisé.
2. Génération de texte (Hook, Body, CTA) basée sur le vecteur ICE.
3. Analyse et feedback du style appliqué.


---

# 07 DETAILS DE LEPIC 2 CONVERSION ET IDENTITE

# 07. Détails de l'Epic 2 : Conversion & Identité (Optimisé INVEST)

**Objectif de l'Epic** : Implémenter l'authentification "Magic Link", la création de compte et la "Révélation" du post, transformant l'intérêt en acquisition.

### Story 2.1 : Configuration Base de Données & Schéma Utilisateur

**En tant que** Développeur,

**Je veux** configurer Supabase et définir le schéma de données users et posts,

**Afin de** pouvoir persister les comptes et sauvegarder le contenu généré.

**Type** : Tech Enabler / Backend

**INVEST Check** :

- **I** : Indépendant du frontend.
- **S** : Focus sur la structure de données.
- **V** : Fondation nécessaire pour la rétention.
    
    **Critères d'Acceptation** :
    
1. Projet Supabase configuré (Dev/Prod).
2. Table users créée (email, id, credits_count, created_at).
3. Table posts créée (user_id, content, theme, answers_json, is_revealed, profile_context).
4. Politiques RLS (Row Level Security) appliquées : un user ne voit que ses posts.

### Story 2.2 : Authentification par Magic Link (Backend & SDK)

**En tant que** Développeur,

**Je veux** implémenter la logique d'envoi et de vérification de Magic Link via Supabase Auth,

**Afin de** permettre une connexion sécurisée sans mot de passe.

**Type** : Backend / Logic

**INVEST Check** :

- **I** : Indépendant de l'UI de la modal.
- **V** : Cœur de la sécurité.
    
    **Critères d'Acceptation** :
    
1. Configuration du provider Email (Magic Link) dans Supabase.
2. Fonction utilitaire front signInWithOtp(email) implémentée.
3. Redirection correcte après clic sur le lien email (gestion du callback URL).

### Story 2.3 : Modal de Capture & Déclenchement Auth

**En tant que** Visiteur face à son post flouté,

**Je veux** saisir mon email dans une modal pour débloquer le contenu,

**Afin de** recevoir mon lien de connexion.

**Type** : Feature UI

**INVEST Check** :

- **I** : Peut être testé avec un mock d'auth.
- **S** : Focus sur l'interaction utilisateur.
    
    **Critères d'Acceptation** :
    
1. Clic sur "Révéler" ouvre une modal ou un formulaire inline.
2. Validation du format de l'email.
3. Feedback visuel après soumission ("Lien envoyé, vérifiez votre boîte mail").
4. État d'attente ("Polling" ou attente de redirection).

### Story 2.4 : Flux de Révélation & Persistance Post-Inscription

**En tant que** Nouvel Utilisateur (venant de cliquer sur le Magic Link),

**Je veux** être redirigé vers mon post désormais déflouté et sauvegardé,

**Afin de** consommer la valeur promise.

**Type** : Integration / UX

**INVEST Check** :

- **I** : Connecte l'Auth (2.2) et la Base de données (2.1).
- **V** : Moment de vérité (Aha Moment).
    
    **Critères d'Acceptation** :
    
1. Au retour de l'auth, le système détecte le contexte du post temporaire (via localStorage ou paramètre).
2. Création automatique du compte user en base.
3. Sauvegarde du post généré dans la table posts lié à ce user.
4. Affichage de la vue "Dashboard" avec le post en clair (sans flou).

### Story 2.5 : Vue "Post Révélé" (Composant d'Affichage)

**En tant que** Utilisateur Connecté venant d'être redirigé,

**Je veux** voir mon post affiché clairement (sans flou) au centre de l'écran,

**Afin de** pouvoir enfin lire le résultat de ma génération.

**Type** : Feature UI

**INVEST Check** :

- **I** : Indépendant du Layout global complexe.
- **S** : Focus uniquement sur le composant "Card" du post (Typo, spacing).
- **V** : Boucle le flux de révélation immédiatement.
    
    **Critères d'Acceptation** :
    
1. Route /dashboard accessible uniquement aux connectés.
2. Affiche le post courant dans un conteneur simple centré.
3. Le texte est lisible, formatté (sauts de ligne respectés) et copiable.
4. (Pas de sidebar ni de menus complexes à ce stade, juste le contenu et un header minimal "Déconnexion").

### Story 2.6 : Stabilisation, Refactoring & Fiabilisation

**En tant que** Développeur et Product Owner,

**Je veux** stabiliser le flux de conversion, garantir la persistance des données et fiabiliser les tests,

**Afin de** construire une base solide pour le Dashboard et éviter la perte de données utilisateur.

**Type** : Refactoring / Stability / Security

**INVEST Check** :

- **I** : Indépendant des nouvelles features.
- **V** : Garantit la qualité et la fiabilité du flux existant.
- **Référence** : [`../../implementation-artifacts/story-2-6-stabilization-refactoring.md`](../../implementation-artifacts/story-2-6-stabilization-refactoring.md)

**Critères d'Acceptation** :

1. Persistance critique : Toutes les données du post sauvegardées en DB.
2. Cohérence post-Magic Link : Post identique avant/après auth.
3. Flux UX sécurisé : Verrouillage du retour, nettoyage localStorage.
4. Tests E2E refondus et stables (3 runs consécutifs sans flake).

### Story 2.7 : Simplification Architecture Auth & Persistance

**En tant que** Équipe Technique,

**Je veux** simplifier l'architecture d'authentification et de persistance,

**Afin de** réduire la complexité du code, améliorer la performance et éliminer les bugs.

**Type** : Refactoring / Architecture / Performance

**INVEST Check** :

- **I** : Indépendant des features utilisateur.
- **V** : ROI de 1,318% (retour en 3 semaines).
- **Référence** : [`../../implementation-artifacts/story-2-7-auth-persistence-simplification.md`](../../implementation-artifacts/story-2-7-auth-persistence-simplification.md)
- **Décision** : [`../../docs/decisions/20260126-auth-persistence-migration-decision.md`](../decisions/20260126-auth-persistence-migration-decision.md)

**Critères d'Acceptation** :

1. Réduction de 42% du code (634 → 369 lignes).
2. Réduction de 33% des API calls (3 → 2).
3. Élimination de 100% des posts orphelins.
4. Temps auth → dashboard < 2s (-60%).
5. Nouveau endpoint `persist-on-login` créé.
6. Suppression de `pre-persist` API et `/quiz/reveal` page.
7. Tests E2E adaptés et passants (3 navigateurs).

**Bénéfices Business** :

- Maintenance facilitée (-42% code)
- Performance améliorée (-33% API calls)
- Base de données plus propre (0 posts orphelins)
- UX améliorée (-60% temps de chargement)


---

# 08 DETAILS DE LEPIC 3 DASHBOARD ET PERSONNALISATION

# 08. Détails de l'Epic 3 : Dashboard & Personnalisation (Engagement)

**Objectif de l'Epic** : Fidéliser l'utilisateur en lui donnant le contrôle sur sa "Rugosité" (Equalizer) et en lui fournissant un espace de travail personnel (Dashboard).

### Notes d'Amélioration (Feedback PO - 2026-01-24)
- **Point d'entrée "Connexion"** : Il est impératif d'ajouter un bouton ou un lien "Connexion" (Sign In) visible sur la page d'accueil (`LandingClient`) pour permettre aux utilisateurs existants d'accéder directement à leur Dashboard (via Magic Link) sans avoir à refaire le Quiz. À traiter en priorité avec la Story 3.1 ou comme une tâche annexe.

### Story 3.1 : Shell Applicatif & Layout Dashboard

**En tant que** Utilisateur régulier,

**Je veux** naviguer dans une interface structurée qui organise mon espace de travail (Zone principale + Outils),

**Afin de** accéder facilement à toutes les fonctionnalités futures (Historique, Equalizer).

**Type** : UI Architecture

**INVEST Check** :

- **I** : Vient *wrapper* (englober) le composant créé en 2.5.
- **S** : Focus sur la structure CSS/Grid responsive.
- **V** : Prépare l'ergonomie pour les outils avancés.
    
    **Critères d'Acceptation** :
    
1. Mise en place du Layout global : Header, Sidebar (collapsible sur mobile), Main Content.
2. Intégration du composant "Vue Post" (de la story 2.5) dans la zone "Main Content".
3. Le Layout est responsive (Mobile: Menu burger ou Tabs inférieurs / Desktop: Sidebar latérale).
4. Zone placeholder vide pour les futurs outils (Equalizer, Historique).

---

### Story 3.2 : Implémentation de l'Equalizer de Style (UI)

**En tant que** Utilisateur,

**Je veux** manipuler des curseurs visuels (Ton, Longueur, Densité) pour ajuster mes préférences,

**Afin de** contrôler la nuance de mon contenu.

**Type** : UI Component

**INVEST Check** :

- **I** : Indépendant de l'API de régénération (peut juste logger les valeurs).
- **S** : Focus sur le composant React (Sliders).
    
    **Critères d'Acceptation** :
    
1. Composant "Equalizer" avec 3-4 sliders nommés (ex: "Ton: Doux <-> Rugueux", "Longueur: Court <-> Long").
2. Les valeurs sont capturées dans le state local.
3. Feedback visuel lors du changement de valeur.

### Story 3.3 : Régénération de Post via Equalizer (Logique)

**En tant que** Utilisateur,

**Je veux** que mon post se réécrive lorsque je valide mes réglages d'Equalizer,

**Afin de** voir l'impact de mes ajustements sur le style.

**Type** : Feature / AI

**INVEST Check** :

- **I** : Connecte l'UI 3.2 au Backend LLM.
- **V** : Apporte la valeur de personnalisation.
    
    **Critères d'Acceptation** :
    
1. Bouton "Appliquer / Régénérer" (ou debounce sur les sliders).
2. Appel API /api/post/regenerate avec : ID du post + nouvelles valeurs Equalizer.
3. Le LLM génère une nouvelle version en prenant en compte les "System Instructions" modifiées par les sliders.
4. Le post affiché est mis à jour et sauvegardé comme nouvelle version (ou remplace l'ancienne).
5. Les régénérations sont limités à 10 par heure et ne sont pas décomptées des crédits

### Story 3.4 : Historique des Posts (Sidebar)

**En tant que** Utilisateur,

**Je veux** voir la liste de mes générations précédentes et pouvoir cliquer pour les recharger,

**Afin de** ne pas perdre mes meilleures idées.

**Type** : Feature

**INVEST Check** :

- **I** : Indépendant de la génération.
- **S** : Lecture simple de la base de données.
    
    **Critères d'Acceptation** :
    
1. Sidebar (ou Drawer mobile) listant les titres des posts (basé sur le sujet ou les premiers mots).
2. Tri chronologique inverse (plus récent en haut).
3. Clic sur un item charge le contenu dans la zone principale.

### Story 3.5 : Création de Nouveau Post (Depuis Dashboard)

**En tant que** Utilisateur,

**Je veux** pouvoir lancer une nouvelle génération sur un nouveau sujet depuis mon Dashboard,

**Afin de** continuer à produire du contenu après mon premier essai.

**Type** : Feature

**INVEST Check** :

- **I** : Réutilise la logique de génération existante.
- **V** : Encourage la rétention.
    
    **Critères d'Acceptation** :
    
1. Bouton "Nouveau Post" visible.
2. Ouvre une modal ou zone de saisie "Sujet".
3. Déclenche la génération standard et ajoute le résultat à l'historique.
4. (Note : Le décompte des crédits sera géré dans l'Epic 4, ici c'est illimité ou mocké).


---

# 09 DETAILS DE LEPIC 4 INTELLIGENCE DEXPERTISE

# 09. Détails de l'Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

**Objectif de l'Epic** : Intégrer l'upload et le parsing de CV (RAG), l'injection de faits dans la génération pour l'ancrage d'expertise, et activer le modèle économique (Quotas/Paiement) pour la viabilité business.

### Story 4.1 : Upload & Stockage Sécurisé de CV

**En tant que** Utilisateur Connecté,

**Je veux** uploader mon CV (PDF/TXT) via une zone de dépôt,

**Afin de** fournir à l'IA le contexte de mon expérience professionnelle.

**Type** : Backend / Feature

**INVEST Check** :

- **I** : Indépendant du parsing ou de la génération.
- **S** : Focus sur l'upload fichier et sécurité.
- **V** : Première étape de la personnalisation avancée.
    
    **Critères d'Acceptation** :
    
1. Zone "Drag & Drop" dans le Dashboard.
2. Upload vers Supabase Storage dans un bucket privé (RLS activé : user only).
3. Validation du type (PDF/TXT uniquement) et de la taille (<5Mo).
4. Feedback visuel de succès/échec de l'upload.

### Story 4.2 : Parsing CV & Extraction (Service RAG)

**En tant que** Système,

**Je veux** extraire le texte brut du fichier uploadé et le structurer minimalement,

**Afin de** le rendre consommable par le LLM.

**Type** : Backend

**INVEST Check** :

- **I** : Indépendant de l'upload (déclenché par événement ou API).
- **S** : Focus sur la transformation Fichier -> Texte.
    
    **Critères d'Acceptation** :
    
1. Fonction backend (Edge Function ou API Route) qui lit le fichier.
2. Utilisation d'une librairie de parsing PDF (ex: pdf-parse) pour extraire le texte.
3. Nettoyage basique (suppression caractères spéciaux bizarres).
4. Stockage du texte extrait (ou d'un résumé structuré par LLM) dans la table users (champ profile_context).
5. (Optionnel MVP) : Pas de vectorisation complexe, on stocke le texte brut ou résumé car la fenêtre de contexte Gemini 2.5 Flash est large.

### Story 4.3 : Génération avec Ancrage Factuel (Injection)

**En tant que** Utilisateur avec un CV uploadé,

**Je veux** que mes générations utilisent automatiquement des faits de mon parcours,

**Afin de** produire du contenu qui prouve mon expertise réelle.

**Type** : AI / Feature

**INVEST Check** :

- **I** : Modifie le prompt de génération existant.
- **V** : Délivre la promesse "Ancrage Factuel".
    
    **Critères d'Acceptation** :
    
1. Mise à jour de l'API /api/post/generate et /regenerate.
2. Si profile_context existe, injection dans le System Prompt : "Utilise le contexte suivant pour ancrer le post dans la réalité de l'utilisateur : [Contexte]".
3. Le post généré cite explicitement une expérience ou compétence du CV pertinente pour le sujet.

### Story 4.4 : Compteur de Crédits & Hard Paywall (Logique)

**En tant que** Product Owner,

**Je veux** bloquer la génération si l'utilisateur a consommé ses 5 crédits gratuits,

**Afin de** forcer la conversion vers le payant.

**Type** : Business Logic

**INVEST Check** :

- **I** : Indépendant du paiement (bloque juste).
- **V** : Protège les coûts et pousse à l'achat.
    
    **Critères d'Acceptation** :
    
1. Champ credits_count décrémenté à chaque génération réussie.
2. Les "Régénérations" (Equalizer) sur un *même* post coûtent 0 crédit 
3. API Check : Si credits_count <= 0, l'API retourne une erreur 402 ou 403 "Quota Exceeded".
4. Frontend : Affiche le solde restant (ex: "2/5 posts restants").
5. Frontend : Si solde 0, bouton "Générer" désactivé et remplacé par "Passer Premium".

### Story 4.5 : Intégration Stripe Checkout (Paiement)

**En tant que** Utilisateur bloqué,

**Je veux** cliquer sur "Passer Premium", payer par carte et être débloqué instantanément,

**Afin de** continuer à utiliser l'outil.

**Type** : Integration

**INVEST Check** :

- **I** : Connecte le bouton au service de paiement.
- **V** : Génère du revenu.
    
    **Critères d'Acceptation** :
    
1. Bouton "Upgrade" redirige vers une URL Stripe Checkout (Session hébergée).
2. Webhook Stripe configuré pour écouter l'événement checkout.session.completed.
3. À réception du webhook, mise à jour du user : is_premium = true (ou credits = 9999).
4. Redirection utilisateur vers Dashboard avec message de succès et crédits débloqués.


---

# 10 DEFINITION OF DONE

# 10. Definition of Done (DoD)

## Definition of Done Globale

Chaque User Story doit satisfaire **tous** les critères suivants avant d'être considérée comme "Done" et prête pour la Production.

### 🔧 Développement

- [ ] **Code implémenté** : Toutes les fonctionnalités décrites dans les critères d'acceptation sont codées
- [ ] **Code testé localement** : Le développeur a vérifié que tout fonctionne en environnement local
- [ ] **Linter errors = 0** : Aucune erreur ESLint ou TypeScript
- [ ] **Warnings critiques résolus** : Les warnings de sécurité ou de performance sont traités
- [ ] **Code formaté** : Prettier appliqué (ou formatteur du projet)

### 🧪 Tests

- [ ] **Tests unitaires passants** :
  - Logique métier critique : **>80% de couverture**
  - Protocole ICE : **100% de couverture** (OBLIGATOIRE)
  - Utils et helpers : **>60% de couverture**
- [ ] **Tests d'intégration passants** (si applicable) :
  - API Routes critiques testées
  - Flux de données validés
- [ ] **Tests E2E passants** (si applicable) :
  - Scénarios utilisateur critiques fonctionnels
  - Pas de flakiness (3 runs consécutifs réussis)
- [ ] **Tests manuels effectués** :
  - Happy path vérifié
  - Edge cases testés
  - Responsive design validé (mobile + desktop)

### 👁️ Code Review

- [ ] **Pull Request créée** : Description claire avec contexte
- [ ] **Code reviewed** : Au moins 1 reviewer a approuvé
- [ ] **Commentaires résolus** : Tous les changements demandés appliqués
- [ ] **Pas de conflits** : Branch à jour avec main/master

### 📚 Documentation

- [ ] **README mis à jour** (si nouveaux setup/configs)
- [ ] **ADR créé** (si décision architecturale importante)
- [ ] **Commentaires code** : Fonctions complexes documentées
- [ ] **Types TypeScript** : Interfaces/types exportés et documentés

### 🚀 Déploiement

- [ ] **Déployé en Staging** : Feature accessible sur environnement de test
- [ ] **Validé en Staging** : QA ou PO a testé et approuvé
- [ ] **Migrations DB appliquées** (si applicable) :
  - Migration testée en staging
  - Rollback plan documenté
- [ ] **Variables d'environnement** : Configurées en prod (si nouvelles)

### ✅ Acceptance

- [ ] **PO Approval** : Product Owner a validé la story
- [ ] **Critères d'acceptation remplis** : Tous les AC de la story respectés
- [ ] **Aucun bug bloquant** : Pas de régression introduite

---

## DoD Spécifiques par Type de Story

### 📊 Stories avec Analytics

- [ ] **Events trackés** : Nouveaux events ajoutés à Posthog/Mixpanel
- [ ] **Dashboard mis à jour** : Métriques visibles dans le tableau de bord

### 🔒 Stories avec Sécurité/Auth

- [ ] **Audit de sécurité** : Revue par un pair orienté sécurité
- [ ] **Rate limiting vérifié** : Endpoints protégés contre l'abus
- [ ] **RLS testé** : Row Level Security validé en DB

### 🎨 Stories avec UI/UX

- [ ] **Design System respecté** : Composants conformes aux maquettes
- [ ] **Accessibilité WCAG AA** :
  - Contraste suffisant (4.5:1 minimum)
  - Navigation au clavier fonctionnelle
  - Labels ARIA présents
- [ ] **Mobile tested** : Testé sur au moins 2 tailles d'écran

### 🤖 Stories avec LLM/IA

- [ ] **Prompt versionné** : Prompts stockés et versionnés
- [ ] **Fallbacks implémentés** : Gestion des timeouts/erreurs LLM
- [ ] **Coûts estimés** : Impact sur budget API calculé
- [ ] **Latence mesurée** : Temps de réponse < 15s validé

### 💳 Stories avec Paiement

- [ ] **Webhooks testés** : Scénarios Stripe validés (succès/échec/annulation)
- [ ] **Idempotence vérifiée** : Pas de double facturation possible
- [ ] **Logs de paiement** : Traçabilité complète des transactions

---

## Exceptions et Notes

### Stories Spike/POC

Pour les stories de type "Spike Technique" ou "Proof of Concept" :
- Tests et documentation peuvent être allégés
- DoD réduit : Code fonctionnel + Rapport de findings/décision

### Refactoring Stories

Pour les refactorings internes (pas de changement fonctionnel) :
- Tests E2E optionnels SI couverture unitaire exhaustive
- Focus sur la non-régression

### Hotfixes

Pour les correctifs urgents en production :
- Fast-track possible (review accélérée, déploiement direct en prod)
- **MAIS** : Tests et documentation requis **après coup** sous 48h

---

## Checklist de Vérification (Pre-Merge)

Avant de merger dans `main`, le développeur exécute cette checklist :

```bash
# 1. Tests
npm run test              # Tests unitaires
npm run test:integration  # Tests d'intégration
npm run test:e2e          # Tests E2E (si applicable)

# 2. Linting
npm run lint              # ESLint
npm run type-check        # TypeScript

# 3. Build
npm run build             # Vérifier que le build passe

# 4. Format
npm run format            # Prettier
```

Si **tous** les checks passent ✅ → Prêt pour merge.

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

# 11 TESTING STRATEGY

# 11. Testing Strategy

## Vision Globale

La stratégie de tests de **postry.ai** vise à garantir la **fiabilité**, la **maintenabilité** et la **rapidité de déploiement** en couvrant trois niveaux :

1. **Unit Tests** : Logique métier isolée (vitesse maximale)
2. **Integration Tests** : Interactions API/DB (confiance dans les contrats)
3. **E2E Tests** : Parcours utilisateur critiques (validation end-to-end)

**Philosophie** : "Write tests, not too many, mostly integration." — Inspiré de Kent C. Dodds

---

## 1. Tests Unitaires (Unit Tests)

### Outils

- **Framework** : [Vitest](https://vitest.dev/) (rapide, compatible Vite/Next.js)
- **Mocking** : `vi.mock()` de Vitest
- **Assertions** : `expect()` standard

### Couverture Cible

| Type de Code | Couverture Minimale | Priorité |
|--------------|---------------------|----------|
| **Protocole ICE** (logique pure) | **100%** | 🔴 CRITIQUE |
| Logique métier (calcul crédits, parsing) | **>80%** | 🟠 HAUTE |
| Utils et helpers | **>60%** | 🟡 MOYENNE |
| Composants React (stateless) | **>40%** | 🟢 BASSE |

### Scope des Tests Unitaires

#### ✅ À Tester en Unitaire

- **Protocole ICE** (`lib/ice/`) :
  - `getClosestArchetype(vector)`
  - `updateVector(currentVector, answer)`
  - `getTargetDimensions(archetype, phase)`
- **Calcul de crédits** :
  - Décompte correct (génération = -1, régénération = 0)
  - Logique de paywall (>= 5 posts)
- **Validation Zod** :
  - Schémas de validation (email, quiz answers, etc.)
- **Parsing et transformations** :
  - Extraction texte CV
  - Formatting du post (sauts de ligne LinkedIn)

#### ❌ À NE PAS Tester en Unitaire

- Composants React complexes avec state (préférer E2E)
- API Routes complètes (préférer Integration Tests)
- UI styling (validation manuelle + screenshots tests)

### Exemple de Test Unitaire

```typescript
// __tests__/lib/ice/archetype.test.ts
import { describe, it, expect } from 'vitest';
import { getClosestArchetype } from '@/lib/ice/archetype';

describe('getClosestArchetype', () => {
  it('should return Le Stratège for high formality and logic', () => {
    const vector = {
      formality: 8,
      logic_emotion: 7,
      directness: 6,
      // ... autres dimensions
    };
    
    const result = getClosestArchetype(vector);
    
    expect(result.name).toBe('Le Stratège');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  it('should handle edge case with all neutral values', () => {
    const neutralVector = {
      formality: 5,
      logic_emotion: 5,
      directness: 5,
      // ...
    };
    
    const result = getClosestArchetype(neutralVector);
    
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
```

---

## 2. Tests d'Intégration (Integration Tests)

### Outils

- **Framework** : Vitest (même stack que unitaire)
- **DB Test** : Supabase Local (via Docker) ou Test Database
- **Mocks** : LLM mockés (éviter les coûts API en test)

### Scope des Tests d'Intégration

#### ✅ À Tester en Intégration

- **API Routes** :
  - `POST /api/quiz/generate` : Génération de questions
  - `POST /api/quiz/post` : Génération de post
  - `POST /api/auth/persist-on-login` : Persistance du post
  - `POST /api/post/regenerate` : Régénération avec Equalizer
- **Workflows Complets** :
  - Quiz → Profil → Génération Post
  - Auth → Persist → Dashboard
  - Upload CV → Parsing → Génération avec contexte

### Exemple de Test d'Intégration

```typescript
// __tests__/api/quiz/post.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { POST } from '@/app/api/quiz/post/route';

describe('POST /api/quiz/post', () => {
  beforeAll(() => {
    // Mock Gemini API
    vi.mock('@google/generative-ai', () => ({
      generateContent: vi.fn().mockResolvedValue({
        hook: 'Test hook',
        content: 'Test content',
        cta: 'Test CTA'
      })
    }));
  });

  it('should generate a post with valid ICE vector', async () => {
    const request = new Request('http://localhost:3000/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify({
        theme: 'Leadership en startup',
        vector: { formality: 7, logic_emotion: 6, /* ... */ },
        profile: { label_final: 'Le Stratège', /* ... */ }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.post).toHaveProperty('hook');
    expect(data.post).toHaveProperty('content');
    expect(data.post).toHaveProperty('cta');
  });

  it('should return 400 if vector is missing', async () => {
    const request = new Request('http://localhost:3000/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify({ theme: 'Test' }) // Missing vector
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

---

## 3. Tests End-to-End (E2E Tests)

### Outils

- **Framework** : [Playwright](https://playwright.dev/)
- **Browsers** : Chromium, Firefox, WebKit (Safari)
- **CI** : GitHub Actions ou Vercel CI

### Scénarios Critiques à Couvrir

| # | Scénario | Priorité | Epic |
|---|----------|----------|------|
| **E2E-01** | Quiz complet → Post flouté → Email → Révélation | 🔴 CRITIQUE | 1-2 |
| **E2E-02** | Login utilisateur existant → Dashboard | 🔴 CRITIQUE | 2 |
| **E2E-03** | Génération → Equalizer → Régénération | 🟠 HAUTE | 3 |
| **E2E-04** | Upload CV → Génération avec contexte | 🟠 HAUTE | 4 |
| **E2E-05** | 5 posts → Paywall → Paiement → Déblocage | 🔴 CRITIQUE | 4 |
| **E2E-06** | Historique des posts → Navigation | 🟡 MOYENNE | 3 |

### Exemple de Test E2E (Scénario Critique)

```typescript
// e2e/quiz-to-reveal.spec.ts
import { test, expect } from '@playwright/test';

test('User completes quiz, sees blurred post, and reveals via email', async ({ page }) => {
  // 1. Landing Page → Start Quiz
  await page.goto('/');
  await page.fill('input[name="theme"]', 'Leadership en startup');
  await page.click('button:has-text("Démarrer")');

  // 2. Complete Quiz (Phase 1 + 2)
  for (let i = 0; i < 9; i++) { // 9 questions total
    await page.waitForSelector('[data-testid="quiz-question"]');
    await page.click('[data-testid="answer-option"]:first-child');
    await page.click('button:has-text("Suivant")');
  }

  // 3. See Blurred Post
  await page.waitForSelector('[data-testid="blurred-post"]');
  await expect(page.locator('[data-testid="blurred-post"]')).toHaveClass(/blur/);

  // 4. Submit Email
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Révéler")');

  // 5. Confirmation Message
  await expect(page.locator('text=Lien envoyé')).toBeVisible();

  // 6. Simulate Magic Link Click (mock auth callback)
  await page.goto('/auth/confirm?token=mock_token');

  // 7. Dashboard with Revealed Post
  await page.waitForURL('/dashboard', { timeout: 10000 });
  await expect(page.locator('[data-testid="post-content"]')).not.toHaveClass(/blur/);
  await expect(page.locator('[data-testid="post-content"]')).toContainText('Leadership');
});
```

### Anti-Flakiness Strategy

Pour éviter les tests E2E instables :

1. **Attentes explicites** : Toujours utiliser `waitForSelector()` au lieu de `sleep()`
2. **Test Isolation** : Chaque test crée son propre user (email unique)
3. **Retry Policy** : 3 tentatives max en CI (via `playwright.config.ts`)
4. **Cleanup** : Nettoyer la DB test entre chaque run

```typescript
// playwright.config.ts
export default {
  retries: process.env.CI ? 3 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
};
```

---

## 4. Tests Spécifiques par Epic

### Epic 1 : Fondation & Tunnel Public

- ✅ **Unit** : Protocole ICE (100%)
- ✅ **Integration** : API génération questions + posts
- ✅ **E2E** : Quiz complet → Post flouté

### Epic 2 : Conversion & Identité

- ✅ **Unit** : Validation email, parsing localStorage
- ✅ **Integration** : API `persist-on-login`, workflow auth
- ✅ **E2E** : Email → Magic Link → Dashboard
- 🔴 **Regression Tests** : Bugs BUG-001 à BUG-004 (voir `docs/bug-fixes-epic-2-critical.md`)

### Epic 3 : Dashboard & Personnalisation

- ✅ **Unit** : Logique Equalizer (mapping sliders → vector)
- ✅ **Integration** : API régénération
- ✅ **E2E** : Equalizer → Régénération → Update post

### Epic 4 : Intelligence d'Expertise

- ✅ **Unit** : Parsing CV, extraction texte
- ✅ **Integration** : RAG injection dans génération
- ✅ **E2E** : Upload CV → Génération avec contexte + Paywall → Paiement

---

## 5. CI/CD Integration

### Pipeline GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

### Règles de Merge

- ❌ **Bloquer le merge** si :
  - Tests unitaires échouent
  - Linter errors > 0
  - E2E critiques (E2E-01, E2E-02, E2E-05) échouent
- ⚠️ **Warning (merge autorisé)** si :
  - Tests E2E non-critiques échouent (à investiguer)
  - Couverture < 80% (rappel mais pas bloquant)

---

## 6. Outils et Ressources

### Commandes NPM

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Dashboards

- **Coverage Report** : `npm run test:coverage` → `coverage/index.html`
- **Playwright Report** : `npx playwright show-report`

---

## 7. Responsabilités

| Rôle | Responsabilité |
|------|----------------|
| **Développeur** | Écrire unit tests + integration tests pour ses stories |
| **QA/Testeur** | Écrire et maintenir les tests E2E critiques |
| **Tech Lead** | Reviewer la couverture et maintenir la stratégie |
| **PO** | Valider que les scénarios E2E couvrent les user stories |

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

# 12 ERROR HANDLING STRATEGY

# 12. Error Handling Strategy

## Philosophie Générale

**"Fail gracefully, recover quickly, inform clearly."**

Les erreurs sont inévitables dans un système distribué avec dépendances externes (LLM, DB, Paiement). Notre stratégie vise à :

1. **Prévenir** : Validation stricte des inputs
2. **Détecter** : Logging et monitoring exhaustifs
3. **Récupérer** : Retries automatiques et fallbacks
4. **Informer** : Messages utilisateur clairs et actionnables

---

## 1. Classification des Erreurs

### Types d'Erreurs

| Type | Exemple | Récupérable ? | Action |
|------|---------|---------------|--------|
| **User Input** | Email invalide, champ vide | ✅ Oui | Validation frontend + message clair |
| **Business Logic** | Quota dépassé (5 posts) | ✅ Oui | Paywall avec CTA "Upgrade" |
| **External Service** | Timeout LLM, DB down | ⚠️ Partiel | Retry + fallback + message temporaire |
| **System** | Out of memory, crash serveur | ❌ Non | Log error + Sentry alert + page erreur 500 |

### Codes d'Erreur HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| **400** | Bad Request | Validation échouée (input invalide) |
| **401** | Unauthorized | User non authentifié |
| **402** | Payment Required | Quota dépassé (paywall) |
| **403** | Forbidden | User authentifié mais pas autorisé (RLS) |
| **404** | Not Found | Ressource inexistante |
| **429** | Too Many Requests | Rate limiting dépassé |
| **500** | Internal Server Error | Erreur serveur générique |
| **503** | Service Unavailable | LLM/DB temporairement indisponible |

---

## 2. Gestion d'Erreurs par Domaine

### 2.1 Erreurs LLM (Gemini/Claude)

**Causes fréquentes** :
- Timeout (>30s sans réponse)
- Rate limiting (trop de requêtes)
- Service unavailable (panne Gemini)
- Invalid response (JSON malformé)

**Stratégie** :

```typescript
// lib/llm/generate-with-retry.ts
async function generateWithRetry(prompt: string, maxRetries = 3) {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await geminiClient.generateContent(prompt);
      return parseResponse(response); // Validation Zod
      
    } catch (error) {
      lastError = error;
      
      // Retry si timeout ou 503
      if (isRetryable(error)) {
        await sleep(attempt * 2000); // Exponential backoff
        continue;
      }
      
      // Ne pas retry si rate limit (429) ou erreur de validation
      break;
    }
  }
  
  // Tous les retries échoués
  throw new LLMError('Génération impossible après 3 tentatives', { cause: lastError });
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Timeout (1ère tentative) | "Génération en cours... Cela prend plus de temps que prévu." |
| Timeout (3 retries) | "⚠️ Le service de génération est surchargé. Réessayez dans 2 minutes." |
| Rate Limit | "⏸️ Limite temporaire atteinte. Réessayez dans 1 minute." |
| Service Down | "🔧 Service temporairement indisponible. Nous travaillons dessus. Réessayez dans 5 minutes." |

**Fallback** : Proposer une génération simplifiée (prompt de secours) si Gemini indisponible.

---

### 2.2 Erreurs d'Authentification

**Causes fréquentes** :
- Email invalide
- Magic Link expiré (>1h)
- Session expirée
- User déjà connecté ailleurs

**Stratégie** :

```typescript
// app/api/auth/callback/route.ts
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Validation
    const emailSchema = z.string().email();
    const validatedEmail = emailSchema.parse(email);
    
    // Send Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email: validatedEmail,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm` }
    });
    
    if (error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Attendez 1 minute.' },
          { status: 429 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email invalide. Vérifiez le format.' },
        { status: 400 }
      );
    }
    
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du lien. Réessayez.' },
      { status: 500 }
    );
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend | Action |
|--------|------------------|--------|
| Email invalide | "⚠️ Email invalide. Exemple : vous@exemple.com" | Reformater input |
| Lien expiré | "⏰ Ce lien a expiré. Demandez un nouveau lien." | Bouton "Renvoyer" |
| Rate limit | "⏸️ Trop de tentatives. Attendez 1 minute." | Désactiver bouton 60s |
| Erreur serveur | "❌ Erreur lors de l'envoi. Réessayez ou contactez support@postry.ai" | Bouton "Réessayer" |

---

### 2.3 Erreurs de Base de Données

**Causes fréquentes** :
- Connexion DB perdue
- Violation de contrainte (unique email)
- RLS policy bloque l'accès
- Timeout de requête (>5s)

**Stratégie** :

```typescript
// lib/db/with-retry.ts
async function queryWithRetry<T>(
  queryFn: () => Promise<PostgrestResponse<T>>,
  maxRetries = 2
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error } = await queryFn();
    
    if (!error) return { data, error: null };
    
    // Retry si timeout ou connexion perdue
    if (error.code === 'PGRST301' || error.message.includes('timeout')) {
      await sleep(attempt * 1000);
      continue;
    }
    
    // Ne pas retry si violation de contrainte
    return { data: null, error };
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Timeout | "⏳ La sauvegarde prend du temps. Réessayez dans 30s." |
| Email déjà existant | "📧 Ce compte existe déjà. Connectez-vous ou utilisez un autre email." |
| RLS policy | "🔒 Accès refusé. Reconnectez-vous." |
| Erreur générique | "❌ Erreur de sauvegarde. Vos données sont conservées localement. Réessayez." |

---

### 2.4 Erreurs de Paiement (Stripe)

**Causes fréquentes** :
- Carte refusée
- Webhook Stripe non reçu
- Double paiement (idempotence)

**Stratégie** :

```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Idempotence: Check if already processed
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();
    
    if (existingPayment) {
      console.log('Payment already processed:', session.id);
      return NextResponse.json({ received: true });
    }
    
    // Process payment...
    await activatePremium(session.customer_email);
  }
  
  return NextResponse.json({ received: true });
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Carte refusée | "💳 Paiement refusé. Vérifiez vos informations bancaires ou essayez une autre carte." |
| Webhook retard | "⏳ Paiement en cours de validation... Rechargez dans 30s." |
| Erreur Stripe | "❌ Erreur de paiement. Vous n'avez PAS été débité. Réessayez ou contactez support@postry.ai" |

---

### 2.5 Erreurs de Upload (CV)

**Causes fréquentes** :
- Fichier trop gros (>5Mo)
- Type invalide (pas PDF/TXT)
- Parsing échoué (PDF corrompu)

**Stratégie** :

```typescript
// app/api/cv/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validation taille
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux. Maximum 5Mo.' },
      { status: 400 }
    );
  }
  
  // Validation type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non supporté. Utilisez PDF ou TXT.' },
      { status: 400 }
    );
  }
  
  try {
    const text = await parsePDF(file);
    
    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'CV illisible ou vide. Vérifiez le fichier.' },
        { status: 400 }
      );
    }
    
    // Save to Supabase Storage...
    
  } catch (error) {
    console.error('CV parsing error:', error);
    return NextResponse.json(
      { error: 'Erreur de lecture du CV. Essayez un autre format.' },
      { status: 500 }
    );
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Fichier trop gros | "📦 Fichier trop volumineux (max 5Mo). Compressez-le ou utilisez un extrait." |
| Format invalide | "📄 Format non supporté. Utilisez PDF ou TXT uniquement." |
| Parsing échoué | "🔍 Impossible de lire ce fichier. Est-il corrompu? Essayez un autre CV." |

---

## 3. Logging et Monitoring

### Outils

- **Frontend** : Sentry (erreurs client)
- **Backend** : Vercel Logs + Sentry (erreurs serveur)
- **Monitoring** : Vercel Analytics + Uptime Robot

### Structure des Logs

```typescript
// lib/logger.ts
export function logError(context: string, error: Error, metadata?: Record<string, any>) {
  console.error(`[${context}]`, {
    message: error.message,
    stack: error.stack,
    ...metadata,
    timestamp: new Date().toISOString()
  });
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { context },
      extra: metadata
    });
  }
}
```

### Alertes Critiques

Déclencher une alerte Slack/Email si :

- Taux d'erreur >5% sur 5 minutes
- LLM timeout >30s pour >3 requêtes consécutives
- Webhook Stripe non reçu pendant >2 minutes
- Base de données inaccessible

---

## 4. Pages d'Erreur Utilisateur

### 404 - Page Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-gray-600">Cette page n'existe pas.</p>
      <a href="/" className="mt-6 text-blue-500">
        Retour à l'accueil
      </a>
    </div>
  );
}
```

### 500 - Internal Server Error

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">Oups!</h1>
      <p className="mt-4 text-gray-600">
        Une erreur inattendue s'est produite.
      </p>
      <button
        onClick={reset}
        className="mt-6 bg-black text-white px-6 py-3"
      >
        Réessayer
      </button>
      <p className="mt-4 text-sm text-gray-400">
        Si le problème persiste : support@postry.ai
      </p>
    </div>
  );
}
```

---

## 5. Checklist de Gestion d'Erreurs

Avant de merger une nouvelle feature, vérifier :

- [ ] **Validation des inputs** : Schémas Zod appliqués
- [ ] **Try-catch présents** : Tous les appels externes wrapped
- [ ] **Messages utilisateur** : Clairs et actionnables
- [ ] **Logs structurés** : Context + metadata
- [ ] **Retry logic** : Pour erreurs récupérables
- [ ] **Fallbacks** : Plan B si service externe down
- [ ] **Tests d'erreurs** : Scénarios d'échec testés

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

# 13 ANALYTICS AND KPIS

# 13. Analytics & KPIs

## Vision

**"Measure what matters, optimize relentlessly."**

Les analytics sont le système nerveux de **postry.ai**. Ils permettent de :

1. **Valider les hypothèses** : Est-ce que le Blurred Proof fonctionne?
2. **Optimiser le tunnel** : Où les users drop-ils?
3. **Mesurer le succès** : Atteignons-nous nos objectifs business?

---

## 1. Outils Analytics

### Stack Recommandée

| Outil | Usage | Coût |
|-------|-------|------|
| **[Posthog](https://posthog.com/)** | Product analytics + Feature flags | Gratuit jusqu'à 1M events/mois |
| **[Vercel Analytics](https://vercel.com/analytics)** | Web Vitals + Performance | Inclus dans plan Vercel |
| **[Stripe Dashboard](https://dashboard.stripe.com/)** | Métriques de paiement | Inclus |
| **[Supabase Dashboard](https://supabase.com/)** | Métriques DB (queries, storage) | Inclus |

**Choix principal** : **Posthog** (open-source, self-hosted possible, feature flags intégrés)

---

## 2. Events Critiques à Tracker

### Funnel d'Acquisition (Epic 1-2)

```typescript
// Événements à capturer via Posthog

// Landing
posthog.capture('landing_viewed');
posthog.capture('theme_selected', { theme: 'Leadership' });

// Quiz
posthog.capture('quiz_started', { theme: 'Leadership' });
posthog.capture('quiz_question_answered', {
  phase: 1,
  question_id: 'q1',
  dimension: 'formality'
});
posthog.capture('quiz_completed', {
  archetype: 'Le Stratège',
  duration_seconds: 45
});

// Génération
posthog.capture('post_generation_started', { theme: 'Leadership' });
posthog.capture('post_generated', {
  theme: 'Leadership',
  archetype: 'Le Stratège',
  generation_time_ms: 12000
});
posthog.capture('blurred_post_viewed');

// Conversion
posthog.capture('email_submitted', { email: 'user@example.com' });
posthog.capture('magic_link_clicked');
posthog.capture('post_revealed', {
  time_to_reveal_seconds: 120 // Temps entre génération et révélation
});
```

### Funnel d'Engagement (Epic 3)

```typescript
// Dashboard
posthog.capture('dashboard_viewed');
posthog.capture('new_post_clicked');

// Equalizer
posthog.capture('equalizer_opened');
posthog.capture('equalizer_slider_changed', {
  slider: 'tone',
  old_value: 5,
  new_value: 8
});
posthog.capture('post_regenerated', {
  post_id: 'abc123',
  changes: ['tone', 'length']
});

// Historique
posthog.capture('history_viewed');
posthog.capture('post_selected_from_history', { post_id: 'abc123' });
```

### Funnel de Monétisation (Epic 4)

```typescript
// CV Upload
posthog.capture('cv_upload_started');
posthog.capture('cv_uploaded', {
  file_type: 'pdf',
  file_size_kb: 245
});
posthog.capture('cv_parsed', {
  success: true,
  text_length: 3500
});

// Paywall
posthog.capture('paywall_hit', {
  post_count: 5
});
posthog.capture('upgrade_button_clicked');

// Paiement
posthog.capture('checkout_started', {
  plan: 'premium',
  price: 9
});
posthog.capture('checkout_completed', {
  plan: 'premium',
  price: 9,
  stripe_session_id: 'cs_xxx'
});
posthog.capture('checkout_abandoned', {
  step: 'payment_info' // Où l'user a abandonné
});
```

---

## 3. KPIs & Objectifs Business

### Métriques Primaires (North Star)

| KPI | Objectif | Formule | Fréquence |
|-----|----------|---------|-----------|
| **Quiz Completion Rate** | >65% | (Quiz Completed / Quiz Started) × 100 | Hebdomadaire |
| **Reveal Rate** | >30% | (Posts Revealed / Posts Generated) × 100 | Hebdomadaire |
| **Premium Conversion Rate** | >5% | (Premium Subs / Paywall Hits) × 100 | Mensuelle |
| **MRR (Monthly Recurring Revenue)** | €1000 (MVP) | Premium Subs × Price | Mensuelle |

### Métriques Secondaires

| KPI | Objectif | Formule |
|-----|----------|---------|
| **Time to Reveal** | <3 min | Median(Post Generated → Post Revealed) |
| **CV Upload Rate** | >40% | (CVs Uploaded / Users Connected) × 100 |
| **Equalizer Usage Rate** | >50% | (Users Using Equalizer / Total Users) × 100 |
| **Regeneration Rate** | >2 per user | Avg(Regenerations / User) |
| **Churn Rate** | <10%/mois | (Users Canceled / Total Premium Users) × 100 |

### Métriques Techniques

| Métrique | SLA | Source |
|----------|-----|--------|
| **Post Generation Time** | <15s (P95) | Vercel Logs |
| **API Error Rate** | <1% | Sentry |
| **Page Load Time (FCP)** | <2s | Vercel Analytics |
| **Uptime** | >99.5% | Uptime Robot |

---

## 4. Dashboards

### Dashboard #1 : Acquisition Funnel

**Vue** : Posthog Funnel

**Étapes** :
1. Landing Viewed
2. Theme Selected
3. Quiz Started
4. Quiz Completed
5. Post Generated
6. Post Revealed

**Segmentations** :
- Par thème choisi
- Par archetype détecté
- Par source de trafic (organic, social, ads)

**Questions à répondre** :
- Quel est le taux de drop à chaque étape?
- Quel thème convertit le mieux?
- Quel archetype génère le plus de reveals?

---

### Dashboard #2 : Engagement & Retention

**Vue** : Posthog Retention + Trends

**Métriques** :
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Retention Day 1, Day 7, Day 30
- Feature Adoption:
  - % Users avec CV uploadé
  - % Users ayant utilisé Equalizer
  - Avg posts per user

**Segmentations** :
- Par cohort (date d'inscription)
- Par type d'utilisateur (Free vs Premium)

**Questions à répondre** :
- Combien d'users reviennent après 7 jours?
- Quelles features fidélisent le plus?

---

### Dashboard #3 : Monétisation

**Vue** : Stripe Dashboard + Posthog

**Métriques** :
- MRR (Monthly Recurring Revenue)
- New Subscriptions (ce mois)
- Churn Rate
- LTV (Lifetime Value) estimé
- Paywall Hit → Conversion Time

**Segmentations** :
- Par plan (si plusieurs tiers futurs)

**Questions à répondre** :
- Combien de temps entre Paywall Hit et Conversion?
- Quel est le taux de churn mensuel?
- LTV/CAC ratio est-il sain (>3)?

---

### Dashboard #4 : Technique & Performance

**Vue** : Vercel Analytics + Sentry

**Métriques** :
- API Response Time (P50, P95, P99)
- Error Rate par endpoint
- LLM Generation Time (P50, P95)
- Web Vitals:
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - CLS (Cumulative Layout Shift)

**Alertes** :
- Error rate >5% pendant 5 min
- LLM timeout >30s pour >3 requêtes
- Uptime <99%

---

## 5. Implémentation Posthog

### Installation

```bash
npm install posthog-js
```

### Configuration

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    }
  });
}

export { posthog };
```

### Usage dans les Composants

```typescript
// app/quiz/page.tsx
'use client';

import { posthog } from '@/lib/analytics';
import { useEffect } from 'react';

export default function QuizPage() {
  useEffect(() => {
    posthog.capture('quiz_started', {
      theme: searchParams.get('theme')
    });
  }, []);

  const handleAnswer = (answer: string) => {
    posthog.capture('quiz_question_answered', {
      phase: currentPhase,
      question_id: currentQuestion.id,
      answer
    });
    // ...
  };

  return <div>...</div>;
}
```

### Identification des Utilisateurs

```typescript
// Après l'auth réussie
posthog.identify(user.id, {
  email: user.email,
  archetype: user.archetype,
  premium: user.is_premium
});
```

---

## 6. A/B Testing (Feature Flags)

### Cas d'Usage

1. **Tester le CTA du Paywall** : "Upgrade" vs "Passer Premium" vs "Débloquer"
2. **Tester la position de l'Equalizer** : Sidebar vs Bottom Panel
3. **Tester le flou** : Gaussian blur vs Pixelated blur

### Implémentation

```typescript
// lib/analytics.ts
export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = posthog.isFeatureEnabled(flagName);
    setEnabled(isEnabled ?? false);
  }, [flagName]);

  return enabled;
}

// Usage dans composant
function PaywallModal() {
  const newCtaVariant = useFeatureFlag('paywall-cta-v2');

  return (
    <button>
      {newCtaVariant ? 'Débloquer maintenant' : 'Passer Premium'}
    </button>
  );
}
```

---

## 7. Privacy & RGPD

### Consentement

- **Cookie Banner** : Demander consentement pour analytics (requis UE)
- **Opt-out** : Permettre aux users de désactiver le tracking

### Anonymisation

```typescript
// Ne pas tracker d'infos sensibles
posthog.capture('post_generated', {
  theme: 'Leadership', // ✅ OK
  archetype: 'Le Stratège', // ✅ OK
  // ❌ NE PAS inclure: post_content, user_email (sauf hashed)
});
```

### Rétention des Données

- **Posthog** : Configurer rétention à 90 jours (gratuit tier)
- **Stripe** : Garder les logs de paiement 7 ans (obligation légale)

---

## 8. Revue et Optimisation

### Cadence de Revue

| Fréquence | Participants | Focus |
|-----------|-------------|-------|
| **Hebdomadaire** | PO + Dev Lead | Funnel metrics (Quiz, Reveal, Paywall) |
| **Mensuelle** | Toute l'équipe | MRR, Churn, Feature Adoption |
| **Trimestrielle** | C-level + Équipe | OKRs, Pivot/Persist decisions |

### Process d'Optimisation

1. **Identifier le bottleneck** : Quelle étape du funnel a le plus gros drop?
2. **Hypothèse** : Pourquoi? (UX confuse, temps de chargement, message flou?)
3. **Expérimentation** : A/B test d'une solution
4. **Mesure** : Impact sur le KPI cible
5. **Décision** : Déployer ou itérer

**Exemple** :

> **Constat** : Reveal Rate = 22% (objectif 30%)  
> **Hypothèse** : Le flou ne montre pas assez la structure du post  
> **Expérimentation** : Variante avec flou moins fort + aperçu du premier paragraphe  
> **Résultat** : Reveal Rate → 28% (+6 points)  
> **Décision** : Déployer la variante pour 100% des users

---

## 9. Checklist Analytics (Pour Chaque Feature)

Avant de livrer une nouvelle feature :

- [ ] **Events définis** : Quels events capturer?
- [ ] **Implémentation** : Posthog.capture() ajouté au bon endroit
- [ ] **Tests** : Vérifier que les events apparaissent dans Posthog (mode debug)
- [ ] **Dashboard mis à jour** : Ajouter les nouvelles métriques au dashboard pertinent
- [ ] **Alertes configurées** (si critique) : Ex: Error rate >5%

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

# 14 SECURITY AND COMPLIANCE

# 14. Security & Compliance

## Vision

**"Security is not a feature, it's a foundation."**

**postry.ai** traite des données sensibles (emails, CVs, contenu professionnel). La sécurité et la conformité RGPD ne sont pas optionnelles.

---

## 1. Conformité RGPD (Règlement Général sur la Protection des Données)

### Principes RGPD

| Principe | Application postry.ai |
|----------|----------------------|
| **Licéité, loyauté, transparence** | Politique de confidentialité claire + Consentement explicite |
| **Limitation des finalités** | Données utilisées uniquement pour génération de posts et amélioration du service |
| **Minimisation des données** | On ne collecte que le nécessaire (email, CV optionnel, réponses quiz) |
| **Exactitude** | Users peuvent modifier leur profil |
| **Limitation de la conservation** | Rétention: CVs (90j inactivité), Posts (tant que compte actif) |
| **Intégrité et confidentialité** | Chiffrement au repos + HTTPS obligatoire |

---

### 1.1 Données Collectées

| Donnée | Obligatoire ? | Finalité | Rétention |
|--------|---------------|----------|-----------|
| **Email** | ✅ Oui | Authentification + Communication | Tant que compte actif |
| **Réponses Quiz** | ✅ Oui | Calcul archétype + Génération personnalisée | Tant que compte actif |
| **Posts générés** | ✅ Oui | Historique + Régénération | Tant que compte actif |
| **CV (PDF/TXT)** | ❌ Non | Ancrage factuel (RAG) | 90 jours inactivité OU suppression sur demande |
| **Données de paiement** | ⚠️ Stripe only | Abonnement Premium | 7 ans (obligation légale) |
| **Adresse IP** | ⚠️ Logs serveur | Sécurité (rate limiting) | 30 jours |

**Important** : Nous ne collectons **jamais** :
- Numéro de téléphone
- Adresse postale
- Informations bancaires directes (géré par Stripe)

---

### 1.2 Base Légale du Traitement

| Traitement | Base Légale RGPD |
|------------|------------------|
| Authentification + Service | **Exécution du contrat** (Art. 6.1.b) |
| Analytics (Posthog) | **Consentement** (Art. 6.1.a) via Cookie Banner |
| Emails transactionnels (Magic Link) | **Exécution du contrat** |
| Emails marketing (newsletter) | **Consentement** (opt-in explicite) |
| Amélioration du service (feedback) | **Intérêt légitime** (Art. 6.1.f) |

---

### 1.3 Droits des Utilisateurs

**Droits RGPD à implémenter** :

| Droit | Implémentation | Délai de Réponse |
|-------|----------------|------------------|
| **Droit d'accès** (Art. 15) | Bouton "Télécharger mes données" dans Dashboard | <30 jours |
| **Droit de rectification** (Art. 16) | Modification profil + posts dans Dashboard | Immédiat |
| **Droit à l'effacement** (Art. 17) | Bouton "Supprimer mon compte" | <7 jours |
| **Droit à la portabilité** (Art. 20) | Export JSON (profil + posts) | <30 jours |
| **Droit d'opposition** (Art. 21) | Opt-out analytics + emails marketing | Immédiat |

**Workflow de Suppression de Compte** :

```typescript
// app/api/account/delete/route.ts
export async function DELETE(request: Request) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 1. Anonymiser les posts (garder pour analytics agrégées)
  await supabase
    .from('posts')
    .update({
      user_id: 'deleted_user',
      email: null,
      content: '[DELETED]'
    })
    .eq('user_id', user.id);
  
  // 2. Supprimer le CV (Supabase Storage)
  const { data: files } = await supabase.storage
    .from('cvs')
    .list(user.id);
  
  if (files) {
    const filePaths = files.map(f => `${user.id}/${f.name}`);
    await supabase.storage.from('cvs').remove(filePaths);
  }
  
  // 3. Supprimer l'utilisateur (Supabase Auth)
  await supabase.auth.admin.deleteUser(user.id);
  
  // 4. Log l'opération (obligation RGPD)
  console.log(`Account deleted: ${user.id} at ${new Date().toISOString()}`);
  
  return NextResponse.json({ success: true });
}
```

---

### 1.4 Documents Légaux Obligatoires

**À créer avant lancement public** :

1. **Politique de Confidentialité** (`/privacy`)
   - Données collectées
   - Finalités
   - Rétention
   - Droits RGPD
   - Contact DPO (Data Protection Officer) ou équivalent

2. **Conditions Générales d'Utilisation** (`/terms`)
   - Utilisation du service
   - Propriété intellectuelle
   - Limitation de responsabilité
   - Résiliation

3. **Politique de Cookies** (intégrée dans Privacy)
   - Types de cookies (Analytics, Auth)
   - Opt-in/Opt-out

**Templates recommandés** :
- [Termly.io](https://termly.io/) (générateur gratuit)
- [iubenda](https://www.iubenda.com/) (payant mais complet)

---

### 1.5 Cookie Banner

**Implémentation** :

```typescript
// components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { posthog } from '@/lib/analytics';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      posthog.opt_in_capturing();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    posthog.opt_in_capturing();
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    posthog.opt_out_capturing();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Nous utilisons des cookies pour améliorer votre expérience. 
          <a href="/privacy" className="underline ml-1">En savoir plus</a>
        </p>
        <div className="flex gap-4">
          <button onClick={handleReject} className="text-sm underline">
            Refuser
          </button>
          <button onClick={handleAccept} className="bg-white text-black px-4 py-2 rounded">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Sécurité Applicative

### 2.1 Authentification

**Stack** : Supabase Auth (Magic Link)

**Sécurité** :
- ✅ Pas de mot de passe stocké (zero-password)
- ✅ Magic Link valide 1h seulement
- ✅ Token JWT signé (HS256)
- ✅ Refresh token rotation activée

**Rate Limiting** :
- Max 5 Magic Links / 5 minutes / email
- Max 10 tentatives de login / heure / IP

```typescript
// middleware.ts (Next.js Edge Middleware)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '5 m'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/signin') {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 5 minutes.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}
```

---

### 2.2 Autorisation (RLS - Row Level Security)

**Supabase RLS Policies** :

```sql
-- Table: posts
-- Policy: Users can only read their own posts
CREATE POLICY "Users can read own posts"
ON public.posts
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own posts
CREATE POLICY "Users can insert own posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);
```

**Test RLS** :

```typescript
// __tests__/security/rls.test.ts
test('User cannot read another user\'s posts', async () => {
  const userA = await createTestUser('usera@example.com');
  const userB = await createTestUser('userb@example.com');

  await createTestPost({ user_id: userA.id, content: 'Secret A' });

  const { data } = await supabaseAsUserB
    .from('posts')
    .select('*')
    .eq('user_id', userA.id);

  expect(data).toEqual([]); // UserB ne voit rien
});
```

---

### 2.3 Chiffrement

**Au repos** :
- ✅ Supabase PostgreSQL : Chiffrement AES-256 par défaut
- ✅ Supabase Storage (CVs) : Chiffrement au repos activé

**En transit** :
- ✅ HTTPS obligatoire (TLS 1.3)
- ✅ Vercel force HTTPS redirect

**Données sensibles** :
- CVs stockés dans bucket privé (RLS)
- Posts accessibles uniquement via auth

---

### 2.4 Validation des Entrées

**Stack** : [Zod](https://zod.dev/) pour la validation

**Exemple** :

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const PostGenerationSchema = z.object({
  theme: z.string().min(5).max(200),
  vector: z.object({
    formality: z.number().min(1).max(10),
    logic_emotion: z.number().min(1).max(10),
    // ... autres dimensions
  }),
  profile: z.object({
    label_final: z.string(),
    definition_longue: z.string()
  })
});

// Usage dans API Route
export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const validated = PostGenerationSchema.parse(body);
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
  }
}
```

---

### 2.5 Protection XSS & CSRF

**XSS (Cross-Site Scripting)** :
- ✅ React échappe automatiquement le contenu par défaut
- ✅ Utiliser `dangerouslySetInnerHTML` **uniquement** si nécessaire (sanitiser avec DOMPurify)

**CSRF (Cross-Site Request Forgery)** :
- ✅ Next.js API Routes protégées par SameSite cookies
- ✅ Supabase JWT token validé côté serveur

**Headers de Sécurité** :

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

---

### 2.6 Gestion des Secrets

**Variables d'Environnement** :

```bash
# .env.local (JAMAIS commité dans Git)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

SUPABASE_SERVICE_ROLE_KEY=eyJyyy... # ⚠️ SENSIBLE - Backend only
STRIPE_SECRET_KEY=sk_test_xxx # ⚠️ SENSIBLE
STRIPE_WEBHOOK_SECRET=whsec_xxx # ⚠️ SENSIBLE
GEMINI_API_KEY=AIzaSyxxx # ⚠️ SENSIBLE
```

**Règles** :
- ❌ JAMAIS commiter `.env.local`
- ✅ Ajouter `.env.local` dans `.gitignore`
- ✅ Utiliser Vercel Environment Variables pour la prod
- ✅ Préfixer les variables publiques avec `NEXT_PUBLIC_`

---

## 3. Audits et Monitoring

### 3.1 Audits Réguliers

| Fréquence | Type d'Audit | Responsable |
|-----------|--------------|-------------|
| **Mensuel** | Revue des logs d'accès (qui accède à quoi?) | Tech Lead |
| **Trimestriel** | Audit des dépendances npm (vulnérabilités) | Dev Team |
| **Annuel** | Audit de sécurité complet (pentesting externe) | RSSI / Consultant |

**Outils** :
- `npm audit` : Détection vulnérabilités npm
- [Snyk](https://snyk.io/) : Monitoring continu
- [OWASP ZAP](https://www.zaproxy.org/) : Pentesting automatisé

---

### 3.2 Logging des Actions Sensibles

**Events à logger** :

```typescript
// lib/audit-log.ts
export function logAuditEvent(event: {
  user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: Date;
}) {
  console.log('[AUDIT]', JSON.stringify(event));
  
  // En prod: envoyer vers Supabase ou service dédié
  if (process.env.NODE_ENV === 'production') {
    supabase.from('audit_logs').insert(event);
  }
}

// Usage
logAuditEvent({
  user_id: user.id,
  action: 'DELETE_ACCOUNT',
  resource: 'account',
  ip_address: request.headers.get('x-forwarded-for'),
  timestamp: new Date()
});
```

---

## 4. Incident Response Plan

### En Cas de Breach (Violation de Données)

**Étapes** :

1. **Détection** (0-1h) :
   - Identifier la brèche via monitoring/alertes
   - Isoler le système compromis

2. **Containment** (1-4h) :
   - Bloquer l'accès malveillant
   - Sauvegarder les logs pour investigation

3. **Notification CNIL** (< 72h) :
   - Si données personnelles affectées: notifier la CNIL
   - Email: donnees-personnelles@cnil.fr

4. **Notification Users** (< 72h) :
   - Si risque élevé pour les utilisateurs: les notifier par email

5. **Remediation** (1-2 semaines) :
   - Patcher la vulnérabilité
   - Audit complet post-incident
   - Documentation du post-mortem

---

## 5. Checklist de Sécurité Pré-Lancement

Avant de lancer en production :

- [ ] **RGPD** :
  - [ ] Politique de confidentialité publiée
  - [ ] CGU publiées
  - [ ] Cookie banner implémenté
  - [ ] Bouton "Supprimer mon compte" fonctionnel
  - [ ] Export de données implémenté

- [ ] **Auth** :
  - [ ] Magic Link fonctionnel
  - [ ] Rate limiting activé
  - [ ] Session timeout configuré (7 jours)

- [ ] **Autorisation** :
  - [ ] RLS policies testées
  - [ ] Pas de fuite de données inter-users

- [ ] **Chiffrement** :
  - [ ] HTTPS forcé
  - [ ] CVs chiffrés au repos

- [ ] **Validation** :
  - [ ] Tous les endpoints validés avec Zod

- [ ] **Headers** :
  - [ ] CSP, X-Frame-Options, etc. configurés

- [ ] **Secrets** :
  - [ ] Aucun secret dans le code
  - [ ] Variables d'environnement Vercel configurées

- [ ] **Monitoring** :
  - [ ] Sentry configuré
  - [ ] Alertes critiques activées

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

# 15 DEPLOYMENT AND ROLLOUT

# 15. Deployment & Rollout Strategy

## Vision

**"Ship early, ship often, ship safely."**

La stratégie de déploiement de **postry.ai** privilégie la **vélocité** (itérations rapides) tout en maintenant la **stabilité** (pas de downtime critique).

---

## 1. Architecture de Déploiement

### Infrastructure

| Composant | Plateforme | Environnement |
|-----------|------------|---------------|
| **Frontend + API** | Vercel | Production, Preview, Dev |
| **Base de Données** | Supabase PostgreSQL | Production, Staging |
| **Storage (CVs)** | Supabase Storage | Production, Staging |
| **LLM** | Google Gemini API | Production (shared) |
| **Paiement** | Stripe | Production (live), Test |
| **Monitoring** | Vercel + Sentry + Posthog | Production |

**Avantages Vercel** :
- ✅ CI/CD automatique (chaque push = déploiement)
- ✅ Preview Deployments (chaque PR = URL unique)
- ✅ Edge Functions (latence faible)
- ✅ Rollback instant (1 clic)

---

## 2. Environnements

### 2.1 Local Development

**Setup** :

```bash
git clone https://github.com/org/postry-ai.git
cd postry-ai
npm install
cp .env.example .env.local
# Configurer les clés API locales
npm run dev
```

**Caractéristiques** :
- Supabase local via Docker (optionnel) OU projet Supabase dev
- Stripe mode Test
- LLM avec clés dev (rate limit plus faible)

---

### 2.2 Staging

**URL** : `https://postry-ai-staging.vercel.app`

**Purpose** : Tests d'intégration, validation PO, démo clients

**Configuration** :
- Branche : `develop` (ou `staging`)
- Base de données : Supabase Staging (copie anonymisée de prod)
- Stripe : Mode Test
- LLM : Prod API (mais quota séparé)

**Déploiement** :
- Automatique sur chaque merge vers `develop`
- Preview URL disponible pour chaque PR

---

### 2.3 Production

**URL** : `https://postry.ai`

**Configuration** :
- Branche : `main`
- Base de données : Supabase Production
- Stripe : Mode Live
- LLM : Prod API
- Analytics : Posthog (prod project)

**Déploiement** :
- Automatique sur chaque merge vers `main`
- Require approval (protection branch)

---

## 3. Stratégie de Release

### 3.1 Phases de Rollout

```
Epic 1-2 (Alpha) → Epic 3 (Beta) → Epic 4 (Launch) → Post-Launch
```

#### Phase 1 : Alpha (Epic 1-2 complétés)

**Objectif** : Valider le tunnel d'acquisition et la conversion

**Audience** : 
- 10-20 early adopters (équipe interne + amis)
- Accès via whitelist email

**Features** :
- ✅ Quiz complet + Profiling ICE
- ✅ Génération de post (flou → révélation)
- ✅ Authentification Magic Link
- ❌ Pas d'Equalizer
- ❌ Pas de CV upload
- ❌ Pas de paywall

**Critères de passage à Beta** :
- Reveal Rate >25%
- Post Generation Time <20s (P95)
- 0 bugs critiques
- Feedback positif de 70% des alphas

**Durée** : 1-2 semaines

---

#### Phase 2 : Beta (Epic 3 complété)

**Objectif** : Valider l'engagement (Equalizer, Dashboard)

**Audience** :
- 100-200 users
- Inscription publique MAIS limite de 200 users (soft cap)
- Landing page avec "Beta Waitlist"

**Features** :
- ✅ Tout de l'Alpha
- ✅ Dashboard complet
- ✅ Equalizer de style
- ✅ Historique des posts
- ❌ Pas de CV upload (Epic 4)
- ❌ Paywall désactivé (génération illimitée pour tests)

**Critères de passage à Launch** :
- Equalizer Usage Rate >40%
- Retention Day 7 >30%
- Avg posts per user >2
- 0 bugs critiques
- Tests E2E tous passants

**Durée** : 2-3 semaines

---

#### Phase 3 : Public Launch (Epic 4 complété)

**Objectif** : Monétisation + Scaling

**Audience** :
- Public (pas de limite)
- Campagne marketing (Product Hunt, LinkedIn, etc.)

**Features** :
- ✅ Tout de la Beta
- ✅ CV Upload + RAG
- ✅ Paywall (5 posts gratuits)
- ✅ Paiement Stripe

**Success Metrics (90 jours post-launch)** :
- 1000+ signups
- Premium Conversion Rate >5%
- MRR >€1000
- Churn <10%/mois

---

#### Phase 4 : Post-Launch

**Focus** : Optimisation + Nouvelles Features

**Roadmap Post-MVP** :
- Epic 5 : Collaboration & Teams (partage de posts)
- Epic 6 : LinkedIn API Integration (posting direct)
- Epic 7 : Multi-langue (EN, ES)
- Epic 8 : Mobile App (React Native)

---

## 4. Feature Flags

### Pourquoi Feature Flags?

- ✅ Déployer du code **sans activer la feature** (dark launch)
- ✅ Rollout progressif (10% users → 50% → 100%)
- ✅ A/B testing facile
- ✅ Kill switch instantané si bug

### Implémentation (Posthog)

```typescript
// lib/feature-flags.ts
import { posthog } from '@/lib/analytics';

export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = posthog.isFeatureEnabled(flagName);
    setEnabled(isEnabled ?? false);
  }, [flagName]);

  return enabled;
}

// Usage dans composant
function Dashboard() {
  const cvUploadEnabled = useFeatureFlag('cv-upload');
  const equalizerV2Enabled = useFeatureFlag('equalizer-v2');

  return (
    <div>
      {equalizerV2Enabled ? <EqualizerV2 /> : <Equalizer />}
      {cvUploadEnabled && <CVUploadZone />}
    </div>
  );
}
```

### Feature Flags Planifiés

| Flag | Epic | Default | Rollout |
|------|------|---------|---------|
| `equalizer-enabled` | 3 | `false` | Beta: 100% |
| `cv-upload-enabled` | 4 | `false` | Launch: 10% → 100% |
| `paywall-enabled` | 4 | `false` | Launch: 100% |
| `linkedin-integration` | 6 | `false` | Post-Launch: Opt-in |

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
        if: github.ref == 'refs/heads/main'

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Règles de Protection

**Branch `main` (Production)** :
- ✅ Require PR (pas de push direct)
- ✅ Require 1 approval minimum
- ✅ Require status checks (tests, lint)
- ✅ Require up-to-date branch

**Branch `develop` (Staging)** :
- ✅ Require PR
- ⚠️ Approval optionnelle (plus de vélocité)

---

## 6. Database Migrations

### Workflow Migrations

**Outil** : Supabase CLI

```bash
# 1. Créer une migration
npx supabase migration new add_archetype_column

# 2. Éditer le fichier SQL
# supabase/migrations/20260127000000_add_archetype_column.sql

# 3. Appliquer en local (test)
npx supabase db push

# 4. Tester l'application
npm run dev

# 5. Commit + Push (CI appliquera automatiquement)
git add supabase/migrations/
git commit -m "feat: add archetype column to posts"
git push
```

### Règles de Migration

1. **Toujours backwards-compatible** :
   - ✅ Ajouter colonne avec valeur par défaut
   - ❌ Supprimer colonne utilisée (d'abord déprécier)

2. **Tester en staging avant prod** :
   - Appliquer manuellement en staging
   - Vérifier que l'app fonctionne
   - Puis merge vers `main`

3. **Rollback Plan** :
   - Chaque migration doit avoir une migration inverse
   - Exemple : `20260127000001_revert_archetype_column.sql`

---

## 7. Rollback Strategy

### Rollback Vercel (Instant)

**Via Dashboard** :
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet
3. Onglet "Deployments"
4. Cliquer sur déploiement précédent → "Promote to Production"

**Via CLI** :

```bash
vercel rollback
```

⏱️ **Temps de rollback** : <30 secondes

---

### Rollback Database (Complexe)

**Si migration casse la prod** :

1. **Appliquer migration inverse** :
   ```bash
   npx supabase db push --include revert_archetype_column
   ```

2. **Si pas de migration inverse** :
   - Restaurer backup DB (Supabase fait backups automatiques)
   - Via Dashboard Supabase : Settings → Database → Point-in-Time Recovery

⚠️ **Important** : Toujours tester les migrations en staging d'abord!

---

## 8. Monitoring Post-Déploiement

### Checklist Après Déploiement

**Immédiat (0-15 min)** :
- [ ] **Health check** : Visiter homepage, tester signup
- [ ] **Sentry** : Aucune erreur critique remontée
- [ ] **Vercel Analytics** : FCP, LCP dans les normes (<2s)
- [ ] **Posthog** : Events arrivent correctement

**Court terme (1h)** :
- [ ] **Error rate** : <1% sur tous les endpoints
- [ ] **LLM generation time** : P95 <15s
- [ ] **Database queries** : Pas de slow queries (>1s)

**Moyen terme (24h)** :
- [ ] **User feedback** : Aucun report de bug critique
- [ ] **Conversion metrics** : Pas de drop significatif
- [ ] **Payment flows** : Tous les webhooks Stripe reçus

---

### Alertes Critiques

**Déclencher alerte (Slack/Email) si** :

| Métrique | Seuil | Action |
|----------|-------|--------|
| Error rate | >5% | Investiguer immédiatement |
| Uptime | <99% | Vérifier Vercel status |
| LLM timeout | >30s pour 5 req | Contacter Google Gemini support |
| Stripe webhook fail | >3 échoués | Vérifier webhook endpoint |
| Database CPU | >80% | Scale up instance |

**Configuration** : Via Vercel Integrations (Slack) + Sentry Alerts

---

## 9. Hotfix Process

### Quand faire un Hotfix?

**Critères** :
- 🔴 Bug critique en production (crash, data loss, security breach)
- 🔴 Blocage majeur empêchant l'usage du service
- 🔴 Problème de paiement (users ne peuvent pas payer)

**Quand NE PAS faire de hotfix** :
- 🟡 Bug mineur (typo, style cassé non-bloquant)
- 🟡 Feature request (attendre prochaine release)

---

### Workflow Hotfix

```bash
# 1. Créer branche hotfix depuis main
git checkout main
git pull
git checkout -b hotfix/fix-duplicate-posts

# 2. Faire le fix (minimal)
# ... éditer fichiers ...

# 3. Commit
git add .
git commit -m "hotfix: prevent duplicate posts on auth"

# 4. Tester localement
npm run test
npm run test:e2e

# 5. Push + Create PR vers main
git push origin hotfix/fix-duplicate-posts
# Créer PR avec label "hotfix" + description claire

# 6. Review accélérée (1 reviewer)
# Merge dès approval

# 7. Vérifier déploiement prod
# Monitoring pendant 1h

# 8. Backport vers develop
git checkout develop
git merge hotfix/fix-duplicate-posts
git push
```

⏱️ **Délai cible hotfix** : <2h de détection à déploiement

---

## 10. Documentation Déploiement

### Runbook

**À documenter dans `/docs/runbook.md`** :

1. **Comment déployer manuellement** (si CI/CD fail)
2. **Comment rollback en urgence**
3. **Comment appliquer une migration DB**
4. **Contacts en cas d'incident** :
   - Vercel Support : support@vercel.com
   - Supabase Support : support@supabase.com
   - Stripe Support : support@stripe.com
   - On-call developer : [phone/Slack]

---

## 11. Checklist de Pre-Launch

Avant de lancer en production (Public Launch) :

### Infrastructure
- [ ] Domaine configuré (postry.ai)
- [ ] SSL/TLS actif (HTTPS)
- [ ] Variables d'environnement Vercel configurées
- [ ] Supabase Production provisioned (plan Pro si besoin)
- [ ] Stripe Live mode activé + webhooks configurés

### Code
- [ ] Tous les tests passent (unit, integration, E2E)
- [ ] Linter errors = 0
- [ ] Security headers configurés (CSP, X-Frame-Options)
- [ ] Rate limiting activé
- [ ] Feature flags configurés (paywall=true, etc.)

### Legal & Compliance
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Cookie banner implémenté
- [ ] Contact support visible (support@postry.ai)

### Monitoring
- [ ] Sentry configuré (production project)
- [ ] Posthog configuré (production project)
- [ ] Vercel Analytics activé
- [ ] Uptime Robot configuré (alerte downtime)
- [ ] Slack alerts configurés

### Documentation
- [ ] README.md à jour
- [ ] Runbook créé
- [ ] Architecture diagram disponible

### Marketing
- [ ] Landing page optimisée (SEO, meta tags)
- [ ] Product Hunt listing préparé
- [ ] LinkedIn posts planifiés
- [ ] Email announcement rédigé

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0


---

## Fin du Document

**Document généré automatiquement le** : 27/01/2026 01:45:01  
**Version** : 4.0  
**Script** : `generate-complete-prd.js`

Pour mettre à jour ce document, éditez les fichiers sources dans `prd/` puis relancez :

```bash
node generate-complete-prd.js
```

---

© 2026 postry.ai - Tous droits réservés
