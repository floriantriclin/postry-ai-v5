# Mise à jour Linear - BMA-49

**Statut:** In Review  
**Description résumée:**

Story 2-11a: Quick Wins - Dashboard & Archetype Fixes

Corrige deux bugs critiques identifiés dans Epic 2:

**BUG-002:** Dashboard crash avec multiple posts
- Retiré .single() de la requête Supabase
- Ajouté filtre status='revealed'
- Amélioré gestion d'erreur

**BUG-003:** Colonne archetype manquante
- Migration SQL créée avec backfill
- API persist-on-login mise à jour
- Fallback chain vérifiée

**Implémentation complète:**
- ✅ Tous les AC satisfaits
- ✅ Tests E2E créés
- ✅ Migration SQL prête
- ✅ Guide QA disponible

**Fichier story complet:** `_bmad-output/implementation-artifacts/2-11a-quick-wins.md`
**Guide QA:** `docs/qa/2-11a-test-execution-guide.md`

**Statut:** Review (prêt pour tests QA)
