# 04. Hypothèses Techniques

### Structure du Repository

- **Monorepo** : Recommandé pour maintenir la cohérence entre le Frontend (Next.js) et les fonctions Backend/API dans un seul dépôt, facilitant le déploiement et le partage de types.

### Architecture de Service

- **Full-Stack Serverless** : Architecture basée sur **Next.js** (hébergé sur Vercel).
    - **Frontend** : React/Next.js pour l'expérience SPA fluide et le rendu hybride.
    - **Backend** : API Routes (Next.js) ou Serverless Functions pour l'orchestration des appels LLM et la gestion métier.
    - **Base de Données** : PostgreSQL (Supabase) pour les profils utilisateurs et l'historique, plus adapté aux données relationnelles que du NoSQL ici.
    - **LLM** : Orchestration "Stateless" via API (Gemini) avec gestion dynamique des prompts systèmes.

### Exigences de Test

- **Unit + Integration** :
    - Tests Unitaires pour la logique métier critique (calcul des crédits, parsing CV).
    - Tests d'Intégration pour le flux critique (Quiz -> Génération -> Auth).
    - Pas de tests E2E lourds pour le MVP pour garder de la vélocité.

### Hypothèses et Requêtes Techniques Supplémentaires

- **Framework Web** : Next.js (16.x).
- **Langage** : TypeScript (Strict mode) pour la robustesse.
- **Styling** : Tailwind CSS pour la rapidité de développement et la cohérence du design system.
- **Auth** : Authentification sans mot de passe ("Magic Link" / OTP) obligatoire pour réduire la friction.
- **Stockage Fichiers** : Stockage objet (Supabase Storage) sécurisé pour les CVs, avec politiques d'expiration automatique pour les fichiers temporaires si nécessaire.
- **Orchestration LLM** : Utilisation de modèles performants et rapides (ex: Gemini 2.5 flash ou Claude 3 Haiku) pour garantir les temps de réponse <15s tout en maîtrisant les coûts.
- **Paiement** : Stripe Checkout en mode hébergé pour minimiser le code de gestion des paiements et assurer la conformité PCI.
