# 📘 Guide Linear pour les Agents BMAD

**Date de création :** 27 Janvier 2026  
**Statut :** ✅ ACTIF  
**Tracking System :** Linear (Team: BMAD)

---

## 🎯 Objectif

Tous les agents BMAD doivent utiliser **Linear** comme système de tracking principal pour :
- 🐛 Bugs
- ✨ Features
- 📋 User Stories
- 🔄 Tasks
- 📝 Improvements

---

## 🚨 RÈGLES CRITIQUES

### ❌ NE JAMAIS
1. **Créer des fichiers de bugs** dans `docs/` - Utiliser Linear à la place
2. **Dupliquer des issues** - Toujours vérifier si l'issue existe déjà
3. **Ignorer le protocole** - Suivre `linear-integration.xml`
4. **Créer des issues sans vérifier** la config Linear
5. **Modifier Linear OU fichier local sans synchroniser l'autre** 🔴 NOUVEAU

### ✅ TOUJOURS
1. **Vérifier les issues existantes** avec `list_issues` avant de créer
2. **Utiliser le protocole** `linear-integration.xml` pour toute opération
3. **Ajouter les URLs Linear** dans les documents de référence
4. **Mapper correctement** les priorités (critique→1, high→2, etc.)
5. **Assigner à l'utilisateur** si demandé ou logique
6. **Synchroniser Linear ↔ Fichiers locaux** - Voir règle détaillée ci-dessous 🔴 NOUVEAU

---

## 🔄 Règle de Synchronisation Linear ↔ Local (CRITIQUE)

**📘 Règle complète et détaillée:** `.cursor/rules/linear-sync.md`

**⚠️ IMPORTANT:** Cette section résume les points clés. Pour les détails complets (stratégie "Pointeur & Payload", résolution de conflits, workflow recommandé), consultez `.cursor/rules/linear-sync.md`.

### Principe Fondamental
**Ne JAMAIS dupliquer l'information.**  
**Linear = Pointeurs (Titres, Priorités, Statuts, Description fonctionnelle ~20 lignes)**  
**Local (_bmad/) = Payload (Contenu technique détaillé)**

**Linear et fichiers locaux (`_bmad-output/implementation-artifacts`) doivent TOUJOURS être cohérents.**

### Quand synchroniser ?
1. **Local → Linear**: Fichier story/bug modifié → Mettre à jour Linear (description résumée ~20 lignes + lien vers fichier)
2. **Linear → Local**: Issue Linear modifiée → Mettre à jour fichier local
3. **Conflit**: Linear prime (source de vérité) - Voir résolution détaillée dans `.cursor/rules/linear-sync.md`

### Process de Synchronisation (Résumé)
```
1. Détecter divergence (comparer titre, priorité, statut, description résumée)
2. Informer utilisateur des changements détectés
3. Demander confirmation explicite
4. Synchroniser (Linear: ~20 lignes max, Local: contenu technique complet)
5. Confirmer la synchronisation réussie
```

### Champs synchronisés
- **Titre** (title)
- **Description** (description) - Version résumée ~20 lignes dans Linear, complète dans Local
- **Priorité** (priority)
- **Estimation** (estimate)
- **Statut** (status)
- **Labels** (labels)
- **Relations** (parent, blockers, related issues)

### ⚠️ Règles Critiques
- **JAMAIS synchroniser silencieusement** - Toujours demander confirmation à l'utilisateur
- **JAMAIS copier le contenu technique complet** dans Linear (utiliser fichier local)
- **TOUJOURS garder description Linear ~20 lignes max** (contexte fonctionnel suffisant)
- **TOUJOURS lier Linear → Local** via description avec chemin du fichier

**Pour plus de détails:** Voir `.cursor/rules/linear-sync.md` (sections complètes sur résolution de conflits, workflow recommandé, exemples concrets)

---

## 📋 Quand Utiliser Linear

### Scénario 1 : Découverte d'un Bug 🐛

**Workflow automatique :**

```yaml
1. Analyser le bug (impact, sévérité, reproductibilité)
2. VÉRIFIER si bug déjà dans Linear:
   → list_issues(query="keywords du bug", labels=["Bug"])
3. Si existe: 
   → Afficher l'URL et demander si update nécessaire
4. Si n'existe pas:
   → invoke-protocol: linear-integration.create_linear_issue
   → Paramètres:
      - title: "🐛 [Résumé court]"
      - description: Template bug complet (voir ci-dessous)
      - priority: "critique" ou "high"
      - labels: ["Bug"]
      - estimate: en heures
5. Retourner l'URL Linear à l'utilisateur
```

### Scénario 2 : Création de Story 📖

**Dans le workflow `create-story` :**

```yaml
1. Créer d'abord le fichier story local avec contenu technique complet:
   → Fichier: _bmad-output/implementation-artifacts/story-{id}.md
   → Contenu: AC détaillés, architecture, tests, etc.

2. Créer ensuite l'issue Linear avec description résumée (~20 lignes):
   → invoke-protocol: linear-integration.create_linear_issue
   → Paramètres:
      - title: "Story {story_id}: {story_title}"
      - description: Résumé fonctionnel ~20 lignes + lien vers fichier local
        (Contexte, problème/objectif, bugs/stories liés, impact, dépendances)
      - priority: "medium"
      - labels: ["Feature"]
      - estimate: selon analyse
      - project: Nom du projet si applicable
   
3. Ajouter l'URL Linear dans le fichier story local:
   → Section "Linear Issue: {url}"
   
4. Mettre à jour sprint-status.yaml:
   → Ajouter story avec statut "ready-for-dev"
   
5. Utiliser le gitBranchName suggéré par Linear
```

**⚠️ IMPORTANT:** Ne jamais copier le contenu technique complet dans Linear. Voir `.cursor/rules/linear-sync.md` pour le format exact de description Linear.

### Scénario 3 : Sprint Planning 📅

**Dans le workflow `sprint-planning` :**

```yaml
1. Récupérer toutes les issues du sprint actuel:
   → list_issues(team="BMAD", status="Backlog")
   
2. Synchroniser avec sprint-status.yaml:
   → Comparer Linear vs fichier local
   → Alerter si divergences détectées
   → Demander confirmation avant synchronisation
   
3. Pour chaque nouvelle story à créer:
   → Créer d'abord le fichier local avec contenu technique complet
   → Créer ensuite l'issue Linear avec description résumée (~20 lignes) + lien
   → Lier les deux avec l'URL Linear dans le fichier local
   → Mettre à jour sprint-status.yaml
```

**⚠️ IMPORTANT:** Voir `.cursor/rules/linear-sync.md` pour le workflow recommandé complet et la résolution de conflits.

### Scénario 4 : Code Review 🔍

**Lorsqu'un bug est trouvé en review :**

```yaml
1. Créer l'issue Linear immédiatement
2. Marquer le code avec un commentaire:
   // TODO: Fix bug Linear BMA-XX - {url}
3. Documenter dans le rapport de review
```

---

## 📝 Templates d'Issues

**⚠️ IMPORTANT:** Ces templates sont pour les **fichiers locaux** (`_bmad-output/implementation-artifacts/`).  
Pour Linear, utiliser une **version résumée ~20 lignes** avec contexte fonctionnel + lien vers fichier local.  
Voir `.cursor/rules/linear-sync.md` pour le format exact de description Linear.

### Template Bug 🐛

**Usage:** Fichier local `bug-{id}.md` (contenu technique complet)

```markdown
## 🐛 Description

[Description claire du bug]

## 💥 Impact Business

* **Sévérité:** [Critique | Haute | Moyenne | Basse]
* **Fréquence:** [Systématique | Intermittent | Rare]
* **Users impactés:** [Tous | Certains | Développeurs uniquement]

## 📂 Fichiers concernés

* `path/to/file.tsx` (lignes X-Y)

## 🔍 Étapes de reproduction

1. Step 1
2. Step 2
3. Observer: [Résultat attendu vs obtenu]

## 🔧 Solution proposée

[Description de la solution technique]

```typescript
// Code example
```

## ✅ Critères d'acceptation

- [ ] Critère 1
- [ ] Critère 2
- [ ] Tests ajoutés

## 📊 Effort estimé

**X heures**

## 📚 Documentation

Référence : `docs/path/to/doc.md`
```

### Template Story ✨

**Usage:** Fichier local `story-{id}.md` (contenu technique complet)

```markdown
## 📖 Story

As a {role},
I want {action},
So that {benefit}.

## 🎯 Valeur Business

[Pourquoi cette story est importante]

## ✅ Critères d'Acceptation

1. [AC1]
2. [AC2]
3. [AC3]

## 🔧 Détails Techniques

### Architecture
* [Décisions techniques]

### Dépendances
* [Stories bloquantes si applicable]

## 📋 Tasks

- [ ] Task 1
- [ ] Task 2

## 📊 Estimation

**X heures** (breakdown si nécessaire)
```

---

## 🔧 Configuration & Outils

### Fichiers Clés

| Fichier | Description |
|---------|-------------|
| `_bmad/_memory/linear-config.yaml` | Configuration Linear (team, labels, mapping) |
| `_bmad/core/protocols/linear-integration.xml` | Protocole réutilisable |
| `_bmad/bmm/config.yaml` | Config globale (tracking_system: linear) |

### Outils MCP Disponibles

| Outil | Usage | Paramètres Clés |
|-------|-------|------------------|
| `list_issues` | Lister issues | team, labels, status, query |
| `create_issue` | Créer issue | title, description, priority, team, labels |
| `get_issue` | Détails d'une issue | id ou identifier (ex: BMA-5) |
| `update_issue` | Mettre à jour | id, status, description, priority |
| `list_teams` | Lister équipes | - |
| `list_issue_labels` | Lister labels | team |

---

## 🎓 Exemples Pratiques

### Exemple 1 : Agent QA Trouve un Bug

```xml
<!-- Dans le workflow de test -->
<step n="5" goal="Créer bug dans Linear si trouvé">
  <check if="bug détecté">
    <invoke-protocol name="linear-integration.create_linear_issue">
      <param name="title">🐛 [CRITICAL] Dashboard crash avec multiple posts</param>
      <param name="description">{markdown_description}</param>
      <param name="priority">critique</param>
      <param name="estimate">1</param>
      <param name="labels">["Bug"]</param>
      <param name="assignee">me</param>
    </invoke-protocol>
    
    <output>✅ Bug créé: {issue_url}</output>
  </check>
</step>
```

### Exemple 2 : Agent SM Crée une Story

```xml
<!-- Dans create-story workflow -->
<step n="6" goal="Créer issue Linear pour la story">
  <invoke-protocol name="linear-integration.create_linear_issue">
    <param name="title">Story {{story_id}}: {{story_title}}</param>
    <param name="description">{{generated_story_content}}</param>
    <param name="priority">medium</param>
    <param name="labels">["Feature"]</param>
    <param name="estimate">{{estimated_hours}}</param>
  </invoke-protocol>
  
  <action>Sauvegarder l'URL Linear dans le fichier story local</action>
</step>
```

### Exemple 3 : Agent Dev Vérifie Contexte

```xml
<!-- Avant de commencer le dev -->
<step n="1" goal="Récupérer contexte Linear">
  <invoke-protocol name="linear-integration.get_linear_context">
    <param name="filter_type">bug</param>
    <param name="filter_status">backlog</param>
  </invoke-protocol>
  
  <action>Analyser les bugs existants pour éviter régression</action>
</step>
```

---

## 🚀 Workflows Modifiés

### Workflows Concernés (À Mettre à Jour)

1. ✅ **`create-story`** → Créer issue Linear pour chaque story
2. ✅ **`sprint-planning`** → Synchroniser avec Linear
3. ⏭️ **`code-review`** → Créer bugs si trouvés
4. ⏭️ **`dev-story`** → Vérifier bugs associés
5. ⏭️ **`retrospective`** → Analyser issues fermées

### Statut d'Intégration

| Workflow | Intégré | Date | Notes |
|----------|---------|------|-------|
| create-story | ⏭️ TODO | - | Ajouter protocole à step 6 |
| sprint-planning | ⏭️ TODO | - | Sync Linear ↔ YAML |
| code-review | ⏭️ TODO | - | Auto-create bugs |
| dev-story | ⏭️ TODO | - | Check bugs avant dev |

---

## 📊 Métriques de Succès

### Objectifs

- **100%** des bugs créés dans Linear (pas de fichiers .md)
- **0** doublons d'issues
- **< 30s** pour créer une issue
- **100%** des stories liées à Linear

### Comment Mesurer

```bash
# Compter les bugs dans Linear vs fichiers locaux
linear_bugs=$(wc -l linear-bugs.txt)
local_bugs=$(find docs/ -name "*bug*.md" | wc -l)

if [ $local_bugs -gt 0 ]; then
  echo "⚠️ $local_bugs bugs encore en fichiers locaux!"
fi
```

---

## ❓ FAQ pour les Agents

### Q: Dois-je créer un fichier .md pour les bugs ?
**R:** ❌ NON. Créer uniquement dans Linear. Les .md sont obsolètes.

### Q: Que faire si l'issue existe déjà ?
**R:** Afficher l'URL à l'utilisateur et demander si update nécessaire.

### Q: Comment gérer les doublons créés par erreur ?
**R:** Demander à l'utilisateur s'il faut supprimer ou merger les doublons.

### Q: Linear est down, que faire ?
**R:** Créer un fichier temporaire dans `_bmad/_memory/pending-linear-issues/` et sync plus tard.

### Q: Comment mapper les priorités ?
**R:** Utiliser `linear-config.yaml`:
- critique → 1 (Urgent)
- high → 2 (High)
- medium → 3 (Normal)
- low → 4 (Low)

---

## 🔄 Migration des Bugs Existants

### Bugs Actuels dans Linear

| ID | Titre | Status |
|---|---|---|
| BMA-2 | [BUG-003] Colonne archetype manquante | Backlog |
| BMA-3 | [BUG-002] Dashboard crash multiple posts | Backlog |
| BMA-4 | [BUG-001] Double appel handleAuthSession | Backlog |
| BMA-5 | [BUG-004] Data loss persist-on-login | Backlog |

### Actions de Migration

1. ✅ Bugs Epic 2 → Déjà dans Linear
2. ⏭️ Nettoyer fichiers `.md` obsolètes dans `docs/`
3. ⏭️ Ajouter liens Linear dans documentation existante

---

## 📞 Support

**En cas de problème avec Linear:**
1. Vérifier que le MCP server est actif
2. Vérifier `linear-config.yaml` est valide
3. Consulter les logs d'erreur
4. Fallback: Créer fichier temporaire + notifier utilisateur

---

**Dernière mise à jour :** 28 Janvier 2026  
**Maintenu par :** BMAD System  
**Version :** 1.1

---

## 📚 Documents Liés

- **Règle de synchronisation détaillée:** `.cursor/rules/linear-sync.md` (source de vérité pour synchronisation)
- **Vérification statut projet:** `.cursor/rules/project-status-check.md` (vérification automatique sprint-status.yaml)
- **Configuration Linear:** `_bmad/_memory/linear-config.yaml`
- **Protocole d'intégration:** `_bmad/core/protocols/linear-integration.xml`
