# Règles Cursor - Postry AI

**Dernière mise à jour:** 28 Janvier 2026

---

## 📋 Liste des Règles

### 🔴 Règles Critiques (Priorité Haute)

1. **[project-status-check.md](./project-status-check.md)** ⭐ NOUVEAU
   - **Vérification automatique du statut du projet à chaque instruction**
   - Tous les agents DOIVENT vérifier et mettre à jour `sprint-status.yaml` si nécessaire
   - **À lire en premier avant toute instruction**

2. **[linear-sync.md](./linear-sync.md)**
   - Synchronisation Linear ↔ Fichiers Locaux
   - Stratégie "Pointeur & Payload"
   - Garantit la cohérence entre Linear et les fichiers locaux

### 🟡 Règles de Workflow

3. **[dev-workflow.md](./dev-workflow.md)**
   - Workflow de développement simplifié (Speed Mode)
   - Règles pour développement solo rapide vers MVP

4. **[git-strategy.md](../docs/git-strategy.md)** ⭐ NOUVEAU
   - Stratégie Git/GitHub complète du projet
   - Workflow branches (main/dev/features)
   - Conventions de commit et processus de merge
   - **À consulter avant tout développement**

---

## 🎯 Comment Utiliser Ces Règles

### Pour les Agents BMAD

**À chaque instruction utilisateur, l'agent DOIT:**

1. ✅ **Lire project-status-check.md** (vérification automatique du statut)
2. ✅ **Lire git-strategy.md** (si développement ou gestion git concernée)
3. ✅ **Lire linear-sync.md** (si synchronisation Linear nécessaire)
4. ✅ **Lire dev-workflow.md** (si workflow de développement concerné)
5. ✅ **Appliquer les règles pertinentes**
6. ✅ **Mettre à jour sprint-status.yaml si nécessaire**

### Ordre de Priorité

1. **project-status-check.md** → Toujours vérifier en premier
2. **git-strategy.md** → Si développement ou gestion git concernée
3. **linear-sync.md** → Si synchronisation Linear nécessaire
4. **dev-workflow.md** → Si workflow de développement concerné

---

## 📝 Notes

- Toutes les règles sont en français
- Les règles sont complémentaires (pas exclusives)
- Les règles critiques doivent être appliquées systématiquement
- En cas de conflit, la règle la plus spécifique prime

---

**Maintenu par:** BMAD System  
**Version:** 1.0
