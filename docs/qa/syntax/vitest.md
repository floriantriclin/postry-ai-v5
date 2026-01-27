# Syntaxe de Base de Vitest

_**Note :** La syntaxe présentée ici est confirmée comme étant valide et recommandée pour **Vitest v4.x** dans ce projet._

Ce document est un aide-mémoire pour la syntaxe courante de [Vitest](https://vitest.dev/).

## 1. Configuration du Projet

Le projet est configuré avec `globals: true` dans `vitest.config.ts`. 
Cela signifie que les fonctions suivantes sont disponibles **globalement** et n'ont pas besoin d'être importées explicitement :
- `describe`, `it`, `test`, `expect`
- `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- `vi` (pour les mocks)

## 2. Structure d'un Fichier de Test

Un fichier de test doit se terminer par `.test.ts`, `.spec.ts`, `.test.tsx` ou `.spec.tsx`.

### Exemple de Test Unitaire (Logique)

```typescript
// mon-module.test.ts
import { addition } from '../mon-module';

describe('addition', () => {
  it('should add two numbers correctly', () => {
    // Assertion
    expect(addition(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(addition(-1, 1)).toBe(0);
  });
});
```

## 3. Assertions Courantes (`expect`)

| Matcher | Description | Exemple |
| :--- | :--- | :--- |
| `.toBe(value)` | Égalité stricte (`===`) | `expect(2).toBe(2);` |
| `.toEqual(value)` | Égalité profonde (objets/tableaux) | `expect({a:1}).toEqual({a:1});` |
| `.toBeTruthy()` / `.toBeFalsy()` | Vérifie si la valeur est vraie/fausse | `expect(true).toBeTruthy();` |
| `.toBeDefined()` / `.toBeUndefined()` | Vérifie si la valeur est définie | `expect(x).toBeDefined();` |
| `.toContain(item)` | Vérifie si un tableau/string contient un item | `expect([1,2]).toContain(2);` |
| `.toThrow(error?)` | Vérifie si une fonction lève une erreur | `expect(() => fn()).toThrow();` |
| `.toHaveLength(n)` | Vérifie la longueur d'un tableau/string | `expect([1,2]).toHaveLength(2);` |

### Matchers étendus (DOM)
Pour les tests de composants, nous utilisons `@testing-library/jest-dom`. 
*Note: Nécessite l'import dans le test ou un fichier de setup.*

```typescript
import '@testing-library/jest-dom';
// ...
expect(screen.getByRole('button')).toBeInTheDocument();
expect(screen.getByText('Submit')).toHaveClass('btn-primary');
```

## 4. Tests Asynchrones

Pour tester des promesses ou du code `async/await`.

```typescript
it('should fetch data correctly', async () => {
  const data = await fetchData();
  expect(data).toBe('success');
});

it('should reject with error', async () => {
  await expect(fetchDataFailure()).rejects.toThrow('error');
});
```

## 5. Mocks et Espions (`vi`)

Les mocks permettent d'isoler le code à tester.

### `vi.fn()` (Fonction Mock)
```typescript
const mockCallback = vi.fn();
mockCallback('hello');
expect(mockCallback).toHaveBeenCalledWith('hello');
```

### `vi.spyOn()` (Espion)
```typescript
const spy = vi.spyOn(console, 'log');
myFunctionThatLogs();
expect(spy).toHaveBeenCalled();
spy.mockRestore(); // Important pour nettoyer
```

### Mocking de Modules
```typescript
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}));
```

## 6. Tests de Composants (React)

Utilisez `@testing-library/react`.

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Hello" />);
    // screen.getByText retourne l'élément ou lève une erreur s'il n'existe pas
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

## 7. Gabarit de Nouveau Fichier (Boilerplate)

Copiez-collez ceci pour démarrer un nouveau test.
**Note :** Avec `globals: true`, il est recommandé de NE PAS importer explicitement `describe`, `it`, `expect` pour éviter des conflits dans certains environnements.

```typescript
// [nom].test.ts
/// <reference types="vitest/globals" />

describe('NomDuModule', () => {
  it('devrait [comportement attendu]', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = input.toUpperCase();
    
    // Assert
    expect(result).toBe('TEST');
  });
});
```

## 8. Problèmes Courants et Solutions

### Crash lors de l'import (Next.js / Env Vars)
Si vous testez du code qui utilise `lib/env.ts` ou `lib/supabase-admin.ts`, le test peut échouer avec "No test suite found" car la validation Zod des variables d'environnement échoue au chargement du module.

**Solution :** Mockez le module d'environnement ou les variables AVANT les imports qui les utilisent.

```typescript
// Exemple de mock pour éviter le crash
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "http://localhost",
    SUPABASE_SERVICE_ROLE_KEY: "mock-key",
  },
}));

import { maFonction } from './mon-fichier-qui-utilise-env';
```
