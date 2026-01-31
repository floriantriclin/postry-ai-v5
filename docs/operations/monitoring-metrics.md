# Monitoring & Métriques - Postry AI

**Date de création:** 31 Janvier 2026  
**Dernière mise à jour:** 31 Janvier 2026  
**Version:** 1.0  
**Statut:** ✅ ACTIF

---

## 📋 Objectif

Définir les métriques clés à surveiller, les seuils d'alerte et les dashboards recommandés pour monitorer la santé de Postry AI en production.

## 🎯 Audience

- **DevOps Engineers:** Configuration et monitoring des métriques
- **Product Owner:** Visibilité sur santé du produit
- **Developers:** Comprendre l'impact de leur code en production

---

## 📊 Métriques Clés (Golden Signals)

### 1. Latency (Temps de Réponse)

**Définition:** Temps entre la requête et la réponse

**Métriques:**
- **p50 (médiane):** Temps de réponse pour 50% des requêtes
- **p95:** Temps de réponse pour 95% des requêtes (exclut outliers)
- **p99:** Temps de réponse pour 99% des requêtes

**Seuils:**

| Endpoint | p50 | p95 | p99 | Action si dépassé |
|----------|-----|-----|-----|-------------------|
| `/` (Landing) | < 500ms | < 1s | < 2s | Optimiser images/bundle |
| `/api/auth/persist-on-login` | < 300ms | < 800ms | < 1.5s | Optimiser DB query |
| `/api/quiz/generate` | < 2s | < 5s | < 10s | Optimiser Gemini call |
| `/dashboard` | < 800ms | < 2s | < 4s | Optimiser DB queries |

**Comment Mesurer:**

**Vercel Analytics:**
```
Dashboard → Analytics → Response Time
Filter: Last 7 days
Group by: Endpoint
```

**Sentry Performance (APM):**
```
Performance → Transactions
Sort by: p95 (descending)
Filter: Last 24h
```

---

### 2. Traffic (Trafic)

**Définition:** Nombre de requêtes par unité de temps

**Métriques:**
- **Requests/minute:** Trafic en temps réel
- **Requests/day:** Volume journalier
- **Peak traffic:** Pic de trafic (pour capacity planning)

**Seuils:**

| Période | Traffic Normal | Alerte High | Alerte Critical |
|---------|----------------|-------------|------------------|
| **Requests/min** | 10-50 | > 200 | > 500 (DDoS?) |
| **Requests/day** | 500-2000 | > 5000 | > 10000 |
| **Unique users/day** | 50-200 | > 1000 | > 5000 |

**Comment Mesurer:**

**Vercel Analytics:**
```
Dashboard → Analytics → Traffic
View: Last 30 days
Breakdown: By day, By hour, By endpoint
```

**Google Analytics (Si configuré):**
```
Real-Time → Overview
Audience → Overview → Active users
```

---

### 3. Errors (Taux d'Erreur)

**Définition:** Pourcentage de requêtes échouant avec erreur (4xx/5xx)

**Métriques:**
- **Error rate:** % de requêtes avec erreur
- **4xx rate:** Erreurs client (bad request, auth failure)
- **5xx rate:** Erreurs serveur (database, API failures)

**Seuils:**

| Type d'Erreur | Normal | Alerte | Critical |
|---------------|--------|--------|----------|
| **4xx (Client)** | < 5% | > 10% | > 20% |
| **5xx (Server)** | < 1% | > 2% | > 5% |
| **Total Errors** | < 5% | > 10% | > 15% |

**Comment Mesurer:**

**Vercel Logs:**
```bash
# Compter erreurs dans les logs
vercel logs --since 1h | grep -E "status\":(4|5)[0-9]{2}" | wc -l
```

**Sentry:**
```
Issues → Filter: is:unresolved
View: Error rate (%)
Period: Last 24h
```

---

### 4. Saturation (Utilisation Ressources)

**Définition:** Charge sur les ressources (CPU, Memory, DB connections)

**Métriques:**
- **Function duration:** Temps d'exécution des serverless functions
- **Memory usage:** Mémoire utilisée par les functions
- **Database connections:** Pool de connexions Supabase

**Seuils:**

| Ressource | Normal | Alerte | Critical |
|-----------|--------|--------|----------|
| **Function duration** | < 5s | > 8s | > 10s (timeout Vercel) |
| **Memory usage** | < 512MB | > 800MB | > 1GB (out of memory) |
| **DB connections** | < 10 | > 20 | > 30 (pool exhausted) |

**Comment Mesurer:**

**Vercel Dashboard:**
```
Functions → Select function
View: Duration, Memory, Invocations
Period: Last 24h
```

**Supabase Dashboard:**
```
Database → Metrics
View: Active connections, Pool exhaustion
Period: Last 24h
```

---

## 🎯 SLIs & SLOs (Service Level Indicators & Objectives)

### SLI 1: Availability (Disponibilité)

**Définition:** Pourcentage de temps où le service est accessible

**Mesure:**
```
Availability = (Uptime / Total Time) × 100%
```

**SLO (Objectif):**
- **Target:** 99.5% uptime (43.8 min downtime/month max)
- **Stretch goal:** 99.9% uptime (4.38 min downtime/month max)

**Comment Mesurer:**

**Uptime Robot (Externe):**
```
https://uptimerobot.com/
Monitor: https://postry.ai
Check interval: 5 minutes
Alert on: Down (2 consecutive failures)
```

**Vercel Status:**
```
Status page: Custom domain availability
Track: 200 OK responses vs total checks
```

---

### SLI 2: Success Rate (Taux de Succès)

**Définition:** Pourcentage de requêtes réussies (status 2xx)

**Mesure:**
```
Success Rate = (2xx responses / Total requests) × 100%
```

**SLO (Objectif):**
- **Target:** > 95% success rate
- **Stretch goal:** > 99% success rate

**Comment Mesurer:**

**Vercel Logs:**
```bash
# Success rate sur 1h
total=$(vercel logs --since 1h | wc -l)
success=$(vercel logs --since 1h | grep "status\":2" | wc -l)
echo "Success rate: $(($success * 100 / $total))%"
```

---

### SLI 3: Performance (p95 Latency)

**Définition:** 95% des requêtes répondent en moins de X secondes

**SLO (Objectif):**
- **Landing page:** p95 < 1s
- **API endpoints:** p95 < 800ms
- **Dashboard:** p95 < 2s

**Comment Mesurer:** Voir Section 1 (Latency)

---

## 📈 Dashboards Recommandés

### Dashboard 1: Overview (Vue Générale)

**Widgets:**

1. **Uptime (Last 30 days):**
   - Vert: 100% uptime
   - Orange: 99.5% - 99.9%
   - Rouge: < 99.5%

2. **Traffic (Requests/hour):**
   - Line chart: Last 24h
   - Compare: Last week

3. **Error Rate (%):**
   - Gauge: Current rate (last 1h)
   - Threshold: 
     - Green: < 5%
     - Orange: 5-10%
     - Red: > 10%

4. **p95 Latency:**
   - Bar chart: By endpoint
   - Threshold line: SLO target

5. **Active Alerts:**
   - Count: Unresolved incidents
   - Link to: Incident runbook

**Outils:**
- **Vercel Analytics:** Built-in dashboard
- **Sentry:** Custom dashboard
- **Grafana/Datadog:** Si budget disponible

---

### Dashboard 2: Database Health (Santé DB)

**Widgets:**

1. **Active Connections:**
   - Gauge: Current connections
   - Max: Pool size (30)

2. **Query Duration:**
   - Line chart: Average query time
   - Threshold: < 100ms

3. **Database Size:**
   - Gauge: Current size (GB)
   - Alert: > 80% quota

4. **Table Growth:**
   - Bar chart: Rows per table
   - Track: posts, users growth

**Outil:** Supabase Dashboard → Database → Metrics

---

### Dashboard 3: Security & Rate Limiting

**Widgets:**

1. **Rate Limit Blocks:**
   - Count: 429 responses (last 1h)
   - Breakdown: By IP, By endpoint

2. **Auth Failures:**
   - Count: 401 responses (last 1h)
   - Trend: Increasing = abuse?

3. **Top Blocked IPs:**
   - Table: IP, Block count, Last seen
   - Action: Whitelist or ban

4. **Alert Volume:**
   - Line chart: Alerts sent (last 24h)
   - Types: Auth, Validation, DB, Exception

**Outils:**
- Custom dashboard (Grafana/Metabase)
- Vercel Logs + grep scripts

---

## 🔔 Alerting Thresholds (Seuils d'Alerte)

### Alertes Critiques (P0)

**Triggers immédiats:**

| Métrique | Condition | Action |
|----------|-----------|--------|
| **Availability** | < 95% (sur 5 min) | Page DevOps immédiatement |
| **5xx Error Rate** | > 10% (sur 5 min) | Rollback automatique |
| **Database down** | Connection failed | Page DevOps + PO |
| **p95 Latency** | > 10s (timeout) | Investigate immediately |

### Alertes Moyennes (P1)

**Surveillance continue:**

| Métrique | Condition | Action |
|----------|-----------|--------|
| **4xx Error Rate** | > 15% (sur 1h) | Investigate client issues |
| **Rate Limit Blocks** | > 100/h | Check for abuse |
| **Memory Usage** | > 800MB | Optimize code |
| **DB Connections** | > 20 | Scale DB pool |

### Alertes Informatives (P2)

**Nice to know:**

| Métrique | Condition | Action |
|----------|-----------|--------|
| **Traffic spike** | +200% (vs baseline) | Monitor capacity |
| **Slow queries** | > 500ms | Optimize SQL |
| **Alert suppression** | > 20% suppressed | Adjust rate limits |

---

## 🔧 Configuration des Alertes

### Sentry Alerts

**Setup:**

1. **Dashboard Sentry** → Project Settings → Alerts
2. **Créer alerte:**
   - Name: "High Error Rate"
   - Condition: `Error count > 50 in 5 minutes`
   - Action: Email + Slack
   - Environment: Production only

**Alertes Recommandées:**

```yaml
- name: "High Error Rate"
  condition: "error_count > 50 in 5min"
  severity: P1
  notify: [email, slack]

- name: "Performance Degradation"
  condition: "p95_duration > 2000ms in 10min"
  severity: P1
  notify: [email, slack]

- name: "Database Errors"
  condition: "database_error_count > 10 in 5min"
  severity: P0
  notify: [email, slack, pagerduty]
```

---

### Uptime Monitoring

**Uptime Robot (Gratuit):**

1. **Créer monitor:**
   - URL: https://postry.ai
   - Type: HTTP(s)
   - Interval: 5 minutes
   - Timeout: 30 seconds

2. **Configurer alertes:**
   - Alert after: 2 consecutive failures (10 min)
   - Notify: Email + SMS (DevOps)

3. **Public status page:**
   - URL: https://stats.uptimerobot.com/xxx
   - Partager avec users (transparence)

---

## 📚 Références

### Outils de Monitoring

| Outil | Usage | Coût | URL |
|-------|-------|------|-----|
| **Vercel Analytics** | Built-in metrics | Inclus | https://vercel.com/analytics |
| **Sentry** | Error tracking + APM | Free tier: 5K events/month | https://sentry.io |
| **Uptime Robot** | Uptime monitoring | Free: 50 monitors | https://uptimerobot.com |
| **Supabase Dashboard** | Database metrics | Inclus | https://app.supabase.com |
| **Google Analytics** | User analytics | Gratuit | https://analytics.google.com |

### Documentation

- **Production Deployment:** [production-deployment-guide.md](./production-deployment-guide.md)
- **Rate Limiting:** [rate-limiting-guide.md](./rate-limiting-guide.md)
- **Alerting:** [alerting-guide.md](./alerting-guide.md)
- **Incident Runbook:** [incident-runbook.md](./incident-runbook.md)

---

## 📞 Support

**Questions sur monitoring?**

| Type | Contact | Response Time |
|------|---------|---------------|
| **Alertes manquantes** | devops@postry.ai | < 1h |
| **Dashboard setup** | dev@postry.ai | < 4h |
| **Sentry configuration** | Sentry Support | < 24h |

---

## ✅ Checklist Setup Monitoring

**Avant de passer en production:**

- [ ] Vercel Analytics activé
- [ ] Sentry configuré avec alertes
- [ ] Uptime Robot configuré avec public status page
- [ ] Supabase metrics accessibles
- [ ] Dashboards créés et partagés avec équipe
- [ ] Seuils d'alerte définis et testés
- [ ] Équipe formée à lire les dashboards
- [ ] Runbook incident accessible (lien depuis dashboard)

---

## 📊 Métriques de Succès (Meta-Monitoring)

**Le monitoring fonctionne bien si:**

- ✅ Incidents détectés en < 5 minutes (alertes fonctionnent)
- ✅ 0 incident non détecté (couverture complète)
- ✅ < 5% false positives (alertes pertinentes)
- ✅ Dashboards consultés quotidiennement (adoption équipe)
- ✅ SLOs respectés > 95% du temps (service stable)

---

**Créé par:** Amelia (BMad Dev)  
**Dernière révision:** 31 Janvier 2026  
**Prochaine révision:** Trimestrielle (ou après incidents majeurs)
