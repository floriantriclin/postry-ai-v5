# Story 2.5 : Vue "Post Révélé" (Composant d'Affichage)

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Utilisateur Connecté venant d'être redirigé,
**Je veux** voir mon post affiché clairement (sans flou) au centre de l'écran,
**Afin de** pouvoir enfin lire le résultat de ma génération.

**Type :** Feature UI

## Critères d'Acceptation

1.  **Route Protégée** : La route `/dashboard` (ou `/post`) est accessible uniquement aux utilisateurs authentifiés.
2.  **Affichage Net** : Affiche le post courant sans aucun effet de flou (blur-0).
3.  **Mise en page** : Conteneur simple, centré, avec une typographie optimisée pour la lecture.
4.  **Formatage** : Le texte respecte les sauts de ligne d'origine (pre-wrap).
5.  **Interactions** : Un bouton "Copier" permet de mettre le texte dans le presse-papier.
6.  **Navigation Minimale** : Header minimal avec un bouton "Déconnexion".

## Notes Techniques / Tâches

- **Auth** : Utiliser le `middleware.ts` ou une vérification `getServerSession` pour protéger la route.
- **Data Fetching** : Récupérer le dernier post de l'utilisateur depuis Supabase (filtré par `user_id` et trié par `created_at DESC`).
- **UI Component** : Créer un composant `PostDisplay` réutilisable pour le rendu du texte.
- **Copy Logic** : Utiliser l'API `navigator.clipboard.writeText` pour la fonctionnalité de copie.
- **SignOut** : Implémenter le `signOut` de `next-auth/react` dans le header.
