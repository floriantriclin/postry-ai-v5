# Stack Technique

## Vue d'ensemble

L'application est une **Fullstack Serverless** hébergée sur Vercel, utilisant **Next.js 16**.
La persistance et l'identité sont gérées par **Supabase**.
L'intelligence est fournie par **Google Gemini 2.5 Flash**.

## Tableau de la Stack

| Catégorie | Technologie | Version | Objectif | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | **16.x** | Framework Fullstack | Standard industriel, SSR, Server Actions. |
| **Langage** | **TypeScript** | **5.x** | Langage Principal | Typage strict partagé (Front/Back). |
| **Styling** | **Tailwind CSS** | **4.x** | Moteur de Style | Design "Brut" rapide, classes utilitaires. |
| **Icons** | **Lucide React** | **Latest** | Iconographie | Légère, style "stroke" technique. |
| **Base de Données** | **PostgreSQL (Supabase)** | **15+** | Persistance | Relationnel, JSONB, RLS (Sécurité). |
| **Auth** | **Supabase Auth** | **Latest** | Identité | Magic Link (Passwordless) natif. |
| **AI Model** | **Google Gemini 2.5 Flash** | **Latest** | LLM | Vitesse extrême, faible coût, large contexte (CV). |
| **Stockage Fichiers** | **Supabase Storage** | **-** | Stockage CVs | Buckets privés sécurisés. |
| **Parsing PDF** | **pdf-parse** | **1.1.1** | Extraction Texte | Léger, pour texte brut (MVP). |
| **Paiements** | **Stripe Checkout** | **Latest** | Monetisation | Hosted Page, conformité PCI. |
| **Validation** | **Zod** | **3.x** | Validation Données | Validation schémas API/Formulaires. |
| **Client HTTP** | **Fetch API** | **Native** | Requêtes API | Natif Next.js, caching/revalidation. |

## Infrastructure Cloud

*   **Vercel :** Hosting Frontend, Serverless Functions (API Routes), Edge Middleware.
    *   Région : `iad1` (US East).
*   **Supabase :** PostgreSQL, Auth, Storage.
    *   Région : `us-east-1` (AWS) - doit matcher Vercel.

## APIs Externes

1.  **Google Gemini API (Vertex AI / AI Studio) :**
    *   Modèle : `gemini-2.5-flash`.
    *   Auth : Clé API Serveur (`GEMINI_API_KEY`).
2.  **Stripe API :**
    *   Service : Stripe Checkout.
    *   Auth : `STRIPE_SECRET_KEY` (Serveur) / `NEXT_PUBLIC_STRIPE_KEY` (Client).
3.  **Supabase API :**
    *   Auth Client : `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   Auth Serveur : `SUPABASE_SERVICE_ROLE_KEY`.

## Variables d'Environnement

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de l'instance Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET**. Clé admin. |
| `GEMINI_API_KEY` | **SECRET**. Clé API Google AI Studio. |
| `STRIPE_SECRET_KEY` | **SECRET**. Clé privée Stripe. |
| `STRIPE_WEBHOOK_SECRET` | **SECRET**. Signature webhooks. |
| `NEXT_PUBLIC_STRIPE_KEY` | Clé publique Stripe. |
| `NEXT_PUBLIC_BASE_URL` | URL canonique pour callbacks Auth. |
