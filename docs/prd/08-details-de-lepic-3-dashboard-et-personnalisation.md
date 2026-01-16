# 08. Détails de l'Epic 3 : Dashboard & Personnalisation (Engagement)

**Objectif de l'Epic** : Fidéliser l'utilisateur en lui donnant le contrôle sur sa "Rugosité" (Equalizer) et en lui fournissant un espace de travail personnel (Dashboard).

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
