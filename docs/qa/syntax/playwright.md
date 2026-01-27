# Syntaxe de Base de Playwright

_**Note :** La syntaxe présentée ici est confirmée comme étant valide et recommandée pour **Playwright v1.5x**._

Ce document est un aide-mémoire pour l'écriture de tests End-to-End (E2E) avec [Playwright](https://playwright.dev/).

## 1. Structure d'un Test E2E

Les tests Playwright utilisent la même syntaxe `test` et `expect` que Vitest.

```typescript
// tests/mon-scenario.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Page d'accueil', () => {
  test('should display a welcome message', async ({ page }) => {
    // `page` est l'objet principal pour interagir avec la page
    await page.goto('/'); // Navigue vers la racine du site

    // Trouve un élément par son rôle et son nom (accessible)
    const welcomeHeading = page.getByRole('heading', { name: 'Bienvenue sur Postry' });

    // Assertion pour vérifier que l'élément est visible
    await expect(welcomeHeading).toBeVisible();
  });
});
```

## 2. Actions Principales

Les actions simulent les interactions utilisateur et sont asynchrones.

- `page.goto(url)`: Navigue vers une URL.
- `locator.click()`: Clique sur un élément.
- `locator.fill(text)`: Remplit un champ de formulaire.
- `locator.press(key)`: Simule une pression de touche (ex: 'Enter').
- `locator.hover()`: Passe la souris sur un élément.
- `page.waitForNavigation()`: Attend une navigation complète.

## 3. Locators

Les "Locators" sont la manière dont Playwright trouve les éléments. Ils sont robustes et attendent automatiquement que l'élément soit disponible.

### Locators Recommandés

Utilisez les locators basés sur l'accessibilité en priorité.

- `page.getByRole(role, { name })`: Le plus robuste. `name` est l'accessible name.
  ```typescript
  page.getByRole('button', { name: /S'inscrire/i });
  ```
- `page.getByLabelText(text)`: Pour trouver un `input` via son `label`.
- `page.getByPlaceholderText(text)`
- `page.getByText(text)`: Pour trouver du texte non interactif.

### Autres Locators

À n'utiliser que si les locators accessibles ne sont pas possibles.

- `page.locator('css-selector')`: Utilise un sélecteur CSS.
  ```typescript
  page.locator('#submit-button');
  ```
- `page.getByTestId(testId)`: Cible un élément par l'attribut `data-testid`.
  ```html
  <button data-testid="submit-btn">Go</button>
  ```
  ```typescript
  page.getByTestId('submit-btn');
  ```

## 4. Assertions

Les assertions de Playwright sont asynchrones et attendent qu'une condition soit remplie (auto-retrying).

- `expect(locator).toBeVisible()`: Vérifie si l'élément est visible.
- `expect(locator).toHaveText(text)`: Vérifie le contenu textuel.
- `expect(locator).toHaveValue(value)`: Vérifie la valeur d'un `input`.
- `expect(locator).toBeDisabled()` / `.toBeEnabled()`: Vérifie l'état d'un élément.
- `expect(page).toHaveURL(url)`: Vérifie l'URL actuelle.
- `expect(page).toHaveTitle(title)`: Vérifie le titre de la page.

## 5. Hooks et Groupes

- `test.describe(title, callback)`: Groupe des tests.
- `test.beforeEach(callback)`: S'exécute avant chaque test du groupe.
- `test.afterEach(callback)`: S'exécute après chaque test du groupe.
