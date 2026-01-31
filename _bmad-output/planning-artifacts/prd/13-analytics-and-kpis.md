# 13. Analytics & KPIs

## Vision

**"Measure what matters, optimize relentlessly."**

Les analytics sont le système nerveux de **postry.ai**. Ils permettent de :

1. **Valider les hypothèses** : Est-ce que le Blurred Proof fonctionne?
2. **Optimiser le tunnel** : Où les users drop-ils?
3. **Mesurer le succès** : Atteignons-nous nos objectifs business?

---

## 1. Outils Analytics

### Stack Recommandée

| Outil | Usage | Coût |
|-------|-------|------|
| **[Posthog](https://posthog.com/)** | Product analytics + Feature flags | Gratuit jusqu'à 1M events/mois |
| **[Vercel Analytics](https://vercel.com/analytics)** | Web Vitals + Performance | Inclus dans plan Vercel |
| **[Stripe Dashboard](https://dashboard.stripe.com/)** | Métriques de paiement | Inclus |
| **[Supabase Dashboard](https://supabase.com/)** | Métriques DB (queries, storage) | Inclus |

**Choix principal** : **Posthog** (open-source, self-hosted possible, feature flags intégrés)

---

## 2. Events Critiques à Tracker

### Funnel d'Acquisition (Epic 1-2)

```typescript
// Événements à capturer via Posthog

// Landing
posthog.capture('landing_viewed');
posthog.capture('theme_selected', { theme: 'Leadership' });

// Quiz
posthog.capture('quiz_started', { theme: 'Leadership' });
posthog.capture('quiz_question_answered', {
  phase: 1,
  question_id: 'q1',
  dimension: 'formality'
});
posthog.capture('quiz_completed', {
  archetype: 'Le Stratège',
  duration_seconds: 45
});

// Génération
posthog.capture('post_generation_started', { theme: 'Leadership' });
posthog.capture('post_generated', {
  theme: 'Leadership',
  archetype: 'Le Stratège',
  generation_time_ms: 12000
});
posthog.capture('blurred_post_viewed');

// Conversion
posthog.capture('email_submitted', { email: 'user@example.com' });
posthog.capture('magic_link_clicked');
posthog.capture('post_revealed', {
  time_to_reveal_seconds: 120 // Temps entre génération et révélation
});
```

### Funnel d'Engagement (Epic 3)

```typescript
// Dashboard
posthog.capture('dashboard_viewed');
posthog.capture('new_post_clicked');

// Equalizer
posthog.capture('equalizer_opened');
posthog.capture('equalizer_slider_changed', {
  slider: 'tone',
  old_value: 5,
  new_value: 8
});
posthog.capture('post_regenerated', {
  post_id: 'abc123',
  changes: ['tone', 'length']
});

// Historique
posthog.capture('history_viewed');
posthog.capture('post_selected_from_history', { post_id: 'abc123' });
```

### Funnel de Monétisation (Epic 4)

```typescript
// CV Upload
posthog.capture('cv_upload_started');
posthog.capture('cv_uploaded', {
  file_type: 'pdf',
  file_size_kb: 245
});
posthog.capture('cv_parsed', {
  success: true,
  text_length: 3500
});

// Paywall
posthog.capture('paywall_hit', {
  post_count: 5
});
posthog.capture('upgrade_button_clicked');

// Paiement
posthog.capture('checkout_started', {
  plan: 'premium',
  price: 9
});
posthog.capture('checkout_completed', {
  plan: 'premium',
  price: 9,
  stripe_session_id: 'cs_xxx'
});
posthog.capture('checkout_abandoned', {
  step: 'payment_info' // Où l'user a abandonné
});
```

---

## 3. KPIs & Objectifs Business

### Métriques Primaires (North Star)

| KPI | Objectif | Formule | Fréquence |
|-----|----------|---------|-----------|
| **Quiz Completion Rate** | >65% | (Quiz Completed / Quiz Started) × 100 | Hebdomadaire |
| **Reveal Rate** | >30% | (Posts Revealed / Posts Generated) × 100 | Hebdomadaire |
| **Premium Conversion Rate** | >5% | (Premium Subs / Paywall Hits) × 100 | Mensuelle |
| **MRR (Monthly Recurring Revenue)** | €1000 (MVP) | Premium Subs × Price | Mensuelle |

### Métriques Secondaires

| KPI | Objectif | Formule |
|-----|----------|---------|
| **Time to Reveal** | <3 min | Median(Post Generated → Post Revealed) |
| **CV Upload Rate** | >40% | (CVs Uploaded / Users Connected) × 100 |
| **Equalizer Usage Rate** | >50% | (Users Using Equalizer / Total Users) × 100 |
| **Regeneration Rate** | >2 per user | Avg(Regenerations / User) |
| **Churn Rate** | <10%/mois | (Users Canceled / Total Premium Users) × 100 |

### Métriques Techniques

| Métrique | SLA | Source |
|----------|-----|--------|
| **Post Generation Time** | <15s (P95) | Vercel Logs |
| **API Error Rate** | <1% | Sentry |
| **Page Load Time (FCP)** | <2s | Vercel Analytics |
| **Uptime** | >99.5% | Uptime Robot |

---

## 4. Dashboards

### Dashboard #1 : Acquisition Funnel

**Vue** : Posthog Funnel

**Étapes** :
1. Landing Viewed
2. Theme Selected
3. Quiz Started
4. Quiz Completed
5. Post Generated
6. Post Revealed

**Segmentations** :
- Par thème choisi
- Par archetype détecté
- Par source de trafic (organic, social, ads)

**Questions à répondre** :
- Quel est le taux de drop à chaque étape?
- Quel thème convertit le mieux?
- Quel archetype génère le plus de reveals?

---

### Dashboard #2 : Engagement & Retention

**Vue** : Posthog Retention + Trends

**Métriques** :
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Retention Day 1, Day 7, Day 30
- Feature Adoption:
  - % Users avec CV uploadé
  - % Users ayant utilisé Equalizer
  - Avg posts per user

**Segmentations** :
- Par cohort (date d'inscription)
- Par type d'utilisateur (Free vs Premium)

**Questions à répondre** :
- Combien d'users reviennent après 7 jours?
- Quelles features fidélisent le plus?

---

### Dashboard #3 : Monétisation

**Vue** : Stripe Dashboard + Posthog

**Métriques** :
- MRR (Monthly Recurring Revenue)
- New Subscriptions (ce mois)
- Churn Rate
- LTV (Lifetime Value) estimé
- Paywall Hit → Conversion Time

**Segmentations** :
- Par plan (si plusieurs tiers futurs)

**Questions à répondre** :
- Combien de temps entre Paywall Hit et Conversion?
- Quel est le taux de churn mensuel?
- LTV/CAC ratio est-il sain (>3)?

---

### Dashboard #4 : Technique & Performance

**Vue** : Vercel Analytics + Sentry

**Métriques** :
- API Response Time (P50, P95, P99)
- Error Rate par endpoint
- LLM Generation Time (P50, P95)
- Web Vitals:
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - CLS (Cumulative Layout Shift)

**Alertes** :
- Error rate >5% pendant 5 min
- LLM timeout >30s pour >3 requêtes
- Uptime <99%

---

## 5. Implémentation Posthog

### Installation

```bash
npm install posthog-js
```

### Configuration

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    }
  });
}

export { posthog };
```

### Usage dans les Composants

```typescript
// app/quiz/page.tsx
'use client';

import { posthog } from '@/lib/analytics';
import { useEffect } from 'react';

export default function QuizPage() {
  useEffect(() => {
    posthog.capture('quiz_started', {
      theme: searchParams.get('theme')
    });
  }, []);

  const handleAnswer = (answer: string) => {
    posthog.capture('quiz_question_answered', {
      phase: currentPhase,
      question_id: currentQuestion.id,
      answer
    });
    // ...
  };

  return <div>...</div>;
}
```

### Identification des Utilisateurs

```typescript
// Après l'auth réussie
posthog.identify(user.id, {
  email: user.email,
  archetype: user.archetype,
  premium: user.is_premium
});
```

---

## 6. A/B Testing (Feature Flags)

### Cas d'Usage

1. **Tester le CTA du Paywall** : "Upgrade" vs "Passer Premium" vs "Débloquer"
2. **Tester la position de l'Equalizer** : Sidebar vs Bottom Panel
3. **Tester le flou** : Gaussian blur vs Pixelated blur

### Implémentation

```typescript
// lib/analytics.ts
export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = posthog.isFeatureEnabled(flagName);
    setEnabled(isEnabled ?? false);
  }, [flagName]);

  return enabled;
}

// Usage dans composant
function PaywallModal() {
  const newCtaVariant = useFeatureFlag('paywall-cta-v2');

  return (
    <button>
      {newCtaVariant ? 'Débloquer maintenant' : 'Passer Premium'}
    </button>
  );
}
```

---

## 7. Privacy & RGPD

### Consentement

- **Cookie Banner** : Demander consentement pour analytics (requis UE)
- **Opt-out** : Permettre aux users de désactiver le tracking

### Anonymisation

```typescript
// Ne pas tracker d'infos sensibles
posthog.capture('post_generated', {
  theme: 'Leadership', // ✅ OK
  archetype: 'Le Stratège', // ✅ OK
  // ❌ NE PAS inclure: post_content, user_email (sauf hashed)
});
```

### Rétention des Données

- **Posthog** : Configurer rétention à 90 jours (gratuit tier)
- **Stripe** : Garder les logs de paiement 7 ans (obligation légale)

---

## 8. Revue et Optimisation

### Cadence de Revue

| Fréquence | Participants | Focus |
|-----------|-------------|-------|
| **Hebdomadaire** | PO + Dev Lead | Funnel metrics (Quiz, Reveal, Paywall) |
| **Mensuelle** | Toute l'équipe | MRR, Churn, Feature Adoption |
| **Trimestrielle** | C-level + Équipe | OKRs, Pivot/Persist decisions |

### Process d'Optimisation

1. **Identifier le bottleneck** : Quelle étape du funnel a le plus gros drop?
2. **Hypothèse** : Pourquoi? (UX confuse, temps de chargement, message flou?)
3. **Expérimentation** : A/B test d'une solution
4. **Mesure** : Impact sur le KPI cible
5. **Décision** : Déployer ou itérer

**Exemple** :

> **Constat** : Reveal Rate = 22% (objectif 30%)  
> **Hypothèse** : Le flou ne montre pas assez la structure du post  
> **Expérimentation** : Variante avec flou moins fort + aperçu du premier paragraphe  
> **Résultat** : Reveal Rate → 28% (+6 points)  
> **Décision** : Déployer la variante pour 100% des users

---

## 9. Checklist Analytics (Pour Chaque Feature)

Avant de livrer une nouvelle feature :

- [ ] **Events définis** : Quels events capturer?
- [ ] **Implémentation** : Posthog.capture() ajouté au bon endroit
- [ ] **Tests** : Vérifier que les events apparaissent dans Posthog (mode debug)
- [ ] **Dashboard mis à jour** : Ajouter les nouvelles métriques au dashboard pertinent
- [ ] **Alertes configurées** (si critique) : Ex: Error rate >5%

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
