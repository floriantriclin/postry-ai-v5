# 08. Schéma de Base de Données

## Script d'Initialisation SQL

Ce script configure les tables, les extensions, les triggers de sécurité et les politiques RLS.

```sql
-- 1. Activer les extensions nécessaires
create extension if not exists "uuid-ossp";

-- 2. Créer la table 'users' publique (Miroir de auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  credits_count integer default 5,
  is_premium boolean default false,
  profile_context text, -- Texte extrait du CV
  created_at timestamptz default now()
);

-- Sécurité RLS pour 'users'
alter table public.users enable row level security;

create policy "Users can view own profile" 
on public.users for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.users for update 
using (auth.uid() = id);

-- 3. Trigger pour créer automatiquement le user public à l'inscription
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Créer la table 'posts'
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  theme text not null,
  content text not null, -- Markdown content
  quiz_answers jsonb, -- Réponses du profilage
  equalizer_settings jsonb, -- Réglages Ton/Longueur
  is_revealed boolean default false,
  created_at timestamptz default now()
);

-- Sécurité RLS pour 'posts'
alter table public.posts enable row level security;

create policy "Users can manage own posts" 
on public.posts for all 
using (auth.uid() = user_id);

-- 5. Configuration Storage (Buckets)
-- Note: À exécuter via l'interface Supabase ou API, mais voici la logique SQL sous-jacente
insert into storage.buckets (id, name, public) 
values ('private-cvs', 'private-cvs', false);

-- Politique Storage: Upload autorisé pour soi-même
create policy "Users can upload own CV"
on storage.objects for insert
with check (
  bucket_id = 'private-cvs' AND
  auth.uid() = owner
);

-- Politique Storage: Lecture autorisée pour soi-même
create policy "Users can read own CV"
on storage.objects for select
using (
  bucket_id = 'private-cvs' AND
  auth.uid() = owner
);
```
