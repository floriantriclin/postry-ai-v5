# Délégation – Test Architect : finaliser la config E2E Story 2-7

**Émetteur :** Scrum Master (SM)  
**Destinataire :** Test Architect (ou QA technique)  
**Date :** 2026-01-29  
**Objectif :** Finaliser la configuration des tests E2E pour la Story 2-7 (Auth Persistence Simplification) afin que les 24 tests passent de façon stable (Chromium, Firefox, WebKit).

---

## Périmètre

- **Fichier de tests :** `e2e/story-2-7.spec.ts`
- **Cible :** Tous les tests Story 2-7 verts, y compris en CI (workers=1) et en local (workers=4).
- **Contexte technique :** Mock quiz activé (`NEXT_PUBLIC_QUIZ_USE_MOCK=true`), build E2E = `npm run build:e2e && npm run start`. Pas de `GEMINI_API_KEY` requise pour les tests.

---

## État actuel (handoff existant)

- Déjà en place : mock quiz, auth setup (sélecteurs corrigés), E2E-2.7-01/02/03/05, boucles `i < 11`, workers CI/local, CI et doc (`e2e/README.md`, `docs/qa/e2e-troubleshooting-guide.md`).
- **Problème principal :** timeouts sur `[data-testid="final-reveal-container"]`, notamment :
  - **E2E-2.7-04** (Auth modal appears without pre-persist call) – souvent WebKit
  - **E2E-2.7-REG-01** (Complete quiz flow still works end-to-end) – souvent WebKit

---

## Mandat du Test Architect

1. **Stabiliser les tests qui timeout sur le final reveal**
   - Vérifier que le quiz mock expose bien **11 questions** (6 P1 + 5 P2) et que toutes les boucles dans `story-2-7.spec.ts` sont cohérentes (`i < 11`).
   - Ajuster les timeouts pour `final-reveal-container` (actuellement 15s) si nécessaire (ex. 25s–30s pour WebKit/Firefox), de façon ciblée (test ou projet) sans dégrader la durée globale des runs.
   - Si besoin : renforcer les attentes (wait sur états intermédiaires, sélecteurs plus robustes) pour réduire les faux timeouts.

2. **Valider la configuration E2E**
   - S’assurer que `playwright.config.ts` (webServer, workers, timeouts projet) et les `auth.setup.*.ts` sont alignés avec le handoff (`story-2-7-e2e-handoff.md`).
   - Documenter toute décision (ex. timeout augmenté pour un test donné, raison).

3. **Livrables**
   - Suite Story 2-7 passante de façon répétable (au moins 2 runs complets verts en local).
   - Mise à jour si besoin de `e2e/README.md` ou `docs/qa/e2e-troubleshooting-guide.md` (ex. timeouts, flakiness WebKit).
   - Courte note (ou commentaire dans le handoff) : ce qui a été changé et pourquoi (pour traçabilité SM/équipe).

---

## Fichiers et commandes de référence

| Fichier | Rôle |
|--------|------|
| `e2e/story-2-7.spec.ts` | Spec complète 2-7 (boucles, timeouts final-reveal) |
| `e2e/auth.setup.chromium.ts`, `.firefox.ts`, `.webkit.ts` | Setup auth, locator `post-content` / "Aucun post généré" |
| `playwright.config.ts` | Workers, webServer, timeouts |
| Source du quiz mock (ex. `lib/` ou data) | Vérifier nombre de questions P1/P2 = 11 |
| `_bmad-output/implementation-artifacts/story-2-7-e2e-handoff.md` | Contexte détaillé et suite recommandée |

**Commandes utiles :**
```bash
# Tous les tests 2-7
npx playwright test e2e/story-2-7.spec.ts --reporter=list

# Un test précis (débug)
npx playwright test e2e/story-2-7.spec.ts -g "E2E-2.7-04" --reporter=list
npx playwright test e2e/story-2-7.spec.ts -g "E2E-2.7-REG-01" --reporter=list

# Debug
npx playwright test e2e/story-2-7.spec.ts -g "E2E-2.7-REG-01" --debug
```

Pour exécution des tests par un agent dans Cursor : lancer avec **permissions « all »** (sandbox désactivée si nécessaire).

---

## Critères de complétion (Definition of Done)

- [ ] `npx playwright test e2e/story-2-7.spec.ts --reporter=list` passe en local (tous navigateurs).
- [ ] Aucun timeout résiduel sur `final-reveal-container` sans justification documentée (ex. timeout augmenté pour WebKit).
- [ ] Doc E2E mise à jour si des changements de config ou de troubleshooting ont été faits.
- [ ] Courte rétro au SM ou mise à jour du handoff avec les changements effectués.

---

*Document généré par le SM pour délégation au Test Architect. À utiliser comme entrée de contexte dans un nouveau chat ou ticket.*
