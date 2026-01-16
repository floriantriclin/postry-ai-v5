# Story 2.4 : Flux de Révélation & Persistance Post-Inscription

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Nouvel Utilisateur (venant de cliquer sur le Magic Link),
**Je veux** être redirigé vers mon post désormais déflouté et sauvegardé,
**Afin de** consommer la valeur promise.

**Type :** Integration / UX

## Critères d'Acceptation

1.  Au retour de l'auth, le système détecte le contexte du post temporaire (via localStorage ou paramètre).
2.  Création automatique du compte user en base.
3.  Sauvegarde du post généré dans la table `posts` lié à ce user.
4.  Affichage de la vue "Dashboard" avec le post en clair (sans flou).
