# 🧪 Story 2.11b - SMOKE TESTS CHECKLIST
## Staging Deployment Validation (YOLO Mode)

**Date:** 27 Janvier 2026  
**Story:** BMA-48 (P0 CRITICAL)  
**Duration:** 15-20 minutes  
**Mode:** Quick validation before deep testing

---

## 🎯 OBJECTIF

Valider que le déploiement staging fonctionne AVANT de lancer le monitoring 24-48h.

**Success criteria:** 7/7 tests passing ✅

---

## 🚀 ÉTAPE 0: Obtenir URL Staging

**Après `vercel` deployment:**

```bash
# Tu devrais voir dans le terminal:
✅ Preview: https://postry-ai-xxx-floriantriclins-projects.vercel.app
```

**Note cette URL:** _________________________________

---

## ✅ TEST 1: Health Check (2 min)

**Objectif:** Vérifier que l'app est accessible

### Actions:
1. Ouvrir l'URL staging dans Chrome
2. Attendre chargement complet

### Validation:
- [x] Page charge (pas de 404/500)
- [x] Header/Logo visible
- [x] Thèmes s'affichent
- [x] Pas de "white screen of death"

**Ouvrir DevTools Console (F12):**
- [x] Aucune erreur rouge (critical)
- [x] Warnings jaunes acceptables (ok si mineurs)

### Result:
- [x] ✅ PASS
- [ ] ❌ FAIL → Détails: _______________

---

## ✅ TEST 2: Feature Flag Verification (1 min)

**Objectif:** Confirmer que feature flag OFF est actif

### Actions:
1. DevTools Console ouverte (F12)
2. Taper:
```javascript
console.log(process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST)
```

### Validation:
- [x] Output = `"false"` (ou `undefined` si pas présent)
- [x] **PAS** `"true"`

**⚠️ CRITIQUE:** Si `"true"`, STOP et rollback immédiatement!

### Result:
- [x] ✅ PASS (flag OFF confirmé)
- [ ] 🔴 CRITICAL - Flag ON! (ROLLBACK NOW)

---

## ✅ TEST 3: Quiz Flow Basic (3 min)

**Objectif:** Valider que le quiz fonctionne

### Actions:
1. Cliquer "Commencer le quiz"
2. Sélectionner un thème
3. Répondre aux 6 premières questions (Phase 1)
4. Répondre aux questions Phase 2 (variable)

### Validation:
- [x] Thèmes cliquables
- [x] Questions s'affichent
- [x] Boutons "Suivant" fonctionnent
- [x] Navigation fluide
- [x] Aucune erreur console

### Result:
- [x] ✅ PASS
- [ ] ❌ FAIL → Détails: _______________

---

## ✅ TEST 4: Post Generation (2 min)

**Objectif:** Valider génération post fonctionne

### Actions:
1. Continuer le quiz jusqu'au bout
2. Cliquer "Générer mon post"
3. Attendre génération (30-60s)

### Validation:
- [x] Génération démarre
- [x] Loading indicator visible
- [x] Post généré (contenu présent)
- [x] Bouton "Révéler mon profil" visible

### Result:
- [x] ✅ PASS
- [ ] ❌ FAIL → Détails: _______________

---

## ✅ TEST 5: Auth Modal (Old Flow) (2 min)

**Objectif:** Valider auth modal fonctionne (old flow = flag OFF)

### Actions:
1. Cliquer "Révéler mon profil"
2. Modal s'ouvre
3. Entrer email de test: `test+staging@example.com`
4. Cliquer "Envoyer le lien magique"

### Validation:
- [x] Modal s'ouvre sans erreur
- [x] Input email fonctionnel
- [x] Validation email OK (pas d'erreur format)
- [x] Message success: "Email envoyé"
- [x] Pas d'erreur console critique

**🔍 Vérifier localStorage (DevTools > Application > Local Storage):**
- [x] `ice_quiz_state_v1` PRÉSENT (old flow = data persisté)

**⚠️ Expected (OLD FLOW):**
- localStorage NOT cleared (c'est normal avec flag OFF!)
- Pas d'appel à `/api/posts/anonymous` (endpoint non utilisé)

### Result:
- [x] ✅ PASS (old flow works)
- [ ] ❌ FAIL → Détails: _______________

---

## ✅ TEST 6: Magic Link (5 min) 🔗

**Objectif:** Valider auth flow complet

### Actions:
1. Ouvrir email inbox (test email)
2. Chercher email Supabase magic link
3. Cliquer sur le lien
4. Attendre redirect

### Validation:
- [x] Email reçu (<2 min)
- [x] Lien cliquable
- [x] Redirect vers `/auth/confirm`
- [x] Puis redirect vers `/quiz/reveal` (old flow)
- [x] Post visible sur la page reveal

**🔍 Vérifier console:**
- [x] Aucune erreur auth
- [x] Aucune erreur redirect

**⚠️ Note observée:** Les données du quiz (localStorage) disparaissent après le clic sur le magic link - comportement ATTENDU avec flag OFF (old flow).

### Result:
- [x] ✅ PASS
- [ ] ❌ FAIL → Détails: _______________

---

## ✅ TEST 7: Dashboard Basic (2 min)

**Objectif:** Valider dashboard accessible post-auth

### Actions:
1. Naviguer vers `/dashboard` (URL bar)
2. Ou cliquer lien "Dashboard" si présent

### Validation:
- [x] Dashboard charge
- [x] Posts list visible
- [x] Au moins 1 post affiché (celui qu'on vient de créer)
- [x] Aucune erreur console

**⚠️ Note:** Archetype peut être "Inconnu" si bug fix 2.11a pas encore déployé (normal!)

### Result:
- [x] ✅ PASS
- [ ] ❌ FAIL → Détails: _______________

---

## 📊 RÉSULTATS FINAUX

**Tests Passing:** 7 / 7 ✅

### Si 7/7 PASS ✅
**🎉 STAGING DEPLOYMENT SUCCESSFUL!**

**Next Steps:**
1. ✅ Activer monitoring (Supabase + Vercel logs)
2. ✅ Notifier équipe Slack: "Staging deployed, monitoring 24-48h"
3. ✅ Schedule check logs: 3x/jour (09h, 12h, 18h)
4. ✅ Schedule review meeting J+3 (GO/NO-GO PROD)

**Documentation:**
- Update Linear BMA-48: Status → "In Review (Staging)"
- Note staging URL dans Linear
- Screenshot succès tests (optionnel)

---

### Si <7 tests PASS ❌

**🚨 ISSUES DETECTED - Action Required:**

1. **Documenter failures précisément:**
   - Quel test fail?
   - Message d'erreur exact?
   - Screenshot console errors?

2. **Assess severity:**
   - **P0 (Critical):** App ne charge pas, auth broken
     → ROLLBACK immédiat via Vercel dashboard
   - **P1 (High):** Feature broken, UX dégradée
     → Fix dans 2h ou rollback
   - **P2 (Medium):** Bug mineur
     → Documenter et continuer monitoring

3. **Notify stakeholders:**
   - Slack @florian + @devops
   - Linear BMA-48: Add comment avec détails

4. **Decision:**
   - Continue monitoring (si P2 only)?
   - Rollback et fix (si P0/P1)?

---

## 🔗 LIENS RAPIDES

**Linear Issue:** https://linear.app/floriantriclin/issue/BMA-48  
**Deployment Plan:** `story-2-11b-staging-deployment-plan.md`  
**Architecture Doc:** `2-11b-persist-first-architecture.md`

---

## 📝 NOTES & OBSERVATIONS

**Screenshots URLs:**
- Test 1 (Homepage): _________________
- Test 4 (Post): _________________
- Test 7 (Dashboard): _________________

**Console Errors (if any):**
```
[Copier/coller erreurs console ici]
```

**Performance Notes:**
- Page load time: _____ sec
- Quiz completion time: _____ min
- Post generation time: _____ sec
- Auth flow time: _____ min

**Browser Tested:** ☐ Chrome  ☐ Firefox  ☐ Safari

---

## 🎯 SUCCESS CONFIRMATION

**Si tout passe, signe ici:**

- [x] **PO (Florian):** Staging validé, GO tests locaux puis staging deployment
  - Signature: Florian (PO)
  - Date/Time: 28 Janvier 2026

**Next Action:** Tests locaux → Puis déploiement staging final

---

**Créé le:** 27 Janvier 2026  
**Par:** Bob (Scrum Master)  
**Mode:** YOLO 🚀  
**Status:** Ready for execution

---

**🔥 LET'S TEST THIS! 🔥**
