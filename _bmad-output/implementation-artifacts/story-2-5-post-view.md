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

## Notes Techniques / Tâches Détaillées

- **Middleware d'Authentification** :
  - Appliquer le middleware Next.js sur la route `/dashboard` (ou la route choisie) pour valider la session utilisateur.
  - Utiliser le client Supabase côté serveur pour vérifier la session.
- **Data Fetching (Server-Side)** :
  - Créer une fonction `async` dans le `page.tsx` pour récupérer le dernier post de l'utilisateur.
  - Requête Supabase : `select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)`.
  - Gérer le cas où aucun post n'est trouvé et passer cette information au composant client.
- **Composant Client `PostRevealView`** :
  - **Gestion de l'animation** :
    - Recevoir les données du post en props.
    - Utiliser un état local `isRevealed`, initialisé à `false`.
    - Utiliser `useEffect` pour passer `isRevealed` à `true` après un court délai (`setTimeout` de ~100ms) pour garantir le rendu initial flouté.
    - Appliquer les classes CSS conditionnelles : `blur-sm` si `isRevealed` est `false`, `blur-0` si `true`. Ajouter une classe `transition-all duration-1000` pour l'animation.
  - **Implémentation du "Copy to Clipboard"** :
    - Créer un hook custom `useCopyToClipboard` pour encapsuler la logique `navigator.clipboard.writeText`.
    - Le hook doit gérer un état "copied" qui revient à `false` après quelques secondes.
    - Le bouton affichera "COPIÉ !" quand l'état est `true`.
  - **Styling (Tailwind)** :
    - `Card` : `bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000]`
    - `Bouton Primaire` : `bg-black text-white rounded-none h-12`
    - `Header` : Mettre en place un layout simple avec le logo et le bouton de déconnexion.

## Assurance Qualité

- **Analyse des Risques** : [Risk Profile for Story 2.5](../qa/assessments/2.5-risk-profile.md)
- **Plan de Test** : [Test Design for Story 2.5](../qa/assessments/2.5-test-design.md)
- **Document de Référence** : [QA Gate: Story 2.5 - Vue "Post Révélé"](../qa/gates/2.5-post-view.md)
