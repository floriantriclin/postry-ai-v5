# Story 2.5 : Vue "Post Révélé" & Dashboard Initial

**Parent Epic:** [Epic 2 : Conversion & Identité (Révélation)](../epics/epic-2-conversion.md)

## Description

**En tant que** Utilisateur Connecté (venant de la validation Magic Link),
**Je veux** accéder à mon tableau de bord privé et voir mon post "déflouté" avec une animation dramatique,
**Afin de** consommer la valeur promise et de pouvoir utiliser mon contenu.

**Type :** Feature UI / UX

## Critères d'Acceptation

1.  **Route Protégée** : La route `/dashboard` est créée et protégée par middleware (redirection vers `/` si non-authentifié).
2.  **Animation de Révélation (The Wow Effect)** :
    - Au premier chargement après inscription, le post apparaît d'abord flouté (`blur-sm`).
    - Une transition fluide (CSS `filter` transition, ~1s) retire le flou pour révéler le texte net.
3.  **Design "Tech & Brut"** :
    - Le post est contenu dans une `Card` neo-brutaliste : `bg-white`, `border-2 border-black`, sans arrondi (`rounded-none`).
    - Utilisation d'une ombre dure (`box-shadow: 4px 4px 0px 0px #000`).
    - Typographie : `font-mono` pour les métadonnées (thème, date) et `font-sans` (Inter) pour le corps du post.
4.  **Affichage du Contenu** :
    - Le texte respecte strictement le formatage d'origine (`whitespace-pre-wrap`).
    - Les métadonnées du post (Thème choisi, Archétype détecté) sont visibles en haut de la carte.
5.  **Actions Rapides** :
    - Bouton **[ COPIER LE TEXTE ]** (Style Primary : Noir, texte blanc, sans arrondi).
    - Feedback visuel immédiat lors de la copie (changement temporaire du label en "COPIÉ !").
6.  **Shell Applicatif (Initial)** :
    - Header minimaliste avec Logo (cliquable vers `/dashboard`).
    - Bouton de déconnexion fonctionnel.
7.  **Gestion des États** :
    - **Loading** : Utiliser le `LoaderMachine` (style terminal) pendant la récupération des données.
    - **Empty State** : Si aucun post n'est trouvé, afficher un message "Aucun post généré" avec un bouton pour retourner au quiz.

## Notes Techniques / Tâches

- **Auth** : S'assurer que le `user_id` est correctement récupéré via la session Supabase/NextAuth.
- **Data Fetching** : Requête Supabase sur la table `posts` : `.select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)`.
- **Composant `PostDisplay`** :
    - Gérer la transition de flou via un état local `isRevealed` (déclenché au `useEffect` de montage).
- **Clipboard API** : Utiliser `navigator.clipboard.writeText`.
- **Navigation** : Préparer la structure pour accueillir l'Equalizer (Story 3.1) sans tout casser.

## QA & Risques

- **Risque** : Flash de contenu non flouté avant l'animation.
- **Solution** : Initialiser l'état local `isRevealed` à `false`.
- **Test** : Vérifier que le bouton "Copier" fonctionne sur mobile (Permissions API).
