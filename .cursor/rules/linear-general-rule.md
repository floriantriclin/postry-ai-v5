# Règle Générale: Vérification Linear Obligatoire

**Date de création:** 29 Janvier 2026  
**Priorité:** 🔴 CRITIQUE  
**Scope:** Tous les agents BMAD

---

## 🎯 Principe Fondamental

**Chaque agent DOIT vérifier et synchroniser Linear lorsqu'il modifie le projet avec un impact sur les issues Linear.**

Cette règle s'applique **automatiquement** via le protocole `linear_sync_check` dans `workflow.xml`, mais les agents doivent aussi être conscients de cette obligation.

---

## ✅ Quand Vérifier Linear

Un agent DOIT vérifier Linear dans ces situations :

### 1. Création de Stories/Bugs
- ✅ Créer une story → Créer issue Linear correspondante
- ✅ Détecter un bug → Créer issue Linear pour le bug
- ✅ Créer un epic → Créer issue Linear pour l'epic

### 2. Modification de Statut
- ✅ Story passe de "backlog" → "ready-for-dev" → Mettre à jour Linear
- ✅ Story passe de "ready-for-dev" → "in-progress" → Mettre à jour Linear
- ✅ Story passe de "in-progress" → "review" → Mettre à jour Linear
- ✅ Story passe de "review" → "done" → Mettre à jour Linear

### 3. Modification de Contenu
- ✅ Story file modifié → Vérifier divergence avec Linear
- ✅ Sprint status modifié → Synchroniser statuts vers Linear
- ✅ Priorité/estimation changée → Mettre à jour Linear

### 4. Découverte de Problèmes
- ✅ Code review trouve bug critique → Créer issue Linear
- ✅ Tests échouent → Créer issue Linear si bug
- ✅ Découverte de régression → Créer issue Linear

---

## 🚨 Règles d'Application

### TOUJOURS Faire:
1. ✅ **Utiliser MCP tools directement** (`update_issue`, `create_issue`, `get_issue`, `list_issues`)
2. ✅ **Vérifier si issue existe** avant de créer
3. ✅ **Synchroniser statuts** quand statut local change
4. ✅ **Suivre format Linear** (~20 lignes max pour description)
5. ✅ **Ajouter lien vers fichier local** dans description Linear

### JAMAIS Faire:
1. ❌ **Créer des fichiers d'instructions** (comme `*-linear-update.md`)
2. ❌ **Ignorer les divergences** détectées
3. ❌ **Modifier Linear sans vérifier** le fichier local
4. ❌ **Modifier fichier local sans vérifier** Linear
5. ❌ **Copier contenu technique complet** dans Linear

---

## 🔧 Intégration Technique

### Protocole Automatique

Le protocole `linear_sync_check` dans `{project-root}/_bmad/core/tasks/workflow.xml` est **automatiquement invoqué** à la fin de chaque workflow qui modifie des fichiers impactant Linear.

**Les agents n'ont pas besoin d'invoquer manuellement ce protocole** - il s'exécute automatiquement.

### Workflows avec Vérifications Spécifiques

Certains workflows ont des vérifications Linear spécifiques intégrées :

1. **create-story** → Crée issue Linear après création story
2. **dev-story** → Met à jour Linear quand story complétée
3. **code-review** → Crée bugs Linear pour findings critiques
4. **sprint-planning** → Synchronise statuts avec Linear

---

## 📋 Checklist pour Agents

Avant de terminer une modification qui impacte Linear :

- [ ] Ai-je modifié un fichier story/bug/sprint-status ?
- [ ] Y a-t-il un Linear issue ID associé ?
- [ ] Le statut a-t-il changé ?
- [ ] Y a-t-il des divergences détectées ?
- [ ] Dois-je créer une nouvelle issue Linear ?
- [ ] Ai-je utilisé les outils MCP directement (pas de fichiers) ?

---

## 🔗 Références

- **Règle détaillée:** `.cursor/rules/linear-sync.md`
- **Guide agents:** `_bmad/_memory/AGENTS-LINEAR-GUIDE.md`
- **Protocole:** `_bmad/core/protocols/linear-integration.xml`
- **Config:** `_bmad/_memory/linear-config.yaml`

---

**Créé le:** 29 Janvier 2026  
**Dernière mise à jour:** 29 Janvier 2026  
**Maintenu par:** BMAD System  
**Statut:** ✅ ACTIF

---

**🎯 RÈGLE D'OR: Si tu modifies le projet et que ça impacte Linear, tu DOIS vérifier et synchroniser Linear directement via MCP.**
