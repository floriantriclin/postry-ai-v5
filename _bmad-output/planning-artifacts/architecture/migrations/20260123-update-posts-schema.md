# Migration DB : Mise à jour de la table Posts (Pre-persistence)

**Date :** 2026-01-23
**Story :** Story 2.4 : Flux de Révélation & Persistance Post-Inscription

## Contexte
Pour permettre le stockage du post avant la confirmation de l'authentification (Magic Link) et assurer une expérience multi-device, la table `posts` doit permettre d'être liée temporairement à un email sans `user_id` obligatoire.

## Script SQL

```sql
-- 1. Rendre user_id optionnel pour la phase de pré-persistance
ALTER TABLE public.posts ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ajouter la colonne email pour le tracking pré-auth
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS email text;

-- 3. Ajouter une colonne status pour distinguer les posts révélés
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Documentation
COMMENT ON COLUMN public.posts.email IS 'Utilisé pour lier le post à l''utilisateur avant confirmation de l''auth';
COMMENT ON COLUMN public.posts.status IS 'pending: généré mais non révélé, revealed: associé à un compte confirmé';
```

## Validation
- Vérifier que l'insertion d'un post avec `user_id = null` et un `email` valide fonctionne.
- Vérifier que le statut par défaut est `pending`.
