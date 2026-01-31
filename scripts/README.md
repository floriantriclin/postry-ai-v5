# 📜 Scripts Postry AI

Ce dossier contient tous les scripts utilitaires et d'intégration pour le projet Postry AI.

## 📁 Scripts Disponibles

### ✅ Validation & Tests

#### `verify-supabase.mjs`
Vérifie la connexion à Supabase.

```bash
node scripts/verify-supabase.mjs
```

#### `test-db-rls.mjs`
Teste les politiques Row Level Security de la base de données.

```bash
node scripts/test-db-rls.mjs
```

#### `validate-setup.js`
Valide la configuration complète du projet.

```bash
node scripts/validate-setup.js
```

#### `verify-env.ts`
Vérifie que toutes les variables d'environnement nécessaires sont présentes.

```bash
npx tsx scripts/verify-env.ts
```

### 🎬 Démos

#### `demo-full-flow.mjs`
Démontre le flux complet de l'application (quiz → génération → sauvegarde).

```bash
node scripts/demo-full-flow.mjs
```

#### `demo-story-*.mjs`
Scripts de démonstration pour différentes user stories.

```bash
node scripts/demo-story-1-5.mjs
node scripts/demo-story-1-6.mjs
node scripts/demo-story-1-7.mjs
```

## 🛠️ Développement de Nouveaux Scripts

### Convention de Nommage

- **Tests:** `test-*.{js,mjs,ts}`
- **Validation:** `verify-*.{js,mjs,ts}` ou `validate-*.{js,mjs,ts}`
- **Démos:** `demo-*.{js,mjs}`
- **Intégrations:** `{service}-integration.ts`
- **Utilitaires:** `{nom-descriptif}.{js,mjs,ts}`

### Template de Script TypeScript

```typescript
#!/usr/bin/env tsx
/**
 * Nom du script
 * 
 * Description de ce que fait le script
 * 
 * Usage:
 *   npx tsx scripts/mon-script.ts [args]
 * 
 * @author Votre Nom
 * @date YYYY-MM-DD
 */

import { config } from 'dotenv';

// Charger l'environnement
config();

async function main() {
  try {
    console.log('🚀 Démarrage du script...\n');
    
    // Votre logique ici
    
    console.log('\n✅ Script terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
```

### Ajouter un Script NPM

Dans `package.json`, ajoutez:

```json
{
  "scripts": {
    "mon-script": "tsx scripts/mon-script.ts"
  }
}
```

## 📦 Dépendances Communes

Les scripts peuvent utiliser:
- `@supabase/supabase-js` - Client Supabase
- `@google/generative-ai` - Client Gemini
- `dotenv` - Variables d'environnement
- `zod` - Validation de schémas

## 🔒 Sécurité

**Important:**
- ⚠️ Les scripts ont accès aux variables d'environnement
- ⚠️ Ne jamais logger les clés API ou secrets
- ⚠️ Toujours valider les inputs utilisateur
- ⚠️ Utiliser des variables d'environnement pour les configs sensibles

## 📚 Ressources

- [Documentation Projet](../docs/index.md)

---

**Besoin d'aide?** Consultez la documentation ou tapez `/bmad-help` dans Cursor.
