# Règle: Vérification Automatique du Statut du Projet

**Date de création:** 28 Janvier 2026  
**Priorité:** 🔴 CRITIQUE  
**Scope:** Tous les agents BMAD (SM, Dev, QA, PM, etc.)

---

## 🎯 Principe Fondamental

**À CHAQUE instruction reçue, l'agent DOIT vérifier s'il doit mettre à jour le statut du projet.**

Le fichier `sprint-status.yaml` est la **source de vérité unique** pour l'état du développement. Il DOIT être maintenu à jour en temps réel.

---

## 📋 Workflow Obligatoire

### Étape 1: Vérification Pré-Instruction

**AVANT de traiter toute instruction utilisateur, l'agent DOIT:**

1. **Charger le fichier sprint-status.yaml**
   - Chemin: `{project-root}/_bmad-output/implementation-artifacts/sprint-status.yaml`
   - Lire le fichier COMPLET pour comprendre l'état actuel

2. **Identifier le contexte de l'instruction**
   - L'instruction concerne-t-elle une story spécifique ?
   - L'instruction modifie-t-elle l'état d'une story ?
   - L'instruction complète-t-elle une story ?
   - L'instruction crée-t-elle une nouvelle story ?

### Étape 2: Traitement de l'Instruction

**Pendant le traitement de l'instruction:**

- Si l'instruction complète une story → Marquer comme `done`
- Si l'instruction démarre une story → Marquer comme `in-progress`
- Si l'instruction met une story en review → Marquer comme `review`
- Si l'instruction crée une nouvelle story → Ajouter avec statut `ready-for-dev`
- Si l'instruction modifie l'état d'un epic → Mettre à jour le statut de l'epic

### Étape 3: Mise à Jour Post-Instruction

**APRÈS avoir traité l'instruction, l'agent DOIT:**

1. **Vérifier si le statut doit être mis à jour**
   - Comparer l'état actuel avec l'état attendu après l'instruction
   - Identifier les changements de statut nécessaires

2. **Mettre à jour sprint-status.yaml si nécessaire**
   - Charger le fichier COMPLET
   - Préserver TOUS les commentaires et la structure
   - Mettre à jour uniquement les lignes concernées
   - Sauvegarder le fichier

3. **Confirmer la mise à jour**
   - Afficher un message de confirmation si mise à jour effectuée
   - Exemple: `✅ Sprint status mis à jour: story-2-11b → done`

---

## 🔍 Cas d'Usage Spécifiques

### Cas 1: Story Complétée

**Quand:** L'utilisateur indique qu'une story est terminée, ou l'agent complète une story

**Action:**
```yaml
# AVANT
2-11b-persist-first-architecture: staging-monitoring

# APRÈS
2-11b-persist-first-architecture: done
```

**Message:** `✅ Sprint status mis à jour: 2-11b-persist-first-architecture → done`

### Cas 2: Story Démarrée

**Quand:** L'utilisateur demande de commencer une story, ou l'agent commence le travail

**Action:**
```yaml
# AVANT
2-9-e2e-test-completion: ready-for-dev

# APRÈS
2-9-e2e-test-completion: in-progress
```

**Message:** `🔄 Sprint status mis à jour: 2-9-e2e-test-completion → in-progress`

### Cas 3: Story en Review

**Quand:** L'utilisateur demande une review, ou l'agent marque une story comme prête pour review

**Action:**
```yaml
# AVANT
2-9-e2e-test-completion: in-progress

# APRÈS
2-9-e2e-test-completion: review
```

**Message:** `📋 Sprint status mis à jour: 2-9-e2e-test-completion → review`

### Cas 4: Nouvelle Story Créée

**Quand:** Une nouvelle story est créée via le workflow create-story

**Action:**
```yaml
# Ajouter une nouvelle ligne dans la section epic appropriée
2-13-new-feature: ready-for-dev  # Linear: BMA-XX
```

**Message:** `🆕 Sprint status mis à jour: Nouvelle story 2-13-new-feature ajoutée (ready-for-dev)`

### Cas 5: Epic Complété

**Quand:** Toutes les stories d'un epic sont `done`

**Action:**
```yaml
# AVANT
epic-2: in-progress
2-9-e2e-test-completion: done
2-10-unit-tests-documentation: done
2-11a-quick-wins: done
2-12-cleanup-job-posts-orphelins: done

# APRÈS
epic-2: done
2-9-e2e-test-completion: done
2-10-unit-tests-documentation: done
2-11a-quick-wins: done
2-12-cleanup-job-posts-orphelins: done
```

**Message:** `🎉 Epic 2 complété! Toutes les stories sont done.`

---

## ⚠️ Règles de Préservation

**CRITIQUE:** Lors de la mise à jour de sprint-status.yaml:

1. **Préserver TOUS les commentaires**
   - Ne pas supprimer les commentaires existants
   - Préserver les commentaires inline (`# Linear: BMA-XX`)
   - Préserver les sections de commentaires

2. **Préserver la structure**
   - Maintenir l'indentation YAML
   - Maintenir l'ordre des stories
   - Maintenir les sections d'epic

3. **Préserver les métadonnées**
   - Ne pas modifier les champs `generated`, `project`, `project_key`, etc.
   - Ne pas modifier les définitions de statut en haut du fichier

---

## 🔄 Intégration avec les Workflows Existants

Cette règle complète les workflows existants:

- **create-story workflow:** Met déjà à jour sprint-status.yaml ✅
- **dev-story workflow:** Met déjà à jour sprint-status.yaml ✅
- **code-review workflow:** Met déjà à jour sprint-status.yaml ✅

**Cette règle garantit que même les instructions hors workflow mettent à jour le statut.**

---

## 📝 Exemples de Messages

### Mise à jour réussie:
```
✅ Sprint status mis à jour: 2-11b-persist-first-architecture → done
```

### Aucune mise à jour nécessaire:
```
ℹ️ Aucune mise à jour du sprint status nécessaire pour cette instruction.
```

### Story non trouvée:
```
⚠️ Story 2-99-unknown non trouvée dans sprint-status.yaml. Vérifiez le nom de la story.
```

### Fichier non trouvé:
```
❌ sprint-status.yaml non trouvé. Exécutez le workflow sprint-planning pour le créer.
```

---

## 🎯 Checklist pour Chaque Agent

**À chaque instruction, l'agent DOIT:**

- [ ] Charger sprint-status.yaml
- [ ] Identifier si l'instruction concerne une story/epic
- [ ] Déterminer si un changement de statut est nécessaire
- [ ] Mettre à jour sprint-status.yaml si nécessaire
- [ ] Préserver tous les commentaires et la structure
- [ ] Confirmer la mise à jour à l'utilisateur

---

**Cette règle s'applique à TOUS les agents BMAD sans exception.**
