# 06. APIs Externes

## 1. Google Gemini API (Vertex AI / AI Studio)

- **Objectif :** Moteur d'intelligence (Génération Quiz, Rédaction Post, Analyse CV).
- **Modèle :** gemini-2.5-flash (ou équivalent stable/rapide).
- **Authentification :** Clé API Serveur (GEMINI_API_KEY) stockée dans les variables d'environnement. **Jamais exposée au client.**
- **Endpoints Clés Utilisés :**
    - POST /v1beta/models/gemini-2.5-flash:generateContent
- **Contraintes :**
    - Rate Limits (RPM) à surveiller selon le plan (Free vs Pay-as-you-go).
    - Gestion du contexte : Le CV complet est passé en texte dans le prompt à chaque requête (Stateless).

## 2. Stripe API (Checkout)

- **Objectif :** Gestion des paiements et abonnements (si applicable futur).
- **Service :** Stripe Checkout (Hosted Page).
- **Authentification :** Clé Secrète (STRIPE_SECRET_KEY) côté serveur. Clé Publique (NEXT_PUBLIC_STRIPE_KEY) côté client pour rediriger.
- **Flux :**
    1. Création de Session Checkout côté serveur.
    2. Redirection client vers URL Stripe.
    3. Webhook Stripe (checkout.session.completed) vers /api/webhooks/stripe pour débloquer les crédits.

## 3. Supabase API (via SDK Client & Admin)

- **Objectif :** Interface unifiée pour Auth, DB, et Storage.
- **Authentification :**
    - Client (Browser) : NEXT_PUBLIC_SUPABASE_ANON_KEY + Token JWT utilisateur (géré par le SDK).
    - Serveur (API Routes) : SUPABASE_SERVICE_ROLE_KEY (pour les tâches admin comme bypasser RLS ou gérer les utilisateurs).
- **Intégration :** Utilisation du package @supabase/ssr pour une gestion propre des cookies dans Next.js App Router.
