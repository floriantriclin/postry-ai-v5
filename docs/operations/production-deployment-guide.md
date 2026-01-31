# Guide de Déploiement en Production - Postry AI

**Date de création:** 31 Janvier 2026  
**Dernière mise à jour:** 31 Janvier 2026  
**Version:** 1.0  
**Statut:** ✅ ACTIF

---

## 📋 Objectif

Guide complet pour déployer Postry AI sur Vercel en production avec toutes les vérifications nécessaires pour assurer un déploiement sécurisé et réussi.

## 🎯 Audience

- **DevOps Engineers:** Gestion des déploiements et infrastructure
- **Developers:** Comprendre le processus de déploiement
- **Product Owner:** Validation et approbation des déploiements

---

## 🚀 Processus de Déploiement

### Étape 1: Pré-Déploiement - Validation Code

**Durée:** 10-15 minutes

#### 1.1 Vérifier que tous les tests passent

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Vérifier coverage
npm run test:coverage
```

✅ **Critères de succès:**
- Tous les tests unitaires passent (100%)
- Tous les tests E2E passent (24/24)
- Coverage > 80% sur les composants critiques

#### 1.2 Vérifier la branche de déploiement

```bash
# S'assurer d'être sur la branche 'main'
git checkout main

# Pull les dernières modifications
git pull origin main

# Vérifier qu'il n'y a pas de changements non commités
git status
```

✅ **Critères de succès:**
- Branche `main` à jour avec remote
- Aucun changement non commité (working directory clean)

#### 1.3 Vérifier l'état du build local

```bash
# Build local pour vérifier qu'il n'y a pas d'erreurs
npm run build

# Vérifier les erreurs TypeScript
npm run type-check
```

✅ **Critères de succès:**
- Build réussit sans erreurs
- Aucune erreur TypeScript
- Aucun warning critique

---

### Étape 2: Configuration des Variables d'Environnement

**Durée:** 5-10 minutes

#### 2.1 Variables d'Environnement Requises (Vercel)

Se connecter à [Vercel Dashboard](https://vercel.com/dashboard) et vérifier que les variables suivantes sont configurées:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Gemini AI:**
```
GEMINI_API_KEY=AIzaSy...
```

**Feature Flags:**
```
ENABLE_PERSIST_FIRST=true
ENABLE_RATE_LIMITING=true
ENABLE_ALERTING=true
```

**Rate Limiting:**
```
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PERSIST_LOGIN=10
RATE_LIMIT_WINDOW_MS=60000
```

**Alerting (Optionnel):**
```
SENTRY_DSN=https://...@sentry.io/...
ALERT_EMAIL=alerts@postry.ai
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

#### 2.2 Vérifier les Variables dans Vercel

1. **Dashboard Vercel** → Sélectionner le projet `postry-ai`
2. **Settings** → **Environment Variables**
3. Vérifier que toutes les variables ci-dessus existent
4. Confirmer les environnements ciblés: `Production`, `Preview`, `Development`

✅ **Critères de succès:**
- Toutes les variables requises sont présentes
- Aucune variable sensible n'est exposée publiquement
- Variables sont configurées pour l'environnement `Production`

---

### Étape 3: Déploiement sur Vercel

**Durée:** 5-10 minutes (build + déploiement)

#### 3.1 Déploiement via Git (Recommandé)

**Méthode:** Push vers branche `main` déclenche déploiement automatique

```bash
# S'assurer d'être sur main et à jour
git checkout main
git pull origin main

# Si merge depuis dev nécessaire (après validation PO):
git merge dev

# Push vers main (déclenche déploiement automatique)
git push origin main
```

✅ **Déploiement automatique se déclenche:**
- Vercel détecte le push vers `main`
- Build démarre automatiquement
- Déploiement en production après build réussi

#### 3.2 Déploiement via Vercel CLI (Alternatif)

**Cas d'usage:** Déploiement manuel ou rollback urgent

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Login à Vercel
vercel login

# Déployer en production
vercel --prod
```

#### 3.3 Monitoring du Build

1. **Ouvrir Vercel Dashboard** → `postry-ai` → **Deployments**
2. Surveiller le build en cours (temps estimé: 3-5 min)
3. Vérifier les logs de build en temps réel:
   - Aucune erreur TypeScript
   - Aucune erreur de build Next.js
   - Aucune erreur d'installation de dépendances

✅ **Critères de succès:**
- Build réussit (status: ✅ Ready)
- Temps de build < 10 minutes
- Aucune erreur dans les logs

---

### Étape 4: Validation Post-Déploiement

**Durée:** 15-20 minutes

#### 4.1 Tests de Smoke (Manuel)

**Tester les flux critiques immédiatement après déploiement:**

1. **Landing Page:**
   - ✅ Page charge en < 3 secondes
   - ✅ Bouton "Commencer le Quiz" fonctionne

2. **Quiz Flow:**
   - ✅ Questions s'affichent correctement
   - ✅ Navigation entre questions fonctionne
   - ✅ Soumission quiz réussit

3. **Authentication:**
   - ✅ Magic link envoyé avec succès
   - ✅ Login fonctionne
   - ✅ Redirection vers dashboard après login

4. **Dashboard:**
   - ✅ Dashboard charge sans crash
   - ✅ Post révélé s'affiche correctement
   - ✅ Archetype affiché correctement

5. **Persist-on-Login (Critique):**
   - ✅ Authentification réussit
   - ✅ Post persisté en DB avec status='revealed'
   - ✅ Rate limiting actif (vérifier headers)
   - ✅ Alerting configuré (check Sentry/logs)

#### 4.2 Vérification Base de Données

**Se connecter à Supabase Dashboard:**

1. Vérifier que des posts sont créés après login
2. Vérifier le status: `status = 'revealed'` (pas 'pending')
3. Vérifier la colonne `archetype` est remplie
4. Vérifier qu'aucune donnée corrompue n'apparaît

#### 4.3 Monitoring Errors (Sentry/Logs)

**Surveiller les erreurs pendant 30 minutes après déploiement:**

1. **Sentry Dashboard** (si configuré):
   - Aucune nouvelle erreur critique (P0/P1)
   - Taux d'erreur < 1%

2. **Vercel Logs:**
   - Aucune erreur 500 dans les logs
   - Rate limiting fonctionne (voir logs `Rate limit exceeded`)
   - Alerting fonctionne (voir logs `Alert sent`)

3. **Supabase Logs:**
   - Aucune erreur de connexion DB
   - Requêtes exécutées avec succès
   - Aucune violation RLS (Row Level Security)

✅ **Critères de succès:**
- Tous les tests de smoke passent
- Aucune erreur critique dans les 30 premières minutes
- Taux d'erreur < 1%
- Performance acceptable (p95 < 3s)

---

### Étape 5: Rollback (Si Problème Détecté)

**Durée:** 5 minutes

#### 5.1 Rollback via Vercel Dashboard

1. **Vercel Dashboard** → `postry-ai` → **Deployments**
2. Trouver le dernier déploiement stable (avant le problème)
3. Cliquer sur les 3 points → **Promote to Production**
4. Confirmer le rollback

✅ **Production revient à la version stable précédente**

#### 5.2 Rollback via Vercel CLI

```bash
# Lister les déploiements récents
vercel ls

# Rollback vers un déploiement spécifique
vercel rollback [deployment-url]
```

#### 5.3 Rollback Base de Données (Si Nécessaire)

**Cas:** Si migration DB problématique

```bash
# Se connecter à Supabase
# Exécuter le script de rollback SQL
# Voir: scripts/rollback/20260127_rollback_archetype.sql
```

⚠️ **Toujours avoir un plan de rollback DB préparé avant migration**

---

## ✅ Checklist Pré-Déploiement Complète

**Avant de déployer en production, vérifier:**

- [ ] Tous les tests unitaires passent (npm test)
- [ ] Tous les tests E2E passent (npm run test:e2e)
- [ ] Build local réussit (npm run build)
- [ ] TypeScript compile sans erreurs (npm run type-check)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Branche `main` à jour et propre (git status)
- [ ] Code review effectué et approuvé
- [ ] Linear issues fermées et synchronisées
- [ ] Documentation mise à jour si nécessaire
- [ ] Feature flags configurés correctement (si applicable)
- [ ] Plan de rollback DB préparé (si migration DB)
- [ ] PO a validé le déploiement (validation explicite requise)

---

## 🔗 Références

- **Vercel Documentation:** https://vercel.com/docs/deployments
- **Supabase Dashboard:** https://app.supabase.com
- **Sentry Dashboard:** https://sentry.io (si configuré)
- **Git Strategy:** [docs/git-strategy.md](../git-strategy.md)
- **Incident Runbook:** [incident-runbook.md](./incident-runbook.md)
- **Monitoring Metrics:** [monitoring-metrics.md](./monitoring-metrics.md)

---

## 📞 Support & Contacts

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| **DevOps Lead** | devops@postry.ai | 24/7 (incidents critiques) |
| **Product Owner** | Florian | Business hours |
| **Developer Lead** | dev@postry.ai | Business hours |
| **Sentry Alerts** | alerts@postry.ai | Automatique |

**En cas de problème critique:**
1. Rollback immédiat (voir Section 5)
2. Alerter DevOps Lead
3. Ouvrir incident dans Linear (label: P0-CRITICAL)
4. Suivre [incident-runbook.md](./incident-runbook.md)

---

## 📚 Historique des Déploiements

Voir [Vercel Dashboard - Deployments](https://vercel.com/floriantriclin/postry-ai/deployments)

**Derniers déploiements majeurs:**
- **29/01/2026:** Story 2.11b (Persist-First Architecture) - ✅ Success
- **28/01/2026:** Story 2.11a (Quick Wins) - ✅ Success
- **27/01/2026:** Story 2.8 (Production Readiness) - ✅ Success

---

**Créé par:** Amelia (BMad Dev)  
**Dernière révision:** 31 Janvier 2026  
**Prochaine révision:** Lors de changements infrastructure majeurs
