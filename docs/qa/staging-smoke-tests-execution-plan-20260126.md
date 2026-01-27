# 🧪 Plan d'Exécution Tests Smoke STAGING - Stories 2.7 & 2.8

**Date:** 26 Janvier 2026 22:51 UTC  
**Responsable:** Product Manager (BMad PM)  
**Collaboration:** Test Architect (BMad QA)  
**Environnement:** https://dev.postry.ai  
**Commits:** `31e624c` (Story 2.8) + `9e7acca` (Story 2.7)

---

## 📋 Résumé Exécutif

**Objectif:** Valider le déploiement STAGING des Stories 2.7 & 2.8 (HIGH PRIORITY) avant le monitoring 24h et la décision GO/NO-GO production.

**Durée totale estimée:** 30 minutes  
**Priorité:** 🔴 CRITIQUE

---

## 🎯 Contexte du Déploiement

### Stories Déployées
- ✅ **Story 2.7:** Simplification Auth & Persistance (-42% code, -60% temps auth)
- ✅ **Story 2.8:** Rate Limiting (10 req/min) + Alerting System

### Changements Critiques
1. Nouveau endpoint [`/api/auth/persist-on-login`](../../app/api/auth/persist-on-login/route.ts)
2. Redirect direct vers [`/dashboard`](../../app/dashboard/page.tsx) après auth
3. Suppression route obsolète [`/quiz/reveal`](../../app/quiz/reveal/page.tsx) → redirect automatique
4. Rate limiting actif sur endpoint auth
5. Alerting system pour monitoring erreurs

---

## 🧪 Tests à Exécuter

### Test 1: Flux Complet Nouveau User 👤
**Responsable:** Product Manager (BMad PM)  
**Durée:** 15 minutes  
**Type:** Test manuel fonctionnel  
**Priorité:** 🔴 CRITIQUE

#### Scénario
```
1. Ouvrir https://dev.postry.ai en navigation privée
2. Cliquer "Commencer"
3. Sélectionner un thème (ex: "Technologie")
4. Compléter le quiz - Phase 1 (Questions initiales)
5. Compléter le quiz - Phase 2 (Questions de suivi)
6. Compléter le quiz - Phase 3 (Questions finales)
7. Voir le post généré
8. Cliquer "Révéler mon profil"
9. Entrer email valide dans modal auth
10. Vérifier réception magic link (email)
11. Cliquer sur magic link
12. ✅ VÉRIFIER: Redirect direct vers /dashboard (PAS via /quiz/reveal)
13. ✅ VÉRIFIER: Post visible dans dashboard
14. ✅ VÉRIFIER: Bouton "Copier" fonctionne
15. ✅ VÉRIFIER: Contenu post correct (correspond au quiz)
```

#### Critères de Succès
- [ ] Flux complet sans erreur
- [ ] Redirect direct `/auth/confirm` → `/dashboard` (< 2s)
- [ ] Post sauvegardé avec status `completed`
- [ ] Post visible immédiatement dans dashboard
- [ ] Copie du post fonctionne
- [ ] Aucune erreur console JavaScript
- [ ] Aucun passage par `/quiz/reveal`

#### Critères d'Échec (BLOQUANTS)
- ❌ Erreur pendant le quiz
- ❌ Magic link ne fonctionne pas
- ❌ Redirect vers `/quiz/reveal` au lieu de `/dashboard`
- ❌ Post non visible dans dashboard
- ❌ Post créé avec status `pending`
- ❌ Erreur critique console

#### Données à Collecter
- Temps total flux (début → dashboard)
- Temps auth (clic magic link → dashboard)
- Contenu post généré
- Screenshot dashboard final
- Logs console (si erreurs)

---

### Test 2: Redirect /quiz/reveal 🔄
**Responsable:** Product Manager (BMad PM)  
**Durée:** 2 minutes  
**Type:** Test manuel fonctionnel  
**Priorité:** 🔴 CRITIQUE

#### Scénario
```
1. Ouvrir https://dev.postry.ai/quiz/reveal en navigation privée
2. ✅ VÉRIFIER: Redirect automatique vers /dashboard
3. ✅ VÉRIFIER: Temps de redirect < 1s
4. ✅ VÉRIFIER: Aucune erreur console
```

#### Critères de Succès
- [ ] Redirect automatique immédiat
- [ ] URL finale: `https://dev.postry.ai/dashboard`
- [ ] Aucun flash de contenu `/quiz/reveal`
- [ ] Aucune erreur console

#### Critères d'Échec (BLOQUANTS)
- ❌ Page `/quiz/reveal` s'affiche
- ❌ Pas de redirect
- ❌ Erreur 404 ou 500

---

### Test 3: Rate Limiting 🛡️
**Responsable:** Test Architect (BMad QA)  
**Durée:** 5 minutes  
**Type:** Test technique automatisé  
**Priorité:** 🔴 CRITIQUE

#### Scénario
```javascript
// Ouvrir console développeur sur https://dev.postry.ai
// Exécuter le script suivant:

const testRateLimiting = async () => {
  console.log('🧪 Test Rate Limiting - Début');
  const results = [];
  
  for (let i = 0; i < 11; i++) {
    try {
      const response = await fetch('/api/auth/persist-on-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      results.push({
        request: i + 1,
        status: response.status,
        remaining,
        limit,
        reset
      });
      
      console.log(`Request ${i+1}: ${response.status} | Remaining: ${remaining}/${limit}`);
      
      // Petit délai pour éviter problèmes réseau
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Request ${i+1} failed:`, error);
      results.push({ request: i + 1, error: error.message });
    }
  }
  
  console.log('🧪 Test Rate Limiting - Résultats:', results);
  return results;
};

// Exécuter le test
testRateLimiting();
```

#### Critères de Succès
- [ ] Requêtes 1-10: Status 401 ou 400 (pas authentifié - NORMAL)
- [ ] Requête 11: Status 429 (Too Many Requests)
- [ ] Headers présents sur TOUTES les réponses:
  - [ ] `X-RateLimit-Limit: 10`
  - [ ] `X-RateLimit-Remaining` (décrémente de 10 à 0)
  - [ ] `X-RateLimit-Reset` (timestamp futur)
- [ ] Message erreur 429 contient `retryAfter`
- [ ] Après 60s, rate limit reset (nouveau test possible)

#### Critères d'Échec (BLOQUANTS)
- ❌ Requête 11 ne retourne pas 429
- ❌ Headers rate limit absents
- ❌ Rate limit ne reset pas après 60s
- ❌ Erreur serveur 500

#### Données à Collecter
- Résultats complets des 11 requêtes
- Headers de chaque réponse
- Timestamp du test
- Screenshot console

---

### Test 4: Vérification Base de Données 🗄️
**Responsable:** Test Architect (BMad QA)  
**Durée:** 5 minutes  
**Type:** Test technique SQL  
**Priorité:** 🔴 CRITIQUE

#### Scénario
```sql
-- Test 4.1: Vérifier aucun post pending créé après déploiement
SELECT 
  id,
  user_id,
  status,
  created_at,
  updated_at
FROM posts 
WHERE status = 'pending' 
AND created_at > '2026-01-26 22:00:00'
ORDER BY created_at DESC;

-- Résultat attendu: 0 rows
-- Si rows > 0: ÉCHEC CRITIQUE


-- Test 4.2: Vérifier posts completed créés correctement
SELECT 
  COUNT(*) as total_completed,
  COUNT(DISTINCT user_id) as unique_users
FROM posts 
WHERE status = 'completed' 
AND created_at > '2026-01-26 22:00:00';

-- Résultat attendu: total_completed > 0 (si tests effectués)


-- Test 4.3: Vérifier intégrité référentielle
SELECT 
  p.id as post_id,
  p.user_id,
  p.status,
  u.id as user_exists
FROM posts p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.created_at > '2026-01-26 22:00:00'
AND u.id IS NULL;

-- Résultat attendu: 0 rows (tous les posts ont un user valide)


-- Test 4.4: Vérifier pas de corruption données
SELECT 
  id,
  user_id,
  status,
  content,
  created_at
FROM posts 
WHERE created_at > '2026-01-26 22:00:00'
AND (
  content IS NULL 
  OR content = '' 
  OR user_id IS NULL
);

-- Résultat attendu: 0 rows
```

#### Critères de Succès
- [ ] Test 4.1: 0 posts avec status `pending`
- [ ] Test 4.2: Posts `completed` créés (si tests effectués)
- [ ] Test 4.3: Intégrité référentielle 100%
- [ ] Test 4.4: Aucune corruption de données
- [ ] Pas d'erreur SQL

#### Critères d'Échec (BLOQUANTS)
- ❌ Posts `pending` trouvés
- ❌ Posts sans user_id
- ❌ Posts sans content
- ❌ Intégrité référentielle cassée

#### Données à Collecter
- Résultats de chaque query
- Nombre de posts créés pendant tests
- Liste des user_id de test
- Screenshot résultats SQL

---

### Test 5: Alerting & Logs 📊
**Responsable:** Test Architect (BMad QA)  
**Durée:** 3 minutes  
**Type:** Test technique monitoring  
**Priorité:** 🟡 HAUTE

#### Scénario
```
1. Accéder Vercel Logs: https://vercel.com/floriantriclin/postry-ai-v5/logs
2. Filtrer logs dernières 10 minutes
3. Déclencher erreur intentionnelle:
   - Requête malformée à /api/auth/persist-on-login
   - Body JSON invalide
4. Vérifier log d'erreur apparaît
5. Vérifier format JSON structuré
6. Vérifier contexte complet présent
```

#### Critères de Succès
- [ ] Logs visibles dans Vercel dashboard
- [ ] Logs au format JSON structuré
- [ ] Chaque log contient:
  - [ ] `timestamp` (ISO 8601)
  - [ ] `level` (info, warn, error)
  - [ ] `endpoint` (ex: /api/auth/persist-on-login)
  - [ ] `method` (POST, GET, etc.)
  - [ ] `statusCode`
  - [ ] `message` descriptif
  - [ ] `context` (détails additionnels)
- [ ] Erreur intentionnelle loggée correctement
- [ ] Pas de spam de logs (< 10 logs/min en idle)

#### Critères d'Échec (NON-BLOQUANTS)
- ⚠️ Logs non structurés (format texte)
- ⚠️ Contexte incomplet
- ⚠️ Spam de logs (> 50 logs/min)

#### Données à Collecter
- Screenshot Vercel logs
- Exemple de log structuré (JSON)
- Fréquence des logs
- Types d'erreurs loggées

---

## 📊 Checklist de Validation Globale

### Validation Fonctionnelle
- [ ] Test 1 passé: Flux complet nouveau user
- [ ] Test 2 passé: Redirect /quiz/reveal
- [ ] Aucune erreur critique dans logs
- [ ] Performance acceptable (< 2s auth → dashboard)

### Validation Technique
- [ ] Test 3 passé: Rate limiting fonctionne
- [ ] Test 4 passé: Pas de posts pending
- [ ] Test 5 passé: Alerting & logs opérationnels
- [ ] Variables d'environnement correctes

### Validation Sécurité
- [ ] Rate limiting actif et fonctionnel
- [ ] Pas de fuite de données sensibles dans logs
- [ ] Magic links fonctionnent correctement
- [ ] Sessions utilisateur sécurisées

---

## 🚨 Critères GO/NO-GO

### 🟢 GO pour Monitoring 24h
**Tous les critères suivants DOIVENT être remplis:**
- ✅ Test 1 passé (flux complet)
- ✅ Test 2 passé (redirect)
- ✅ Test 3 passé (rate limiting)
- ✅ Test 4 passé (pas de posts pending)
- ✅ Aucune erreur critique
- ✅ Performance acceptable

### 🔴 NO-GO (Rollback Requis)
**UN SEUL de ces critères suffit pour NO-GO:**
- ❌ Test 1 échoué (flux cassé)
- ❌ Posts pending créés
- ❌ Rate limiting ne fonctionne pas
- ❌ Erreurs critiques récurrentes
- ❌ Perte de données
- ❌ Performance inacceptable (> 5s)

---

## 📝 Template Rapport d'Exécution

### Test 1: Flux Complet Nouveau User
**Statut:** [ ] ✅ PASSÉ | [ ] ❌ ÉCHOUÉ | [ ] ⚠️ PARTIEL

**Détails:**
- Temps total flux: ___ secondes
- Temps auth → dashboard: ___ secondes
- Post visible: [ ] Oui [ ] Non
- Erreurs console: [ ] Aucune [ ] Oui (détails: ___)

**Screenshots:**
- [ ] Dashboard final
- [ ] Console (si erreurs)

**Notes:**
___

---

### Test 2: Redirect /quiz/reveal
**Statut:** [ ] ✅ PASSÉ | [ ] ❌ ÉCHOUÉ

**Détails:**
- Redirect automatique: [ ] Oui [ ] Non
- Temps redirect: ___ ms
- URL finale: ___

**Notes:**
___

---

### Test 3: Rate Limiting
**Statut:** [ ] ✅ PASSÉ | [ ] ❌ ÉCHOUÉ | [ ] ⚠️ PARTIEL

**Détails:**
- Requêtes 1-10: Status ___
- Requête 11: Status ___
- Headers présents: [ ] Oui [ ] Non
- Rate limit reset: [ ] Oui [ ] Non

**Résultats:**
```
[Coller résultats console ici]
```

**Notes:**
___

---

### Test 4: Vérification Base de Données
**Statut:** [ ] ✅ PASSÉ | [ ] ❌ ÉCHOUÉ

**Détails:**
- Posts pending: ___ (attendu: 0)
- Posts completed: ___
- Intégrité référentielle: [ ] OK [ ] KO
- Corruption données: [ ] Aucune [ ] Détectée

**Résultats SQL:**
```sql
[Coller résultats queries ici]
```

**Notes:**
___

---

### Test 5: Alerting & Logs
**Statut:** [ ] ✅ PASSÉ | [ ] ❌ ÉCHOUÉ | [ ] ⚠️ PARTIEL

**Détails:**
- Logs visibles: [ ] Oui [ ] Non
- Format JSON: [ ] Oui [ ] Non
- Contexte complet: [ ] Oui [ ] Non
- Spam logs: [ ] Non [ ] Oui

**Exemple Log:**
```json
[Coller exemple log structuré ici]
```

**Notes:**
___

---

## 🎯 Décision Finale

### Résumé des Tests
- Tests passés: ___ / 5
- Tests échoués: ___ / 5
- Tests partiels: ___ / 5

### Problèmes Identifiés
1. ___
2. ___
3. ___

### Recommandation
[ ] 🟢 **GO** - Lancer monitoring 24h STAGING  
[ ] 🟡 **GO avec réserves** - Lancer monitoring avec surveillance accrue  
[ ] 🔴 **NO-GO** - Rollback requis

### Justification
___

### Prochaines Étapes
- [ ] Si GO: Lancer monitoring 24h
- [ ] Si NO-GO: Exécuter plan de rollback
- [ ] Créer rapport final tests smoke
- [ ] Communiquer résultats à l'équipe

---

## 📞 Coordination Équipe

### Responsabilités
| Rôle | Responsable | Tests Assignés | Statut |
|------|-------------|----------------|--------|
| **Product Manager** | BMad PM | Test 1, Test 2 | ⏳ En attente |
| **Test Architect** | BMad QA | Test 3, Test 4, Test 5 | ⏳ En attente |

### Communication
- **Slack/Discord:** Canal #staging-tests
- **Durée estimée:** 30 minutes
- **Deadline:** 26 Janvier 2026 23:30 UTC
- **Rapport final:** 26 Janvier 2026 23:45 UTC

---

## 📚 Références

### Documentation
- [`docs/RECAP-CE-QUI-RESTE-A-FAIRE.md`](../RECAP-CE-QUI-RESTE-A-FAIRE.md) - Guide actions
- [`docs/deployments/staging-deployment-report-20260126.md`](../deployments/staging-deployment-report-20260126.md) - Rapport déploiement
- [`docs/stories/STORIES-2-7-2-8-SYNTHESE-COMPLETE.md`](../stories/STORIES-2-7-2-8-SYNTHESE-COMPLETE.md) - Synthèse complète

### Code Source
- [`app/api/auth/persist-on-login/route.ts`](../../app/api/auth/persist-on-login/route.ts) - Endpoint auth
- [`lib/rate-limit.ts`](../../lib/rate-limit.ts) - Rate limiting
- [`lib/alerting.ts`](../../lib/alerting.ts) - Alerting system
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) - Dashboard
- [`app/quiz/reveal/page.tsx`](../../app/quiz/reveal/page.tsx) - Redirect page

---

**Créé par:** Product Manager (BMad PM)  
**Date:** 26 Janvier 2026 22:51 UTC  
**Version:** 1.0  
**Statut:** 📋 PLAN PRÊT - EN ATTENTE EXÉCUTION
