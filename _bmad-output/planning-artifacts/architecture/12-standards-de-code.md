# 12. Standards de Code

## Règles Critiques pour Agents IA

Ces instructions sont destinées à guider le Developer Agent lors de la génération de code :

1. **Strict Typing :** noImplicitAny est activé. Ne jamais utiliser any. Si un type est complexe, le définir dans lib/types.ts.
2. **Server Components par Défaut :** Dans app/, tous les composants sont Server Components par défaut. Ajouter 'use client' *uniquement* si le composant utilise des hooks (useState, useEffect) ou des event listeners (onClick).
    - *Exemple :* Page.tsx (Server) -> fetch data -> passe props à QuizClient.tsx (Client).
3. **Tailwind Arbitrary Values Interdites (sauf exception) :** Ne pas utiliser w-[123px]. Utiliser l'échelle standard w-32. Cela garantit la cohérence visuelle.
4. **Pas de Logique dans le JSX :** Extraire les logiques conditionnelles complexes dans des variables ou des fonctions avant le return.
    - *Mauvais :* { data && data.items.length > 0 && user.isPremium ? ... : ... }
    - *Bon :* if (!shouldShowItems) return null;
5. **Environment Variables Type-Safe :** Ne pas faire process.env.API_KEY. Créer un fichier lib/env.ts qui valide l'existence des variables au démarrage (avec zod ou simple check) et les exporte.

## Conventions de Nommage

| **Élément** | **Convention** | **Exemple** |
| --- | --- | --- |
| **Fichiers Composants** | Kebab-case | quiz-card.tsx |
| **Noms Composants** | PascalCase | QuizCard |
| **Fonctions / Variables** | camelCase | generateQuiz, isLoading |
| **Types / Interfaces** | PascalCase | UserProfile, QuizResponse |
| **Dossiers Routes** | Kebab-case | app/blog-posts/page.tsx |
| **Constantes** | SCREAMING_SNAKE | MAX_CREDITS_DEFAULT |

## Organisation des Tests (MVP)

- **Tests Unitaires :** Colocalisés avec le code si possible ou dans __tests__.
    - Focale : Fonctions utilitaires (lib/utils.ts), Parsers.
- **Tests E2E :** Pas de Cypress/Playwright pour le MVP (Vitesse > Couverture exhaustive initiale). On teste manuellement le "Happy Path".

## Gestion de Git

- **Commits :** Conventionnelle (ex: feat: add quiz engine, fix: typo in prompt).
- **Branches :** main (Prod), dev (Dev). Feature branches : feat/nom-feature.
