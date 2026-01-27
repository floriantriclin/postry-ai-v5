# 15. Deployment & Rollout Strategy

## Vision

**"Ship early, ship often, ship safely."**

La stratégie de déploiement de **postry.ai** privilégie la **vélocité** (itérations rapides) tout en maintenant la **stabilité** (pas de downtime critique).

---

## 1. Architecture de Déploiement

### Infrastructure

| Composant | Plateforme | Environnement |
|-----------|------------|---------------|
| **Frontend + API** | Vercel | Production, Preview, Dev |
| **Base de Données** | Supabase PostgreSQL | Production, Staging |
| **Storage (CVs)** | Supabase Storage | Production, Staging |
| **LLM** | Google Gemini API | Production (shared) |
| **Paiement** | Stripe | Production (live), Test |
| **Monitoring** | Vercel + Sentry + Posthog | Production |

**Avantages Vercel** :
- ✅ CI/CD automatique (chaque push = déploiement)
- ✅ Preview Deployments (chaque PR = URL unique)
- ✅ Edge Functions (latence faible)
- ✅ Rollback instant (1 clic)

---

## 2. Environnements

### 2.1 Local Development

**Setup** :

```bash
git clone https://github.com/org/postry-ai.git
cd postry-ai
npm install
cp .env.example .env.local
# Configurer les clés API locales
npm run dev
```

**Caractéristiques** :
- Supabase local via Docker (optionnel) OU projet Supabase dev
- Stripe mode Test
- LLM avec clés dev (rate limit plus faible)

---

### 2.2 Staging

**URL** : `https://postry-ai-staging.vercel.app`

**Purpose** : Tests d'intégration, validation PO, démo clients

**Configuration** :
- Branche : `develop` (ou `staging`)
- Base de données : Supabase Staging (copie anonymisée de prod)
- Stripe : Mode Test
- LLM : Prod API (mais quota séparé)

**Déploiement** :
- Automatique sur chaque merge vers `develop`
- Preview URL disponible pour chaque PR

---

### 2.3 Production

**URL** : `https://postry.ai`

**Configuration** :
- Branche : `main`
- Base de données : Supabase Production
- Stripe : Mode Live
- LLM : Prod API
- Analytics : Posthog (prod project)

**Déploiement** :
- Automatique sur chaque merge vers `main`
- Require approval (protection branch)

---

## 3. Stratégie de Release

### 3.1 Phases de Rollout

```
Epic 1-2 (Alpha) → Epic 3 (Beta) → Epic 4 (Launch) → Post-Launch
```

#### Phase 1 : Alpha (Epic 1-2 complétés)

**Objectif** : Valider le tunnel d'acquisition et la conversion

**Audience** : 
- 10-20 early adopters (équipe interne + amis)
- Accès via whitelist email

**Features** :
- ✅ Quiz complet + Profiling ICE
- ✅ Génération de post (flou → révélation)
- ✅ Authentification Magic Link
- ❌ Pas d'Equalizer
- ❌ Pas de CV upload
- ❌ Pas de paywall

**Critères de passage à Beta** :
- Reveal Rate >25%
- Post Generation Time <20s (P95)
- 0 bugs critiques
- Feedback positif de 70% des alphas

**Durée** : 1-2 semaines

---

#### Phase 2 : Beta (Epic 3 complété)

**Objectif** : Valider l'engagement (Equalizer, Dashboard)

**Audience** :
- 100-200 users
- Inscription publique MAIS limite de 200 users (soft cap)
- Landing page avec "Beta Waitlist"

**Features** :
- ✅ Tout de l'Alpha
- ✅ Dashboard complet
- ✅ Equalizer de style
- ✅ Historique des posts
- ❌ Pas de CV upload (Epic 4)
- ❌ Paywall désactivé (génération illimitée pour tests)

**Critères de passage à Launch** :
- Equalizer Usage Rate >40%
- Retention Day 7 >30%
- Avg posts per user >2
- 0 bugs critiques
- Tests E2E tous passants

**Durée** : 2-3 semaines

---

#### Phase 3 : Public Launch (Epic 4 complété)

**Objectif** : Monétisation + Scaling

**Audience** :
- Public (pas de limite)
- Campagne marketing (Product Hunt, LinkedIn, etc.)

**Features** :
- ✅ Tout de la Beta
- ✅ CV Upload + RAG
- ✅ Paywall (5 posts gratuits)
- ✅ Paiement Stripe

**Success Metrics (90 jours post-launch)** :
- 1000+ signups
- Premium Conversion Rate >5%
- MRR >€1000
- Churn <10%/mois

---

#### Phase 4 : Post-Launch

**Focus** : Optimisation + Nouvelles Features

**Roadmap Post-MVP** :
- Epic 5 : Collaboration & Teams (partage de posts)
- Epic 6 : LinkedIn API Integration (posting direct)
- Epic 7 : Multi-langue (EN, ES)
- Epic 8 : Mobile App (React Native)

---

## 4. Feature Flags

### Pourquoi Feature Flags?

- ✅ Déployer du code **sans activer la feature** (dark launch)
- ✅ Rollout progressif (10% users → 50% → 100%)
- ✅ A/B testing facile
- ✅ Kill switch instantané si bug

### Implémentation (Posthog)

```typescript
// lib/feature-flags.ts
import { posthog } from '@/lib/analytics';

export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = posthog.isFeatureEnabled(flagName);
    setEnabled(isEnabled ?? false);
  }, [flagName]);

  return enabled;
}

// Usage dans composant
function Dashboard() {
  const cvUploadEnabled = useFeatureFlag('cv-upload');
  const equalizerV2Enabled = useFeatureFlag('equalizer-v2');

  return (
    <div>
      {equalizerV2Enabled ? <EqualizerV2 /> : <Equalizer />}
      {cvUploadEnabled && <CVUploadZone />}
    </div>
  );
}
```

### Feature Flags Planifiés

| Flag | Epic | Default | Rollout |
|------|------|---------|---------|
| `equalizer-enabled` | 3 | `false` | Beta: 100% |
| `cv-upload-enabled` | 4 | `false` | Launch: 10% → 100% |
| `paywall-enabled` | 4 | `false` | Launch: 100% |
| `linkedin-integration` | 6 | `false` | Post-Launch: Opt-in |

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
        if: github.ref == 'refs/heads/main'

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Règles de Protection

**Branch `main` (Production)** :
- ✅ Require PR (pas de push direct)
- ✅ Require 1 approval minimum
- ✅ Require status checks (tests, lint)
- ✅ Require up-to-date branch

**Branch `develop` (Staging)** :
- ✅ Require PR
- ⚠️ Approval optionnelle (plus de vélocité)

---

## 6. Database Migrations

### Workflow Migrations

**Outil** : Supabase CLI

```bash
# 1. Créer une migration
npx supabase migration new add_archetype_column

# 2. Éditer le fichier SQL
# supabase/migrations/20260127000000_add_archetype_column.sql

# 3. Appliquer en local (test)
npx supabase db push

# 4. Tester l'application
npm run dev

# 5. Commit + Push (CI appliquera automatiquement)
git add supabase/migrations/
git commit -m "feat: add archetype column to posts"
git push
```

### Règles de Migration

1. **Toujours backwards-compatible** :
   - ✅ Ajouter colonne avec valeur par défaut
   - ❌ Supprimer colonne utilisée (d'abord déprécier)

2. **Tester en staging avant prod** :
   - Appliquer manuellement en staging
   - Vérifier que l'app fonctionne
   - Puis merge vers `main`

3. **Rollback Plan** :
   - Chaque migration doit avoir une migration inverse
   - Exemple : `20260127000001_revert_archetype_column.sql`

---

## 7. Rollback Strategy

### Rollback Vercel (Instant)

**Via Dashboard** :
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet
3. Onglet "Deployments"
4. Cliquer sur déploiement précédent → "Promote to Production"

**Via CLI** :

```bash
vercel rollback
```

⏱️ **Temps de rollback** : <30 secondes

---

### Rollback Database (Complexe)

**Si migration casse la prod** :

1. **Appliquer migration inverse** :
   ```bash
   npx supabase db push --include revert_archetype_column
   ```

2. **Si pas de migration inverse** :
   - Restaurer backup DB (Supabase fait backups automatiques)
   - Via Dashboard Supabase : Settings → Database → Point-in-Time Recovery

⚠️ **Important** : Toujours tester les migrations en staging d'abord!

---

## 8. Monitoring Post-Déploiement

### Checklist Après Déploiement

**Immédiat (0-15 min)** :
- [ ] **Health check** : Visiter homepage, tester signup
- [ ] **Sentry** : Aucune erreur critique remontée
- [ ] **Vercel Analytics** : FCP, LCP dans les normes (<2s)
- [ ] **Posthog** : Events arrivent correctement

**Court terme (1h)** :
- [ ] **Error rate** : <1% sur tous les endpoints
- [ ] **LLM generation time** : P95 <15s
- [ ] **Database queries** : Pas de slow queries (>1s)

**Moyen terme (24h)** :
- [ ] **User feedback** : Aucun report de bug critique
- [ ] **Conversion metrics** : Pas de drop significatif
- [ ] **Payment flows** : Tous les webhooks Stripe reçus

---

### Alertes Critiques

**Déclencher alerte (Slack/Email) si** :

| Métrique | Seuil | Action |
|----------|-------|--------|
| Error rate | >5% | Investiguer immédiatement |
| Uptime | <99% | Vérifier Vercel status |
| LLM timeout | >30s pour 5 req | Contacter Google Gemini support |
| Stripe webhook fail | >3 échoués | Vérifier webhook endpoint |
| Database CPU | >80% | Scale up instance |

**Configuration** : Via Vercel Integrations (Slack) + Sentry Alerts

---

## 9. Hotfix Process

### Quand faire un Hotfix?

**Critères** :
- 🔴 Bug critique en production (crash, data loss, security breach)
- 🔴 Blocage majeur empêchant l'usage du service
- 🔴 Problème de paiement (users ne peuvent pas payer)

**Quand NE PAS faire de hotfix** :
- 🟡 Bug mineur (typo, style cassé non-bloquant)
- 🟡 Feature request (attendre prochaine release)

---

### Workflow Hotfix

```bash
# 1. Créer branche hotfix depuis main
git checkout main
git pull
git checkout -b hotfix/fix-duplicate-posts

# 2. Faire le fix (minimal)
# ... éditer fichiers ...

# 3. Commit
git add .
git commit -m "hotfix: prevent duplicate posts on auth"

# 4. Tester localement
npm run test
npm run test:e2e

# 5. Push + Create PR vers main
git push origin hotfix/fix-duplicate-posts
# Créer PR avec label "hotfix" + description claire

# 6. Review accélérée (1 reviewer)
# Merge dès approval

# 7. Vérifier déploiement prod
# Monitoring pendant 1h

# 8. Backport vers develop
git checkout develop
git merge hotfix/fix-duplicate-posts
git push
```

⏱️ **Délai cible hotfix** : <2h de détection à déploiement

---

## 10. Documentation Déploiement

### Runbook

**À documenter dans `/docs/runbook.md`** :

1. **Comment déployer manuellement** (si CI/CD fail)
2. **Comment rollback en urgence**
3. **Comment appliquer une migration DB**
4. **Contacts en cas d'incident** :
   - Vercel Support : support@vercel.com
   - Supabase Support : support@supabase.com
   - Stripe Support : support@stripe.com
   - On-call developer : [phone/Slack]

---

## 11. Checklist de Pre-Launch

Avant de lancer en production (Public Launch) :

### Infrastructure
- [ ] Domaine configuré (postry.ai)
- [ ] SSL/TLS actif (HTTPS)
- [ ] Variables d'environnement Vercel configurées
- [ ] Supabase Production provisioned (plan Pro si besoin)
- [ ] Stripe Live mode activé + webhooks configurés

### Code
- [ ] Tous les tests passent (unit, integration, E2E)
- [ ] Linter errors = 0
- [ ] Security headers configurés (CSP, X-Frame-Options)
- [ ] Rate limiting activé
- [ ] Feature flags configurés (paywall=true, etc.)

### Legal & Compliance
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Cookie banner implémenté
- [ ] Contact support visible (support@postry.ai)

### Monitoring
- [ ] Sentry configuré (production project)
- [ ] Posthog configuré (production project)
- [ ] Vercel Analytics activé
- [ ] Uptime Robot configuré (alerte downtime)
- [ ] Slack alerts configurés

### Documentation
- [ ] README.md à jour
- [ ] Runbook créé
- [ ] Architecture diagram disponible

### Marketing
- [ ] Landing page optimisée (SEO, meta tags)
- [ ] Product Hunt listing préparé
- [ ] LinkedIn posts planifiés
- [ ] Email announcement rédigé

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
