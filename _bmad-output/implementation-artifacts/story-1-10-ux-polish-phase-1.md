# Story 1.10 : UX Polish & Wording Refinements (Phase 1)

**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)

**Statut :** Done
**Date de création :** 2026-01-22

## Description

**En tant que** Product Owner,
**Je veux** appliquer un ensemble de raffinements UX et de corrections de wording sur le tunnel d'acquisition (Landing -> Quiz -> Reveal),
**Afin de** renforcer l'immersion "Tech & Brut", harmoniser le ton (vouvoiement, professionnalisme) et fluidifier le parcours utilisateur avant le lancement de la phase de conversion.

**Type :** Refinement / UI Polish
**INVEST:**
- **Independent:** Peut être réalisé indépendamment du backend (principalement frontend).
- **Valuable:** Améliore la perception de qualité et réduit la friction cognitive.
- **Small:** Un ensemble de petites tâches UI/Content.

## Critères d'Acceptation

### 1. Landing Page
- [x] **Accroche :** Modifier le sous-titre pour : "Découvrez quel genre d’auteur vous êtes en 2 minutes" (Suppression de la mention spécifique "LinkedIn").
- [x] **CTA :** Modifier le libellé du bouton principal pour retirer les crochets : "DÉTERMINER MON STYLE" (au lieu de "[ DÉTERMINER MON STYLE ]").

### 2. Page Consigne (Interstitiel)
- [x] **Wording Consigne :** Remplacer le texte explicatif par la version suivante exacte :
    > "Nous allons commencer par une phase de calibration rapide pour identifier votre ADN rédactionnel.
    > Le principe est simple : pour chaque étape, deux options d'écriture vous seront présentées. Votre mission est de choisir celle qui résonne le plus avec votre propre voix — celle que vous auriez pu signer de votre main.
    > Il ne s'agit pas de juger la qualité du texte, mais de saisir la nuance, le rythme et le ton qui vous sont naturels.
    > ⚠️ Répondez spontanément. Il n’y a pas de bonne ou de mauvaise réponse, seulement le reflet de votre style unique."
- [x] **Animation d'Attente :** Remplacer le message statique "Initialisation" par une animation "Computer Thinking".
    - Le composant doit faire défiler plusieurs messages de logs système (ex: "Calibrating sensors...", "Loading archetype database...", "Initializing neural link...") pour simuler une réflexion machine.

### 3. Questions A/B Phase 1 (Calibration)
- [x] **Instruction :** Remplacer le label "Que préférez-vous" au-dessus des cartes par "Choisissez la version que vous auriez pu écrire".
- [x] **Progression :** Remplacer l'indicateur numérique (ex: "1/6") par une **Barre de Progression** visuelle minimaliste (Style Brut, remplissage noir).

### 4. Résultat Intermédiaire (Archétype)
- [x] **Titre :** Remplacer "Résultat intermédiaire" par "Votre ADN rédactionnel".
- [x] **Ton :** Passer toutes les définitions d'archétype au **vouvoiement** (ex: "Votre ton est docte" au lieu de "Ton ton est docte").
    - *Action technique :* Mettre à jour `lib/data/mock-quiz.json` (si utilisé) et vérifier les prompts de génération si dynamique.
- [x] **Visuel :** Harmoniser le cadre visuel (padding, bordures) avec celui du Profil Augmenté final pour une cohérence graphique.

### 5. Questions A/B Phase 2 (Affinage)
- [x] **Instruction :** Remplacer le texte "Que préférez-vous ?" par "Choisissez la version que vous auriez pu écrire".
- [x] **Progression :** Remplacer le pourcentage textuel par une **Barre de Progression** visuelle (qui continue celle de la Phase 1 ou redémarre, à définir - UX: redémarre pour cette phase).

### 6. Profil Augmenté (Final Reveal)
- [x] **Animation d'Attente :** Utiliser la même animation "Computer Thinking" (messages défilants) que pour la page Consigne avant l'affichage du résultat.
- [x] **Titre :** Modifier le titre pour "Votre profil augmenté".
- [x] **Sous-titre :** Ajouter "Vous êtes…" en plus petit que l'archétype, juste avant le nom de l'archétype.
- [x] **Responsive Fix :** Corriger le bug d'affichage sur mobile où le bouton couvre la phrase "De quoi voulez vous parler ?". Assurer un espacement suffisant (margin-bottom) pour l'input.

## Tâches Techniques

1.  **UI Components :**
    - Créer `components/ui/loader-machine.tsx` pour l'animation de logs défilants.
    - Créer/Modifier `components/ui/progress-bar.tsx` pour le style Néo-Brut.

2.  **Content Updates :**
    - Mettre à jour les constantes de texte dans `app/landing-client.tsx` (ou équivalent).
    - Mettre à jour `components/feature/quiz-interstitial.tsx`.
    - Mettre à jour les labels dans `components/feature/quiz-engine.tsx`.
    - Mettre à jour les descriptions dans `lib/data/mock-quiz.json` (Vouvoiement).

3.  **Layout Refactor :**
    - Ajuster le CSS de `components/feature/final-reveal.tsx` pour le responsive.
    - Ajuster le CSS de `components/feature/archetype-transition.tsx` pour l'harmonisation visuelle.

## Definition of Done
- [x] Tous les textes sont conformes aux demandes (Vouvoiement, Wording exact).
- [x] Les animations de chargement "Machine" sont fluides et renforcent le style "Tech".
- [x] Les barres de progression remplacent les compteurs numériques.
- [x] Le responsive du Profil Augmenté est validé sur mobile (Pas de chevauchement).
- [x] Le code respecte les standards (Tailwind, pas de style inline, composants atomiques).
