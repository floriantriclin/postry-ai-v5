# Standards de Code

## 1. Règles Critiques pour Agents IA & Développeurs

Ces instructions guident le développement pour assurer la cohérence et la qualité.

1.  **Strict Typing :**
    *   `noImplicitAny` est activé.
    *   Ne jamais utiliser `any`. Si un type est complexe, le définir dans `lib/types.ts`.
2.  **Server Components par Défaut :**
    *   Dans `app/`, tous les composants sont Server Components par défaut.
    *   Ajouter `'use client'` *uniquement* si le composant utilise des hooks (`useState`, `useEffect`) ou des event listeners (`onClick`).
    *   *Exemple :* `Page.tsx` (Server) -> fetch data -> passe props à `QuizClient.tsx` (Client).
3.  **Tailwind Arbitrary Values Interdites (sauf exception) :**
    *   Ne pas utiliser `w-[123px]`. Utiliser l'échelle standard `w-32`. Cela garantit la cohérence visuelle.
4.  **Pas de Logique dans le JSX :**
    *   Extraire les logiques conditionnelles complexes dans des variables ou des fonctions avant le `return`.
    *   *Mauvais :* `{ data && data.items.length > 0 && user.isPremium ? ... : ... }`
    *   *Bon :* `if (!shouldShowItems) return null;`
5.  **Environment Variables Type-Safe :**
    *   Ne pas faire `process.env.API_KEY`. Utiliser un validateur (ex: `zod` dans `lib/env.ts`) qui valide l'existence des variables au démarrage.

## 2. Conventions de Nommage

| Élément | Convention | Exemple |
| :--- | :--- | :--- |
| **Fichiers Composants** | Kebab-case | `quiz-card.tsx` |
| **Noms Composants** | PascalCase | `QuizCard` |
| **Fonctions / Variables** | camelCase | `generateQuiz`, `isLoading` |
| **Types / Interfaces** | PascalCase | `UserProfile`, `QuizResponse` |
| **Dossiers Routes** | Kebab-case | `app/blog-posts/page.tsx` |
| **Constantes** | SCREAMING_SNAKE | `MAX_CREDITS_DEFAULT` |

## 3. Style & Architecture UI ("Raw UI")

*   **Philosophie :** Pas d'effets de matière (ombres portées douces, dégradés). Tout est plat, délimité par des bordures ou des contrastes forts.
*   **Composants Cœurs :** Utiliser des composants atomiques construits avec Tailwind (pas de librairie lourde comme MUI).
    *   *Boutons :* Bordures nettes (`rounded-none`), fort contraste.
    *   *Inputs :* Font mono, soulignement épais au focus.
*   **Responsivité :** Mobile First (Base 375px).

## 4. Organisation des Tests (MVP)

*   **Tests Unitaires :** Colocalisés avec le code ou dans `__tests__`. Focus sur `lib/utils.ts`, parsers, et logique de crédits.
*   **Tests E2E :** Tests automatisés avec Playwright pour les parcours critiques.
*   **Outil :** Vitest.

## 5. Gestion de Git

*   **Commits :** Conventionnels (ex: `feat: add quiz engine`, `fix: typo in prompt`).
*   **Branches :** `main` (Prod), `dev` (Dev). Feature branches : `feat/nom-feature`.

## 6. Gestion des Cookies (Server Components & Actions)

*   **Accès :** `const cookieStore = await cookies()`
*   **Lecture :** `const theme = cookieStore.get('theme')` (Retourne `{ name, value }`)
*   **Écriture :** `cookieStore.set('theme', 'dark')`

**Important :** L'API `cookies()` est disponible dans les Server Components, Server Actions, et Route Handlers. Il est impératif d'utiliser `await cookies()` pour y accéder.
