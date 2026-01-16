# Story 1.5 : Intégration Quiz Dynamique

**Parent Epic:** Epic 1 : Fondation & Tunnel Public (Acquisition)

## Description

**En tant que** Visiteur,
**Je veux** que le Quiz affiche désormais les vraies questions générées par l'IA selon mon thème,
**Afin de** vivre l'expérience personnalisée réelle.

**Type :** Integration

## Critères d'Acceptation

1.  Le Frontend appelle l'API 1.4 au lieu du fichier Mock.
2.  Gestion des états de chargement (Skeletons/Spinners) pendant la génération.
3.  Gestion des erreurs (ex: fallback sur questions statiques si API down).
