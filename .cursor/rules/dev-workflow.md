# Postry AI - Development Workflow

## 🚀 SPEED MODE ACTIF (Pré-MVP)

**Mode actuel:** Développement solo, itération rapide vers le MVP

### Règles ABSOLUES:

1. **SIMPLIFIER** au maximum toutes les propositions
2. **PAS de feature flags** (sauf argent/DB critique)
3. **PAS de rollout progressif**
4. **PAS de tests exhaustifs** (juste smoke test 2-3 min)
5. **PAS de monitoring 24-48h**
6. **TOUJOURS demander:** "Peut-on faire plus simple?"

### Workflow Standard:

```
Dev → Push → Auto-deploy dev.postry.ai → Test rapide (2-3 min) → DONE ✅
```

**Temps total target:** 1-2h max par feature

### Branches:

- `dev`: Solo dev (Florian) → dev.postry.ai
- `main`: Beta testeurs (famille) → postry.ai

### Default Response:

**"Ship it!"** 🚢

---

**Doc complète:** `_bmad-output/implementation-artifacts/dev-workflow-simplification.md`

**Valid jusqu'à:** MVP + premiers users payants
