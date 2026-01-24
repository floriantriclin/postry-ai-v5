# Dictionnaire des Données

**Version :** 1.1.0
**Dernière mise à jour :** 24/01/2026
**Changements récents :**
*   Clarification de la colonne `theme` (Post Topic).
*   Détail de la structure JSONB de `quiz_answers` incluant `acquisition_theme`.

Ce document fournit une description détaillée des tables de la base de données, des colonnes et de leurs objectifs.

## Table `users`

Cette table contient les informations relatives aux utilisateurs enregistrés. Elle étend la table `auth.users` de Supabase.

| Colonne | Type | Description |
| --- | --- | --- |
| **id** | `UUID` | **Clé Primaire**. Référence `auth.users.id`. |
| email | `TEXT` | Email de l'utilisateur (copié depuis `auth.users`). |
| credits_count | `INTEGER` | Solde de crédits de l'utilisateur. La valeur par défaut est 5. |
| is_premium | `BOOLEAN` | Indique si l'utilisateur a un statut premium. La valeur par défaut est `FALSE`. |
| profile_context | `TEXT` | Contenu textuel brut extrait du CV de l'utilisateur pour l'injection RAG. |
| archetype | `TEXT` | L'archétype de personnalité principal de l'utilisateur (ex: "ALCHIMISTE"). |
| vstyle_vector | `JSONB` | Le vecteur de style de l'utilisateur, représenté par 9 dimensions. |
| created_at | `TIMESTAMPTZ` | Horodatage de la création de l'enregistrement de l'utilisateur. |

## Table `posts`

Cette table stocke tous les contenus générés par les utilisateurs.

| Colonne | Type | Description |
| --- | --- | --- |
| **id** | `UUID` | **Clé Primaire**. Générée automatiquement. |
| user_id | `UUID` | **Clé Étrangère**. Référence `public.users.id`. Peut être `NULL` initialement. |
| email | `TEXT` | Utilisé pour lier un post à un utilisateur avant la confirmation de l'authentification complète. |
| theme | `TEXT` | Le sujet ou le thème du post saisi par l'utilisateur (ex: "L'échec"). Correspond au "Post Topic". |
| content | `TEXT` | Le contenu Markdown final du post généré. |
| quiz_answers | `JSONB` | Stocke les réponses de l'utilisateur. Structure: `{ "acquisition_theme": "...", "p1": {...}, "p2": {...} }`. |
| equalizer_settings | `JSONB` | Stocke les réglages de l'égaliseur (ton, longueur) utilisés pour la génération. |
| is_revealed | `BOOLEAN` | Indique si le post a été "révélé" après l'authentification. La valeur par défaut est `FALSE`. |
| status | `TEXT` | L'état actuel du post (par exemple, `pending`, `revealed`). La valeur par défaut est `'pending'`. |
| archetype | `TEXT` | L'archétype de l'utilisateur associé au moment de la génération du post. |
| created_at | `TIMESTAMPTZ` | Horodatage de la création du post. |

## Objet de Réponse de Génération de Post (`PostGenerationResponse`)

Cet objet représente les données renvoyées par le service de génération avant qu'un post ne soit sauvegardé. Ces données sont utilisées pour l'affichage "reveal".

| Champ | Type | Description |
| --- | --- | --- |
| hook | `TEXT` | Une phrase d'accroche ou un titre court pour le post. |
| content | `TEXT` | Le contenu principal du post en Markdown. C'est ce qui sera sauvegardé dans la table `posts`. |
| cta | `TEXT` | Un appel à l'action (Call To Action) généré pour accompagner le post. |
| style_analysis | `TEXT` | Une brève analyse du style d'écriture utilisé dans le post. |
