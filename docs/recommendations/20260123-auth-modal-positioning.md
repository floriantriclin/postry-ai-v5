# Recommandation UX : Positionnement de la Modale d'Authentification

**Date :** 23/01/2026
**Auteur :** Product Owner
**Concerne :** Story 2-3: Auth Modal

## Problème

Lors de l'affichage de la "Preuve Floutée" (Blurred Proof), la modale de saisie d'email pour l'authentification se superpose actuellement au texte qui est encore lisible (titres, structure).

## Recommandation

Pour renforcer l'expérience utilisateur et la logique de "révélation", il est recommandé de modifier le positionnement de la modale d'authentification.

**La modale doit se superposer directement sur le texte qui est flouté et donc illisible.**

### Justification

1.  **Cohérence du Parcours :** Le principe est de montrer une "preuve" de valeur (le texte structuré mais illisible) pour inciter à l'action (saisir son email). En plaçant la modale sur la partie illisible, on crée une barrière directe à la lecture du contenu convoité, ce qui rend l'appel à l'action plus logique et plus fort.
2.  **Focus Visuel :** L'utilisateur tente de lire le texte flouté. Placer la modale à cet endroit précis capture son attention au moment exact où il ressent la frustration de ne pas pouvoir accéder au contenu.
3.  **Clarté de l'Interface :** Cela évite de masquer les seuls éléments de contexte dont dispose l'utilisateur (la structure visible du post).

## Action Requise

Modifier les styles CSS ou la logique de positionnement du composant `AuthModal` pour qu'il s'affiche au centre de la zone de contenu textuel flouté.

### Détails d'Implémentation pour le Développeur

*   **Composant Cible :** [`components/feature/auth-modal.tsx`](../../components/feature/auth-modal.tsx)
*   **Contexte d'Intégration :** Le composant `AuthModal` est intégré dans la vue `FinalReveal` (`components/feature/final-reveal.tsx`), qui est responsable de l'affichage du post flouté comme décrit dans la [Story 1.9](./../stories/story-1-9-initial-post-generation.md).
*   **Zone de Positionnement :** La modale doit être centrée sur la **"Zone Post (Centre)"** définie dans la Story 1.9, qui contient le contenu textuel rendu illisible. L'objectif est de masquer la partie floutée, et non les titres clairs.
*   **Référence Story Auth Modal :** La logique générale de la modale est décrite dans la [Story 2.3](./../stories/story-2-3-auth-modal.md).

Cette modification impacte principalement la logique de style (CSS/Tailwind) et de positionnement du composant `AuthModal` et de son conteneur au sein de `FinalReveal`.
