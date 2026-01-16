# Story 2.2 : Authentification par Magic Link (Backend & SDK)

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Développeur,
**Je veux** implémenter la logique d'envoi et de vérification de Magic Link via Supabase Auth,
**Afin de** permettre une connexion sécurisée sans mot de passe.

**Type :** Backend / Logic

## Critères d'Acceptation

1.  Configuration du provider Email (Magic Link) dans Supabase.
2.  Fonction utilitaire front `signInWithOtp(email)` implémentée.
3.  Redirection correcte après clic sur le lien email (gestion du callback URL).
