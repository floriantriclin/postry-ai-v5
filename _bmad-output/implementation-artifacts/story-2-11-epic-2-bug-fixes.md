# Story 2.11 : Epic 2 - Critical Bug Fixes

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)  
**Type:** Bug Fixes / Technical Debt  
**Priorité:** 🔴 CRITIQUE  
**Statut:** Ready for Dev  
**Date de Création:** 27 Janvier 2026

## Linear Issue

- **ID:** BMA-9
- **URL:** https://linear.app/floriantriclin/issue/BMA-9/story-211-epic-2-critical-bug-fixes
- **Git Branch:** florian/bma-9-story-211-epic-2-critical-bug-fixes

---

## 📋 Description

**En tant que** Développeur,  
**Je veux** corriger les 4 bugs critiques identifiés dans Epic 2,  
**Afin de** garantir la stabilité et la fiabilité du système d'authentification et du dashboard.

**Type:** Technical Debt / Bug Resolution

---

## 🐛 Bugs Inclus dans Cette Story

Cette story regroupe **7 bugs critiques** qui doivent être résolus avant de continuer avec Epic 3 :

### 1. **BUG-003 : Colonne archetype manquante** 
- **Linear:** [BMA-2](https://linear.app/floriantriclin/issue/BMA-2)
- **Priorité:** 🔴 URGENT
- **Effort:** 30 minutes
- **Impact:** Tous les posts affichent "Archetype Inconnu"
- **Solution:** Ajouter migration SQL + mettre à jour API

### 2. **BUG-002 : Dashboard crash avec multiple posts**
- **Linear:** [BMA-3](https://linear.app/floriantriclin/issue/BMA-3)
- **Priorité:** 🔴 URGENT  
- **Effort:** 1 heure
- **Impact:** Dashboard inaccessible si user a 2+ posts
- **Solution:** Retirer `.single()`, utiliser array indexing

### 3. **BUG-006 : Pas d'expiration localStorage - Architecture Persist-First** ⭐ NOUVEAU
- **Linear:** [BMA-45](https://linear.app/floriantriclin/issue/BMA-45)
- **Priorité:** 🔴 CRITIQUE
- **Effort:** 6 heures
- **Impact:** Données sensibles persistent indéfiniment, risque sécurité
- **Solution:** Architecture Persist-First - Persist AVANT auth, clear cache immédiat
- **Résout aussi:** BUG-001 (BMA-4), BUG-004 (BMA-5), BUG-007 (BMA-46)

### 4. **BUG-007 : Email multi-soumission - Duplication magic links** ⭐ NOUVEAU
- **Linear:** [BMA-46](https://linear.app/floriantriclin/issue/BMA-46)
- **Priorité:** 🔴 CRITIQUE
- **Effort:** Inclus dans BUG-006
- **Impact:** User peut soumettre multiple emails pour même post
- **Solution:** Résolu automatiquement par architecture Persist-First + Rate limiting IP

### 5. **BONUS : Tests E2E cross-browser**
- **Linear:** [BMA-8](https://linear.app/floriantriclin/issue/BMA-8)
- **Priorité:** 🟡 MEDIUM
- **Effort:** 3 heures
- **Impact:** Tests échouent sur Firefox/WebKit
- **Solution:** Setup d'auth séparé par navigateur

---

## ✅ Critères d'Acceptation

### AC1: Migration Base de Données ✅
- [ ] Migration SQL créée pour ajouter colonne `archetype`
- [ ] Backfill des posts existants réussi
- [ ] API `persist-on-login` enregistre l'archetype
- [ ] Dashboard affiche le vrai archetype

### AC2: Dashboard Robuste ✅
- [ ] `.single()` retiré du Dashboard
- [ ] Array indexing utilisé avec filtre par status
- [ ] Messages d'erreur distincts (error vs no posts)
- [ ] Test avec 10+ posts sans crash

### AC3: Prévention Doublons ✅
- [ ] Flag `sessionHandled` implémenté
- [ ] Double appel impossible (onAuthStateChange + getUser)
- [ ] Test E2E validant la non-duplication
- [ ] Logs console clairs si double trigger

### AC4: Préservation Données ✅
- [ ] localStorage nettoyé UNIQUEMENT si persist réussit (200)
- [ ] Message d'erreur clair si échec
- [ ] Bouton "Réessayer" affiché
- [ ] Test E2E validant préservation des données
- [ ] Test E2E validant retry réussi

### AC5 (BONUS): Tests Cross-Browser ✅
- [ ] Setup d'auth séparé pour Chromium, Firefox, WebKit
- [ ] Tous les tests passent sur les 3 navigateurs
- [ ] 0 tests skippés
- [ ] Temps d'exécution < 5 minutes

---

## 📊 Estimation Totale

**🚨 CHANGEMENT ARCHITECTURAL MAJEUR: Persist-First**

**Effort High Priority:**
- BUG-003 (Archetype): 0.5h
- BUG-002 (Dashboard crash): 1h
- **BUG-006 (Architecture Persist-First): 6h** ⭐
  - Crée 2 nouveaux endpoints (`/api/posts/anonymous`, `/api/posts/link-to-user`)
  - Modifie auth flow (auth-modal, auth/confirm)
  - **Résout automatiquement:** BUG-001, BUG-004, BUG-007
- BUG-007 (Rate limiting): Inclus dans BUG-006

**Subtotal High Priority:** 7h 30min

**Effort Bonus (Bug 5):** 3h

**Total:** 10h 30min

---

### 💡 Note: Architecture Persist-First

L'architecture Persist-First simplifie considérablement le flow:
- ✅ Résout 4 bugs d'un coup (BUG-001, BUG-004, BUG-006, BUG-007)
- ✅ Plus robuste (données en DB immédiatement)
- ✅ Plus simple (pas de TTL localStorage complexe)
- ✅ Rate limiting inclus (protection IP)

---

## 🎯 Plan d'Implémentation

### Phase 1 : Quick Wins (2h)
**Jour 1 Matin**
1. ✅ BUG-003 : Migration archetype (30 min)
   - Créer migration SQL
   - Appliquer en staging
   - Mettre à jour API persist-on-login (obsolète avec nouvelle archi)
   - Vérifier affichage

2. ✅ BUG-002 : Fix Dashboard crash (1h)
   - Retirer `.single()`
   - Ajouter array indexing
   - Tester avec multiple posts
   - Déployer en staging

### Phase 2 : Architecture Persist-First (6h) ⭐ NOUVEAU
**Jour 1 Après-midi + Jour 2 Matin**

3. ✅ **BUG-006 : Créer nouveaux endpoints (2h)**
   - Créer `/api/posts/anonymous` avec rate limiting IP
   - Créer `/api/posts/link-to-user` 
   - Tests unitaires des endpoints

4. ✅ **BUG-006 : Modifier auth flow (1.5h)**
   - Modifier `auth-modal.tsx` pour appeler `/api/posts/anonymous`
   - Ajouter `localStorage.clear()` immédiat après submit
   - Modifier `auth/confirm/page.tsx` pour appeler link-to-user
   - Passer postId dans magic link URL

5. ✅ **BUG-006 + BUG-007 : Tests E2E (2.5h)**
   - Test localStorage cleared après submit
   - Test rate limiting (max 5 posts/heure)
   - Test multiple acquisitions indépendantes
   - Test data persisted même si user ne clique pas magic link
   - Validation flow complet

### Phase 3 : Tests & Validation (2h)
**Jour 2 Après-midi**
6. ✅ Tests complets (1h)
   - Exécuter toute la suite E2E
   - Vérifier métriques (0 duplicates, 0 crashes, 0 data loss)
   - Validation manuelle flux complet
   - Vérifier posts orphelins en DB (status='pending')

7. ✅ Documentation & Déploiement (1h)
   - Mettre à jour documentation architecture
   - Créer changelog avec breaking changes
   - Déployer en production
   - Monitoring 2h post-déploiement

### Phase 4 (BONUS) : Cross-Browser (3h)
**Jour 3 (si temps disponible)**
8. ✅ BUG-008 : Tests E2E cross-browser (3h)
   - Créer setups séparés par navigateur
   - Retirer `test.skip()` dans dashboard.spec.ts
   - Valider 100% de réussite sur 3 navigateurs

---

### ⚠️ Note Technique: Cleanup Job

**Posts Orphelins:**
Les posts avec `status: 'pending'` (user n'a jamais cliqué le magic link) resteront en DB.

**Action requise:** Créer un cleanup job pour supprimer posts `pending` > 24h  
**Prévu pour:** Story 4 (Mise en prod MVP)  
**Linear:** TODO - Créer issue séparée

---

## 📂 Fichiers Concernés

### À Créer (Architecture Persist-First)
- `app/api/posts/anonymous/route.ts` ⭐ **NOUVEAU** (BUG-006, BUG-007)
  - Persist posts avant auth avec rate limiting IP
- `app/api/posts/link-to-user/route.ts` ⭐ **NOUVEAU** (BUG-006)
  - Link post pending à user après auth
- `supabase/migrations/20260127000000_add_archetype_to_posts.sql` (BUG-003)

### À Modifier (Architecture Persist-First)
- `components/feature/auth-modal.tsx` ⭐ (BUG-006, BUG-007)
  - Appeler `/api/posts/anonymous` au lieu de `signInWithOtp`
  - `localStorage.clear()` immédiat après submit
- `app/auth/confirm/page.tsx` ⭐ (BUG-006)
  - Appeler `/api/posts/link-to-user` après auth
  - Lire `postId` depuis URL params
- `app/dashboard/page.tsx` (BUG-002)
  - Retirer `.single()`, utiliser array indexing
- `app/dashboard/post-reveal-view.tsx` (BUG-003)
  - Afficher archetype depuis DB

### À Supprimer (Obsolète)
- `app/api/auth/persist-on-login/route.ts` (Remplacé par architecture Persist-First)

### Tests E2E À Créer
- `e2e/acquisition-persist-first.spec.ts` ⭐ (BUG-006, BUG-007)
- `e2e/acquisition-rate-limiting.spec.ts` ⭐ (BUG-007)
- `e2e/dashboard-multiple-posts.spec.ts` (BUG-002)
- `e2e/auth.setup.chromium.ts` (BUG-008)
- `e2e/auth.setup.firefox.ts` (BUG-008)
- `e2e/auth.setup.webkit.ts` (BUG-008)

---

## 🧪 Tests Requis

### Tests E2E Nouveaux
- [ ] `auth-duplicate-posts.spec.ts` - Valide non-duplication
- [ ] `dashboard-multiple-posts.spec.ts` - Dashboard avec 2+ posts
- [ ] `auth-persist-failure.spec.ts` - localStorage préservé si erreur
- [ ] `auth-persist-failure-retry.spec.ts` - Retry fonctionne
- [ ] `dashboard-archetype-display.spec.ts` - Archetype affiché correctement

### Tests Unitaires Nouveaux
- [ ] `app/api/auth/persist-on-login/route.test.ts` - Tous cas d'erreur
- [ ] `app/dashboard/page.test.ts` - Gestion multiple posts

### Tests Manuels
- [ ] Flux complet : Quiz → Auth → Dashboard (archetype visible)
- [ ] Simulation échec API persist-on-login (localStorage intact)
- [ ] Création de 3+ posts (dashboard stable)
- [ ] Double trigger auth (1 seul post créé)

---

## 📊 Métriques de Succès

### Avant Fixes
- ❌ Taux d'erreur Dashboard: >10% (si user a 2+ posts)
- ❌ Posts dupliqués: ~5% des auth (race condition)
- ❌ "Archetype Inconnu": 100% des posts
- ❌ Data loss: ~1% des auth (erreurs API)
- ❌ localStorage sans expiration: Risque sécurité permanent
- ❌ Multi-soumission email: Possible sans limitation

### Après Fixes avec Architecture Persist-First
- ✅ Taux d'erreur Dashboard: 0%
- ✅ Posts dupliqués: 0 (plus de race condition localStorage)
- ✅ "Archetype Inconnu": 0%
- ✅ Data loss: 0% (données en DB avant clear cache)
- ✅ localStorage: Nettoyé immédiatement après submit
- ✅ Rate limiting: Max 5 acquisitions/heure par IP
- ✅ Sécurité: Données sensibles ne persistent plus dans le navigateur

---

## 🔗 Ressources

### Documentation Principale
- **Linear Issues:**
  - [BMA-2 - BUG-003 Archetype manquant](https://linear.app/floriantriclin/issue/BMA-2)
  - [BMA-3 - BUG-002 Dashboard crash](https://linear.app/floriantriclin/issue/BMA-3)
  - [BMA-45 - BUG-006 localStorage expiration](https://linear.app/floriantriclin/issue/BMA-45) ⭐ **NOUVEAU**
  - [BMA-46 - BUG-007 Email multi-soumission](https://linear.app/floriantriclin/issue/BMA-46) ⭐ **NOUVEAU**
  - [BMA-8 - BUG-008 E2E cross-browser](https://linear.app/floriantriclin/issue/BMA-8)
- **Issues Résolues par Architecture Persist-First:**
  - [BMA-4 - BUG-001 Double appel](https://linear.app/floriantriclin/issue/BMA-4) - Résolu par BMA-45
  - [BMA-5 - BUG-004 Data loss](https://linear.app/floriantriclin/issue/BMA-5) - Résolu par BMA-45

### Architecture
- `docs/architecture/auth-and-persistence-architecture-analysis.md`
- `docs/architecture/testing-standards.md`

### Epic Context
- `_bmad-output/implementation-artifacts/epic-2-conversion.md`

---

## 📝 Dev Notes

### Ordre Recommandé
1. **BUG-003 (archetype)** - Quick win, amélioration UX immédiate
2. **BUG-002 (dashboard)** - Bloquant pour Epic 3
3. **BUG-001 (double appel)** - Corruption de données
4. **BUG-004 (data loss)** - Expérience utilisateur critique
5. **BUG-008 (cross-browser)** - Bonus qualité

### Stratégie de Déploiement
- **Hotfix si prod active:** Deploy BUG-003 et BUG-002 immédiatement
- **Sprint normal si pas en prod:** Tout ensemble après validation complète

### Points d'Attention
- 🚨 **Migration SQL:** Tester en staging d'abord, backup DB avant prod
- 🚨 **localStorage:** Ne jamais nettoyer avant confirmation 200
- 🚨 **Tests E2E:** Tous les nouveaux tests doivent passer sur 3 navigateurs
- 🚨 **Monitoring:** Surveiller erreurs 2h après chaque déploiement

---

## 🎯 Definition of Done

- [ ] Les 4 bugs HIGH PRIORITY sont fixés dans le code
- [ ] Tous les tests E2E ajoutés et passants (>95%)
- [ ] Migration SQL appliquée (dev + staging + prod)
- [ ] Code reviewed (pair review recommandé pour bugs critiques)
- [ ] Déployé en production
- [ ] Métriques validées (0 duplicates, 0 crashes, 0 data loss)
- [ ] Documentation mise à jour
- [ ] Linear issues marquées comme "Done"
- [ ] Sprint status mis à jour

**BONUS (si temps):**
- [ ] BUG-008 (cross-browser) résolu
- [ ] 100% tests E2E passants sur 3 navigateurs

---

---

## 🔧 DEV AGENT GUARDRAILS

### Context from Previous Stories

**Story 2.7 (Auth Simplification):**
- ✅ Implémenté: Architecture simplifiée avec `persist-on-login`
- ✅ Créé: `/api/auth/persist-on-login/route.ts` 
- ✅ Supprimé: `/api/auth/pre-persist` (obsolète)
- ⚠️ **ATTENTION:** Ne PAS recréer les anciens endpoints supprimés

**Story 2.8 (Production Readiness):**
- ✅ Implémenté: Rate limiting dans `lib/rate-limit.ts`
- ✅ Implémenté: Alerting dans `lib/alerting.ts`
- ✅ Tests: `lib/rate-limit.test.ts` + `lib/alerting.test.ts`
- ⚠️ **RÉUTILISER** ces modules pour Story 2.11 (BUG-007)

### 🚨 CRITICAL: Latest Tech Best Practices (2026)

#### Playwright 1.57 Cross-Browser Auth
**Source:** Playwright Official Docs 2026

```typescript
// BEST PRACTICE: Use global setup with fixtures
// e2e/auth.setup.chromium.ts
import { test as setup } from '@playwright/test';

setup('authenticate chromium', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="email"]', 'test-chromium@postry.ai');
  await page.click('button:has-text("Révéler")');
  // Wait for magic link confirmation
  await page.waitForURL('/auth/confirm*');
  // Save authenticated state
  await page.context().storageState({ 
    path: 'e2e/.auth/user-chromium.json' 
  });
});
```

**Key Points:**
- ✅ Create separate setup files per browser: `auth.setup.{chromium|firefox|webkit}.ts`
- ✅ Save state in `e2e/.auth/` (already in .gitignore)
- ✅ Configure `playwright.config.ts` with dependencies:
  ```typescript
  projects: [
    { name: 'setup-chromium', testMatch: /auth\.setup\.chromium\.ts/ },
    { 
      name: 'chromium', 
      use: { storageState: 'e2e/.auth/user-chromium.json' },
      dependencies: ['setup-chromium']
    }
  ]
  ```
- ⚠️ **DO NOT** use shared auth state across browsers - causes flakiness

#### Supabase Migration Best Practices (2026)
**Source:** Supabase Declarative Schemas 2026

```sql
-- ✅ BEST PRACTICE: Use IF EXISTS + DEFAULT + NOT NULL
ALTER TABLE IF EXISTS public.posts
ADD COLUMN IF NOT EXISTS archetype text DEFAULT 'Le Pragmatique' NOT NULL;

-- ✅ Add index for performance
CREATE INDEX IF NOT EXISTS idx_posts_archetype 
ON public.posts(archetype);

-- ✅ Update existing rows (backfill)
UPDATE public.posts
SET archetype = COALESCE(
  (answers_json->>'archetype')::text,
  'Le Pragmatique'
)
WHERE archetype IS NULL;

-- ✅ ROLLBACK PLAN (for documentation)
-- ALTER TABLE public.posts DROP COLUMN IF EXISTS archetype;
-- DROP INDEX IF EXISTS idx_posts_archetype;
```

**Key Points:**
- ✅ Use `supabase migration new add_archetype_to_posts`
- ✅ Test locally first: `supabase db reset` → `npm run test:e2e`
- ✅ Plan rollback in migration comment
- ⚠️ **NEVER** skip `IF EXISTS` / `IF NOT EXISTS` - prevents prod crashes

#### Rate Limiting Production Setup (2026)
**Source:** Next.js API Best Practices + Upstash 2026

```typescript
// ✅ BEST PRACTICE: Use Upstash Redis for distributed environments
// lib/rate-limit-redis.ts (OPTIONAL upgrade for prod)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 posts/hour
  analytics: true,
  prefix: 'postry-ai:ratelimit',
});

// Extract IP from Next.js 16 headers
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
```

**Key Points:**
- ✅ Story 2.8 already implemented in-memory rate limiting in `lib/rate-limit.ts`
- ✅ For Architecture Persist-First (BUG-006), reuse existing `lib/rate-limit.ts`
- ⚠️ **OPTIONAL FUTURE UPGRADE:** Migrate to Upstash Redis for distributed prod
- ✅ Include headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 📂 File Structure Context

**Existing Files (DO NOT RECREATE):**
```
lib/
  rate-limit.ts ✅ (Story 2.8)
  rate-limit.test.ts ✅ (Story 2.8)
  alerting.ts ✅ (Story 2.8)
  alerting.test.ts ✅ (Story 2.8)
  supabase.ts ✅
  supabase-admin.ts ✅

app/api/auth/
  persist-on-login/route.ts ✅ (Story 2.7)

e2e/
  auth.setup.ts ✅ (Generic setup - needs split per browser)
  .auth/ ✅ (Directory exists in .gitignore)
```

**Files to CREATE:**
```
supabase/migrations/
  20260127000000_add_archetype_to_posts.sql 🆕

app/api/posts/
  anonymous/route.ts 🆕 (BUG-006, BUG-007)
  link-to-user/route.ts 🆕 (BUG-006)

e2e/
  auth.setup.chromium.ts 🆕 (BUG-008)
  auth.setup.firefox.ts 🆕 (BUG-008)
  auth.setup.webkit.ts 🆕 (BUG-008)
  acquisition-persist-first.spec.ts 🆕 (BUG-006, BUG-007)
```

**Files to MODIFY:**
```
app/dashboard/page.tsx (BUG-002)
  - Remove .single()
  - Use array indexing: .data?.[0]

components/feature/auth-modal.tsx (BUG-006, BUG-007)
  - Call /api/posts/anonymous
  - Clear localStorage immediately

app/auth/confirm/page.tsx (BUG-006)
  - Call /api/posts/link-to-user
  - Read postId from URL params

playwright.config.ts (BUG-008)
  - Add setup-chromium, setup-firefox, setup-webkit projects
  - Configure storageState per browser
```

### 🧪 Testing Requirements Specifics

**Definition of Done (PRD Section 10):**
- ✅ Linter errors = 0
- ✅ Unit tests: >80% coverage for new code
- ✅ E2E tests: 3 runs consécutifs sans flake
- ✅ Cross-browser: Chromium + Firefox + WebKit

**Testing Strategy (PRD Section 11):**
- ✅ Vitest for unit tests (fast, ESM native)
- ✅ Playwright for E2E (cross-browser)
- ⚠️ **ANTI-FLAKINESS:** Always use `waitForSelector()`, NEVER `sleep()`
- ⚠️ **TEST ISOLATION:** Each test creates unique email (e.g., `test-${Date.now()}@postry.ai`)

**Error Handling Strategy (PRD Section 12):**
- ✅ Validation Zod pour tous les inputs
- ✅ Try-catch sur tous les appels externes
- ✅ Messages utilisateur clairs et actionnables
- ✅ Logs structurés avec context (userId, postId, error)
- ✅ Retry logic pour erreurs récupérables (LLM timeout, DB timeout)

### 🚨 Common LLM Developer Mistakes to AVOID

**❌ MISTAKE #1:** Recréer des fichiers déjà supprimés
- `/api/auth/pre-persist` a été supprimé dans Story 2.7
- Ne PAS le recréer pour BUG-006

**❌ MISTAKE #2:** Ignorer les modules existants
- `lib/rate-limit.ts` existe déjà (Story 2.8)
- RÉUTILISER ce module pour BUG-007

**❌ MISTAKE #3:** Tests E2E non isolés
- NE PAS partager le même email entre tests
- Utiliser `test-${Date.now()}@postry.ai`

**❌ MISTAKE #4:** Migration SQL sans rollback plan
- Toujours documenter comment rollback en commentaire

**❌ MISTAKE #5:** Rate limiting sans headers
- Toujours inclure `X-RateLimit-*` headers dans la réponse 429

**❌ MISTAKE #6:** localStorage.clear() avant persist success
- Architecture Persist-First = persist AVANT clear
- Clear UNIQUEMENT après 200 response

**❌ MISTAKE #7:** Shared auth state cross-browser
- Playwright 1.57 requiert setup séparé par navigateur
- Ne PAS réutiliser `user.json` pour tous les browsers

### 🎯 Success Metrics (Reference)

**Before Fixes:**
- Dashboard crash rate: >10% (if 2+ posts)
- Post duplication: ~5% (race condition)
- Archetype unknown: 100%
- Data loss: ~1%

**After Fixes (Target):**
- Dashboard crash rate: 0%
- Post duplication: 0%
- Archetype unknown: 0%
- Data loss: 0%
- Rate limiting: Max 5 posts/hour per IP
- E2E success: 100% (3 browsers)

---

## Dev Agent Record

### Agent Model Used
_À remplir par le Dev agent_

### Completion Notes
_À remplir lors de l'implémentation_

### Files Modified
_Liste complète des fichiers modifiés_

---

**Créé le:** 27 Janvier 2026  
**Statut:** ✅ Ready for Dev  
**Prochaine Action:** Assigner à un développeur et commencer Phase 1
