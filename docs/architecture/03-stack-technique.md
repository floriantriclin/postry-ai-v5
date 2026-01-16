# 03. Stack Technique

## Tableau de la Stack Technologique

| **Catégorie** | **Technologie** | **Version** | **Objectif** | **Rationale (Justification)** |
| --- | --- | --- | --- | --- |
| **Frontend Framework** | **Next.js (App Router)** | **16.x** | Framework Fullstack | Standard industriel, SSR performant, intégration Vercel native, Server Actions simplifient les appels backend. |
| **Langage** | **TypeScript** | **5.x** | Langage Principal | Typage strict partagé entre Front et Back, réduit les bugs à l'exécution, auto-completion dans l'IDE. |
| **Styling** | **Tailwind CSS** | **4.x** | Moteur de Style | Permet le design "Brut" rapide sans runtime JS lourd. Classes utilitaires idéales pour le Mobile First. |
| **Icons** | **Lucide React** | **Dernière** | Iconographie | Légère, style "stroke" propre qui correspond à l'esthétique technique/brute visée. |
| **Base de Données** | **PostgreSQL (Supabase)** | **15+** | Persistance | Robustesse relationnelle, support natif JSONB (pour les réponses Quiz), et Row Level Security (RLS) pour la sécurité. |
| **Auth** | **Supabase Auth** | **Dernière** | Identité | Support natif du "Magic Link" (Passwordless) requis par le PRD, gestion de session sécurisée. |
| **AI Model** | **Google Gemini 2.5 Flash** | **Latest** | LLM | Vitesse extrême (<2s), coût très faible, et fenêtre de contexte suffisante pour ingérer un CV complet. |
| **Stockage Fichiers** | **Supabase Storage** | **-** | Stockage CVs | Buckets privés sécurisés, intégration directe avec l'Auth Supabase pour les droits d'accès. |
| **Parsing PDF** | **pdf-parse** | **1.1.1** | Extraction Texte | Librairie Node.js légère et éprouvée pour extraire du texte brut sans OCR complexe (suffisant pour MVP). |
| **Paiements** | **Stripe Checkout** | **Latest** | Monetisation | Page de paiement hébergée (Hosted UI) pour minimiser la conformité PCI et le code de gestion. |
| **État Global** | **React Context + Hooks** | **-** | State Management | Suffisant pour gérer l'état du Quiz et de l'Equalizer sans la complexité de Redux/Zustand. |
| **Validation** | **Zod** | **3.x** | Validation Données | Validation des schémas d'API et des formulaires, typage inféré automatiquement. |
| **Client HTTP** | **Fetch API (Native)** | **-** | Requêtes API | Pas besoin d'Axios, fetch est natif dans Next.js et supporte le caching/revalidation. |

## Choix d'Infrastructure Cloud

- **Fournisseur :** **Vercel** (Frontend + API) & **Supabase** (Data).
- **Services Clés :** Vercel Serverless Functions, Supabase Auth/DB/Storage.
- **Régions de Déploiement :**
    - Vercel : iad1 (US East) - *Recommandé pour la proximité avec la plupart des APIs AI.*
    - Supabase : us-east-1 (AWS) - *Doit matcher la région Vercel.*
