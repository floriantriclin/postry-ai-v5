# Story 4.3 : Génération avec Ancrage Factuel (Injection)

**Parent Epic:** Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

## Description

**En tant que** Utilisateur avec un CV uploadé,
**Je veux** que mes générations utilisent automatiquement des faits de mon parcours,
**Afin de** produire du contenu qui prouve mon expertise réelle.

**Type :** AI / Feature

## Critères d'Acceptation

1.  Mise à jour de l'API `/api/post/generate` et `/regenerate`.
2.  Si `profile_context` existe, injection dans le System Prompt : "Utilise le contexte suivant pour ancrer le post dans la réalité de l'utilisateur : [Contexte]".
3.  Le post généré cite explicitement une expérience ou compétence du CV pertinente pour le sujet.
