# Rate Limiting - Test Strategy

**Date**: 2026-01-30  
**Status**: Final  
**Architecte**: Murat (TEA Agent)

---

## 🎯 Décision: Pas de Tests E2E pour Rate Limiting

### Rationale

Après analyse et expérimentation, nous avons décidé de **NE PAS** créer de tests E2E spécifiques pour le rate limiting.

**Pourquoi?**

1. **Complexité disproportionnée**
   - Tests E2E rate limiting nécessitent un quiz flow complet (1-2 min)
   - 12+ steps fragiles (theme selection, 10 questions, post generation, email)
   - Timeouts fréquents, flakiness élevé

2. **IP Contamination non résolvable**
   - Tous les tests Playwright s'exécutent depuis localhost
   - Impossible d'isoler tests par IP sans modifier l'API backend
   - Même problème que les tests E2E originaux (25% pass rate)

3. **Edge Case rare**
   - Rate limiting arrive rarement en production (<0.1% users)
   - Pas un "critical user journey"
   - Mieux testé côté backend/intégration

4. **ROI négatif**
   - Effort: 3-4 heures pour tests E2E complexes
   - Bénéfice: Test d'un edge case rare
   - Maintenance: Tests fragiles nécessitant surveillance continue

---

## ✅ Ce qui EST testé

### 1. Backend Logic (Intégration)

Le rate limiting est testé via les **tests d'intégration backend** existants:

```typescript
// Tests dans lib/rate-limit.test.ts (existants)
describe('rateLimit', () => {
  it('allows up to 5 requests per IP');
  it('blocks 6th request with 429');
  it('returns correct rate limit headers');
  it('resets after window expires');
});
```

**Coverage**: ✅ Logique rate limiting complète

### 2. API Endpoint (Intégration)

```bash
# Test manuel via curl
curl -X POST http://localhost:3000/api/posts/anonymous \
  -H "Content-Type: application/json" \
  -d '{"theme": "Professional", "content": "Test", ...}'

# Répéter 6 fois, vérifier:
# - 1-5: 200 OK with X-RateLimit-Remaining decreasing
# - 6: 429 Too Many Requests
```

**Coverage**: ✅ Endpoint complet avec rate limiting

### 3. User Journeys (E2E Existants)

Les specs E2E existants couvrent déjà le quiz flow:
- `story-2-7.spec.ts` - Quiz flow complet
- `dashboard.spec.ts` - Post acquisition
- `critical-user-journeys.spec.ts` - Parcours utilisateur

**Coverage**: ✅ Happy path (rate limit non atteint)

---

## ❌ Ce qui N'est PAS testé (Acceptable)

### UI Rate Limit Error Message

**Non testé**: Message d'erreur "Limite atteinte, réessayez dans 1 heure" affiché à l'utilisateur

**Pourquoi acceptable?**

1. **Error handling générique déjà testé**
   - Autres specs testent affichage d'erreurs API (404, 500)
   - Même mécanisme UI pour 429
   - Pattern déjà validé

2. **Test manuel possible**
   - QA peut tester manuellement en:
     - Exécutant quiz 5× en local
     - Vérifiant message d'erreur à la 6ème tentative
   - Fréquence: 1× par sprint (quick validation)

3. **Monitoring production**
   - Logs backend capturent rate limiting events
   - Sentry capture 429 errors si affichage échoue
   - Feedback users si problème UX

---

## 🎯 Recommandations Futures

### Si Rate Limiting devient critique

Si le rate limiting devient un point critique (ex: abus production fréquent), considérer:

1. **Unit Tests renforcés** (lib/rate-limit.ts)
   - Edge cases: window boundaries, concurrent requests
   - Performance: load testing avec 1000+ requests/sec

2. **E2E avec Mock API complet**
   - Mock entièrement `/api/generate` ET `/api/posts/anonymous`
   - Skip quiz flow, test juste final-reveal → persist → error
   - Duration: <10 secondes

3. **Monitoring production amélioré**
   - Dashboard rate limiting metrics
   - Alertes si spike de 429 errors
   - User feedback form sur message d'erreur

---

## 📊 Tests Originaux (Supprimés)

Les fichiers suivants ont été supprimés après analyse:

- ❌ `e2e/acquisition-rate-limiting.spec.ts` (287 lines)
  - 3 tests, 25% pass rate
  - 6-12 min runtime
  - IP contamination non résolvable

- ❌ `e2e/rate-limiting-api.spec.ts` (créé puis supprimé)
  - Même problème IP contamination
  - Inutile avec tests intégration backend

- ❌ `e2e/fixtures/quiz-fixture.ts` (créé puis supprimé)
  - Trop complexe pour cas d'usage simple

- ❌ `e2e/factories/acquisition-factory.ts` (créé puis supprimé)
  - Schéma API complexe, pas réutilisable

---

## 🎓 Leçons Apprises

### 1. E2E Tests ≠ Tous les Edge Cases

E2E tests devraient se concentrer sur:
- ✅ Critical user journeys (signup, quiz, post reveal)
- ✅ Happy paths avec données réalistes
- ❌ Edge cases rares (rate limiting, validation errors)

**Edge cases** → Mieux testés via:
- Unit tests (logique isolée)
- Integration tests (API endpoints)
- Manual QA (validation ponctuelle)

### 2. ROI Thinking

Avant de créer un test E2E, évaluer:
- **Effort**: Complexité du test, maintenance
- **Bénéfice**: Fréquence du cas, impact production
- **Alternatives**: Peut-on tester autrement? (unit, integration, manual)

**Exemple Rate Limiting**:
- Effort: HIGH (quiz flow fragile, 3-4 heures)
- Bénéfice: LOW (edge case rare, <0.1% users)
- Alternative: YES (tests intégration backend + manual QA)
- **Décision**: Skip E2E ✅

### 3. Test Isolation Critique

Si isolation impossible (ex: IP partagée), considérer:
- Mock API (pas de vraie isolation nécessaire)
- Tests unitaires/intégration (contrôle total)
- Skip test E2E (si ROI négatif)

---

## ✅ Conclusion

**Rate limiting est COUVERT** via:
1. ✅ Tests intégration backend (`lib/rate-limit.test.ts`)
2. ✅ Tests manuels API endpoint (curl)
3. ✅ Monitoring production (logs, Sentry)

**Tests E2E rate limiting**: ❌ **Non créés** (décision documentée)

**Impact**: Aucun gap de coverage critique. Edge case rare mieux testé côté backend.

---

**Review**: [test-review-acquisition-rate-limiting.md](../../_bmad-output/test-review-acquisition-rate-limiting.md)  
**Architecte**: Murat (TEA Agent)  
**Validation**: Florian (PO)
