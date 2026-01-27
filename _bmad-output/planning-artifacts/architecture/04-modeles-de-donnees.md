# 04. Modèles de Données

## Modèles Conceptuels

Nous avons besoin de stocker trois types d'entités principales :

1. **L'Utilisateur (User) :** Son identité, ses crédits, et son "Contexte CV" extrait.
2. **Le Post (Post) :** Le contenu généré, le thème, et les paramètres qui l'ont créé (pour l'historique).
3. **Le CV (Fichier) :** Le fichier physique stocké (via Supabase Storage, référencé implicitement).

## Schéma de Base de Données (PostgreSQL)

### 1. Table public.users

*Extension de la table système auth.users de Supabase via Trigger.*

| **Colonne** | **Type** | **Description** |
| --- | --- | --- |
| **id** | UUID | **Clé Primaire**. Référence étrangère vers auth.users.id. Assure que l'utilisateur DB correspond à l'utilisateur Auth. |
| email | TEXT | Email de l'utilisateur (copié de auth.users pour facilité d'accès). |
| credits_count | INTEGER | **Solde de crédits**. Défaut : 5. Décrémenté à chaque génération réussie (sauf régénération). |
| is_premium | BOOLEAN | **Statut abonné**. Défaut : FALSE. Passé à TRUE via Webhook Stripe. |
| profile_context | TEXT | **Texte brut extrait du CV**. Utilisé pour l'injection RAG dans le prompt LLM. Peut être NULL. |
| created_at | TIMESTAMPTZ | Date de création du compte. |

### 2. Table public.posts

| **Colonne** | **Type** | **Description** |
| --- | --- | --- |
| **id** | UUID | **Clé Primaire**. Générée automatiquement (gen_random_uuid()). |
| user_id | UUID | **Clé Étrangère**. Référence public.users.id. Lie le post à son créateur. |
| theme | TEXT | Le sujet saisi par l'utilisateur (ex: "L'échec"). |
| content | TEXT | Le contenu final généré en Markdown. |
| quiz_answers | JSONB | Stocke les réponses au quiz (Profilage). Ex: {"q1": "A", "archetype": "Visionnaire"}. |
| equalizer_settings | JSONB | Stocke les réglages de ton. Ex: {"tone": 20, "length": "short"}. |
| is_revealed | BOOLEAN | Défaut : FALSE. Passe à TRUE après l'auth (pour les posts générés anonymement puis réclamés). |
| created_at | TIMESTAMPTZ | Date de création. |

## Sécurité des Données (Row Level Security - RLS)

Supabase expose l'API directement, donc RLS est **critique**.

1. **Politique Users :**
    - SELECT : Un utilisateur ne peut voir QUE sa propre ligne (auth.uid() = id).
    - UPDATE : Un utilisateur ne peut modifier QUE sa propre ligne (ex: upload CV).
    - *Note :* credits_count et is_premium devraient idéalement être protégés contre l'écriture directe par l'utilisateur (via une fonction SECURITY DEFINER côté serveur) pour éviter la fraude.
2. **Politique Posts :**
    - ALL (Select, Insert, Update, Delete) : Autorisé uniquement si auth.uid() = user_id.
3. **Politique Storage (Bucket private-cvs) :**
    - INSERT : Autorisé pour auth.uid().
    - SELECT : Autorisé pour auth.uid().
    - Le bucket doit être configuré en mode **PRIVATE** (pas d'accès public URL).
