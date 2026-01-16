# 13. Stratégie de Test & Sécurité

## Stratégie de Test (MVP "Lean")

Nous n'avons pas le temps pour une couverture à 100%. Nous ciblons les zones critiques.

### 1. Tests Unitaires (Critiques Uniquement)

- **Outil :** Vitest (plus rapide que Jest).
- **Cible :**
    - lib/utils.ts : Fonctions de formatage.
    - actions/cv-parser.ts : Vérifier que l'extraction PDF retourne du texte propre (mock du buffer).
    - lib/credit-logic.ts : Vérifier que la décrémentation des crédits fonctionne et bloque à 0.

### 2. Tests d'Intégration (Manuels / Scriptés)

- **Cible :** Le flux "Quiz -> API Gemini -> JSON".
- **Méthode :** Script scripts/test-gemini.ts à lancer manuellement pour vérifier que Gemini répond bien au format JSON attendu (smoke test) sans lancer toute l'UI.

### 3. Tests UI (Manuels)

- **Cible :** Responsivité Mobile.
- **Méthode :** Vérification visuelle sur Chrome DevTools (mode Device) et sur un vrai smartphone avant chaque déploiement Prod.

## Sécurité (Security by Design)

### 1. Protection des Données (Privacy)

- **CVs :** Stockage dans un bucket privé. Accès via Signed URLs uniquement. RLS empêche l'accès aux autres users.
- **Prompts :** Les prompts système (System Instructions) ne sont jamais envoyés au client. Ils restent côté serveur (API Route). Cela protège la "Secret Sauce" du profilage psychologique.

### 2. Protection API

- **Rate Limiting :** Utilisation de @vercel/kv ou simple Map en mémoire (pour MVP) pour limiter les abus sur /api/post/generate par IP (ex: 10 requêtes / heure pour les anonymes).
- **Validation des Entrées :** Zod rejette tout JSON malformé ou trop volumineux avant même de traiter la demande.
- **CORS :** Configuré pour n'accepter que les requêtes venant de postry.ai (et localhost en dev).

### 3. Gestion des Secrets

- Les clés API (Gemini, Stripe, Supabase Service Role) ne sont *jamais* commitées dans Git (ajoutées au .gitignore).
- Scan de secrets via GitHub Advanced Security (si dispo) ou pre-commit hooks.
