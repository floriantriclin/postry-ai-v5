# 10. Infrastructure et Déploiement

## Stratégie de Déploiement (GitOps)

Nous utilisons le pipeline natif Vercel connecté à GitHub.

1. **Source :** GitHub Repository (main branch).
2. **Trigger :** Push sur main déclenche un déploiement Production. Push sur dev ou Pull Request déclenche un déploiement Preview.
3. **Build :** npm run build (Next.js build process).
4. **Output :** Edge Network (Statique + Serverless Functions).

## Variables d'Environnement (Secrets)

Ces variables doivent être configurées dans le dashboard Vercel (Project Settings > Environment Variables).

| **Variable** | **Environnement** | **Description** |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Prod / Preview / Dev | URL de l'instance Supabase. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Prod / Preview / Dev | Clé publique Supabase (sûre pour le client). |
| SUPABASE_SERVICE_ROLE_KEY | Prod / Preview / Dev | **SECRET**. Clé admin pour les Server Actions privilégiées. |
| GEMINI_API_KEY | Prod / Preview / Dev | **SECRET**. Clé API Google AI Studio. |
| STRIPE_SECRET_KEY | Prod | **SECRET**. Clé privée Stripe (Live). |
| STRIPE_WEBHOOK_SECRET | Prod | **SECRET**. Pour vérifier la signature des webhooks. |
| NEXT_PUBLIC_STRIPE_KEY | Prod | Clé publique Stripe (Live). |
| NEXT_PUBLIC_BASE_URL | Prod | URL canonique (ex: https://postry.ai) pour les callbacks Auth. |

## Infrastructure as Code (IaC) - "ClickOps" pour MVP

Pour le MVP, nous ne mettons pas en place Terraform ou Pulumi. La configuration se fait via :

1. **Supabase :** Script SQL (Section 8) exécuté manuellement ou via CLI supabase db push.
2. **Vercel :** Interface Web pour connecter le repo.

## Stratégie de Rollback

- **Vercel :** Instant Rollback. En cas de bug critique en prod, un clic dans le dashboard Vercel permet de "Promote" le déploiement précédent instantanément.
