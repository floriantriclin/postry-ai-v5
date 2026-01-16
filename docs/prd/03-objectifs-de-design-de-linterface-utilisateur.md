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
