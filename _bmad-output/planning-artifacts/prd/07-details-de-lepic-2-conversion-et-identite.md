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
