# Story 2.1 : Configuration Base de Données & Schéma Utilisateur

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Développeur,
**Je veux** configurer Supabase et définir le schéma de données `users` et `posts`,
**Afin de** pouvoir persister les comptes et sauvegarder le contenu généré.

**Type :** Tech Enabler / Backend

## Critères d'Acceptation

1.  Projet Supabase configuré (Dev/Prod).
2.  Table `users` créée (email, id, credits_count, created_at).
3.  Table `posts` créée (user_id, content, theme, answers_json, is_revealed, profile_context).
4.  Politiques RLS (Row Level Security) appliquées : un user ne voit que ses posts.
