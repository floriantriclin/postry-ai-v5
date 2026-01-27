# Standards de Test pour le Projet postry-ai

Ce document définit la stratégie, les standards et les meilleures pratiques pour les tests du projet postry-ai. L'objectif est d'assurer la qualité, la maintenabilité et la robustesse de l'application.

## Stratégie de Test (MVP "Lean")

Pour la phase de MVP, nous n'avons pas le temps pour une couverture à 100%. Nous ciblons les zones critiques pour maximiser l'impact avec un effort pragmatique.

### 1. Tests Unitaires (Critiques Uniquement)

- **Outil :** Vitest (plus rapide que Jest).
- **Cible :**
    - `lib/utils.ts` : Fonctions de formatage.
    - `actions/cv-parser.ts` : Vérifier que l'extraction PDF retourne du texte propre (mock du buffer).
    - `lib/credit-logic.ts` : Vérifier que la décrémentation des crédits fonctionne et bloque à 0.

### 2. Tests d'Intégration (Manuels / Scriptés)

- **Cible :** Le flux "Quiz -> API Gemini -> JSON".
- **Méthode :** Un script `scripts/test-gemini.ts` sera lancé manuellement pour vérifier que Gemini répond bien au format JSON attendu (smoke test) sans lancer toute l'UI.

### 3. Tests UI (Manuels)

- **Cible :** Responsivité Mobile.
- **Méthode :** Vérification visuelle sur Chrome DevTools (mode Device) et sur un vrai smartphone avant chaque déploiement en Production.

## Standards Détaillés et Bonnes Pratiques

Au fur et à mesure que le projet mûrit, nous adopterons les standards plus formels décrits ci-dessous.

### 1. Philosophie de Test Générale

Nous adoptons une approche pragmatique des tests, en nous concentrant sur la valeur ajoutée et la réduction des risques. La pyramide des tests est notre modèle de référence :

- **Tests Unitaires (TU) :** Rapides et nombreux, ils valident les plus petites unités de code (fonctions, composants) de manière isolée.
- **Tests d'Intégration (TI) :** Ils vérifient que plusieurs unités fonctionnent correctement ensemble (ex: un composant et son service, une route d'API et sa logique métier).
- **Tests End-to-End (E2E) :** Moins nombreux, ils simulent des parcours utilisateurs complets dans un environnement proche de la production.

### 2. Outils et Versions

#### 2.1. Installation

Pour installer les dépendances de développement nécessaires, exécutez la commande suivante :

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event playwright
```

#### 2.2. Versions Recommandées

- **Framework de test :** [Vitest](https://vitest.dev/) (`^4.0.17`)
- **Tests de composants UI :**
    - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (`^16.3.2`)
    - `@testing-library/user-event` (`^14.6.1`)
- **Tests E2E :** [Playwright](https://playwright.dev/) (`^1.57.0`)
- **Assertions :** La syntaxe `expect` de Vitest (compatible Chai/Jest).
- **Mocking :** Les fonctions de mock intégrées à Vitest (`vi.fn`, `vi.spyOn`).

### 3. Standards pour les Tests Unitaires

#### 3.1. Quoi tester ?

- La logique métier critique.
- Les fonctions utilitaires complexes.
- Les hooks React personnalisés avec une logique non triviale.
- La validation de schémas (Zod).

#### 3.2. Bonnes Pratiques

- **Arrange, Act, Assert (AAA) :** Chaque test doit suivre cette structure.
- **Un seul `assert` par test.**
- **Tests indépendants.**
- **Nommage clair :** `should [comportement attendu] when [condition]`.
- **Mockez les dépendances.**

### 4. Standards pour les Tests de Composants (React)

#### 4.1. Philosophie

Tester du point de vue de l'utilisateur, pas les détails d'implémentation.

#### 4.2. Bonnes Pratiques

- **Utilisez les queries sémantiques de Testing Library** (`getByRole`, `getByLabelText`, etc.).
- **Simulez les interactions utilisateur avec `@testing-library/user-event`.**
- **Mockez les appels API.**

### 5. Standards pour les Tests End-to-End

#### 5.1. Quoi tester ?

- Les parcours utilisateurs critiques (happy path).
- La validation des formulaires de bout en bout.

#### 5.2. Bonnes Pratiques

- **Utilisez des `data-testid` pour les locators.**
- **Gérez l'état pour des tests indépendants.**
- **Évitez les `sleep`, utilisez les `waitFor`.**

### 6. Aide-mémoires de Syntaxe

Pour des exemples et des guides de référence rapides sur la syntaxe, consultez les documents suivants :

- [Syntaxe de Base de Vitest](../qa/syntax/vitest.md)
- [Syntaxe de React Testing Library](../qa/syntax/react-testing-library.md)
- [Syntaxe de Base de Playwright](../qa/syntax/playwright.md)
