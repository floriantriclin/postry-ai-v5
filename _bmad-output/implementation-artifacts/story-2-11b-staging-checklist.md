# Story 2.11b - Checklist Déploiement Staging

**Date:** 27 Janvier 2026  
**Story:** BMA-48 - Architecture Persist-First  
**Branch:** `florian/bma-48-story-211b-architecture-persist-first-security-stability`  
**Status:** ✅ Ready for Staging

---

## 🎯 OBJECTIF

Valider l'implémentation Persist-First en environnement staging avant le rollout production progressif (10% → 50% → 100%).

---

## 📋 PRÉ-DÉPLOIEMENT (Avant staging)

### 1. Vérifications Code
- [x] Review technique complétée (GO decision)
- [x] 162/162 tests unitaires passants
- [x] 0 blockers identifiés
- [x] Feature flag implémenté (default: false)
- [ ] Lancer linter sur les fichiers modifiés
  ```bash
  npm run lint
  ```

### 2. Vérifications Environment
- [ ] Vérifier `.env` staging a `NEXT_PUBLIC_ENABLE_PERSIST_FIRST=false`
- [ ] Vérifier variables Supabase (URL, ANON_KEY, SERVICE_KEY)
- [ ] Vérifier branch Git est à jour avec `dev`
  ```bash
  git status
  git log -3
  ```

### 3. Backup & Rollback
- [ ] Backup DB manuel via Supabase Dashboard
  - Aller sur dashboard.supabase.com
  - Projet: postry-ai
  - Database → Backups → Manual backup
- [ ] Vérifier fichier rollback existe:
  ```bash
  ls supabase/migrations/rollback/20260127_rollback_archetype.sql
  ```
- [ ] Vérifier RUNBOOK-EMERGENCY-RESTORE.md accessible

---

## 🚀 DÉPLOIEMENT STAGING

### 4. Deploy vers Staging
- [ ] Commit final si nécessaire
  ```bash
  git add .
  git commit -m "chore: ready for staging deployment (Story 2.11b)"
  ```
- [ ] Push branch
  ```bash
  git push origin florian/bma-48-story-211b-architecture-persist-first-security-stability
  ```
- [ ] Deploy sur Vercel staging (ou équivalent)
  ```bash
  # Si Vercel CLI installé
  vercel --target staging
  
  # Ou via GitHub → Vercel auto-deploy
  ```
- [ ] Noter URL staging: _______________________

### 5. Vérifications Post-Deploy
- [ ] Site staging accessible
- [ ] Aucune erreur 500 sur page d'accueil
- [ ] Console browser: 0 erreurs critiques
- [ ] Vérifier Supabase staging connecté (check posts table)

---

## 🧪 TESTS MANUELS STAGING (Critiques)

### 6. Test Happy Path - Feature Flag OFF (Old Flow)
**Objectif:** Vérifier que l'ancien flow fonctionne toujours

- [ ] Aller sur staging URL
- [ ] Compléter quiz Page 1 (6 questions)
- [ ] Compléter quiz Page 2 (6 questions)
- [ ] Cliquer "Générer mon post"
- [ ] Attendre génération (30-60s)
- [ ] Cliquer "Révéler mon identité"
- [ ] Entrer email valide
- [ ] Recevoir magic link (vérifier inbox)
- [ ] Cliquer magic link
- [ ] **VÉRIFIER:** Redirect vers `/dashboard`
- [ ] **VÉRIFIER:** Post visible dans dashboard
- [ ] **VÉRIFIER:** Aucune erreur console

**Résultat:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________

---

### 7. Test Rate Limiting (6 acquisitions)
**Objectif:** Vérifier que rate limiting fonctionne

**Important:** Utiliser même IP / même browser pour ce test

- [ ] Compléter 5 quiz → génération post (5 fois)
- [ ] **VÉRIFIER:** 5 posts créés avec succès
- [ ] Compléter 6ème quiz → génération post
- [ ] Cliquer "Révéler mon identité" (6ème fois)
- [ ] **VÉRIFIER:** Message erreur "Limite atteinte. Réessayez dans 1 heure."
- [ ] **VÉRIFIER:** Bouton "Réessayer" présent
- [ ] Ouvrir Network tab → Check response 429
- [ ] **VÉRIFIER:** Headers présents:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: [timestamp]`

**Résultat:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________

---

### 8. Test localStorage Security
**Objectif:** Vérifier qu'aucune donnée sensible ne persiste

- [ ] Compléter quiz → génération post
- [ ] Ouvrir DevTools → Application → Local Storage
- [ ] **AVANT clic "Révéler":** Noter clé `ice_quiz_state_v1` présente
- [ ] Cliquer "Révéler mon identité" → Entrer email
- [ ] **APRÈS envoi email:** Vérifier `ice_quiz_state_v1` TOUJOURS présent
  - ✅ Correct: localStorage préservé (feature flag OFF = old flow)
- [ ] Vérifier aucune donnée PII visible (email, posts, etc.)

**Résultat:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________

---

### 9. Test Error Handling - Réseau Déconnecté
**Objectif:** Vérifier graceful degradation

- [ ] Compléter quiz → génération post
- [ ] Ouvrir DevTools → Network → Throttling → Offline
- [ ] Cliquer "Révéler mon identité" → Entrer email
- [ ] **VÉRIFIER:** Message erreur user-friendly (pas de stack trace)
- [ ] **VÉRIFIER:** Bouton "Réessayer" présent
- [ ] Re-connecter réseau → Cliquer "Réessayer"
- [ ] **VÉRIFIER:** Email envoyé avec succès

**Résultat:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________

---

### 10. Test Cross-Browser (Minimum)
**Objectif:** Vérifier compatibilité navigateurs

**Chrome/Chromium:**
- [ ] Happy path fonctionne
- [ ] Aucune erreur console

**Firefox:**
- [ ] Happy path fonctionne
- [ ] Aucune erreur console

**Safari (si Mac disponible):**
- [ ] Happy path fonctionne
- [ ] Aucune erreur console

**Résultat:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________

---

## 📊 MONITORING STAGING (2-4h minimum)

### 11. Vérifications Logs & Métriques

**Sentry/Error Tracking:**
- [ ] Aucune erreur critique
- [ ] Vérifier taux d'erreur < 1%
- [ ] Aucun crash frontend

**Supabase Database:**
- [ ] Requête: Posts créés last 4h
  ```sql
  SELECT COUNT(*) FROM posts 
  WHERE created_at > NOW() - INTERVAL '4 hours';
  ```
- [ ] Requête: Posts orphelins (status='pending')
  ```sql
  SELECT COUNT(*) FROM posts 
  WHERE status = 'pending' 
  AND created_at > NOW() - INTERVAL '4 hours';
  ```
- [ ] Vérifier ratio pending/revealed normal (≈ même que production)

**Supabase Logs:**
- [ ] Aucune erreur RLS policy
- [ ] Aucune erreur auth (sessions invalides)
- [ ] Aucune erreur insert/update posts

---

## 🕐 SOAK TEST (24-48h)

### 12. Monitoring Long-Terme

**Après 24h:**
- [ ] Vérifier Sentry: 0 nouvelles erreurs critiques
- [ ] Vérifier DB: Posts orphelins < 5%
- [ ] Vérifier rate limiting: < 10 blocks/day
- [ ] Décision: GO/NO-GO pour tests avancés?

**Après 48h:**
- [ ] Vérifier stabilité générale
- [ ] Vérifier performance (temps chargement)
- [ ] Vérifier coûts Supabase (pas de spike anormal)
- [ ] **DÉCISION FINALE:** GO/NO-GO pour production?

---

## ✅ GO/NO-GO PRODUCTION

### 13. Critères GO pour Production

**Tous ces critères DOIVENT être ✅ pour passer en prod:**

- [ ] ✅ Tous les tests manuels staging passent (tests 6-10)
- [ ] ✅ Soak test 24-48h sans erreur critique
- [ ] ✅ Posts orphelins < 5%
- [ ] ✅ Rate limiting fonctionne (429 responses)
- [ ] ✅ Aucun crash frontend
- [ ] ✅ Aucune régression old flow (feature flag OFF)
- [ ] ✅ Backup DB fait
- [ ] ✅ Rollback plan validé

**Si UN SEUL critère est ❌:**
→ NO-GO production, fixer le problème, re-tester staging

---

## 🚨 ROLLBACK STAGING (Si Problème)

### 14. Procédure Rollback

**Si erreur critique détectée:**

1. **Arrêter tests** → Ne pas passer en prod
2. **Collecter logs:**
   - Sentry: Screenshots erreurs
   - Supabase: Logs DB
   - Browser console: Erreurs JS
3. **Analyser root cause**
4. **Créer fix** (nouvelle branche si nécessaire)
5. **Re-déployer staging**
6. **Refaire checklist complète**

**Rollback code (si nécessaire):**
```bash
# Revert commit
git revert HEAD
git push origin florian/bma-48-*

# Re-deploy
vercel --target staging
```

---

## 📝 NOTES & OBSERVATIONS

### Issues Rencontrées
```
[Documenter tout problème rencontré pendant les tests]

Issue #1:
- Description:
- Severity: 🔴 Critical / 🟡 Medium / 🟢 Low
- Résolu: Oui/Non
- Action:

Issue #2:
[etc.]
```

### Observations Positives
```
[Documenter tout ce qui fonctionne mieux que prévu]

Observation #1:
[etc.]
```

---

## 🎯 PROCHAINES ÉTAPES (Après GO Staging)

### Si GO pour Production

1. **Planifier rollout progressif:**
   - Date Phase 1 (10%): _______________
   - Date Phase 2 (50%): _______________
   - Date Phase 3 (100%): _______________

2. **Communiquer équipe:**
   - [ ] Update Linear (BMA-48 status → "In Production")
   - [ ] Slack #tech: Annoncer déploiement
   - [ ] Documenter CHANGELOG

3. **Préparer monitoring production:**
   - [ ] Sentry alerts configurés
   - [ ] Dashboard métriques prêt
   - [ ] On-call assigné (48h post-deploy)

### Si NO-GO pour Production

1. **Fixer issues identifiées**
2. **Re-tester staging**
3. **Re-faire checklist**

---

## 👥 SIGNATURES

**Tests Staging Complétés par:** _______________  
**Date:** _______________  
**Décision GO/NO-GO:** ✅ GO / ❌ NO-GO  
**Approuvé par (PO):** Florian  
**Date Approbation:** _______________

---

## 📎 LIENS UTILES

- **Story:** `_bmad-output/implementation-artifacts/2-11b-persist-first-architecture.md`
- **Review:** `_bmad-output/implementation-artifacts/story-2-11b-review-decision.md`
- **Rollback Plan:** `RUNBOOK-EMERGENCY-RESTORE.md`
- **Linear Issue:** https://linear.app/floriantriclin/issue/BMA-48

---

**Créé le:** 27 Janvier 2026  
**Agent:** Bob (Scrum Master)  
**Status:** Ready for use
