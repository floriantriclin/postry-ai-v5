# Story 1.6 : Saisie du Sujet & Génération de Post Flouté

**Parent Epic:** Epic 1 : Fondation & Tunnel Public (Acquisition)

## Description

**En tant que** Visiteur ayant terminé le Quiz,
**Je veux** préciser le sujet ou l'idée clé de mon premier post avant de lancer la génération,
**Afin de** voir un résultat concret sur un sujet qui m'intéresse vraiment, même s'il est flouté.

**Type :** Feature UI + Backend

## Critères d'Acceptation

1.  À la fin du quiz, affichage d'un écran intermédiaire "De quoi voulez-vous parler ?".
2.  Champ de saisie texte (ex: "L'importance de l'échec", "Mon nouveau job").
3.  Bouton "Générer ma signature" qui déclenche l'appel API `/api/post/generate` avec : le profil quiz + le sujet saisi.
4.  Affichage du résultat avec classe CSS `blur-sm` et overlay "Révéler".
