**Nom** : Product Requirements Document

Nom de fichier : prd.md

**Version :** 3.0

**Confidentialité :** Interne / Strict

**Objet :** Document des Exigences Produit

# 1. Objectifs et Contexte

### Objectifs

- **Acquisition** : Atteindre un Taux de Complétion du Quiz > 65% et un Taux de Révélation ("Reveal Rate") > 30% (Conversion du Lead Magnet).
- **Engagement** : Inciter > 40% des utilisateurs à uploader un CV (Ancre de Valeur) et > 50% à utiliser l'Equalizer de Style.
- **Monétisation** : Convertir > 5% des utilisateurs atteignant la limite des 5 posts ("Paywall Hit") en abonnés Premium.
- **Différenciation** : Établir la "Rugosité" et l'"IA-Miroir" comme proposition de valeur principale, en opposition à la "lisseur" des outils d'IA génériques.
- **Simplicité** : Délivrer un tunnel "Product-Led Growth" où la valeur est prouvée *avant* la création de compte ou le paiement.

### Contexte (Background)

**postry.ai** s'attaque au "Déficit de Fidélité Textuelle" sur LinkedIn. Les outils d'IA actuels produisent un contenu générique et "lisse" qui échoue à capturer le style unique d'un individu ou sa réalité professionnelle spécifique. Cela crée une déconnexion entre l'identité réelle de l'utilisateur et sa persona numérique.

La solution est une plateforme **"IA-Miroir"**. Au lieu d'inventer une voix, elle cartographie l'"Archétype" de l'utilisateur via un quiz psychologique et ancre le contenu dans son expérience réelle (via analyse CV). Le MVP se concentre sur un tunnel de "Preuve Floutée" (Blurred Proof) : les utilisateurs génèrent un post gratuitement, voient un aperçu flouté pour valider que la structure et le style correspondent à leur intention, et échangent leur email pour révéler le texte. Ce modèle "Essayer avant d'acheter/s'inscrire" réduit la friction et prouve la valeur immédiatement.

### 1.3 Journal des Modifications (Change Log)

| **Date** | **Version** | **Description** | **Auteur** |
| --- | --- | --- | --- |
| 08/01/2026 | v1.0 | Création initiale | John (PM) |
| 10/01/2026 | v1.1 | Pivot vers la stratégie "Zéro Friction" et intégration des métriques de fidélité. | John (PM) |
| **13/01/2026** | **v2.0** | **Mise à jour majeure (Alignement Brief v5.1)** : Intégration des protocoles ICE (9 dimensions), RME (Ontologie) et ALE (Nudge). Pivot "Rugosité". | **John (PM)** |
| 14/01/2026 | v2.1 | **Création du workspace `packages/shared-types`** | FTR |
| 14/01/2026 | v2.2 | Ajout de la strory 1.6 pour sécuriser la fondation de donneés | FTR |
| 14/01/2026 | v2.3 | **Story 3.0 : Spike Technique - Moteur Radar (POC)** | FTR |
| 15/01/2026 | v3.0 | Refonte complète / simplification | FTR |

# 2. Exigences

### Exigences Fonctionnelles (FR)

- **FR1 (Moteur de Quiz)** : Le système doit présenter un parcours de découverte composé de questions de "Mapping" et d'"Affinement", générées dynamiquement par un LLM pour cerner l'archétype de l'utilisateur.
- **FR2 (Génération et Aperçu Flouté)** : À partir du thème saisi par l'utilisateur et de ses réponses, le système génère un post. Pour les visiteurs non connectés, ce résultat s'affiche immédiatement dans un état "Flouté" (structure visible mais texte illisible) afin de susciter l'intérêt.
- **FR3 (Gate de Conversion)** : Le système doit exiger la saisie d'un email valide (vérifié via OTP ou Magic Link) pour "déflouter" le contenu, révéler le texte final et créer le compte utilisateur.
- **FR4 (Equalizer de Style)** : Le Dashboard met à disposition des curseurs de réglage (ex : Ton, Longueur, Densité). Une fois les ajustements souhaités effectués, le système permet de régénérer le post pour refléter ces nouvelles nuances.
- **FR5 (Ancre CV / RAG)** : Le système doit permettre aux utilisateurs connectés d'uploader un CV (PDF/TXT). Le moteur analyse ce document pour extraire les expériences clés et injecter les faits pertinents dans la génération (RAG léger).
- **FR6 (Système de Crédits)** : Le système gère un compteur visible appliquant une limite stricte de 5 générations gratuites, bloquant toute création supplémentaire au-delà (Hard Paywall).
- **FR7 (Paiement)** : Une intégration Stripe Checkout permet la souscription à l'offre Premium pour débloquer l'usage illimité.

### Exigences Non-Fonctionnelles (NFR)

- **NFR1 (Performance)** : Le chargement des étapes du quiz doit s'effectuer en moins de 10 secondes. La génération complète d'un post doit s'exécuter en moins de 15 secondes pour garantir une expérience fluide.
- **NFR2 (Sécurité des Données)** : Les CV, accessibles uniquement aux utilisateurs identifiés, sont des données sensibles et doivent être chiffrés au repos.
- **NFR3 (Gestion de Session)** : Les données de session des visiteurs anonymes (réponses au quiz, thème) doivent être purgées automatiquement après 24h d'inactivité.
- **NFR4 (Expérience Mobile)** : L'ensemble du parcours utilisateur (du Quiz au Dashboard) doit être conçu en priorité pour mobile ("Mobile First").
- **NFR5 (Architecture Stateless)** : L'orchestration LLM privilégie une approche "Stateless" pour supporter la charge sans nécessiter de fine-tuning par utilisateur.

### Exigences de Compatibilité (CR)

- **CR1** : Le format de sortie du texte doit respecter strictement les contraintes de mise en forme LinkedIn (sauts de ligne, listes, caractères spéciaux).

# 3. Objectifs de Design de l'Interface Utilisateur

### Vision UX Globale

L'expérience doit être celle d'une **"Découverte Ludique"** plutôt que celle d'un outil de productivité complexe. L'interface masque la complexité de l'IA derrière des interactions simples et fluides. Le maître-mot est la **"Révélation"** : faire progresser l'utilisateur d'un état de curiosité (Quiz) à un état de satisfaction (Révélation du post), avec une transition visuelle marquante ("Wow effect") lors du défloutage.

### Paradigmes d'Interaction Clés

- **Navigation Linéaire (Tunnel)** : Pour la phase d'acquisition, pas de menu complexe, l'utilisateur est guidé étape par étape.
- **Retour Haptique/Visuel** : Les curseurs de l'"Equalizer" doivent offrir une sensation de contrôle direct et physique sur le texte.
- **Feedback Immédiat** : Le flou du "Blurred Proof" doit laisser deviner la structure (paragraphes, listes) pour prouver que le travail est fait, sans donner la valeur textuelle.

### Écrans et Vues Cœurs

1. **Landing "Suspense"** : Minimaliste, centrée sur le sélecteur de thème pour lancer le quiz immédiatement.
2. **Interface de Quiz** : Questions une par une, avec barre de progression gamifiée.
3. **Vue "Blurred Preview"** : Le post généré mais flouté, avec le formulaire de capture email en superposition (overlay) ou en dessous.
4. **Dashboard Utilisateur** : Vue claire du post final (déflouté), zone de "Dropzone" pour le CV, et panneau latéral ou inférieur pour l'"Equalizer".
5. **Paywall "Choc"** : Une modal bloquante mais élégante qui apparaît à la 6ème tentative.

### Accessibilité

- **Niveau** : WCAG AA (Standard pour assurer la lisibilité et le contraste, notamment sur mobile).

### Branding

- **Style** : "Tech & Brut". Une esthétique qui reflète la promesse de "Rugosité". Typographie forte, contrastes élevés (Noir/Blanc/Accent), évitant le style "Corporate Blue" trop lisse de LinkedIn. Usage possible de textures légères (papier, grain) pour évoquer l'écriture humaine.

### Appareils et Plateformes Cibles

- **Priorité** : **Mobile First** (Web Responsive). La majorité des utilisateurs découvriront l'outil via un lien sur mobile. L'interface desktop est une adaptation de la version mobile, pas l'inverse.

# 4. Hypothèses Techniques

### Structure du Repository

- **Monorepo** : Recommandé pour maintenir la cohérence entre le Frontend (Next.js) et les fonctions Backend/API dans un seul dépôt, facilitant le déploiement et le partage de types.

### Architecture de Service

- **Full-Stack Serverless** : Architecture basée sur **Next.js** (hébergé sur Vercel).
    - **Frontend** : React/Next.js pour l'expérience SPA fluide et le rendu hybride.
    - **Backend** : API Routes (Next.js) ou Serverless Functions pour l'orchestration des appels LLM et la gestion métier.
    - **Base de Données** : PostgreSQL (Supabase) pour les profils utilisateurs et l'historique, plus adapté aux données relationnelles que du NoSQL ici.
    - **LLM** : Orchestration "Stateless" via API (Gemini) avec gestion dynamique des prompts systèmes.

### Exigences de Test

- **Unit + Integration** :
    - Tests Unitaires pour la logique métier critique (calcul des crédits, parsing CV).
    - Tests d'Intégration pour le flux critique (Quiz -> Génération -> Auth).
    - Pas de tests E2E lourds pour le MVP pour garder de la vélocité.

### Hypothèses et Requêtes Techniques Supplémentaires

- **Framework Web** : Next.js (16.x).
- **Langage** : TypeScript (Strict mode) pour la robustesse.
- **Styling** : Tailwind CSS pour la rapidité de développement et la cohérence du design system.
- **Auth** : Authentification sans mot de passe ("Magic Link" / OTP) obligatoire pour réduire la friction.
- **Stockage Fichiers** : Stockage objet (Supabase Storage) sécurisé pour les CVs, avec politiques d'expiration automatique pour les fichiers temporaires si nécessaire.
- **Orchestration LLM** : Utilisation de modèles performants et rapides (ex: Gemini 2.5 flash ou Claude 3 Haiku) pour garantir les temps de réponse <15s tout en maîtrisant les coûts.
- **Paiement** : Stripe Checkout en mode hébergé pour minimiser le code de gestion des paiements et assurer la conformité PCI.

# 5. Liste des Epics

1. **Epic 1 : Fondation & Tunnel Public (Acquisition)**
    
    *Objectif : Mettre en place l'infrastructure Next.js/Supabase, déployer la Landing Page, et implémenter le moteur de Quiz public avec génération "Floutée" (sans Auth).*
    
    *Valeur : Permet de tester immédiatement l'intérêt (Lead Magnet) et la performance du LLM sans barrière à l'entrée.*
    
2. **Epic 2 : Conversion & Identité (Révélation)**
    
    *Objectif : Implémenter le système d'authentification "Magic Link", la création de compte, et la mécanique de "Révélation" (défloutage) du post.*
    
    *Valeur : Transforme les visiteurs curieux en utilisateurs inscrits (Lead Capture) et livre la promesse de valeur.*
    
3. **Epic 3 : Dashboard & Personnalisation (Engagement)**
    
    *Objectif : Développer le Dashboard utilisateur, l'Equalizer de Style (régénération) et l'historique des posts.*
    
    *Valeur : Fidélise l'utilisateur en lui donnant le contrôle sur sa "Rugosité" et transforme l'outil en un assistant récurrent.*
    
4. **Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)**
    
    *Objectif : Intégrer l'upload et le parsing de CV (RAG), l'injection de faits dans la génération, et le système de quota/Paiement Stripe.*
    
    *Valeur : Délivre la différenciation majeure (Expertise réelle) et active le modèle économique.*
    

---

# 6. Détails de l'Epic 1 : Fondation & Tunnel Public (Optimisé INVEST)

### Story 1.1 : Initialisation Socle Technique & Déploiement

**En tant que** Développeur,

**Je veux** déployer une application "Hello World" Next.js 16 sur Vercel avec le setup TypeScript/Tailwind,

**Afin de** valider la chaîne de CI/CD et l'accessibilité publique dès le début.

**Type** : Tech Enabler (Nécessaire pour toute valeur future)

**INVEST Check** :

- **I** : Indépendant de tout fonctionnel.
- **S** : Très petit (Setup + Push).
- **V** : Valeur immédiate (Environnement de prod prêt).
    
    **Critères d'Acceptation** :
    
1. Repo initialisé et accessible.
2. Déploiement Vercel actif sur URL publique.
3. La page d'accueil affiche un titre statique stylisé avec Tailwind.

### Story 1.2 : Landing Page Statique & Navigation

**En tant que** Visiteur,

**Je veux** voir la proposition de valeur et cliquer sur "Démarrer" pour accéder à l'écran de Quiz (vide pour l'instant),

**Afin de** comprendre ce que propose le site et initier le parcours.

**Type** : Feature

**INVEST Check** :

- **I** : Ne dépend pas du backend ou du moteur de quiz.
- **S** : Focus uniquement sur la Home et le routing.
    
    **Critères d'Acceptation** :
    
1. UI Landing Page implémentée (Mobile First).
2. Composant de sélection de thème (Input simple).
3. Clic sur "Démarrer" redirige vers /quiz avec le thème en URL query param.

### Story 1.3 : Moteur de Quiz avec Données Mockées (Frontend Only)

**En tant que** Visiteur,

**Je veux** parcourir les questions du quiz et voir ma progression, même si les questions sont statiques pour l'instant,

**Afin de** valider l'expérience utilisateur et la fluidité de l'interface.

**Type** : Feature

**INVEST Check** :

- **I** : Indépendant du Backend LLM (utilise un fichier JSON mocké).
- **V** : Permet de valider l'UX/UI sans attendre l'API.
    
    **Critères d'Acceptation** :
    
1. Le Quiz charge un set de questions depuis un fichier local.
2. Transition fluide entre les questions.
3. Barre de progression fonctionnelle.
4. À la fin, affiche un écran "En attente de résultat".

### Story 1.4 : API de Génération de Questions (Backend Only)

**En tant que** Développeur (via Postman/Curl),

**Je veux** appeler l'API /api/quiz/generate avec un thème et recevoir un JSON de questions générées par Gemini,

**Afin de** valider la logique de prompt et la structure de données avant l'intégration.

**Type** : Backend API

**INVEST Check** :

- **I** : Indépendant de l'interface utilisateur.
- **V** : Valide la "brique intelligente" du système.
    
    **Critères d'Acceptation** :
    
1. Endpoint API fonctionnel et sécurisé.
2. Prompt Système Gemini implémenté pour générer 6+5 questions.
3. Retourne un JSON valide respectant le schéma attendu par le front.
4. Temps de réponse acceptable (<5s).

### Story 1.5 : Intégration Quiz Dynamique

**En tant que** Visiteur,

**Je veux** que le Quiz affiche désormais les vraies questions générées par l'IA selon mon thème,

**Afin de** vivre l'expérience personnalisée réelle.

**Type** : Integration

**INVEST Check** :

- **I** : Dépend de 1.3 et 1.4, mais livre la valeur combinée.
- **S** : Focus uniquement sur le branchement (Fetch API & State).
    
    **Critères d'Acceptation** :
    
1. Le Frontend appelle l'API 1.4 au lieu du fichier Mock.
2. Gestion des états de chargement (Skeletons/Spinners) pendant la génération.
3. Gestion des erreurs (ex: fallback sur questions statiques si API down).

### Story 1.6 : Saisie du Sujet & Génération de Post Flouté

**En tant que** Visiteur ayant terminé le Quiz,

**Je veux** préciser le sujet ou l'idée clé de mon premier post avant de lancer la génération,

**Afin de** voir un résultat concret sur un sujet qui m'intéresse vraiment, même s'il est flouté.

**Type** : Feature UI + Backend

**INVEST Check** :

- **I** : Indépendant de l'Auth (toujours en mode anonyme).
- **S** : Combine l'input utilisateur et l'appel de génération.
- **V** : Augmente la pertinence du "Teaser" (c'est *mon* sujet, écrit avec *mon* style).
    
    **Critères d'Acceptation** :
    
1. À la fin du quiz, affichage d'un écran intermédiaire "De quoi voulez-vous parler ?".
2. Champ de saisie texte (ex: "L'importance de l'échec", "Mon nouveau job").
3. Bouton "Générer ma signature" qui déclenche l'appel API /api/post/generate avec : le profil quiz + le sujet saisi.
4. Affichage du résultat avec classe CSS blur-sm et overlay "Révéler".

## 7. Détails de l'Epic 2 : Conversion & Identité (Optimisé INVEST)

**Objectif de l'Epic** : Implémenter l'authentification "Magic Link", la création de compte et la "Révélation" du post, transformant l'intérêt en acquisition.

### Story 2.1 : Configuration Base de Données & Schéma Utilisateur

**En tant que** Développeur,

**Je veux** configurer Supabase et définir le schéma de données users et posts,

**Afin de** pouvoir persister les comptes et sauvegarder le contenu généré.

**Type** : Tech Enabler / Backend

**INVEST Check** :

- **I** : Indépendant du frontend.
- **S** : Focus sur la structure de données.
- **V** : Fondation nécessaire pour la rétention.
    
    **Critères d'Acceptation** :
    
1. Projet Supabase configuré (Dev/Prod).
2. Table users créée (email, id, credits_count, created_at).
3. Table posts créée (user_id, content, theme, answers_json, is_revealed, profile_context).
4. Politiques RLS (Row Level Security) appliquées : un user ne voit que ses posts.

### Story 2.2 : Authentification par Magic Link (Backend & SDK)

**En tant que** Développeur,

**Je veux** implémenter la logique d'envoi et de vérification de Magic Link via Supabase Auth,

**Afin de** permettre une connexion sécurisée sans mot de passe.

**Type** : Backend / Logic

**INVEST Check** :

- **I** : Indépendant de l'UI de la modal.
- **V** : Cœur de la sécurité.
    
    **Critères d'Acceptation** :
    
1. Configuration du provider Email (Magic Link) dans Supabase.
2. Fonction utilitaire front signInWithOtp(email) implémentée.
3. Redirection correcte après clic sur le lien email (gestion du callback URL).

### Story 2.3 : Modal de Capture & Déclenchement Auth

**En tant que** Visiteur face à son post flouté,

**Je veux** saisir mon email dans une modal pour débloquer le contenu,

**Afin de** recevoir mon lien de connexion.

**Type** : Feature UI

**INVEST Check** :

- **I** : Peut être testé avec un mock d'auth.
- **S** : Focus sur l'interaction utilisateur.
    
    **Critères d'Acceptation** :
    
1. Clic sur "Révéler" ouvre une modal ou un formulaire inline.
2. Validation du format de l'email.
3. Feedback visuel après soumission ("Lien envoyé, vérifiez votre boîte mail").
4. État d'attente ("Polling" ou attente de redirection).

### Story 2.4 : Flux de Révélation & Persistance Post-Inscription

**En tant que** Nouvel Utilisateur (venant de cliquer sur le Magic Link),

**Je veux** être redirigé vers mon post désormais déflouté et sauvegardé,

**Afin de** consommer la valeur promise.

**Type** : Integration / UX

**INVEST Check** :

- **I** : Connecte l'Auth (2.2) et la Base de données (2.1).
- **V** : Moment de vérité (Aha Moment).
    
    **Critères d'Acceptation** :
    
1. Au retour de l'auth, le système détecte le contexte du post temporaire (via localStorage ou paramètre).
2. Création automatique du compte user en base.
3. Sauvegarde du post généré dans la table posts lié à ce user.
4. Affichage de la vue "Dashboard" avec le post en clair (sans flou).

### Story 2.5 : Vue "Post Révélé" (Composant d'Affichage)

**En tant que** Utilisateur Connecté venant d'être redirigé,

**Je veux** voir mon post affiché clairement (sans flou) au centre de l'écran,

**Afin de** pouvoir enfin lire le résultat de ma génération.

**Type** : Feature UI

**INVEST Check** :

- **I** : Indépendant du Layout global complexe.
- **S** : Focus uniquement sur le composant "Card" du post (Typo, spacing).
- **V** : Boucle le flux de révélation immédiatement.
    
    **Critères d'Acceptation** :
    
1. Route /dashboard accessible uniquement aux connectés.
2. Affiche le post courant dans un conteneur simple centré.
3. Le texte est lisible, formatté (sauts de ligne respectés) et copiable.
4. (Pas de sidebar ni de menus complexes à ce stade, juste le contenu et un header minimal "Déconnexion").

---

## 8. Détails de l'Epic 3 : Dashboard & Personnalisation (Engagement)

**Objectif de l'Epic** : Fidéliser l'utilisateur en lui donnant le contrôle sur sa "Rugosité" (Equalizer) et en lui fournissant un espace de travail personnel (Dashboard).

### Story 3.1 : Shell Applicatif & Layout Dashboard

**En tant que** Utilisateur régulier,

**Je veux** naviguer dans une interface structurée qui organise mon espace de travail (Zone principale + Outils),

**Afin de** accéder facilement à toutes les fonctionnalités futures (Historique, Equalizer).

**Type** : UI Architecture

**INVEST Check** :

- **I** : Vient *wrapper* (englober) le composant créé en 2.5.
- **S** : Focus sur la structure CSS/Grid responsive.
- **V** : Prépare l'ergonomie pour les outils avancés.
    
    **Critères d'Acceptation** :
    
1. Mise en place du Layout global : Header, Sidebar (collapsible sur mobile), Main Content.
2. Intégration du composant "Vue Post" (de la story 2.5) dans la zone "Main Content".
3. Le Layout est responsive (Mobile: Menu burger ou Tabs inférieurs / Desktop: Sidebar latérale).
4. Zone placeholder vide pour les futurs outils (Equalizer, Historique).

---

### Story 3.2 : Implémentation de l'Equalizer de Style (UI)

**En tant que** Utilisateur,

**Je veux** manipuler des curseurs visuels (Ton, Longueur, Densité) pour ajuster mes préférences,

**Afin de** contrôler la nuance de mon contenu.

**Type** : UI Component

**INVEST Check** :

- **I** : Indépendant de l'API de régénération (peut juste logger les valeurs).
- **S** : Focus sur le composant React (Sliders).
    
    **Critères d'Acceptation** :
    
1. Composant "Equalizer" avec 3-4 sliders nommés (ex: "Ton: Doux <-> Rugueux", "Longueur: Court <-> Long").
2. Les valeurs sont capturées dans le state local.
3. Feedback visuel lors du changement de valeur.

### Story 3.3 : Régénération de Post via Equalizer (Logique)

**En tant que** Utilisateur,

**Je veux** que mon post se réécrive lorsque je valide mes réglages d'Equalizer,

**Afin de** voir l'impact de mes ajustements sur le style.

**Type** : Feature / AI

**INVEST Check** :

- **I** : Connecte l'UI 3.2 au Backend LLM.
- **V** : Apporte la valeur de personnalisation.
    
    **Critères d'Acceptation** :
    
1. Bouton "Appliquer / Régénérer" (ou debounce sur les sliders).
2. Appel API /api/post/regenerate avec : ID du post + nouvelles valeurs Equalizer.
3. Le LLM génère une nouvelle version en prenant en compte les "System Instructions" modifiées par les sliders.
4. Le post affiché est mis à jour et sauvegardé comme nouvelle version (ou remplace l'ancienne).
5. Les régénérations sont limités à 10 par heure et ne sont pas décomptées des crédits

### Story 3.4 : Historique des Posts (Sidebar)

**En tant que** Utilisateur,

**Je veux** voir la liste de mes générations précédentes et pouvoir cliquer pour les recharger,

**Afin de** ne pas perdre mes meilleures idées.

**Type** : Feature

**INVEST Check** :

- **I** : Indépendant de la génération.
- **S** : Lecture simple de la base de données.
    
    **Critères d'Acceptation** :
    
1. Sidebar (ou Drawer mobile) listant les titres des posts (basé sur le sujet ou les premiers mots).
2. Tri chronologique inverse (plus récent en haut).
3. Clic sur un item charge le contenu dans la zone principale.

### Story 3.5 : Création de Nouveau Post (Depuis Dashboard)

**En tant que** Utilisateur,

**Je veux** pouvoir lancer une nouvelle génération sur un nouveau sujet depuis mon Dashboard,

**Afin de** continuer à produire du contenu après mon premier essai.

**Type** : Feature

**INVEST Check** :

- **I** : Réutilise la logique de génération existante.
- **V** : Encourage la rétention.
    
    **Critères d'Acceptation** :
    
1. Bouton "Nouveau Post" visible.
2. Ouvre une modal ou zone de saisie "Sujet".
3. Déclenche la génération standard et ajoute le résultat à l'historique.
4. (Note : Le décompte des crédits sera géré dans l'Epic 4, ici c'est illimité ou mocké).

## 9. Détails de l'Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

**Objectif de l'Epic** : Intégrer l'upload et le parsing de CV (RAG), l'injection de faits dans la génération pour l'ancrage d'expertise, et activer le modèle économique (Quotas/Paiement) pour la viabilité business.

### Story 4.1 : Upload & Stockage Sécurisé de CV

**En tant que** Utilisateur Connecté,

**Je veux** uploader mon CV (PDF/TXT) via une zone de dépôt,

**Afin de** fournir à l'IA le contexte de mon expérience professionnelle.

**Type** : Backend / Feature

**INVEST Check** :

- **I** : Indépendant du parsing ou de la génération.
- **S** : Focus sur l'upload fichier et sécurité.
- **V** : Première étape de la personnalisation avancée.
    
    **Critères d'Acceptation** :
    
1. Zone "Drag & Drop" dans le Dashboard.
2. Upload vers Supabase Storage dans un bucket privé (RLS activé : user only).
3. Validation du type (PDF/TXT uniquement) et de la taille (<5Mo).
4. Feedback visuel de succès/échec de l'upload.

### Story 4.2 : Parsing CV & Extraction (Service RAG)

**En tant que** Système,

**Je veux** extraire le texte brut du fichier uploadé et le structurer minimalement,

**Afin de** le rendre consommable par le LLM.

**Type** : Backend

**INVEST Check** :

- **I** : Indépendant de l'upload (déclenché par événement ou API).
- **S** : Focus sur la transformation Fichier -> Texte.
    
    **Critères d'Acceptation** :
    
1. Fonction backend (Edge Function ou API Route) qui lit le fichier.
2. Utilisation d'une librairie de parsing PDF (ex: pdf-parse) pour extraire le texte.
3. Nettoyage basique (suppression caractères spéciaux bizarres).
4. Stockage du texte extrait (ou d'un résumé structuré par LLM) dans la table users (champ profile_context).
5. (Optionnel MVP) : Pas de vectorisation complexe, on stocke le texte brut ou résumé car la fenêtre de contexte Gemini 2.5 Flash est large.

### Story 4.3 : Génération avec Ancrage Factuel (Injection)

**En tant que** Utilisateur avec un CV uploadé,

**Je veux** que mes générations utilisent automatiquement des faits de mon parcours,

**Afin de** produire du contenu qui prouve mon expertise réelle.

**Type** : AI / Feature

**INVEST Check** :

- **I** : Modifie le prompt de génération existant.
- **V** : Délivre la promesse "Ancrage Factuel".
    
    **Critères d'Acceptation** :
    
1. Mise à jour de l'API /api/post/generate et /regenerate.
2. Si profile_context existe, injection dans le System Prompt : "Utilise le contexte suivant pour ancrer le post dans la réalité de l'utilisateur : [Contexte]".
3. Le post généré cite explicitement une expérience ou compétence du CV pertinente pour le sujet.

### Story 4.4 : Compteur de Crédits & Hard Paywall (Logique)

**En tant que** Product Owner,

**Je veux** bloquer la génération si l'utilisateur a consommé ses 5 crédits gratuits,

**Afin de** forcer la conversion vers le payant.

**Type** : Business Logic

**INVEST Check** :

- **I** : Indépendant du paiement (bloque juste).
- **V** : Protège les coûts et pousse à l'achat.
    
    **Critères d'Acceptation** :
    
1. Champ credits_count décrémenté à chaque génération réussie.
2.  Les "Régénérations" (Equalizer) sur un *même* post coûtent 0 crédit 
3. API Check : Si credits_count <= 0, l'API retourne une erreur 402 ou 403 "Quota Exceeded".
4. Frontend : Affiche le solde restant (ex: "2/5 posts restants").
5. Frontend : Si solde 0, bouton "Générer" désactivé et remplacé par "Passer Premium".

### Story 4.5 : Intégration Stripe Checkout (Paiement)

**En tant que** Utilisateur bloqué,

**Je veux** cliquer sur "Passer Premium", payer par carte et être débloqué instantanément,

**Afin de** continuer à utiliser l'outil.

**Type** : Integration

**INVEST Check** :

- **I** : Connecte le bouton au service de paiement.
- **V** : Génère du revenu.
    
    **Critères d'Acceptation** :
    
1. Bouton "Upgrade" redirige vers une URL Stripe Checkout (Session hébergée).
2. Webhook Stripe configuré pour écouter l'événement checkout.session.completed.
3. À réception du webhook, mise à jour du user : is_premium = true (ou credits = 9999).
4. Redirection utilisateur vers Dashboard avec message de succès et crédits débloqués.