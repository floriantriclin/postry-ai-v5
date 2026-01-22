# Story 2.1 : Configuration Base de Données & Schéma Utilisateur

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Développeur,
**Je veux** configurer Supabase et définir le schéma de données `users` et `posts`,
**Afin de** pouvoir persister les comptes et sauvegarder le contenu généré.

**Type :** Tech Enabler / Backend

## Critères d'Acceptation

1.  Projet Supabase configuré (Dev/Prod).
2.  Table `users` créée (email, id, credits_count, is_premium, profile_context, archetype, vstyle_vector, created_at).
3.  Table `posts` créée (user_id, content, theme, quiz_answers, equalizer_settings, is_revealed).
4.  Politiques RLS (Row Level Security) appliquées : un user ne voit que ses posts.

## Plan d'Implémentation Technique

- [x] **Dépendances :** Installer `@supabase/supabase-js`.
- [x] **Environnement :** Configurer `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local` et valider dans `lib/env.ts`.
- [x] **Base de Données :** Exécuter le script SQL (Migration 08) via le dashboard Supabase ou CLI.
- [x] **Client :** Créer un singleton `lib/supabase.ts` pour l'initialisation du client.
- [x] **Vérification :** Tester l'insertion manuelle ou via script pour valider les triggers et RLS.

## QA & Documentation

- [Risk Assessment](../qa/assessments/2.1-risk-20260122.md)
- [Test Design](../qa/assessments/2.1-test-design-20260122.md)
