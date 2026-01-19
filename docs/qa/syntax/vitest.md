# Syntaxe de Base de Vitest

_**Note :** La syntaxe présentée ici est confirmée comme étant valide et recommandée pour **Vitest v4.x**._

Ce document est un aide-mémoire pour la syntaxe courante de [Vitest](https://vitest.dev/).

## 1. Structure d'un Fichier de Test

Un fichier de test se termine généralement par `.test.ts` ou `.spec.ts`.

```typescript
// mon-module.test.ts
import { describe, it, expect } from 'vitest';
import { addition } from '../mon-module';

// `describe` groupe des tests liés
describe('addition', () => {

  // `it` ou `test` définit un cas de test individuel
  it('should add two numbers correctly', () => {
    // Assertion
    expect(addition(1, 2)).toBe(3);
  });
});
```

## 2. Fonctions Globales

- `describe(name, factory)`: Crée un bloc qui groupe plusieurs tests.
- `it(name, fn)` / `test(name, fn)`: Définit un test.
- `beforeEach(fn)`: S'exécute avant chaque test dans le `describe`.
- `afterEach(fn)`: S'exécute après chaque test dans le `describe`.
- `beforeAll(fn)`: S'exécute une fois avant tous les tests du `describe`.
- `afterAll(fn)`: S'exécute une fois après tous les tests du `describe`.

## 3. Assertions (`expect`)

`expect` permet de vérifier si une valeur correspond à une attente.

| Matcher | Description | Exemple |
| :--- | :--- | :--- |
| `.toBe(value)` | Égalité stricte (`===`) | `expect(2).toBe(2);` |
| `.toEqual(value)` | Égalité profonde (objets/tableaux) | `expect({a:1}).toEqual({a:1});` |
| `.toBeTruthy()` / `.toBeFalsy()` | Vérifie si la valeur est vraie/fausse | `expect(true).toBeTruthy();` |
| `.toContain(item)` | Vérifie si un tableau contient un item | `expect([1,2]).toContain(2);` |
| `.toThrow()` | Vérifie si une fonction lève une erreur | `expect(() => fn()).toThrow();` |
| `.toHaveBeenCalled()` | Vérifie si un mock a été appelé | `expect(mockFn).toHaveBeenCalled();` |

## 4. Mocks

Les mocks permettent d'isoler le code à tester de ses dépendances.

### `vi.fn()`

Crée une fonction mock vide.

```typescript
import { vi } from 'vitest';

const mockCallback = vi.fn();
mockCallback();
expect(mockCallback).toHaveBeenCalled();
```

### `vi.spyOn()`

"Espionne" une méthode existante sur un objet.

```typescript
import { vi } from 'vitest';

const obj = {
  methode: () => 'original'
};

const spy = vi.spyOn(obj, 'methode');
obj.methode();

expect(spy).toHaveBeenCalled();
spy.mockRestore(); // Restaure l'implémentation originale
```

### Mocking de Modules

Utilisez `vi.mock` pour remplacer un module entier.

```typescript
// service.ts
export const fetchData = () => Promise.resolve('real data');

// test.ts
import { vi } from 'vitest';
import { fetchData } from './service';

// Doit être en haut du fichier
vi.mock('./service', () => ({
  fetchData: vi.fn().mockResolvedValue('mocked data'),
}));

it('should fetch mocked data', async () => {
  const data = await fetchData();
  expect(data).toBe('mocked data');
});
```
