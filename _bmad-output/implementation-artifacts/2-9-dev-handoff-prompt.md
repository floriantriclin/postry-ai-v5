# Passation Dev – Story 2-9 (E2E Test Completion)

**À faire :** Ouvrir une **nouvelle fenêtre de chat** dans Cursor, puis coller le bloc ci-dessous.

---

## Prompt à coller dans le nouveau chat

```
/bmad-bmm-dev.agent

Lance le workflow Dev Story (DS) pour la story 2-9 avec le fichier story suivant. Utilise ce fichier comme contexte unique pour l’implémentation.

Story path: _bmad-output/implementation-artifacts/story-2-9-e2e-test-completion.md
```

---

## Si la commande /bmad-bmm-dev.agent n’existe pas

Coller à la place :

```
Tu es l’agent Dev (Amelia). Charge la config depuis _bmad/bmm/config.yaml, puis exécute le workflow dev-story pour cette story :

Fichier story : _bmad-output/implementation-artifacts/story-2-9-e2e-test-completion.md

Le fichier contient toute la story 2-9 (E2E Test Completion) avec la section "Contexte Dev (pour dev-story)" en fin de document. Suis les tasks/subtasks dans l’ordre, applique la git strategy (docs/git-strategy.md) et mets à jour Linear (BMA-10) via MCP. Ne t’arrête pas avant que tous les AC soient satisfaits et tous les tests passent.
```

---

## Rappel

- **Story :** 2-9 E2E Test Completion (Linear BMA-10)
- **Objectif :** 24/24 tests E2E passants, fix mock fallback quiz sans GEMINI_API_KEY, CI/CD E2E, doc.
- **Contexte complet :** dans `story-2-9-e2e-test-completion.md` (section « Contexte Dev » en bas).
