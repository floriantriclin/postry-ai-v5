# Incident Runbook - Postry AI

**Date de création:** 31 Janvier 2026  
**Dernière mise à jour:** 31 Janvier 2026  
**Version:** 1.0  
**Statut:** ✅ ACTIF

---

## 📋 Objectif

Guide opérationnel pour diagnostiquer et résoudre rapidement les incidents critiques affectant Postry AI en production.

## 🎯 Audience

- **DevOps Engineers:** Premier intervenant sur incidents
- **Developers On-Call:** Support technique de niveau 2
- **Support Engineers:** Triage et escalation

---

## 🚨 Classification des Incidents

### P0 - CRITIQUE (Résolution < 1h)

**Impact:** Service complètement indisponible ou perte de données

**Exemples:**
- Application complètement down (502/503)
- Base de données inaccessible
- Authentification cassée (100% des users bloqués)
- Perte de données utilisateur

**Actions:**
1. Alerter immédiatement DevOps Lead + PO
2. Ouvrir incident P0 dans Linear
3. Suivre procédure P0 (voir Section 1)

---

### P1 - MAJEUR (Résolution < 4h)

**Impact:** Fonctionnalité critique partiellement dégradée

**Exemples:**
- Dashboard inaccessible pour certains users
- Endpoint `/persist-on-login` échoue sporadiquement
- Rate limiting trop agressif (users légitimes bloqués)
- Alerting spam (>100 alertes/min)

**Actions:**
1. Ouvrir incident P1 dans Linear
2. Analyser l'impact (combien de users affectés?)
3. Suivre procédure P1 (voir Section 2)

---

### P2 - MINEUR (Résolution < 24h)

**Impact:** Problème cosmétique ou fonctionnalité non-critique dégradée

**Exemples:**
- Logs excessifs (non-critique)
- Lenteur UX mineure (p95 < 5s)
- Bug UI mineur (typo, mauvais CSS)

**Actions:**
1. Créer ticket Linear (label: P2-MINOR)
2. Planifier fix dans prochain sprint

---

## 1️⃣ PROCÉDURE P0 - Incident Critique

### Étape 1: Triage Rapide (< 5 min)

**Objectif:** Identifier rapidement la cause root

#### 1.1 Vérifier l'État Global

```bash
# Vercel Status
https://www.vercel-status.com/

# Supabase Status
https://status.supabase.com/

# Gemini AI Status
https://status.cloud.google.com/
```

✅ **Si service externe down:**
- Pas de notre faute, attendre résolution
- Informer users via status page (si disponible)
- Passer en mode dégradé si possible (fallback)

#### 1.2 Vérifier les Logs Vercel

```bash
# Logs en temps réel
vercel logs --follow

# Rechercher erreurs 500
vercel logs | grep "500"

# Rechercher exceptions
vercel logs | grep "Error"
```

**Erreurs critiques à rechercher:**
- `ECONNREFUSED` → Base de données inaccessible
- `ETIMEDOUT` → Timeout API externe (Supabase, Gemini)
- `TypeError: Cannot read property` → Bug code (rollback!)
- `502 Bad Gateway` → Vercel deployment échoué

#### 1.3 Vérifier Sentry (Si Configuré)

**Dashboard Sentry:**
1. Issues → Filter: `is:unresolved level:error`
2. Trier par: `Frequency` (descendant)
3. Identifier l'erreur la plus fréquente
4. Analyser la stacktrace

---

### Étape 2: Mitigation Immédiate (< 10 min)

**Objectif:** Restaurer le service rapidement, analyse approfondie plus tard

#### Option A: Rollback vers Version Stable

**Cas:** Incident apparu après un déploiement récent

```bash
# Via Vercel Dashboard
1. Deployments → Trouver dernier déploiement stable
2. Cliquer "..." → "Promote to Production"
3. Confirmer rollback

# Via Vercel CLI
vercel rollback [deployment-url]
```

⏱️ **Temps estimé:** 2-3 minutes

#### Option B: Redéployer depuis Main

**Cas:** Problème de build ou de cache

```bash
# Forcer redéploiement
vercel --prod --force

# Ou via Dashboard
Deployments → "Redeploy"
```

⏱️ **Temps estimé:** 5-7 minutes

#### Option C: Activer Mode Maintenance

**Cas:** Incident nécessite investigation approfondie

```bash
# Activer maintenance mode (si implémenté)
vercel env add MAINTENANCE_MODE true production
vercel --prod
```

⏱️ **Temps estimé:** 3-5 minutes

---

### Étape 3: Validation Post-Mitigation (< 5 min)

**Vérifier que le service est restauré:**

1. **Smoke Tests Manuels:**
   - Landing page charge?
   - Quiz flow fonctionne?
   - Login fonctionne?
   - Dashboard accessible?

2. **Vérifier les Logs:**
   ```bash
   vercel logs --follow
   # Rechercher erreurs (devrait être 0)
   ```

3. **Vérifier Sentry:**
   - Taux d'erreur revenu à < 1%?
   - Aucune nouvelle erreur critique?

✅ **Si service restauré:** Passer à Étape 4 (Post-Mortem)

❌ **Si problème persiste:** Escalader vers Developer Lead

---

### Étape 4: Post-Mortem (< 24h après résolution)

**Objectif:** Comprendre la cause root et éviter récurrence

#### 4.1 Analyse Approfondie

**Questions à répondre:**
1. Quelle était la cause root exacte?
2. Pourquoi n'a-t-elle pas été détectée avant production?
3. Combien de users ont été affectés?
4. Quelle a été la durée d'indisponibilité?
5. Quel est le coût business (conversions perdues)?

#### 4.2 Actions Correctives

**Documenter dans Linear Issue:**

```markdown
## Post-Mortem: [Titre Incident]

**Date:** 31/01/2026
**Durée:** 15 minutes (12:00 - 12:15 UTC)
**Severité:** P0-CRITICAL

### Cause Root
[Description détaillée]

### Impact
- Users affectés: ~100
- Conversions perdues: ~5
- Revenue loss: ~$50

### Timeline
- 12:00: Incident détecté (alerte Sentry)
- 12:03: Triage effectué (DB timeout identifié)
- 12:05: Rollback initié
- 12:08: Service restauré
- 12:15: Validation complète

### Actions Correctives
1. [ ] Augmenter timeout DB de 5s à 10s
2. [ ] Ajouter retry logic sur DB queries
3. [ ] Améliorer alerting pour DB timeouts
4. [ ] Ajouter smoke test automatique post-deploy

### Lessons Learned
- DB timeout peut arriver même avec faible trafic
- Rollback est la solution la plus rapide (< 3 min)
- Besoin de monitoring DB metrics en temps réel
```

---

## 2️⃣ PROCÉDURE P1 - Incident Majeur

### Scénario 1: Dashboard Inaccessible (Erreur 500)

**Symptômes:**
- Users reportent dashboard crash
- Erreur 500 sur `/dashboard`
- Sentry: `TypeError: Cannot read property 'id' of undefined`

**Diagnostic:**

1. **Vérifier les logs Vercel:**
   ```bash
   vercel logs | grep "/dashboard"
   ```

2. **Identifier l'erreur exacte:**
   - Ligne de code problématique (stacktrace)
   - Contexte: User ID, post ID, etc.

3. **Reproduire localement:**
   ```bash
   npm run dev
   # Naviguer vers /dashboard avec les mêmes données
   ```

**Solution:**

1. **Hotfix:**
   - Identifier la ligne causant le crash
   - Ajouter null check: `if (!post) return <ErrorPage />`
   - Commit + push vers `main`
   - Déployer: `vercel --prod`

2. **Validation:**
   - Vérifier dashboard accessible
   - Vérifier erreur ne se reproduit plus

⏱️ **Temps estimé:** 30-60 minutes

---

### Scénario 2: Persist-on-Login Échoue Sporadiquement

**Symptômes:**
- 10-20% des requêtes échouent avec 500
- Alerte Database Error fréquente
- Users ne peuvent pas sauvegarder leurs posts

**Diagnostic:**

1. **Vérifier Supabase Dashboard:**
   - Database → Logs → Rechercher erreurs
   - API → Logs → Rechercher timeouts

2. **Vérifier les logs Vercel:**
   ```bash
   vercel logs | grep "persist-on-login" | grep "500"
   ```

3. **Identifier le pattern:**
   - Erreur aléatoire (connection pool full)?
   - Erreur spécifique à certains users (data corruption)?

**Solution:**

**Si connection pool full:**
```bash
# Augmenter pool size dans Supabase
# Dashboard → Settings → Database → Connection Pooling
# Max connections: 15 → 30
```

**Si timeout:**
```bash
# Augmenter timeout dans code
# lib/supabase-admin.ts
const supabaseAdmin = createClient(url, key, {
  db: { timeout: 10000 } // 10s au lieu de 5s
});
```

**Si data corruption:**
```sql
-- Identifier les posts corrompus
SELECT * FROM posts WHERE equalizer_settings IS NULL;

-- Nettoyer si nécessaire
DELETE FROM posts WHERE created_at < NOW() - INTERVAL '24 hours' AND status = 'pending';
```

⏱️ **Temps estimé:** 1-2 heures

---

### Scénario 3: Rate Limiting Trop Agressif

**Symptômes:**
- Users légitimes bloqués (429)
- Nombreuses plaintes support
- Taux de conversion baisse

**Diagnostic:**

1. **Analyser les logs:**
   ```bash
   vercel logs | grep "Rate limit exceeded" | grep -v "abuse"
   ```

2. **Identifier les IPs légitimes bloquées:**
   ```bash
   # Compter les blocks par IP
   grep "Rate limit exceeded" logs.txt | cut -d' ' -f3 | sort | uniq -c | sort -nr
   ```

3. **Vérifier le trafic actuel:**
   - Pic de trafic lié à campagne marketing?
   - Tests automatisés non déclarés?

**Solution:**

1. **Augmenter temporairement la limite:**
   ```bash
   # Vercel Dashboard → Environment Variables
   RATE_LIMIT_PERSIST_LOGIN=20 (au lieu de 10)
   
   # Redéployer
   vercel --prod
   ```

2. **Alternative: Whitelist IPs légitimes:**
   ```javascript
   // lib/rate-limit.ts
   const WHITELIST_IPS = ['123.45.67.89', '98.76.54.32'];
   
   if (WHITELIST_IPS.includes(clientIp)) {
     return { allowed: true, ... };
   }
   ```

⏱️ **Temps estimé:** 15-30 minutes

---

## 3️⃣ PROCÉDURE P2 - Incident Mineur

### Approche Générale

**Pas d'urgence, mais documenter:**

1. **Créer ticket Linear:**
   - Titre: Description courte du problème
   - Label: `P2-MINOR`
   - Assigner: Developer disponible

2. **Documenter:**
   - Steps to reproduce
   - Impact utilisateur
   - Workaround temporaire (si existe)

3. **Planifier fix:**
   - Inclure dans prochain sprint
   - Pas de hotfix nécessaire

---

## 🔗 Références Utiles

### Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| **Vercel** | https://vercel.com/dashboard | SSO |
| **Supabase** | https://app.supabase.com | SSO |
| **Sentry** | https://sentry.io | SSO |
| **Linear** | https://linear.app | SSO |

### Contacts d'Urgence

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| **DevOps Lead** | devops@postry.ai | 24/7 (P0 only) |
| **Developer Lead** | dev@postry.ai | Business hours |
| **Product Owner** | Florian | Business hours |
| **Supabase Support** | https://supabase.com/support | 24/7 (Enterprise) |

### Documentation

- **Production Deployment:** [production-deployment-guide.md](./production-deployment-guide.md)
- **Rate Limiting:** [rate-limiting-guide.md](./rate-limiting-guide.md)
- **Alerting:** [alerting-guide.md](./alerting-guide.md)
- **Monitoring:** [monitoring-metrics.md](./monitoring-metrics.md)
- **Git Strategy:** [../git-strategy.md](../git-strategy.md)

---

## ✅ Checklist Gestion d'Incident

**Pendant l'incident:**

- [ ] Classification P0/P1/P2 effectuée
- [ ] Incident documenté dans Linear
- [ ] Stakeholders alertés (si P0/P1)
- [ ] Triage effectué (< 5 min pour P0)
- [ ] Mitigation appliquée
- [ ] Service validé restauré
- [ ] Users informés (si impact visible)

**Après l'incident:**

- [ ] Post-mortem rédigé (P0/P1 uniquement)
- [ ] Actions correctives identifiées
- [ ] Tickets créés pour actions correctives
- [ ] Documentation mise à jour si nécessaire
- [ ] Équipe informée (retrospective)

---

**Créé par:** Amelia (BMad Dev)  
**Dernière révision:** 31 Janvier 2026  
**Prochaine révision:** Après chaque incident majeur (amélioration continue)
