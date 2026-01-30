# Règle: Synchronisation Linear ↔ Fichiers Locaux + Stratégie "Pointeur & Payload"

**Date de création:** 27 Janvier 2026  
**Dernière mise à jour:** 28 Janvier 2026  
**Priorité:** 🔴 CRITIQUE  
**Scope:** Tous les agents BMAD

**⚠️ IMPORTANT:** Cette règle doit être appliquée en conjonction avec `.cursor/rules/project-status-check.md` qui définit la vérification automatique du statut du projet à chaque instruction.

---

## 🎯 Principe Fondamental

**Ne JAMAIS dupliquer l'information.**  
**Linear = Pointeurs (Titres, Priorités, Statuts, Description fonctionnelle ~20 lignes)**  
**Local (_bmad/) = Payload (Contenu technique détaillé)**

**Linear et les fichiers locaux (`_bmad-output/implementation-artifacts`) doivent TOUJOURS être cohérents.**

Toute modification qui remet en question le contenu de l'un DOIT être synchronisée avec l'autre.

---

## 🟦 CE QUI VA DANS LINEAR

Linear est le **tableau de bord pour l'Humain et l'équipe**. Contenu fonctionnel et contextuel (~20 lignes max).

### Epics
- Les grands blocs fonctionnels
- Exemple: "Auth System", "User Dashboard"
- Description: Contexte fonctionnel (~20 lignes) + lien vers spécifications locales

### User Stories (Tickets)
- Le **"Quoi" fonctionnel** avec contexte suffisant
- **Description:** ~20 lignes permettant de comprendre:
  - Le problème à résoudre / la fonctionnalité à implémenter
  - Les bugs/stories liés
  - L'impact business/technique
  - Les dépendances clés
  - **Lien vers fichier local** pour détails techniques complets

### Bugs
- Titre court + Description contextuelle (~20 lignes)
- **Description:** 
  - Résumé du problème
  - Impact utilisateur/business
  - Steps to reproduce (si pertinent)
  - Lien vers fichier de logs local si logs complexes

### Priorité & Statut
- **Priorité:** Urgent, High, Normal, Low
- **Statut:** Todo, In Progress, In Review, Done
- **Estimation:** Points/heures

### Règle d'Or pour Description Linear
**~20 lignes maximum** permettant de définir correctement la story/bug avec:
- Contexte fonctionnel clair
- Problème/objectif bien défini
- Impact et dépendances
- **Lien vers fichier local** pour spécifications techniques détaillées

L'IA peut déduire le chemin du fichier depuis le nom de la story/bug.

---

## 📂 CE QUI RESTE EN LOCAL (_bmad/)

Le dossier local est la **mémoire vive pour l'Agent IA**. Contenu technique détaillé.

### sprint-status.yaml (CRITIQUE)
- **L'état temps réel du développement**
- "On a fini l'auth, on bosse sur la DB, le test X échoue"
- **C'est ce que l'IA lit en premier** pour comprendre où on en est
- Format: `story-id: status # Commentaire`

### architecture.md
- Choix techniques (Stack, DB Schema)
- Décisions architecturales
- Patterns utilisés

### tech_specs/ ou implementation-artifacts/
- Plans d'implémentation détaillés
- L'IA écrit ces fichiers **avant de coder**
- Spécifications techniques complètes
- Tests requis, critères d'acceptation détaillés
- Fichiers à créer/modifier
- Architecture détaillée

### Logs d'erreurs complexes
- **Inutile de polluer Linear** avec 500 lignes de stacktrace
- Mettre dans un fichier temporaire local pour analyse
- Exemple: `_bmad-output/implementation-artifacts/bug-2-X-logs.md`
- Lien depuis Linear si nécessaire

### Documents de référence
- Decision records (ADR)
- Quality checks
- Test results
- Deployment plans
- Tous les documents techniques détaillés

---

## 📋 Règles de Synchronisation

### 1. Local → Linear (Mise à jour vers Linear)

**QUAND:** Un agent modifie un fichier story/bug local ET le contenu diverge de Linear

**ALORS:**
1. ✅ Détecter la divergence (comparer titre, description, priorité, estimation, statut)
2. ✅ Informer l'utilisateur des changements détectés
3. ✅ Demander confirmation explicite
4. ✅ Mettre à jour Linear avec `update_issue` (description ~20 lignes max, pas le contenu technique complet)
5. ✅ Confirmer la synchronisation réussie

**Exemple:**
```
Agent: "J'ai modifié la description de Story 2.11 dans story-2-11-epic-2-bug-fixes.md.
La description dans Linear (BMA-9) est différente.

Changements détectés:
- Description: +300 lignes (nouvelle architecture Persist-First)
- Estimation: 10h (inchangé)

Je vais mettre à jour Linear avec une description résumée (~20 lignes) + lien vers fichier local.
Voulez-vous mettre à jour Linear BMA-9 ? [y/n]"
```

---

### 2. Linear → Local (Mise à jour depuis Linear)

**QUAND:** Linear est mis à jour (par user ou autre agent) ET diverge du fichier local

**ALORS:**
1. ✅ Détecter la divergence lors d'une lecture Linear
2. ✅ Informer l'utilisateur des changements
3. ✅ Demander confirmation explicite
4. ✅ Mettre à jour le fichier `.md` local correspondant
5. ✅ Confirmer la synchronisation réussie

**Exemple:**
```
Agent: "L'issue Linear BMA-9 a été mise à jour:
- Priorité: Urgent → High
- Assignee: Ajouté (Florian)

Le fichier local story-2-11-epic-2-bug-fixes.md n'est pas à jour.

Voulez-vous mettre à jour le fichier local ? [y/n]"
```

---

### 3. Résolution de Conflits

**EN CAS DE:** Modifications des deux côtés (Local ET Linear modifiés)

**ALORS:** **Linear prime** (source de vérité officielle)

**Process:**
1. ⚠️ Avertir l'utilisateur du conflit détecté
2. 📊 Montrer les différences (diff style)
3. 🤔 Proposer 3 options:
   - **[L]inear wins:** Écraser local avec Linear
   - **[M]erge:** Fusionner intelligemment (demander détails)
   - **[K]eep local:** Garder local et overwrite Linear (à éviter)

**Exemple:**
```
Agent: "⚠️ CONFLIT DÉTECTÉ sur BMA-9 / story-2-11-epic-2-bug-fixes.md

Linear (modifié il y a 2h):
  Priorité: High
  Description: [version résumée ~20 lignes]

Local (modifié il y a 30min):
  Priorité: Urgent
  Description: [version complète avec architecture détaillée]

Options:
[L] Linear wins - Écraser local avec Linear (perte de vos changements)
[M] Merge - Fusionner (priorité de Linear + description locale complète)
[K] Keep local - Écraser Linear avec local (recommandé si changements techniques majeurs)

Votre choix? [L/M/K]"
```

---

## 🔄 Champs Synchronisés

### ✅ Synchronisation Bidirectionnelle (Local ↔ Linear)
- **Titre** (title)
- **Description** (description) - Version résumée ~20 lignes dans Linear, complète dans Local
- **Priorité** (priority)
- **Estimation** (estimate)
- **Statut** (status)
- **Labels** (labels)
- **Relations** (parent, blockers, related issues)

### ➡️ Linear → Local Uniquement
- **Assignee** (décision d'équipe dans Linear)
- **Dates** (createdAt, updatedAt)
- **Commentaires** (discussion dans Linear)
- **URL** (généré par Linear)
- **Git Branch Name** (généré par Linear)

### ⬅️ Local → Linear (Référence uniquement)
- **Détails d'implémentation** (trop verbeux, résumé dans Linear)
- **Notes de meeting** (fichier séparé, référencé dans Linear)
- **Architecture complète** (lien vers fichier dans Linear description)
- **AC détaillés** (dans fichier local, résumé dans Linear)
- **Tests complets** (dans fichier local, mention dans Linear)

---

## ✅ RÈGLES D'APPLICATION

### Quand créer/mettre à jour Linear
1. **Créer ticket Linear** avec titre + description fonctionnelle (~20 lignes max)
2. **Ajouter lien** vers fichier local dans description
3. **Mettre à jour statut** dans Linear quand statut change dans sprint-status.yaml
4. **NE PAS** copier le contenu technique complet dans Linear

### Quand créer/mettre à jour fichiers locaux
1. **Créer fichier story/bug** dans `_bmad-output/implementation-artifacts/`
2. **Contenu technique complet** : AC, tests, architecture, etc.
3. **Mettre à jour sprint-status.yaml** en premier
4. **Synchroniser statut** vers Linear (statut uniquement, pas le contenu complet)

### Format de Description Linear Recommandé (~20 lignes)

```markdown
[Contexte fonctionnel - 2-3 lignes]

[Problème/Objectif - 3-4 lignes]

[Bugs/Stories liés - 2-3 lignes]

[Impact business/technique - 2-3 lignes]

[Dépendances clés - 2-3 lignes]

Voir spécifications techniques complètes dans: _bmad-output/implementation-artifacts/story-2-X.md
```

---

## 🚨 ANTI-PATTERNS À ÉVITER

### ❌ NE JAMAIS
1. **Copier le contenu technique complet** dans la description Linear
2. **Dupliquer les AC détaillés** dans Linear
3. **Mettre les logs d'erreurs complets** dans Linear
4. **Créer des documents techniques** dans Linear (utiliser fichiers locaux)
5. **Ignorer sprint-status.yaml** (c'est la source de vérité pour l'IA)
6. **Dépasser ~20 lignes** dans la description Linear (utiliser fichier local)

### ✅ TOUJOURS
1. **Garder Linear fonctionnel** (~20 lignes max pour contexte suffisant)
2. **Mettre le contenu technique** dans fichiers locaux
3. **Lier Linear → Local** via description
4. **Mettre à jour sprint-status.yaml** en premier
5. **Synchroniser statut** Linear depuis sprint-status.yaml

---

## 📋 WORKFLOW RECOMMANDÉ

### Création d'une Story
1. **Créer fichier local** `story-2-X.md` avec contenu technique complet
2. **Créer ticket Linear** avec titre + description fonctionnelle (~20 lignes) + lien vers fichier
3. **Mettre à jour sprint-status.yaml** avec statut initial
4. **Ajouter URL Linear** dans le fichier story local

### Mise à jour de statut
1. **Mettre à jour sprint-status.yaml** en premier (source de vérité)
2. **Synchroniser statut** vers Linear (statut uniquement)
3. **Optionnel:** Ajouter commentaire court dans Linear si changement significatif

### Résolution d'un Bug
1. **Créer fichier local** avec logs/analyse si complexe
2. **Créer ticket Linear** avec titre + description contextuelle (~20 lignes) + lien si logs locaux
3. **Mettre à jour sprint-status.yaml**
4. **Résoudre dans Linear** quand fix déployé

---

## 🔍 Détection de Divergence

### Comment détecter ?

**Au moment de:**
1. **Création d'issue Linear:** Vérifier si fichier local existe déjà
2. **Modification fichier local:** Vérifier si issue Linear existe et comparer
3. **Lecture issue Linear:** Vérifier si fichier local existe et comparer
4. **Workflows create-story:** Toujours créer Linear + Local ensemble

**Méthode de comparaison:**
- Comparer titre, priorité, estimation, statut (exact match)
- Pour description: Comparer version résumée (~20 lignes) dans Linear vs résumé dans fichier local
- Ne pas comparer contenu technique complet (il reste dans fichier local uniquement)

---

## 🔗 EXEMPLES CONCRETS

### Exemple 1: Story Technique (BMA-48)

**Linear (~20 lignes):**
```markdown
Implémenter l'architecture Persist-First pour résoudre les bugs de sécurité critiques identifiés dans Epic 2.

**Problème:**
Les données sensibles du quiz persistent indéfiniment dans localStorage, créant un risque de sécurité majeur. De plus, les utilisateurs peuvent soumettre plusieurs emails pour le même post, causant des duplications.

**Bugs résolus:**
- BUG-006 (BMA-45): localStorage sans expiration
- BUG-007 (BMA-46): Email multi-soumission
- Résout automatiquement: BUG-001 (double appel API), BUG-004 (data loss)

**Solution:**
Nouvelle architecture où les posts sont persistés en DB AVANT l'authentification, avec rate limiting IP (5 posts/heure). Le localStorage est immédiatement vidé après la persistance réussie.

**Dépendances:**
- Story 2.8 (Rate Limiting) ✅ DONE
- Feature flag `ENABLE_PERSIST_FIRST` obligatoire pour rollout progressif

Voir spécifications techniques complètes dans: `_bmad-output/implementation-artifacts/story-2-11-epic-2-bug-fixes.md`
```

**Local:**
- Fichier: `story-2-11-epic-2-bug-fixes.md` (601 lignes)
- Contenu: AC détaillés, architecture complète, tests (28 unitaires + 36 E2E), fichiers à créer/modifier, etc.

### Exemple 2: Bug Complexe

**Linear (~20 lignes):**
```markdown
Dashboard crash avec multiple posts lors de la récupération du dernier post.

**Problème:**
Le dashboard utilise `.single()` pour récupérer le dernier post, ce qui échoue quand l'utilisateur a plusieurs posts. L'application crash avec une erreur "Expected 1 row, got 2+".

**Impact:**
Dashboard inaccessible pour tous les utilisateurs ayant créé 2+ posts. Bloque l'accès à l'historique des posts.

**Steps to reproduce:**
1. Créer 2+ posts avec le même compte
2. Naviguer vers /dashboard
3. Crash avec erreur Supabase

**Solution:**
Remplacer `.single()` par array indexing avec filtre par status. Utiliser le premier post avec status='published'.

**Logs détaillés:** `_bmad-output/implementation-artifacts/bug-2-X-logs.md`
```

**Local:**
- Fichier: `bug-2-X-logs.md`
- Contenu: Stacktrace complet, analyse détaillée, solution proposée avec code

---

## ⚡ Actions Requises des Agents

### TOUJOURS Faire:
- ✅ Vérifier divergence avant toute modification
- ✅ Informer l'utilisateur des changements
- ✅ Demander confirmation explicite
- ✅ Confirmer synchronisation réussie
- ✅ Logger les synchronisations (console)
- ✅ Garder description Linear ~20 lignes max (contexte fonctionnel)

### JAMAIS Faire:
- ❌ Synchroniser silencieusement sans confirmation
- ❌ Overwrite sans montrer les différences
- ❌ Ignorer les divergences détectées
- ❌ Modifier Linear sans vérifier le fichier local
- ❌ Modifier le fichier local sans vérifier Linear
- ❌ Copier contenu technique complet dans Linear

---

## 🚫 Exceptions (Pas de Synchronisation)

### Issues Linear à NE PAS synchroniser localement:
- ❌ Statut: "Duplicate" (référence au duplicata suffit)
- ❌ Statut: "Cancelled" (archivé)
- ❌ Label: "Draft" ou "WIP" (travail en cours)

### Fichiers locaux à NE PAS pousser vers Linear:
- ❌ Notes techniques détaillées (`tech-note-*.md`) → Créer issue séparée avec label "Technical Note"
- ❌ Documents d'architecture (`architecture/*.md`) → Référencer dans description Linear
- ❌ Meeting notes (`meeting-*.md`) → Résumé dans commentaire Linear

---

## 🔧 Intégration avec Workflows Existants

### Workflows Affectés:
1. ✅ **create-story** → Créer Linear + Local ensemble
2. ✅ **update-story** → Vérifier divergence avant update
3. ✅ **sprint-planning** → Synchroniser sprint-status.yaml ↔ Linear
4. ✅ **dev-story** → Vérifier Linear au début, synchro à la fin
5. ✅ **code-review** → Mettre à jour Linear si story modifiée

---

## 📊 Métriques de Succès

**Objectifs:**
- ✅ 100% des stories ont Linear + fichier local cohérents
- ✅ 0 divergence non détectée
- ✅ < 5 minutes pour détecter et synchroniser
- ✅ 100% des synchronisations confirmées par user
- ✅ Descriptions Linear ~20 lignes max (contexte fonctionnel suffisant)

---

**Créé le:** 27 Janvier 2026  
**Dernière mise à jour:** 28 Janvier 2026  
**Maintenu par:** BMAD System  
**Version:** 2.0  
**Statut:** ✅ ACTIF

---

**🎯 RÈGLE D'OR: Linear = Pointeurs (~20 lignes fonctionnel), Local = Payload (technique détaillé)**
