# Syntaxe de React Testing Library

_**Note :** La syntaxe présentée ici est confirmée comme étant valide et recommandée pour **React Testing Library v16.x**._

Ce document est un aide-mémoire pour la syntaxe et les concepts de [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (RTL).

## 1. Philosophie

Ne testez pas les détails d'implémentation. Testez vos composants comme un utilisateur le ferait.

## 2. Fonctions de Base

- `render(component)`: Rend un composant React dans un conteneur qui est nettoyé automatiquement après chaque test.
- `screen`: Un objet qui contient toutes les [queries](#3-les-queries) pré-liées au `document.body`. C'est la manière recommandée d'accéder aux queries.
- `fireEvent`: Déclenche des événements DOM. (Préférez `@testing-library/user-event` pour des simulations plus réalistes).

## 3. Les Queries

Les queries sont les méthodes utilisées pour trouver des éléments sur la page. RTL les classe par priorité.

### Queries Prioritaires (celles que vous devriez utiliser)

1.  **`getByRole`**: Pour les éléments accessibles, comme un `button` ou un `dialog`.
    ```javascript
    screen.getByRole('button', { name: /Soumettre/i });
    ```
2.  **`getByLabelText`**: Pour les `input` liés à un `label`.
    ```javascript
    screen.getByLabelText(/Nom d'utilisateur/i);
    ```
3.  **`getByPlaceholderText`**: Pour les `input` avec un placeholder.
4.  **`getByText`**: Cherche le contenu textuel.
5.  **`getByDisplayValue`**: Cherche la valeur actuelle d'un `input`.

### `getBy` vs `findBy` vs `queryBy`

- **`getBy*`**: Trouve un élément ou lève une erreur. Pour les éléments qui doivent être présents.
- **`findBy*`**: Renvoie une **promesse** qui se résout quand l'élément est trouvé. Pour les éléments asynchrones.
- **`queryBy*`**: Trouve un élément ou renvoie `null`. Pour vérifier qu'un élément **n'est pas** présent.

```javascript
// Doit être là
expect(screen.getByText('Bienvenue')).toBeInTheDocument();

// N'est pas là
expect(screen.queryByText('Erreur')).not.toBeInTheDocument();

// Apparaîtra après un appel API
const user = await screen.findByText('John Doe');
expect(user).toBeInTheDocument();
```

## 4. Interactions avec `@testing-library/user-event`

Cette bibliothèque simule les interactions utilisateur de manière plus fidèle que `fireEvent`.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonComposant from './MonComposant';

it('should update the input value on type', async () => {
  const user = userEvent.setup();
  render(<MonComposant />);

  const input = screen.getByRole('textbox');
  await user.type(input, 'Bonjour');

  expect(input).toHaveValue('Bonjour');
});
```

## 5. Matchers Personnalisés (`jest-dom`)

Vitest peut être configuré pour utiliser les matchers de `@testing-library/jest-dom` pour des assertions plus lisibles.

- `.toBeInTheDocument()`
- `.toHaveValue(value)`
- `.toBeVisible()`
- `.toBeDisabled()`
