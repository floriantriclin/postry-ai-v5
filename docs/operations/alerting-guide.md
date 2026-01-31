# Guide Alerting & Monitoring - Postry AI

**Date de création:** 31 Janvier 2026  
**Dernière mise à jour:** 31 Janvier 2026  
**Version:** 1.0  
**Statut:** ✅ ACTIF

---

## 📋 Objectif

Guide complet pour configurer, gérer et répondre aux alertes du système d'alerting de Postry AI.

## 🎯 Audience

- **DevOps Engineers:** Configuration des channels d'alerting
- **Backend Developers:** Implémentation des alertes dans le code
- **Support Engineers:** Réponse aux alertes et triage

---

## 🔔 Types d'Alertes

### 1. Auth Failures (Alertes d'Authentification)

**Trigger:** Échec d'authentification dans un endpoint critique

**Fonction:** `alertAuthFailure(message, context)`

**Exemples:**
- User non authentifié tente d'accéder à `/api/auth/persist-on-login`
- Token JWT expiré ou invalide
- Session Supabase corrompue

**Contexte typique:**
```javascript
{
  endpoint: '/api/auth/persist-on-login',
  error: 'Session expired',
  userId: null,
  timestamp: '2026-01-31T12:00:00.000Z'
}
```

**Severity:** 🟡 MEDIUM (peut être légitime si session expirée naturellement)

**Actions recommandées:**
- Vérifier si c'est un pattern (plusieurs échecs du même user)
- Si abuse détecté: Bloquer IP temporairement
- Si légitime: Rien à faire (user doit se reconnecter)

---

### 2. Validation Errors (Alertes de Validation)

**Trigger:** Données invalides reçues par l'API

**Fonction:** `alertValidationError(message, error, context)`

**Exemples:**
- Email invalide (format incorrect)
- Champ requis manquant (ex: `theme` undefined)
- Type de données incorrect (ex: string au lieu de number)

**Contexte typique:**
```javascript
{
  endpoint: '/api/auth/persist-on-login',
  userId: 'user-123',
  validationErrors: [
    {
      path: ['email'],
      message: 'Invalid email address',
      code: 'invalid_format'
    }
  ],
  timestamp: '2026-01-31T12:00:00.000Z'
}
```

**Severity:** 🟢 LOW (généralement erreur client, pas serveur)

**Actions recommandées:**
- Analyser les patterns: Même erreur répétée = bug frontend
- Vérifier si le frontend envoie les bonnes données
- Si trop fréquent: Ouvrir issue pour améliorer validation frontend

---

### 3. Database Errors (Alertes Base de Données)

**Trigger:** Échec d'opération sur la base de données

**Fonction:** `alertDatabaseError(message, error, context)`

**Exemples:**
- Insert post échoue (contrainte unique violée)
- Connection timeout Supabase
- Query SQL malformée
- RLS (Row Level Security) block

**Contexte typique:**
```javascript
{
  endpoint: '/api/auth/persist-on-login',
  userId: 'user-123',
  email: 'test@example.com',
  theme: 'Test Theme',
  error: {
    message: 'Connection timeout',
    code: 'PGRST301'
  },
  timestamp: '2026-01-31T12:00:00.000Z'
}
```

**Severity:** 🔴 HIGH (impacte directement l'expérience utilisateur)

**Actions recommandées:**
1. **Immédiat:** Vérifier l'état de Supabase (Dashboard → Status)
2. **Diagnostic:** Vérifier les logs Supabase pour l'erreur exacte
3. **Mitigation:** Si timeouts fréquents, augmenter pool de connexions
4. **Escalation:** Si downtime Supabase, contacter support Supabase

---

### 4. Unhandled Exceptions (Exceptions Non Gérées)

**Trigger:** Exception inattendue dans le code (catch-all)

**Fonction:** `alertUnhandledException(message, error, context)`

**Exemples:**
- TypeError: Cannot read property 'x' of undefined
- ReferenceError: Variable non définie
- Unexpected null/undefined dans le code

**Contexte typique:**
```javascript
{
  endpoint: '/api/auth/persist-on-login',
  method: 'POST',
  error: {
    name: 'TypeError',
    message: "Cannot read property 'id' of undefined",
    stack: '...'
  },
  timestamp: '2026-01-31T12:00:00.000Z'
}
```

**Severity:** 🔴 HIGH à 🟣 CRITICAL (bug dans le code)

**Actions recommandées:**
1. **Immédiat:** Rollback si l'erreur est critique et fréquente (>10/min)
2. **Debug:** Analyser la stacktrace pour identifier la ligne problématique
3. **Fix:** Ouvrir issue Linear (P0-CRITICAL) et assigner au dev
4. **Deploy:** Déployer hotfix dès que possible

---

## 🔧 Configuration des Channels

### 1. Sentry (Recommandé)

**Setup:**

1. **Créer compte Sentry:** https://sentry.io
2. **Créer projet:** Nom: `postry-ai`, Platform: `Next.js`
3. **Copier DSN:** Ex: `https://abc123@o123456.ingest.sentry.io/789012`
4. **Configurer Vercel:**
   - Vercel Dashboard → Environment Variables
   - Ajouter: `SENTRY_DSN=https://abc123@...`
   - Redéployer

**Avantages:**
- ✅ Groupement automatique des erreurs similaires
- ✅ Stacktraces détaillées avec source maps
- ✅ Alerting configuré par email/Slack
- ✅ Release tracking (quelle version a introduit le bug?)
- ✅ Performance monitoring (APM)

**Configuration Sentry:**

```javascript
// lib/sentry.ts (exemple)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% des requêtes tracées
  beforeSend(event, hint) {
    // Filtrer erreurs non critiques
    if (event.level === 'info') return null;
    return event;
  }
});
```

---

### 2. Email Alerts

**Setup:**

1. **Configurer SMTP:** Utiliser SendGrid, Mailgun, ou AWS SES
2. **Ajouter variables d'environnement:**
   ```bash
   ALERT_EMAIL=alerts@postry.ai
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxx
   ```

**Template Email:**

```
Subject: [Postry AI] Database Error - /api/auth/persist-on-login

Severity: HIGH
Timestamp: 2026-01-31 12:00:00 UTC
Endpoint: /api/auth/persist-on-login
User ID: user-123

Error Message:
Connection timeout - could not connect to database

Context:
{
  "email": "test@example.com",
  "theme": "Test Theme",
  "userId": "user-123"
}

Actions:
1. Check Supabase status: https://app.supabase.com/status
2. Review logs: https://vercel.com/logs
3. Escalate if needed: See incident-runbook.md
```

---

### 3. Slack Alerts (Optionnel)

**Setup:**

1. **Créer Slack App:** https://api.slack.com/apps
2. **Activer Incoming Webhooks**
3. **Copier Webhook URL:** `https://hooks.slack.com/services/T.../B.../xxx`
4. **Configurer Vercel:**
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   SLACK_CHANNEL=#postry-alerts
   ```

**Message Slack:**

```javascript
{
  "channel": "#postry-alerts",
  "username": "Postry AI Alerting",
  "icon_emoji": ":rotating_light:",
  "attachments": [
    {
      "color": "danger",
      "title": "Database Error - /api/auth/persist-on-login",
      "fields": [
        { "title": "Severity", "value": "HIGH", "short": true },
        { "title": "User ID", "value": "user-123", "short": true },
        { "title": "Error", "value": "Connection timeout", "short": false }
      ],
      "footer": "Postry AI Alerting",
      "ts": 1706745600
    }
  ]
}
```

---

## 🚨 Rate Limiting des Alertes

**Problème:** Sans rate limiting, une erreur répétée peut générer des milliers d'alertes en quelques minutes.

**Solution Implémentée:** Rate limiting par type d'alerte

**Configuration:**

```javascript
// lib/alerting.ts
const ALERT_RATE_LIMITS = {
  authFailure: { limit: 10, windowMs: 60000 },      // Max 10 alertes/min
  validationError: { limit: 5, windowMs: 60000 },   // Max 5 alertes/min
  databaseError: { limit: 20, windowMs: 60000 },    // Max 20 alertes/min
  unhandledException: { limit: 50, windowMs: 60000 }// Max 50 alertes/min
};
```

**Comportement:**
- Si limite atteinte, alertes supplémentaires sont silencieuses
- Log indique: `Alert suppressed due to rate limit`
- Après la fenêtre, alerting reprend normalement

**Ajuster les Limites:**

1. **Trop d'alertes (spam):**
   - Réduire: `databaseError.limit = 10`
   - Augmenter fenêtre: `windowMs = 120000` (2 min)

2. **Pas assez d'alertes (alertes manquées):**
   - Augmenter: `databaseError.limit = 50`
   - Réduire fenêtre: `windowMs = 30000` (30s)

---

## 🧪 Tester l'Alerting

### Test en Staging

**1. Déclencher alerte Auth Failure:**

```bash
curl -X POST https://staging.postry.ai/api/auth/persist-on-login \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", ... }'
  # Sans cookies d'authentification → 401 → alerte
```

**2. Déclencher alerte Validation Error:**

```bash
curl -X POST https://staging.postry.ai/api/auth/persist-on-login \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{ "email": "invalid-email", ... }'
  # Email invalide → 400 → alerte
```

**3. Vérifier:**
- Sentry Dashboard: Nouvelle issue créée?
- Email reçu? (vérifier spam)
- Slack message posté? (channel configuré)

---

## 📊 Monitoring des Alertes

### Métriques Clés

| Métrique | Description | Seuil d'Alerte |
|----------|-------------|----------------|
| **Alerte Rate** | Nombre d'alertes/heure | > 100/h (spam) |
| **Auth Failures** | Échecs authentification | > 50/h (abuse potentiel) |
| **Database Errors** | Erreurs DB | > 10/h (downtime DB?) |
| **Unhandled Exceptions** | Bugs code | > 5/h (rollback?) |
| **Alert Suppression** | Alertes supprimées (rate limit) | > 20% (ajuster limites) |

### Dashboard Sentry (Recommandé)

**Vues utiles:**
1. **Issues → By Frequency:** Erreurs les plus fréquentes
2. **Issues → By Impact:** Erreurs affectant le plus d'utilisateurs
3. **Releases:** Quelle version a introduit le bug?
4. **Performance:** Transactions lentes (APM)

---

## 🔗 Références

### Code Source

- **Alerting Logic:** `lib/alerting.ts`
- **Tests Alerting:** Tests intégrés dans `app/api/auth/persist-on-login/route.test.ts`

### Documentation Externe

- **Sentry Documentation:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Slack Incoming Webhooks:** https://api.slack.com/messaging/webhooks
- **SendGrid SMTP:** https://docs.sendgrid.com/for-developers/sending-email/smtp

### Liens Internes

- **Production Deployment:** [production-deployment-guide.md](./production-deployment-guide.md)
- **Rate Limiting Guide:** [rate-limiting-guide.md](./rate-limiting-guide.md)
- **Incident Runbook:** [incident-runbook.md](./incident-runbook.md)
- **Monitoring Metrics:** [monitoring-metrics.md](./monitoring-metrics.md)

---

## 📞 Support

**Questions ou problèmes avec alerting?**

| Type | Contact | Response Time |
|------|---------|---------------|
| **Incident P0 (alerting down)** | devops@postry.ai | < 15 min |
| **Faux positifs** | dev@postry.ai | < 2h (business hours) |
| **Configuration Sentry** | Sentry Support | < 24h |

---

## ✅ Checklist Configuration Alerting

**Avant de passer en production:**

- [ ] Sentry configuré avec DSN valide
- [ ] Email SMTP configuré et testé
- [ ] Slack webhook configuré (optionnel)
- [ ] Rate limiting des alertes activé
- [ ] Tests d'alerte effectués en staging
- [ ] Channels de notification vérifiés (email, Slack)
- [ ] Dashboard Sentry accessible à l'équipe
- [ ] Documentation lue et comprise par l'équipe

---

**Créé par:** Amelia (BMad Dev)  
**Dernière révision:** 31 Janvier 2026  
**Prochaine révision:** Lors de changements dans l'implémentation alerting
