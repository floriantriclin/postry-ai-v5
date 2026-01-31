# Guide Rate Limiting - Postry AI

**Date de création:** 31 Janvier 2026  
**Dernière mise à jour:** 31 Janvier 2026  
**Version:** 1.0  
**Statut:** ✅ ACTIF

---

## 📋 Objectif

Guide complet pour configurer, monitorer et ajuster le rate limiting sur les endpoints critiques de Postry AI.

## 🎯 Audience

- **DevOps Engineers:** Configuration et monitoring du rate limiting
- **Backend Developers:** Implémentation et maintenance
- **Support Engineers:** Diagnostic des problèmes de rate limiting

---

## 🔧 Configuration Actuelle

### Endpoints Protégés

| Endpoint | Limite | Fenêtre | Identifiant |
|----------|--------|---------|-------------|
| `/api/auth/persist-on-login` | 10 req | 60s (1 min) | IP address |
| _(Futurs endpoints)_ | - | - | - |

### Variables d'Environnement

**Fichier:** `.env` (local) ou **Vercel Environment Variables** (production)

```bash
# Activer/désactiver rate limiting globalement
RATE_LIMIT_ENABLED=true

# Configuration spécifique persist-on-login
RATE_LIMIT_PERSIST_LOGIN=10        # Nombre max de requêtes
RATE_LIMIT_WINDOW_MS=60000         # Fenêtre en millisecondes (60s)
```

⚠️ **Important:** Ces variables sont lues au démarrage du serveur. Modifier ces valeurs nécessite un redéploiement.

---

## 📊 Comment Fonctionne le Rate Limiting

### Architecture

**Implémentation:** In-memory Map (serveur Node.js)

```
Client (IP: 192.168.1.1)
    ↓
Request: POST /api/auth/persist-on-login
    ↓
Rate Limit Check:
  - Identifier: getClientIp(req) → "192.168.1.1"
  - Store: Map<IP, { count, resetTime }>
  - Check: count < limit?
    ↓ YES
  Allow request (count++)
  Return: 200 OK + rate limit headers
    ↓ NO
  Block request
  Return: 429 Too Many Requests
```

### Extraction de l'IP Client

**Ordre de priorité:**
1. Header `x-forwarded-for` (proxy/load balancer)
2. Header `x-real-ip` (reverse proxy)
3. Fallback: `"unknown"` (rare en production)

**Exemple:**
```javascript
// Header: x-forwarded-for: "192.168.1.1, 10.0.0.1"
// IP extraite: "192.168.1.1" (premier IP de la liste)
```

### Nettoyage Automatique

**Stratégie:** Cleanup interval de 5 minutes

- Toutes les 5 minutes, les entrées expirées sont supprimées du store
- Évite la croissance infinie de la Map en mémoire
- Aucun impact sur les performances

---

## 📡 Headers Rate Limit dans les Réponses

### Headers Standard (RateLimit Specification)

Chaque réponse d'un endpoint protégé inclut ces headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706745600
```

**Explication:**
- `X-RateLimit-Limit`: Nombre max de requêtes autorisées dans la fenêtre
- `X-RateLimit-Remaining`: Nombre de requêtes restantes avant blocage
- `X-RateLimit-Reset`: Timestamp Unix (en secondes) du reset de la limite

### Réponse 429 Too Many Requests

Quand la limite est dépassée:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706745600
Content-Type: application/json

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 2026-01-31T12:30:00.000Z",
  "retryAfter": 1706745600
}
```

---

## 🛠️ Monitoring du Rate Limiting

### 1. Logs Serveur (Vercel Logs)

**Rechercher les logs de rate limiting:**

```bash
# Vercel CLI
vercel logs --follow

# Rechercher "Rate limit exceeded"
grep "Rate limit exceeded" logs.txt
```

**Logs typiques:**

```
[2026-01-31T12:00:00.000Z] POST /api/auth/persist-on-login
  IP: 192.168.1.1
  Rate limit exceeded: 11/10 requests
  Reset at: 2026-01-31T12:01:00.000Z
```

### 2. Sentry (Si Configuré)

**Alertes automatiques:**
- Une alerte Sentry est envoyée quand un utilisateur atteint la limite
- Filtre: `level:warning`, `tag:rate-limit`

**Dashboard Sentry:**
1. **Issues** → Filter: `rate-limit`
2. Voir la fréquence des incidents
3. Identifier les IPs problématiques (abuse)

### 3. Métriques Clés à Surveiller

| Métrique | Description | Seuil d'Alerte |
|----------|-------------|----------------|
| **Rate Limit Blocks** | Nombre de requêtes bloquées (429) | > 100/jour (abuse potentiel) |
| **Top Blocked IPs** | IPs les plus bloquées | > 50 blocks/IP/jour |
| **False Positives** | Utilisateurs légitimes bloqués | > 5% des blocks |
| **Reset Rate** | Fréquence de reset des compteurs | Devrait être constant |

---

## 🔧 Ajuster les Limites

### Quand Augmenter la Limite?

**Cas d'usage:**
1. **Trafic légitime élevé:** Période de lancement, campagne marketing
2. **UX dégradée:** Utilisateurs légitimes bloqués fréquemment
3. **Tests automatisés:** Environnements de staging/dev

**Procédure:**

1. **Analyser les logs:**
   ```bash
   # Identifier combien d'utilisateurs légitimes sont bloqués
   grep "Rate limit exceeded" logs.txt | grep -v "abuse"
   ```

2. **Calculer la nouvelle limite:**
   - Limite actuelle: 10 req/min
   - Trafic légitime observé: 15 req/min (peak)
   - Nouvelle limite recommandée: 20 req/min (buffer de 33%)

3. **Mettre à jour la variable d'environnement:**

   **Vercel Dashboard:**
   - Settings → Environment Variables
   - Modifier: `RATE_LIMIT_PERSIST_LOGIN=20`
   - Redéployer: `vercel --prod`

4. **Valider:**
   - Vérifier les headers: `X-RateLimit-Limit: 20`
   - Surveiller les logs pendant 24h

### Quand Réduire la Limite?

**Cas d'usage:**
1. **Attaque DDoS détectée:** Trop de requêtes d'IPs suspectes
2. **Abus identifié:** Scripts automatisés malveillants
3. **Réduction de charge serveur:** Optimisation des coûts

**Procédure:**

1. **Identifier les IPs malveillantes:**
   ```bash
   grep "Rate limit exceeded" logs.txt | sort | uniq -c | sort -nr
   ```

2. **Réduire temporairement:**
   - Nouvelle limite: `RATE_LIMIT_PERSIST_LOGIN=5`
   - Fenêtre plus courte: `RATE_LIMIT_WINDOW_MS=30000` (30s)

3. **Activer alerting aggressive:**
   - Envoyer alerte pour chaque block
   - Monitorer en temps réel

---

## 🚨 Scénarios d'Incident

### Scénario 1: Utilisateur Légitime Bloqué

**Symptôme:** User reporte qu'il ne peut pas se connecter (429 error)

**Diagnostic:**
1. Vérifier les logs: Est-ce un utilisateur légitime ou un bot?
2. Vérifier l'IP dans les logs: Combien de requêtes ont été faites?
3. Vérifier le contexte: Lancement d'app mobile, test automatisé?

**Solution:**
1. **Temporaire:** Augmenter la limite pour cet endpoint
2. **Permanent:** Implémenter une whitelist d'IPs (si applicable)
3. **Alternative:** Utiliser authentification pour exemption (user logged = higher limit)

### Scénario 2: Attaque DDoS

**Symptôme:** Milliers de requêtes 429 en quelques minutes

**Diagnostic:**
1. Identifier les IPs sources (probablement quelques IPs avec beaucoup de requêtes)
2. Vérifier la distribution géographique (botnet?)
3. Vérifier le pattern: Requêtes espacées régulièrement = bot

**Solution:**
1. **Immédiat:** Réduire drastiquement la limite (RATE_LIMIT=2, WINDOW=10000)
2. **Court terme:** Activer Vercel Edge Firewall (si disponible)
3. **Long terme:** Implémenter rate limiting IP-based avec Redis (multi-instance)

### Scénario 3: Rate Limiting Ne Fonctionne Pas

**Symptôme:** Endpoint spammé sans blocage (pas de 429)

**Diagnostic:**
1. Vérifier la variable: `RATE_LIMIT_ENABLED=true`?
2. Vérifier l'implémentation: Rate limit appliqué dans le code?
3. Vérifier les logs: Aucune trace de rate limiting = bug

**Solution:**
1. Vérifier le code: `rateLimit(req, config)` est bien appelé?
2. Vérifier les mocks en tests: Les tests unitaires passent?
3. Redéployer si variable manquante

---

## 🔗 Références Techniques

### Code Source

- **Rate Limiting Logic:** `lib/rate-limit.ts`
- **Tests Unitaires:** `lib/rate-limit.test.ts` (100% coverage)
- **Endpoint Exemple:** `app/api/auth/persist-on-login/route.ts`

### Standards & Specs

- **IETF RateLimit Specification:** https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
- **Vercel Rate Limiting:** https://vercel.com/docs/functions/edge-middleware/middleware-api#rate-limiting
- **Best Practices:** https://cloud.google.com/architecture/rate-limiting-strategies

### Liens Internes

- **Production Deployment:** [production-deployment-guide.md](./production-deployment-guide.md)
- **Alerting Guide:** [alerting-guide.md](./alerting-guide.md)
- **Incident Runbook:** [incident-runbook.md](./incident-runbook.md)
- **Monitoring Metrics:** [monitoring-metrics.md](./monitoring-metrics.md)

---

## 📞 Support

**Questions ou problèmes avec rate limiting?**

| Type | Contact | Response Time |
|------|---------|---------------|
| **Incident P0** | devops@postry.ai | < 15 min |
| **Question technique** | dev@postry.ai | < 2h (business hours) |
| **Feature request** | Linear (label: rate-limit) | Next sprint |

---

## 🧪 Tests & Validation

### Tester le Rate Limiting en Local

```bash
# Start dev server
npm run dev

# Faire 11 requêtes rapidement
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/auth/persist-on-login \
    -H "Content-Type: application/json" \
    -d '{ "email": "test@example.com", ... }'
done

# La 11ème requête devrait retourner 429
```

### Tester en Staging

```bash
# Utiliser un script de load testing
npm run test:rate-limit-staging
```

---

## 📊 Métriques de Succès

**Rate limiting fonctionne correctement si:**

- ✅ 0 incidents d'abuse non détectés
- ✅ < 5% de false positives (utilisateurs légitimes bloqués)
- ✅ Temps de réponse 429 < 100ms (blocage instantané)
- ✅ Cleanup automatique fonctionne (mémoire stable)

---

**Créé par:** Amelia (BMad Dev)  
**Dernière révision:** 31 Janvier 2026  
**Prochaine révision:** Lors de changements dans l'implémentation rate limiting
