# Story 1.11 : Final Flow Patch & Hard Gate

**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](epic-1-acquisition.md)

**Statut :** Completed
**Date de création :** 2026-01-22

## Description

**En tant que** Product Owner,
**Je veux** corriger des éléments critiques du flow final (Loading, Prompts) et introduire un "Hard Gate" email,
**Afin de** garantir la qualité des contenus générés et capturer les leads avant la révélation de la valeur finale.

**Type :** Hotfix / Feature
**INVEST:**
- **Independent:** Modifie des comportements existants spécifiques.
- **Valuable:** Crucial pour la rétention (qualité) et la conversion (email).
- **Small:** Changements ciblés sur des composants existants.

## Critères d'Acceptation

### 1. UX Loading (Clean Terminal)
- [x] **Suppression Texte :** Sur l'écran d'attente du profil augmenté, le texte "CALIBRATION DES 9 DIMENSIONS"  doit être **supprimé**.
- [x] **Reste :** Seul le composant Terminal (Logs défilants) doit être visible pour une immersion maximale.

### 2. Qualité Prompt (Backend)
- [x] **System Prompt Update :** Modifier le System Prompt utilisé pour la génération des questions (Phase 1 & 2).
- [x] **Consigne Stricte :** Ajouter la consigne : "Générer des fragments de texte type post LinkedIn sur le thème choisi. NE JAMAIS générer de questions posées à l'utilisateur."
- [x] **Validation :** Vérifier que les outputs ne sont plus des interrogations mais bien des affirmations/fragments de style.

### 3. UX Génération Post (Full Focus)
- [x] **Masquage Profil :** Au clic sur le bouton "Générer" (après avoir entré le sujet), l'écran du Profil Augmenté doit disparaitre complètement.
- [x] **Interstitiel :** Afficher un écran interstitiel (Terminal + Logs) en **plein écran** pendant la génération du post. Plus de superposition ou de scroll.

### 4. Gating Email (Hard Gate)
- [x] **Déclenchement :** Une fois le post généré (sur la page de résultat).
- [x] **Affichage & Layout :** L'affichage du post (flouté) et le layout global de la page **ne changent pas**.
- [x] **Blocage (Modifications UI) :**
    - **Supprimer** le bouton "Fermer" (X) ou tout moyen de fermer la vue.
    - **Supprimer** le bouton "Retour".
- [x] **Contenu Gate :**
    - Ajouter/Afficher le champ Email + Bouton de validation.
    - Message obligatoire : "Entrez votre email pour sauvegarder votre post et le découvrir en entier".
    - L'utilisateur DOIT entrer son email pour voir le résultat (Défloutage ou accès complet).

## Tâches Techniques

1.  **Frontend (UX Loading & Generation) :**
    - Modifier `components/feature/final-reveal.tsx` (ou le composant parent) pour gérer l'état `isGenerating`.
    - Si `isGenerating` est true, afficher uniquement `LoaderMachine` en plein écran.
    - Supprimer le titre dans la vue de loading du profil augmenté.

2.  **Backend (Prompts) :**
    - Modifier `app/api/quiz/generate/route.ts` (ou `lib/gemini.ts` selon où est construit le prompt).
    - Injecter la consigne restrictive dans le `systemInstruction`.

3.  **Frontend (Gating) :**
    - Modifier le flux de succès de la génération de post.
    - Créer un état `showEmailGate` qui s'active à la fin de la génération au lieu d'afficher le post.
    - Implémenter le UI du Gate (Input + Btn + Message).
    - Connecter (mock pour l'instant ou stockage local/log) la soumission de l'email pour débloquer l'affichage du post (`showPost`).

## Definition of Done
- [x] Plus de questions dans les cartes de quiz.
- [x] Le loading est épuré (Terminal only).
- [x] La génération cache bien tout le reste.
- [x] Impossible de voir le post sans email (Test manuel de contournement UI simple).
